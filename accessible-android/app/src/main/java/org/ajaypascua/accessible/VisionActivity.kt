package org.ajaypascua.accessible

import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import android.graphics.Color
import android.os.Bundle
import android.os.SystemClock
import android.speech.tts.TextToSpeech
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.label.ImageLabel
import com.google.mlkit.vision.label.ImageLabeling
import com.google.mlkit.vision.label.defaults.ImageLabelerOptions
import com.google.mlkit.vision.text.Text
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import java.util.Locale
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

/**
 * Standalone local camera assistant. Camera frames are processed on-device, never uploaded.
 * Uses image classification and OCR, not a generative vision-language model.
 */
class VisionActivity : Activity(), TextToSpeech.OnInitListener {
    private lateinit var previewView: PreviewView
    private lateinit var status: TextView
    private lateinit var cameraExecutor: ExecutorService
    private val labeler by lazy { ImageLabeling.getClient(ImageLabelerOptions.DEFAULT_OPTIONS) }
    private val textRecognizer by lazy { TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS) }
    private var tts: TextToSpeech? = null
    private var cameraProvider: ProcessCameraProvider? = null
    private var lastAnalysisAt = 0L
    private var lastSpoken = ""
    @Volatile private var paused = false
    private var speechReady = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        cameraExecutor = Executors.newSingleThreadExecutor()
        tts = TextToSpeech(this, this)

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.BLACK)
            setPadding(20, 20, 20, 20)
        }
        root.addView(TextView(this).apply {
            text = "Guided Vision 2 – Live assistance"
            textSize = 22f
            setTextColor(Color.WHITE)
            contentDescription = "Guided Vision 2 live camera assistance"
        })
        status = TextView(this).apply {
            text = "Point your camera at a scene or printed text. Analysis runs on this phone."
            textSize = 15f
            setTextColor(Color.WHITE)
            setPadding(0, 12, 0, 12)
        }
        root.addView(status)
        previewView = PreviewView(this).apply {
            implementationMode = PreviewView.ImplementationMode.COMPATIBLE
            contentDescription = "Live camera preview"
        }
        root.addView(previewView, LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f
        ))
        root.addView(Button(this).apply {
            text = "Pause assistance"
            setOnClickListener {
                paused = !paused
                text = if (paused) "Resume assistance" else "Pause assistance"
                status.text = if (paused) "Camera analysis paused." else "Camera analysis resumed."
                if (!paused) lastSpoken = ""
            }
        })
        root.addView(Button(this).apply {
            text = "Speak what I see now"
            setOnClickListener {
                if (lastSpoken.isNotBlank()) speak(lastSpoken)
                else speak("I am still analyzing the camera view. Please hold the phone steady.")
            }
        })
        root.addView(Button(this).apply {
            text = "Close camera"
            setOnClickListener { finish() }
        })
        root.addView(TextView(this).apply {
            text = "This feature can miss objects and misread text. It is not a mobility aid or a substitute for checking hazards."
            textSize = 12f
            setTextColor(Color.LTGRAY)
            setPadding(0, 10, 0, 0)
        })
        setContentView(root)

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            startCamera()
        } else {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.CAMERA), CAMERA_REQUEST)
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == CAMERA_REQUEST) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) startCamera()
            else {
                status.text = "Camera permission is needed for live visual assistance."
                speak("Camera permission was not granted.")
            }
        }
    }

    private fun startCamera() {
        val providerFuture = ProcessCameraProvider.getInstance(this)
        providerFuture.addListener({
            try {
                cameraProvider = providerFuture.get()
                val preview = Preview.Builder().build().also {
                    it.surfaceProvider = previewView.surfaceProvider
                }
                val analysis = ImageAnalysis.Builder()
                    .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                    .build()
                analysis.setAnalyzer(cameraExecutor) { proxy ->
                    val now = SystemClock.elapsedRealtime()
                    if (paused || now - lastAnalysisAt < 2500L) {
                        proxy.close()
                    } else {
                        lastAnalysisAt = now
                        val mediaImage = proxy.image
                        if (mediaImage == null) {
                            proxy.close()
                        } else {
                            val input = InputImage.fromMediaImage(mediaImage, proxy.imageInfo.rotationDegrees)
                            labeler.process(input)
                                .addOnSuccessListener { labels ->
                                    textRecognizer.process(input)
                                        .addOnSuccessListener { recognized -> handleAnalysis(labels, recognized) }
                                        .addOnFailureListener { handleAnalysis(labels, null) }
                                        .addOnCompleteListener { proxy.close() }
                                }
                                .addOnFailureListener {
                                    runOnUiThread { status.text = "Analyzing scene… some results may be unavailable." }
                                    proxy.close()
                                }
                        }
                    }
                }
                cameraProvider?.unbindAll()
                cameraProvider?.bindToLifecycle(this as LifecycleOwner, CameraSelector.DEFAULT_BACK_CAMERA, preview, analysis)
                status.text = "Live assistance is on. Keep the camera pointed at what you want described."
            } catch (e: Exception) {
                status.text = "Could not start the camera: " + (e.localizedMessage ?: "camera unavailable")
                speak("I could not start the camera.")
            }
        }, ContextCompat.getMainExecutor(this))
    }

    private fun handleAnalysis(labels: List<ImageLabel>, recognized: Text?) {
        val objects = labels
            .filter { it.confidence >= 0.60f }
            .sortedByDescending { it.confidence }
            .take(3)
            .map { it.text }
            .distinct()
        val printedText = recognized?.text
            ?.replace(Regex("\\s+"), " ")
            ?.trim()
            ?.take(150)
            .orEmpty()
        val parts = mutableListOf<String>()
        if (objects.isNotEmpty()) parts.add("I can identify: " + objects.joinToString(", ") + ".")
        if (printedText.isNotBlank()) parts.add("Visible text: " + printedText)
        val description = parts.joinToString(" ")
        runOnUiThread {
            status.text = if (description.isBlank()) {
                "I have not identified a clear object or readable text yet. Try changing the camera angle or lighting."
            } else description
        }
        if (description.isNotBlank() && description != lastSpoken && !paused) {
            lastSpoken = description
            speak(description)
        }
    }

    override fun onInit(result: Int) {
        speechReady = result == TextToSpeech.SUCCESS
        if (speechReady) {
            val prefs = getSharedPreferences("accessible_settings", MODE_PRIVATE)
            val tag = prefs.getString("speech_language", "system") ?: "system"
            val locale = if (tag == "system") Locale.getDefault() else Locale.forLanguageTag(tag)
            val availability = tts?.isLanguageAvailable(locale) ?: TextToSpeech.LANG_NOT_SUPPORTED
            tts?.language = if (availability >= TextToSpeech.LANG_AVAILABLE) locale else Locale.getDefault()
            tts?.setSpeechRate(prefs.getFloat("speech_rate", 1.0f).coerceIn(0.5f, 3.0f))
        }
    }

    private fun speak(message: String) {
        if (speechReady && !isFinishing) {
            tts?.speak(message, TextToSpeech.QUEUE_FLUSH, null, "guided-vision-live")
        }
    }

    override fun onDestroy() {
        cameraProvider?.unbindAll()
        if (::cameraExecutor.isInitialized) cameraExecutor.shutdown()
        tts?.stop()
        tts?.shutdown()
        labeler.close()
        textRecognizer.close()
        super.onDestroy()
    }

    companion object { private const val CAMERA_REQUEST = 4812 }
}
