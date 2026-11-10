package com.ajaypascua.secureaudio

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.ajaypascua.secureaudio.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            showStatus("Microphone permission granted. The app is ready.")
            Toast.makeText(this, "Permission granted.", Toast.LENGTH_SHORT).show()
        } else {
            showStatus("Microphone permission denied. You can try again.")
            Toast.makeText(this, "Permission denied.", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.actionButton.setOnClickListener {
            checkAndRequestAudioPermission()
        }
    }

    override fun onResume() {
        super.onResume()
        if (::binding.isInitialized &&
            ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.RECORD_AUDIO
            ) == PackageManager.PERMISSION_GRANTED
        ) {
            showStatus("Microphone permission is active. The app is ready.")
        }
    }

    private fun checkAndRequestAudioPermission() {
        val permission = Manifest.permission.RECORD_AUDIO

        when {
            ContextCompat.checkSelfPermission(this, permission) ==
                PackageManager.PERMISSION_GRANTED -> {
                showStatus("Microphone permission is already active.")
                Toast.makeText(
                    this,
                    "Permission already active.",
                    Toast.LENGTH_SHORT
                ).show()
            }

            shouldShowRequestPermissionRationale(permission) -> {
                showStatus("Microphone access is needed only when you choose to use audio features. Tap again to continue.")
                requestPermissionLauncher.launch(permission)
            }

            else -> requestPermissionLauncher.launch(permission)
        }
    }

    private fun showStatus(message: String) {
        binding.statusText.text = message
    }
}
