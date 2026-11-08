package org.ajaypascua.accessible

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import android.view.Gravity
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

class MainActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setPadding(32, 40, 32, 40)
        }
        layout.addView(TextView(this).apply {
            text = "Accessible\n\nAn experimental screen reader that speaks on-screen text and accessibility labels. Enable the service below to try it."
            textSize = 20f
            contentDescription = "Accessible. Experimental screen reader. Reads on-screen text and accessibility labels."
        })
        layout.addView(Button(this).apply {
            text = "Open Accessibility Settings"
            setOnClickListener { startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)) }
        })
        layout.addView(TextView(this).apply {
            text = "\nNote: This early test build does not yet provide reliable automatic photo recognition or complete two-dimensional gesture navigation. Android may require you to confirm the service manually."
            textSize = 14f
        })
        setContentView(layout)
    }
}
