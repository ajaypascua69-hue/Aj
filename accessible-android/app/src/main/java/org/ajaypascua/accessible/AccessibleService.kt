package org.ajaypascua.accessible

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.graphics.Bitmap
import android.graphics.Rect
import android.view.Display
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.label.ImageLabeling
import com.google.mlkit.vision.label.defaults.ImageLabelerOptions
import android.speech.tts.TextToSpeech
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import java.util.Locale

class AccessibleService : AccessibilityService(), TextToSpeech.OnInitListener {
    private var tts: TextToSpeech? = null
    private var ready = false
    private var lastSpoken = ""
    private var describeReceiverRegistered = false

    private val describeReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            describeActiveScreen()
        }
    }

    private val prefs by lazy { getSharedPreferences("accessible_settings", Context.MODE_PRIVATE) }

    override fun onServiceConnected() {
        super.onServiceConnected()
        // Ask Android to provide touch-exploration focus and standard double-tap activation.
        serviceInfo = serviceInfo.apply {
            flags = flags or AccessibilityServiceInfo.FLAG_REQUEST_TOUCH_EXPLORATION_MODE
        }
        tts = TextToSpeech(this, this)
        val filter = IntentFilter("org.ajaypascua.accessible.DESCRIBE_SCREEN")
        registerDescribeReceiver(filter)
        describeReceiverRegistered = true
    }

    @Suppress("DEPRECATION")
    private fun registerDescribeReceiver(filter: IntentFilter) {
        if (Build.VERSION.SDK_INT >= 33) {
            registerReceiver(describeReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(describeReceiver, filter)
        }
    }

    override fun onInit(status: Int) {
        ready = status == TextToSpeech.SUCCESS
        if (ready) {
            applySelectedLanguage()
            applySpeechRate()
        }
    }

    private fun applySelectedLanguage() {
        val tag = prefs.getString("speech_language", "system") ?: "system"
        val locale = if (tag == "system") Locale.getDefault() else Locale.forLanguageTag(tag)
        val engine = tts ?: return
        val availability = engine.isLanguageAvailable(locale)
        if (availability >= TextToSpeech.LANG_AVAILABLE) {
            engine.language = locale
        } else {
            engine.language = Locale.getDefault()
            speak("The selected language is not installed in your Android text-to-speech engine. Using the system language instead.")
        }
    }

    private fun applySpeechRate() {
        tts?.setSpeechRate(prefs.getFloat("speech_rate", 1.0f).coerceIn(0.5f, 3.0f))
    }

    // Intentionally do not speak accessibility events automatically.
    // Speech is produced only by an explicit user gesture or the manual
    // "Describe Screen" command.
    override fun onAccessibilityEvent(event: AccessibilityEvent?) = Unit


    private fun describeSelectedImage(node: AccessibilityNodeInfo) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
            speak("Image selected. This Android version does not support image recognition here.")
            return
        }
        val bounds = Rect()
        node.getBoundsInScreen(bounds)
        if (bounds.isEmpty) {
            speak("Image selected, but its picture area is unavailable.")
            return
        }
        speak("Analyzing selected image.")
        takeScreenshot(Display.DEFAULT_DISPLAY, mainExecutor, object : TakeScreenshotCallback {
            override fun onSuccess(screenshot: ScreenshotResult) {
                val hardwareBitmap = Bitmap.wrapHardwareBuffer(screenshot.hardwareBuffer, screenshot.colorSpace)
                screenshot.hardwareBuffer.close()
                if (hardwareBitmap == null) {
                    speak("I could not read this image.")
                    return
                }
                val screen = hardwareBitmap.copy(Bitmap.Config.ARGB_8888, false)
                hardwareBitmap.recycle()
                val left = bounds.left.coerceIn(0, screen.width - 1)
                val top = bounds.top.coerceIn(0, screen.height - 1)
                val right = bounds.right.coerceIn(left + 1, screen.width)
                val bottom = bounds.bottom.coerceIn(top + 1, screen.height)
                val crop = Bitmap.createBitmap(screen, left, top, right - left, bottom - top)
                screen.recycle()
                val labeler = ImageLabeling.getClient(ImageLabelerOptions.DEFAULT_OPTIONS)
                labeler.process(InputImage.fromBitmap(crop, 0))
                    .addOnSuccessListener { labels ->
                        val words = labels.sortedByDescending { it.confidence }.take(3).map { it.text }
                        speak(if (words.isEmpty()) "I could not identify the contents of this photo."
                              else "Image description: " + words.joinToString(", "))
                    }
                    .addOnFailureListener { speak("I could not describe this image.") }
                    .addOnCompleteListener {
                        crop.recycle()
                        labeler.close()
                    }
            }
            override fun onFailure(errorCode: Int) {
                speak("Image recognition is unavailable for this screen.")
            }
        })
    }

    private fun collectUsefulLabels(node: AccessibilityNodeInfo, out: MutableList<String>, depth: Int) {
        if (depth > 5 || out.size > 30) return
        val label = (node.text ?: if (prefs.getBoolean("speak_hints", true)) node.contentDescription else null)
            ?.toString()?.trim()
        if (!label.isNullOrEmpty()) out.add(label)
        for (i in 0 until node.childCount) {
            node.getChild(i)?.let { child ->
                collectUsefulLabels(child, out, depth + 1)
                child.recycle()
            }
        }
    }

    private fun describeActiveScreen() {
        if (!prefs.getBoolean("screen_description", true)) {
            speak("Screen Description is turned off in Accessible settings.")
            return
        }
        val root = rootInActiveWindow
        if (root == null) {
            speak("The current screen is not available to describe.")
            return
        }
        val items = mutableListOf<String>()
        collectScreenDescription(root, items, 0)
        root.recycle()
        val description = items.distinct().take(80)
        val result = if (description.isEmpty()) {
            "No readable screen text or accessibility descriptions were provided by this app."
        } else {
            "Screen description. " + description.joinToString(". ")
        }
        speak(result.take(3500))
    }

    private fun collectScreenDescription(node: AccessibilityNodeInfo, out: MutableList<String>, depth: Int) {
        if (depth > 12 || out.size >= 80 || !node.isVisibleToUser) return
        val label = (node.text ?: node.contentDescription)?.toString()?.trim()?.takeIf { it.isNotEmpty() }
        val className = node.className?.toString()?.substringAfterLast('.') ?: "item"
        val role = when {
            className.contains("Button", true) -> "Button"
            className.contains("Image", true) -> "Image"
            className.contains("CheckBox", true) -> "Checkbox"
            className.contains("EditText", true) -> "Text field"
            className.contains("Switch", true) -> "Switch"
            node.isScrollable -> "Scrollable area"
            else -> ""
        }
        if (label != null) out.add(if (role.isNotEmpty()) "$role: $label" else label)
        else if (role.isNotEmpty() && node.isClickable) out.add("Unlabeled $role")
        for (i in 0 until node.childCount) {
            node.getChild(i)?.let { child ->
                collectScreenDescription(child, out, depth + 1)
                child.recycle()
            }
        }
    }

    override fun onGesture(gestureId: Int): Boolean {
        // Only the two requested diagonal gestures navigate.
        // All cardinal (left, right, up, down) swipes are intentionally ignored.
        if (!prefs.getBoolean("diagonal_gestures", true)) return false

        val root = rootInActiveWindow ?: return false
        val handled = when (gestureId) {
            GESTURE_SWIPE_UP_AND_RIGHT -> moveAccessibilityFocus(root, next = true)
            GESTURE_SWIPE_DOWN_AND_LEFT -> moveAccessibilityFocus(root, next = false)
            else -> false
        }
        root.recycle()
        return handled
    }

    private fun moveAccessibilityFocus(root: AccessibilityNodeInfo, next: Boolean): Boolean {
        val nodes = mutableListOf<AccessibilityNodeInfo>()
        collectFocusable(root, nodes, 0)
        if (nodes.isEmpty()) {
            speak("No navigable items")
            return true
        }
        val currentIndex = nodes.indexOfFirst { it.isAccessibilityFocused }
        val targetIndex = when {
            currentIndex < 0 && next -> 0
            currentIndex < 0 -> nodes.lastIndex
            next -> (currentIndex + 1).coerceAtMost(nodes.lastIndex)
            else -> (currentIndex - 1).coerceAtLeast(0)
        }
        val target = nodes[targetIndex]
        target.performAction(AccessibilityNodeInfo.ACTION_ACCESSIBILITY_FOCUS)
        val label = (target.text ?: target.contentDescription)?.toString()
        if (!label.isNullOrBlank()) speak(label)
        nodes.forEach { it.recycle() }
        return true
    }

    private fun collectFocusable(node: AccessibilityNodeInfo, out: MutableList<AccessibilityNodeInfo>, depth: Int) {
        if (depth > 12 || out.size >= 100 || !node.isVisibleToUser) return
        if (node.isImportantForAccessibility && (node.isFocusable || node.isClickable || node.text != null || node.contentDescription != null)) {
            out.add(AccessibilityNodeInfo.obtain(node))
        }
        for (i in 0 until node.childCount) {
            node.getChild(i)?.let { child ->
                collectFocusable(child, out, depth + 1)
                child.recycle()
            }
        }
    }

    private fun scroll(node: AccessibilityNodeInfo, forward: Boolean, horizontal: Boolean): Boolean {
        if (node.isScrollable) {
            val action = when {
                horizontal && forward -> AccessibilityNodeInfo.AccessibilityAction.ACTION_SCROLL_RIGHT.id
                horizontal -> AccessibilityNodeInfo.AccessibilityAction.ACTION_SCROLL_LEFT.id
                forward -> AccessibilityNodeInfo.ACTION_SCROLL_FORWARD
                else -> AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD
            }
            if (node.performAction(action)) return true
        }
        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            val done = scroll(child, forward, horizontal)
            child.recycle()
            if (done) return true
        }
        return false
    }

    private fun speak(message: String) {
        if (ready) {
            applySpeechRate()
            tts?.speak(message, TextToSpeech.QUEUE_FLUSH, null, "accessible-feedback")
        }
    }

    override fun onInterrupt() { tts?.stop() }

    override fun onDestroy() {
        if (describeReceiverRegistered) unregisterReceiver(describeReceiver)
        tts?.stop()
        tts?.shutdown()
        tts = null
        super.onDestroy()
    }
}
