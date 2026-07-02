import Flutter
import UIKit
import UserNotifications

@main
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    GeneratedPluginRegistrant.register(with: self)
    // Required for iOS notification taps to reach Flutter: FlutterAppDelegate
    // implements UNUserNotificationCenterDelegate and forwards willPresent /
    // didReceiveResponse to the plugins registered as application delegates
    // (flutter_local_notifications for the daily routine reminder, and
    // firebase_messaging once push is enabled). Without this, scheduled
    // notifications still display but taps — including cold-start launch
    // details — never fire. Pointing the center at self is the shared,
    // conflict-free setup both plugins recommend.
    if #available(iOS 10.0, *) {
      UNUserNotificationCenter.current().delegate = self
    }
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
