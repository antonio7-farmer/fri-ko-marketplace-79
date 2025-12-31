package com.frisko.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import android.view.View;
import android.view.WindowInsetsController;

public class MainActivity extends BridgeActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Enable edge-to-edge display (Android 10+)
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
      getWindow().setDecorFitsSystemWindows(false);

      // Set status bar appearance
      View decorView = getWindow().getDecorView();
      WindowInsetsController controller = decorView.getWindowInsetsController();
      if (controller != null) {
        // Light status bar (dark icons) for light backgrounds
        controller.setSystemBarsAppearance(
          WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS,
          WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS
        );
      }
    }
  }
}
