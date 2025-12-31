# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# Capacitor ProGuard Rules
-keep class com.getcapacitor.** { *; }
-keep interface com.getcapacitor.** { *; }
-keep public class * extends com.getcapacitor.Plugin

# Keep the MainActivity entry point
-keep public class com.frisko.app.MainActivity { *; }

# WebView support
-keepclassmembers class fqcn.of.javascript.interface.for.webview {
   public *;
}
-keepattributes SourceFile,LineNumberTable
