import { AppRegistry } from "react-native";
import { registerRootComponent } from "expo";
import App from "./App";
import { name as appName } from "./app.json";
import TrackPlayer from "react-native-track-player";
import { PlaybackService } from "./src/services";

// AppRegistry.registerComponent(appName, () => App);
registerRootComponent(App);
TrackPlayer.registerPlaybackService(() => PlaybackService);
