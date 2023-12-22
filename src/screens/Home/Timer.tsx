import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { RootStackScreenProps } from "../../types/global";
import { adUnitId, generalProperties } from "../../common/constant";
import globalState from "../../common/globalState";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import WheelPicker from "react-native-wheely";
import { useCommoneActions, useTimer, useUserInfo } from "../../store/user";
import { format } from "../../common/utils";
import { Audio } from "expo-av";
import {
  BannerAd,
  BannerAdSize,
} from "react-native-google-mobile-ads";
import TrackPlayer, {
  useActiveTrack,
  usePlaybackState,
} from "react-native-track-player";

const Timer = ({ navigation, route }: RootStackScreenProps<"Timer">) => {
  const timer = useTimer();
  const activeTrack = useActiveTrack();
  const setTimer = useCommoneActions().setTimer;
  const [startSound, setStartSound] = useState<Audio.Sound>();
  const playbackState = usePlaybackState();
  const userInfo = useUserInfo();

  const [index, setIndex] = useState(1);

  // array of all options
  const min = 15,
    max = 240,
    interval = 15;
  const length = (max - min) / interval + 1;
  const arr = Array.from({ length }, (_, i) => (min + i * interval).toString());

  // play start sound
  async function PlaySound() {
    console.log("loading");
    const { sound } = await Audio.Sound.createAsync(
      require("../../../assets/audios/start.mp3")
    );
    setStartSound(sound);
    await sound?.playAsync();
  }

  // circle center
  function timerCenter() {
    return (
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {timer.current <= 0 ? (
          <>
            <WheelPicker
              selectedIndex={index}
              options={arr}
              onChange={(index) => setIndex(index)}
              itemStyle={{
                // backgroundColor: "green",
                alignItems: "center",
                justifyContent: "center",

                minHeight: 60,
              }}
              // containerStyle={{ backgroundColor: "blue" }}
              selectedIndicatorStyle={{
                backgroundColor: "rgba(0,0,0,0)",
              }}
              scaleFunction={(n) => 0.5}
              itemTextStyle={{
                color: "#fff",
                fontFamily: "regular",
                fontSize: 48,
                textAlign: "center",
              }}
            />
            <Text
              style={{
                ...styles.header_text,
                marginLeft: -16,
                fontSize: 16,
                lineHeight: 24,
                marginTop: 44,
              }}
            >
              mins
            </Text>
          </>
        ) : (
          <View style={{ alignItems: "baseline", flexDirection: "row" }}>
            {parseInt(format(timer.current).split(":")[0]) > 0 && (
              <>
                <Text style={{ ...styles.header_text, fontSize: 48 }}>
                  {format(timer.current).split(":")[0]}
                </Text>
                <Text style={{ ...styles.header_text, fontSize: 16 }}>m</Text>
              </>
            )}

            <Text style={{ ...styles.header_text, fontSize: 48 }}>
              {parseInt(format(timer.current).split(":")[1]) > 0
                ? format(timer.current).split(":")[1]
                : 0}
            </Text>
            <Text style={{ ...styles.header_text, fontSize: 16 }}>s</Text>
          </View>
        )}
      </View>
    );
  }

  // start method
  async function startHandler() {
    setTimer({
      ...timer,
      current: parseInt(arr[index]) * 60,
      duration: parseInt(arr[index]) * 60,
      // current: parseInt(arr[index]),
      // duration: parseInt(arr[index]),
      isRunning: true,
    });
    // await PlaySound();

    // setTimeout(async () => {
    //   await TrackPlayer.play();
    // }, 1000);
  }

  // stop timer
  function stopHandler() {
    setTimer({ ...timer, isStop: true, isRunning: false });
  }

  // reset timer
  function resetHandler() {
    setTimer({
      ...timer,
      isRunning: false,
      isStop: false,
      current: 0,
      duration: parseInt(arr[index]) * 60,
    });
  }

  // resume timer
  function resumeHandler() {
    setTimer({ ...timer, isRunning: true, isStop: false });
  }

  // unload sound source after playing
  useEffect(() => {
    return startSound
      ? () => {
          startSound.unloadAsync();
        }
      : undefined;
  }, [startSound]);

  useEffect(() => {
    console.log(arr[index]);
  }, [index]);

  return (
    <SafeAreaView style={globalState.container}>
      {
        //background
      }
      <View style={styles.background}>
        <Image
          source={{ uri: activeTrack?.artwork }}
          style={{
            width: "100%",
            height: "100%",
          }}
          blurRadius={20}
        />
      </View>
      <LinearGradient
        colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0.5)"]}
        style={{ ...styles.background, zIndex: 2 }}
      >
        {
          // header
        }
        <View style={styles.header}>
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center" }}
            onPress={() => navigation.goBack()}
          >
            <Image
              source={require("../../../assets/icons/close.png")}
              style={{ width: 28, height: 28, resizeMode: "contain" }}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.container}>
          <Text style={{ ...styles.header_text, fontSize: 24 }}>Timer</Text>
          {
            // circular
          }
          <View>
            <AnimatedCircularProgress
              size={280}
              width={5}
              fill={
                (1 - timer.current / timer.duration) * 100 === 100
                  ? 0
                  : (1 - timer.current / timer.duration) * 100
              }
              rotation={0}
              tintColor={generalProperties.primary}
              // onAnimationComplete={() => console.log("onAnimationComplete")}
              backgroundColor="rgba(212, 221, 224,0.6)"
            >
              {() => timerCenter()}
            </AnimatedCircularProgress>
          </View>
          {
            // bottom
          }
          {timer.current <= 0 ? (
            <TouchableOpacity
              style={{
                ...styles.button_container,
                borderColor: generalProperties.primary,
                backgroundColor: generalProperties.primary,
              }}
              onPress={startHandler}
            >
              <Text
                style={{
                  ...styles.header_text,
                  fontWeight: "400",
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                Start
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.bottom_container}>
              <TouchableOpacity
                style={{
                  ...styles.button_container,
                  borderColor: "#fff",
                  backgroundColor: "rgba(0,0,0,0)",
                }}
                onPress={resetHandler}
              >
                <Text
                  style={{
                    ...styles.header_text,
                    fontWeight: "400",
                    fontSize: 14,
                    textAlign: "center",
                  }}
                >
                  Reset
                </Text>
              </TouchableOpacity>
              {timer.isStop && timer.current > 0 ? (
                <TouchableOpacity
                  style={{
                    ...styles.button_container,
                    borderColor: generalProperties.primary,
                    backgroundColor: generalProperties.primary,
                  }}
                  onPress={resumeHandler}
                >
                  <Text
                    style={{
                      ...styles.header_text,
                      fontWeight: "400",
                      fontSize: 14,
                      textAlign: "center",
                    }}
                  >
                    Resume
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={{
                    ...styles.button_container,
                    borderColor: generalProperties.primary,
                    backgroundColor: generalProperties.primary,
                  }}
                  onPress={stopHandler}
                >
                  <Text
                    style={{
                      ...styles.header_text,
                      fontWeight: "400",
                      fontSize: 14,
                      textAlign: "center",
                    }}
                  >
                    Pause
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          {
            // ad
          }
          {userInfo.is_member === 0 && (
            <BannerAd
              unitId={adUnitId}
              size={BannerAdSize.BANNER}
              requestOptions={{
                requestNonPersonalizedAdsOnly: true,
                keywords: ["fashion", "clothing"],
              }}
            />
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default Timer;

const styles = StyleSheet.create({
  background: {
    ...(StyleSheet.absoluteFill as {}),
    zIndex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    marginBottom: 48,
    justifyContent: "space-evenly",
    paddingHorizontal: generalProperties.paddingX,
  },
  header: {
    marginTop: generalProperties.marginTop,
    paddingHorizontal: generalProperties.paddingX,
    width: "100%",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  header_text: {
    color: "#fff",
    fontFamily: "regular",
    fontWeight: "bold",
    fontSize: 16,
  },
  bottom_container: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-evenly",
  },
  button_container: {
    width: "32.8%",
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 50,
  },
});
