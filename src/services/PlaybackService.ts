import TrackPlayer from "react-native-track-player";
import { Event } from "react-native-track-player/lib/constants";
import {
  useCommonStore,
  useCurrentPlayListID,
  useShuffleList,
} from "../store/user";

let c: string | number = 0;
let sList: (string | number)[] = [];

const subCurrent = useCommonStore.subscribe((state, prev) => {
  console.log("change");

  if (state.currentPlayListID !== prev.currentPlayListID) {
    c = state.currentPlayListID;
  }
  if (state.shuffleLists !== prev.shuffleLists) {
    sList = state.shuffleLists;
  }
});

subCurrent();

/**
 * services
 */
export async function PlaybackService() {
  TrackPlayer.addEventListener(Event.RemotePause, () => {
    console.log("Event.RemotePause");
    TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    console.log("Event.RemotePlay");
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    console.log("Event.RemoteNext");
    TrackPlayer.skipToNext();
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    console.log("Event.RemotePrevious");
    sList.includes(c) ? TrackPlayer.seekTo(0) : TrackPlayer.skipToPrevious();
  });

  TrackPlayer.addEventListener(Event.RemoteJumpForward, async (event) => {
    console.log("Event.RemoteJumpForward", event);
    TrackPlayer.seekBy(event.interval);
  });

  TrackPlayer.addEventListener(Event.RemoteJumpBackward, async (event) => {
    console.log("Event.RemoteJumpBackward", event);
    TrackPlayer.seekBy(-event.interval);
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
    console.log("Event.RemoteSeek", event);
    TrackPlayer.seekTo(event.position);
  });

  TrackPlayer.addEventListener(Event.RemoteDuck, async (event) => {
    console.log("Event.RemoteDuck", event);
  });

  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, (event) => {
    console.log("Event.PlaybackQueueEnded", event);
  });

  TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, (event) => {
    console.log("Event.PlaybackActiveTrackChanged", event);
  });

  TrackPlayer.addEventListener(Event.PlaybackPlayWhenReadyChanged, (event) => {
    console.log("Event.PlaybackPlayWhenReadyChanged", event);
  });

  TrackPlayer.addEventListener(Event.PlaybackState, (event) => {
    console.log("Event.PlaybackState", event);
  });

  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    console.log("Event.RemoteStop");
  });

  TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, (event) => {
    console.log("Event.PlaybackProgressUpdated", event);
  });

  TrackPlayer.addEventListener(
    Event.PlaybackMetadataReceived,
    async ({ title, artist }) => {
      const activeTrack = await TrackPlayer.getActiveTrack();
      TrackPlayer.updateNowPlayingMetadata({
        artist: [title, artist].filter(Boolean).join(" - "),
        title: activeTrack?.title,
        artwork: activeTrack?.artwork,
      });
    }
  );
}
