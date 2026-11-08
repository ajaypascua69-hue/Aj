package com.cloudbox.app;
import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
public class MainActivity extends Activity {
 @Override public void onCreate(Bundle savedInstanceState){super.onCreate(savedInstanceState);
  WebView web=new WebView(this); WebSettings settings=web.getSettings(); settings.setJavaScriptEnabled(true); settings.setDomStorageEnabled(true); settings.setAllowFileAccess(true); settings.setAllowContentAccess(true);
  web.setWebChromeClient(new WebChromeClient()); web.setWebViewClient(new WebViewClient()); setContentView(web); web.loadUrl("file:///android_asset/www/index.html");
 }
 @Override public void onBackPressed(){ WebView w=(WebView)((android.view.ViewGroup)findViewById(android.R.id.content)).getChildAt(0); if(w.canGoBack())w.goBack();else super.onBackPressed(); }
}