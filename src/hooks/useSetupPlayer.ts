import { useEffect, useState } from "react";
import { InitalSongs, SetupService } from "../services";
import TrackPlayer from "react-native-track-player";

export function useSetupPlayer() {
  const [playerReady, setPlayerReady] = useState(false);
  useEffect(() => {
    let unmounted = false;
    (async () => {
      await SetupService();
      if (unmounted) return;
      setPlayerReady(true);
      const queue = await TrackPlayer.getQueue();
      if (unmounted) return;
      if (queue.length <= 0) {
        await InitalSongs();
      }
    })();
    return () => {
      unmounted = true;
    };
  }, []);
  return playerReady;
}
