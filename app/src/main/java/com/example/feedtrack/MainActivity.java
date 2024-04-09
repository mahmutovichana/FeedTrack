package com.example.feedtrack;

import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends AppCompatActivity {

    WebView feedtrack;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        feedtrack = findViewById(R.id.feedtrack);
        feedtrack.getSettings().setJavaScriptEnabled(true);
        feedtrack.setWebViewClient(new WebViewClient());
        feedtrack.loadUrl("https://feedtrack.vercel.app/userFeedback");
    }
}