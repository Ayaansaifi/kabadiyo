package com.kabadiwala.app;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Hide only if ActionBar exists as fallback
        if (getSupportActionBar() != null) {
            getSupportActionBar().hide();
        }
    }
}
