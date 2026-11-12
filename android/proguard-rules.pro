# ScrollCoordination.getReactScrollEnabled() looks up `getScrollEnabled()` reflectively by name on
# the scroll views under a touch (ReactScrollView, ReactHorizontalScrollView,
# ReactNestedScrollView and third-party views). Keep the name so R8/ProGuard in release builds
# never renames or strips it, which would make every scroll view with `scrollEnabled={false}`
# read as scrollable and take the drag from the sheet.
-keepclassmembers class * extends android.view.View {
    public boolean getScrollEnabled();
}
