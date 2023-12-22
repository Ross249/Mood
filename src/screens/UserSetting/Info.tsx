import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import React, { useState, useEffect } from "react";
import { RootStackScreenProps } from "../../types/global";
import { generalProperties } from "../../common/constant";
import globalState from "../../common/globalState";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import CopiedHandling from "../../components/CopiedHandling";
import { useCommoneActions, useToken, useUserInfo } from "../../store/user";
import { useMutation, useQuery } from "@tanstack/react-query";
import { UserService } from "../../services/User.service";
import { AuthService } from "../../services/Auth.service";
import { SoundQualites, SoundQuality, UserInfo } from "../../types/common";
import TrackPlayer from "react-native-track-player";
import { debounce } from "lodash";
import moment from "moment";

const Info = ({
  navigation,
  route,
}: RootStackScreenProps<"User.settings.accounts">) => {
  const [visible, setVisible] = useState(false);
  const token = useToken();
  const userInfo = useUserInfo();
  const setUserInfo = useCommoneActions().setUserInfo;
  const setIsError = useCommoneActions().setIsError;
  const setToken = useCommoneActions().setToken;
  const setFirstTime = useCommoneActions().setFirstTime;
  const logout = useCommoneActions().logout;
  const setQualities = useCommoneActions().setSoundQualities;
  const getUserInfo = useQuery<UserInfo & SoundQualites>({
    queryKey: ["user_info"],
    queryFn: UserService.getUserInfo,
    enabled: !!token,
  });

  // const Unsubscribe = useMutation({
  //   mutationKey: ["unsubscribe"],
  //   mutationFn: UserService.cancelSubscription,
  //   onSuccess: () => {
  //     Toast.show("Unsubscribe Successfully");
  //     getUserInfo.refetch();
  //   },
  //   onError: (e) => {
  //     if (e instanceof Error && e.message.split(" ")[0] === "Network") {
  //       setIsError(true);
  //     } else {
  //       Toast.show(e instanceof Error ? e.message : typeof e);
  //     }
  //   },
  // });

  // const pressForUnsubscribe = async () => {
  //   await Unsubscribe.mutateAsync();
  // };

  // const ToLogout = useMutation({
  //   mutationKey: ["logout"],
  //   mutationFn: AuthService.Logout,
  // });

  useEffect(() => {
    if (getUserInfo.isSuccess) {
      setUserInfo(getUserInfo.data);
      setQualities({
        wifi_streaming: getUserInfo.data.wifi_streaming,
        data_streaming: getUserInfo.data.data_streaming,
      });
    }
    if (getUserInfo.isError) {
      setIsError(true);
    }
  }, [getUserInfo.isSuccess, getUserInfo.isError]);

  // useEffect(() => {
  //   if (!token) {
  //     navigation.popToTop();
  //   }
  // }, [token]);

  const ClickToLogout = async () => {
    logout();
    await TrackPlayer.reset();
    navigation.popToTop();
  };

  const copyToClipboard = async () => {
    setVisible(true);
    await Clipboard.setStringAsync(userInfo.uid.toString());
  };

  return (
    <View style={globalState.container}>
      {
        //background
      }
      <View style={styles.background}>
        <Image
          source={require("../../../assets/backgrounds/account_page.jpg")}
          style={{ width: "100%", height: "100%" }}
        />
      </View>
      {
        // header
      }
      <View style={styles.header}>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="ios-arrow-back-sharp" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.header_text}>Accounts</Text>
        <View style={{ width: 24 }}></View>
      </View>
      <View style={styles.content}>
        <View style={{ width: "100%" }}>
          <View style={{ width: "100%", marginBottom: 32 }}>
            <Text style={styles.text}>User ID:</Text>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
              onPress={copyToClipboard}
            >
              <Text style={styles.text}>
                {getUserInfo.isSuccess ? getUserInfo.data.uid : userInfo.uid}
              </Text>
              <Image
                source={require("../../../assets/icons/content_copy.png")}
                style={{
                  width: 16,
                  height: 16,
                  resizeMode: "contain",
                  marginLeft: 12,
                }}
              />
            </TouchableOpacity>
          </View>
          <View style={{ width: "100%", marginBottom: 32 }}>
            <Text style={styles.text}>Email:</Text>
            <Text style={styles.text}>
              {getUserInfo.isSuccess ? getUserInfo.data.email : userInfo.email}
            </Text>
          </View>

          {/* {getUserInfo.isSuccess &&
            getUserInfo.data.expiration_time !== null &&
            getUserInfo.data.subscription_time !== null &&
            moment(getUserInfo.data.expiration_time).isAfter(moment()) && (
              <View style={{ width: "100%", marginBottom: 32 }}>
                <Text style={styles.text}>Expiration time:</Text>
                <View style={{ flexDirection: "row" }}>
                  <Text style={styles.text}>
                    {getUserInfo.data.expiration_time}
                  </Text>
                  {getUserInfo.data.is_cancel_subscription === 0 && (
                    <Text
                      style={{
                        ...styles.text,
                        textDecorationLine: "underline",
                        marginLeft: 16,
                      }}
                      onPress={debounce(pressForUnsubscribe, 500)}
                    >
                      Unsubscribe
                    </Text>
                  )}
                </View>
              </View>
            )} */}
        </View>
        <View style={{ alignItems: "center" }}>
          <TouchableOpacity style={styles.button} onPress={ClickToLogout}>
            <Text
              style={{
                ...styles.button_text,
                fontSize: 16,
                lineHeight: 20,
                letterSpacing: -0.48,
              }}
            >
              Sign out
            </Text>
          </TouchableOpacity>
          <Text
            style={{
              ...styles.button_text,
              fontSize: 12,
              textDecorationLine: "underline",
            }}
            onPress={() => navigation.push("User.settings.accounts.delete")}
          >
            I want to delete my account
          </Text>
        </View>
      </View>
      <CopiedHandling visible={visible} setVisible={setVisible} />
    </View>
  );
};

export default Info;

const styles = StyleSheet.create({
  background: {
    ...(StyleSheet.absoluteFill as {}),
  },
  header: {
    marginTop: generalProperties.marginTop,
    paddingHorizontal: generalProperties.paddingX,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  header_text: {
    color: "#fff",
    fontFamily: "regular",
    fontWeight: "bold",
    fontSize: 16,
  },
  content: {
    flex: 1,
    width: "100%",
    marginTop: 32,
    paddingHorizontal: generalProperties.paddingX,
    marginBottom: generalProperties.tabPlayerHeight,
    justifyContent: "space-between",
  },
  text: {
    color: "#fff",
    fontFamily: "regular",
    fontSize: 14,
  },
  button: {
    borderRadius: 100,
    marginBottom: 52,
    width: "34%",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#fff",
  },
  button_text: {
    fontFamily: "regular",
    color: "#fff",
    textAlign: "center",
  },
});
