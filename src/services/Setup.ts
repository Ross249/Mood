import TrackPlayer from "react-native-track-player";
import {
  AppKilledPlaybackBehavior,
  Capability,
} from "react-native-track-player/lib/constants";

const setupPlayer = async (
  options: Parameters<typeof TrackPlayer.setupPlayer>[0]
) => {
  const setup = async () => {
    try {
      await TrackPlayer.setupPlayer(options);
    } catch (error) {
      return (error as Error & { code?: string }).code;
    }
  };
  while ((await setup()) === "android_cannot_setup_player_in_background") {
    // A timeout will mostly only execute when the app is in the foreground,
    // and even if we were in the background still, it will reject the promise
    // and we'll try again:
    await new Promise<void>((resolve) => setTimeout(resolve, 1));
  }
};

/**
 * set up service
 */
export const SetupService = async () => {
  await setupPlayer({
    autoHandleInterruptions: true,
    autoUpdateMetadata: true,
  });
  await TrackPlayer.updateOptions({
    // Media controls capabilities

    android: {
      // This is the default behavior
      appKilledPlaybackBehavior:
        AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
    },
    alwaysPauseOnInterruption: true,
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.Skip,
      Capability.SeekTo,
    ],

    // Capabilities that will show up when the notification is in the compact form on Android
    compactCapabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,

      Capability.Skip,
      Capability.SkipToPrevious,
      Capability.SeekTo,
    ],
    progressUpdateEventInterval: 0.5,
    // Icons for the notification on Android (if you don't like the default ones)
  });
};
