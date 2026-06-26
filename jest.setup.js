jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  return {
    GestureHandlerRootView: View,
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    PanGestureHandler: View,
    gestureHandlerRootHOC: (component: unknown) => component,
    Directions: {},
  };
});
