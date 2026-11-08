package org.ajaypascua.accessible

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import android.view.Gravity
import android.widget.Button
import android.widget.LinearLayout
import android.widget.SeekBar
import android.widget.Switch
import android.widget.TextView

class MainActivity : Activity() {
    private val prefs by lazy { getSharedPreferences("accessible_settings", MODE_PRIVATE) }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val page = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(28, 28, 28, 28)
        }
        page.addView(TextView(this).apply {
            text = "Accessible - 2"
            textSize = 28f
        })
        page.addView(TextView(this).apply {
            text = "Screen reader settings"
            textSize = 20f
            setPadding(0, 18, 0, 8)
        })
        page.addView(TextView(this).apply {
            text = "Speech"
            textSize = 18f
            setPadding(0, 12, 0, 4)
        })
        page.addView(TextView(this).apply {
            text = "Speech rate"
            textSize = 16f
        })
        val rateLabel = TextView(this)
        val rate = SeekBar(this).apply {
            max = 250
            progress = (prefs.getFloat("speech_rate", 1.0f) * 100).toInt().coerceIn(50, 300) - 50
            setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
                override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
                    val value = (progress + 50) / 100f
                    rateLabel.text = "Speech rate: %.1fx".format(value)
                    if (fromUser) prefs.edit().putFloat("speech_rate", value).apply()
                }
                override fun onStartTrackingTouch(seekBar: SeekBar?) {}
                override fun onStopTrackingTouch(seekBar: SeekBar?) {}
            })
        }
        rateLabel.text = "Speech rate: %.1fx".format(prefs.getFloat("speech_rate", 1.0f))
        page.addView(rateLabel)
        page.addView(rate)

        fun addToggle(label: String, key: String, default: Boolean = true) {
            page.addView(Switch(this).apply {
                text = label
                isChecked = prefs.getBoolean(key, default)
                setOnCheckedChangeListener { _, checked -> prefs.edit().putBoolean(key, checked).apply() }
                textSize = 16f
                setPadding(0, 8, 0, 8)
            })
        }
        addToggle("Speak screen changes", "speak_events")
        addToggle("Speak hints and control descriptions", "speak_hints")
        addToggle("Read text and control labels", "read_labels")
        addToggle("Screen Description feature", "screen_description")
        addToggle("Directional swipe navigation", "directional_gestures")
        addToggle("Diagonal previous/next navigation", "diagonal_gestures")

        page.addView(TextView(this).apply {
            text = "Screen Description"
            textSize = 18f
            setPadding(0, 20, 0, 4)
        })
        page.addView(TextView(this).apply {
            text = "Describe the text, buttons, icons and image descriptions exposed by the current app. Unlabeled photos require an image-understanding service and may not be recognized in this test build."
            textSize = 14f
        })
        page.addView(Button(this).apply {
            text = "Describe Current Screen"
            setOnClickListener {
                sendBroadcast(Intent("org.ajaypascua.accessible.DESCRIBE_SCREEN").setPackage(packageName))
            }
        })
        page.addView(Button(this).apply {
            text = "Enable Accessible - 2"
            setOnClickListener { startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)) }
        })
        page.addView(Button(this).apply {
            text = "Open Android Text-to-Speech Settings"
            setOnClickListener { startActivity(Intent("com.android.settings.TTS_SETTINGS")) }
        })
        page.addView(TextView(this).apply {
            text = "\nGesture note: Android and individual apps control which touch gestures reach an accessibility service. Gesture behavior can vary by device."
            textSize = 13f
        })
        setContentView(page)
    }
}
