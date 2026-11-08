package com.cloudbox.app;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
public class MainActivity extends Activity {
 private ValueCallback<Uri[]> uploadCallback;
 private static final int FILE_PICKER = 41;
 @Override public void onCreate(Bundle savedInstanceState){super.onCreate(savedInstanceState);
  WebView web=new WebView(this); WebSettings settings=web.getSettings(); settings.setJavaScriptEnabled(true); settings.setDomStorageEnabled(true); settings.setAllowFileAccess(true); settings.setAllowContentAccess(true);
  web.setWebChromeClient(new WebChromeClient(){
   @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params){
    if(uploadCallback!=null)uploadCallback.onReceiveValue(null); uploadCallback=callback;
    Intent intent=params.createIntent(); try{startActivityForResult(intent,FILE_PICKER);return true;}catch(Exception e){uploadCallback=null;return false;}
   }
  });
  web.setWebViewClient(new WebViewClient()); setContentView(web); web.loadUrl("file:///android_asset/www/index.html");
 }
 @Override protected void onActivityResult(int requestCode,int resultCode,Intent data){super.onActivityResult(requestCode,resultCode,data);if(requestCode==FILE_PICKER&&uploadCallback!=null){Uri[] result=WebChromeClient.FileChooserParams.parseResult(resultCode,data);uploadCallback.onReceiveValue(result);uploadCallback=null;}}
 @Override public void onBackPressed(){WebView w=(WebView)((android.view.ViewGroup)findViewById(android.R.id.content)).getChildAt(0);if(w.canGoBack())w.goBack();else super.onBackPressed();}
}