import { createNavigationContainerRef } from "@react-navigation/native";
import { RootStackParamList } from "../types/global";
import { API_URL } from "./API_URL";
import { Share } from "react-native";
import * as MailComposer from "expo-mail-composer";
import { MailComposerStatus } from "expo-mail-composer";
import { Song } from "../types/response";
import * as Network from "expo-network";
import { Track } from "react-native-track-player";

// custom request
export async function ST_request({
  method = "GET",
  path = "",
  data,
}: {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  data?: Object;
}) {
  let response;
  console.log("------REQ-----");
  console.log(API_URL + path);
  console.log(data);
  const headers = {
    Authorization: "Bearer " + AppToken || "",
    "Content-type": "application/json",
  };
  if (method === "PUT" || method === "POST") {
    response = await fetch(`${API_URL}${path}`, {
      headers,
      method,
      body: JSON.stringify(data),
    });
  } else {
    response = await fetch(`${API_URL}${path}`, { headers, method });
  }

  if (response.status === 401) {
    // Toast.show("Please Login")
    throw new Error("Please Login first!");
  }
  if (response.status !== 200) {
    // console.log(await response.text());
    throw new Error("Network response was not ok");
  }
  const _json = await response.json();
  console.log("res");
  // console.log(_json);
  if (_json.code === 401) navigationRef.navigate("Auth.signin");
  if (_json.code !== 200) throw new Error(_json.message);
  console.log(_json.data);
  return _json.data;
}

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * songs' duration time formatter
 * @param seconds
 * @returns
 */
export const format = (seconds: number) => {
  let mins = parseInt((seconds / 60).toString())
    .toString()
    .padStart(2, "0");
  let secs = (Math.trunc(seconds) % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

// contact us
export const ClickToContact = async () => {
  const isAvaliable = await MailComposer.isAvailableAsync();
  if (isAvaliable) {
    await MailComposer.composeAsync({
      recipients: ["info@moodmusics.com"],
    });
  } else {
    Toast.show("Your phone can not send email");
    return;
  }
};

export async function getNetwordState() {
  const state = await Network.getNetworkStateAsync();
  return state;
}

// format song to track
export const formatTrack = async (data: Song[]) => {
  const netWork = await Network.getNetworkStateAsync();

  let newList: Track[] = [];
  data.map((song, i) =>
    newList.push({
      id: song.id,
      title: song.title,
      artist: "",
      url: `${API_URL}/app/v1/music/play?id=${song.id}&streaming_type=${
        netWork.type === "WIFI" ? "wifi_streaming" : "data_streaming"
      }`,
      duration: song.length,
      artwork: song.album_cover,
      genre: song.genre,
    })
  );
  return newList;
};

// share to friends
export const ClickToShare = async () => {
  try {
    const res = await Share.share({
      title: "MOOD Lofi Music",
      message: `Mood Musics |  Lofi. Chill. Study. Meditate. SleepImmerse yourself in beats designed for focus, flow and creativity. Click here for details: https://www.moodmusics.com/Download our app to enjoy ad-free Lofi Musics, over 2,000+ lofi music in the app, plus offline and background playback.`,
    });
    if (res.action === Share.sharedAction) {
      if (res.activityType) {
        // shared with activity type of result.activityType
      } else {
        // shared
      }
    } else if (res.action === Share.dismissedAction) {
      // dismissed
    }
  } catch (error) {
    Toast.show(error instanceof Error ? error.message : "");
  } finally {
    return;
  }
};
