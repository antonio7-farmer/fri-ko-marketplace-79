import { useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export interface StatusBarConfig {
  backgroundColor?: string;
  style?: 'DARK' | 'LIGHT' | 'DEFAULT';
  overlay?: boolean;
}

/**
 * Hook to manage status bar appearance
 * @param config - Status bar configuration
 */
export const useStatusBar = (config: StatusBarConfig = {}) => {
  const {
    backgroundColor = '#FFFFFF',
    style = 'DARK',
    overlay = true,
  } = config;

  useEffect(() => {
    // Only run on native platforms
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const configureStatusBar = async () => {
      try {
        // Set overlay mode
        await StatusBar.setOverlaysWebView({ overlay });

        // Set background color
        await StatusBar.setBackgroundColor({ color: backgroundColor });

        // Set style (icon color)
        const styleMap: Record<string, Style> = {
          DARK: Style.Dark,
          LIGHT: Style.Light,
          DEFAULT: Style.Default,
        };
        await StatusBar.setStyle({ style: styleMap[style] });
      } catch (error) {
        console.error('Failed to configure status bar:', error);
      }
    };

    configureStatusBar();
  }, [backgroundColor, style, overlay]);
};

/**
 * Show the status bar
 */
export const showStatusBar = async () => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await StatusBar.show();
  } catch (error) {
    console.error('Failed to show status bar:', error);
  }
};

/**
 * Hide the status bar
 */
export const hideStatusBar = async () => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await StatusBar.hide();
  } catch (error) {
    console.error('Failed to hide status bar:', error);
  }
};
