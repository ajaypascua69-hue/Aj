package org.ajaypascua.accessible

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import android.speech.tts.TextToSpeech
import java.util.Locale

class AccessibleService : AccessibilityService(), TextToSpeech.OnInitListener {
    private var tts: TextToSpeech? = null
    private var ready = false
    private var lastSpoken = ""

    override fun onServiceConnected() {
        super.onServiceConnected()
        tts = TextToSpeech(this, this)
    }

    override fun onInit(status: Int) {
        ready = status == TextToSpeech.SUCCESS
        if (ready) tts?.language = Locale.getDefault()
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (!ready || event == null) return
        val parts = mutableListOf<String>()
        event.text.mapNotNullTo(parts) { it?.toString()?.trim()?.takeIf(String::isNotEmpty) }
        event.contentDescription?.toString()?.trim()?.takeIf(String::isNotEmpty)?.let(parts::add)
        event.source?.let { node ->
            collectUsefulLabels(node, parts, 0)
            node.recycle()
        }
        val message = parts.distinct().joinToString(". ").take(500)
        if (message.isNotBlank() && message != lastSpoken) {
            lastSpoken = message
            tts?.speak(message, TextToSpeech.QUEUE_ADD, null, "accessible-event")
        }
    }

    private fun collectUsefulLabels(node: AccessibilityNodeInfo, out: MutableList<String>, depth: Int) {
        if (depth > 5 || out.size > 30) return
        val label = (node.text ?: node.contentDescription)?.toString()?.trim()
        if (!label.isNullOrEmpty()) out.add(label)
        for (i in 0 until node.childCount) {
            node.getChild(i)?.let { child ->
                collectUsefulLabels(child, out, depth + 1)
                child.recycle()
            }
        }
    }

    override fun onGesture(gestureId: Int): Boolean {
        val root = rootInActiveWindow ?: return false
        val handled = when (gestureId) {
            GESTURE_SWIPE_UP -> scroll(root, forward = false, horizontal = false)
            GESTURE_SWIPE_DOWN -> scroll(root, forward = true, horizontal = false)
            GESTURE_SWIPE_LEFT -> scroll(root, forward = true, horizontal = true)
            GESTURE_SWIPE_RIGHT -> scroll(root, forward = false, horizontal = true)
            GESTURE_SWIPE_UP_AND_LEFT, GESTURE_SWIPE_UP_AND_RIGHT -> {
                speak("Previous item")
                true
            }
            GESTURE_SWIPE_DOWN_AND_LEFT, GESTURE_SWIPE_DOWN_AND_RIGHT -> {
                speak("Next item")
                true
            }
            else -> false
        }
        root.recycle()
        return handled
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
        if (ready) tts?.speak(message, TextToSpeech.QUEUE_FLUSH, null, "accessible-gesture")
    }

    override fun onInterrupt() { tts?.stop() }
    override fun onDestroy() {
        tts?.stop()
        tts?.shutdown()
        tts = null
        super.onDestroy()
    }
}
