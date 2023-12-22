import { useEffect, useState } from "react";
import {
  useCommonStore,
  useCommoneActions,
  useRepeatMode,
  useTimer,
  useToken,
  useUserInfo,
} from "../store/user";
import { NavigationContainer } from "@react-navigation/native";
import { format, getNetwordState, navigationRef } from "../common/utils";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/global";
import TabNav from "./TabNav";
import HomeNav from "./HomeNav";
import UserSetting from "./UserSetting";
import AuthNav from "./AuthNav";
import BackgroundTimer from "react-native-background-timer";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import TrackPlayer, { usePlaybackState } from "react-native-track-player";
import {
  useRewardedInterstitialAd,
  useAppOpenAd,
} from "react-native-google-mobile-ads";
import { adUnitId, openUnitId } from "../common/constant";
import * as SplashScreen from "expo-splash-screen";
import { Platform } from "react-native";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  const timer = useTimer();
  const updateTimer = useCommoneActions().setTimer;
  const repeatMode = useRepeatMode();
  const [endSound, setEndSound] = useState<Audio.Sound>();
  const [showTab, setShowTab] = useState(false);
  const userInfo = useUserInfo();
  const setCurrentPlayListID = useCommoneActions().setCurrentPlayListID;
  const setCurrentPlayList = useCommoneActions().setCurrentPlayList;
  const playbackState = usePlaybackState();
  const { isLoaded, isClosed, load, show } = useAppOpenAd(openUnitId, {
    requestNonPersonalizedAdsOnly: true,
    keywords: ["fashion", "clothing"],
  });

  const token = useToken();

  async function setUpAudio() {
    await Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: true,
      allowsRecordingIOS: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      playsInSilentModeIOS: true,
    });
  }

  async function playSound() {
    console.log("Loading Sound");
    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/audios/end.mp3"),
      { shouldPlay: true }
    );
    setEndSound(sound);

    console.log("Playing Sound");
    await sound.playAsync();

    setTimeout(async () => {
      await TrackPlayer.play();
    }, 750);
  }

  async function setRepeat() {
    await TrackPlayer.setRepeatMode(repeatMode);
  }

  async function OpenTab() {
    setShowTab(true);
    await SplashScreen.hideAsync();
  }

  useEffect(() => {
    if (token) AppToken = token;
  }, [token]);

  useEffect(() => {
    const Inter = BackgroundTimer.setInterval(function () {
      if (timer.current - 1 < 0) {
        timer.current === 0 && playSound();
        updateTimer({
          ...timer,
          current: -1,
          duration: 30 * 60,
          isRunning: false,
          isStop: false,
        });
      } else {
        updateTimer({ ...timer, current: timer.current-- });
      }
    }, 1000);

    if (!timer.isRunning) {
      BackgroundTimer.clearInterval(Inter);
    }

    return () => BackgroundTimer.clearInterval(Inter);
  }, [timer.isRunning]);

  useEffect(() => {
    setRepeat();
    setUpAudio();
  }, []);

  useEffect(() => {
    return endSound
      ? () => {
          endSound.unloadAsync();
        }
      : undefined;
  }, [endSound]);

  useEffect(() => {
    if (timer.current === 0) {
      updateTimer({
        ...timer,
        current: -1,
        duration: 30 * 60,
        isRunning: false,
        isStop: false,
      });
    }
    console.log(timer);
  }, [timer.current]);

  useEffect(() => {
    if (userInfo.is_member === 1) {
      OpenTab();
      return;
    } else {
      console.log(`is show tab ${showTab}`);

      !showTab && load();
    }
  }, [load, showTab]);

  useEffect(() => {
    console.log(`is loaded ${isLoaded}`);

    if (isLoaded) {
      userInfo.is_member === 0 && !showTab && show();
    }
    if (isClosed || userInfo.is_member === 1) {
      OpenTab();
    }
  }, [isLoaded, isClosed]);

  useEffect(() => {
    console.log(`is member ${userInfo.is_member === 1}`);
    if (userInfo.is_member === 1) {
      OpenTab();
      return;
    }
    getNetwordState().then((res) => {
      if (res.type === "NONE") {
        OpenTab();
      }
      return;
    });

    const timer = setTimeout(() => {
      console.log("in timer");

      if (!showTab) {
        OpenTab();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (playbackState.state === "ended") {
      setCurrentPlayList([]);
      setCurrentPlayListID(0);
    }
  }, [playbackState]);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Index"
        screenOptions={{ animation: "slide_from_right" }}
      >
        {TabNav(Stack)}
        {HomeNav(Stack)}
        {UserSetting(Stack)}
        {AuthNav(Stack)}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
