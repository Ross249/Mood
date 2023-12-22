import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { RootStackScreenProps } from "../../types/global";
import { StreamQualityType } from "../../types/component";
import globalState from "../../common/globalState";
import { generalProperties } from "../../common/constant";
import { Ionicons } from "@expo/vector-icons";
import SoundQualityItem from "../../components/SoundQualityItem";
import { useCommoneActions, useQualities } from "../../store/user";
import { SoundQualites, SoundQuality, UserInfo } from "../../types/common";
import { useMutation, useQuery } from "@tanstack/react-query";
import { UserService } from "../../services/User.service";
import { debounce } from "lodash";
/**
 * stream quality selected page
 * @param param0
 * @returns
 */
const StreamQuality = ({
  navigation,
  route,
}: RootStackScreenProps<"User.settings.quality">) => {
  const [trigger, setTrigger] = useState(false);
  const setUserInfo = useCommoneActions().setUserInfo;
  const quality = useQualities();
  const setQualities = useCommoneActions().setSoundQualities;
  const setIsError = useCommoneActions().setIsError;
  const changeQuality = useMutation({
    mutationKey: ["change_quality"],
    mutationFn: UserService.changeSoundQuality,
    onError: (e) => {
      setTrigger(true);
      if (e instanceof Error && e.message.split(" ")[0] === "Network") {
        setIsError(true);
      } else {
        Toast.show(e instanceof Error ? e.message : typeof e);
      }
    },
  });

  const getUserInfo = useQuery<UserInfo & SoundQualites>({
    queryKey: ["user_info"],
    queryFn: UserService.getUserInfo,
    enabled: trigger,
  });

  console.log(quality);

  const pressForSettingQuality = async (
    tag: "wifi" | "data",
    qual: SoundQuality
  ) => {
    await changeQuality.mutateAsync(
      {
        wifi_streaming: tag === "wifi" ? qual : quality.wifi_streaming,
        data_streaming: tag === "data" ? qual : quality.data_streaming,
      },
      {
        onSuccess: () => {
          tag === "wifi"
            ? setQualities({ ...quality, wifi_streaming: qual })
            : setQualities({ ...quality, data_streaming: qual });
          getUserInfo.refetch();
        },
      }
    );
  };

  useEffect(() => {
    if (getUserInfo.isSuccess) {
      setUserInfo(getUserInfo.data);
      setQualities({
        wifi_streaming: getUserInfo.data.wifi_streaming,
        data_streaming: getUserInfo.data.data_streaming,
      });
    }
  }, [getUserInfo.isSuccess]);

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
        <Text style={styles.header_text}>Streaming Quality</Text>
        <View style={{ width: 24 }}></View>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View
            style={{
              width: "100%",
              borderBottomColor: "#fff",
              borderBottomWidth: 1,
              height: 16,
            }}
          />
          <View style={styles.card_content}>
            <Text style={{ ...styles.header_text, fontSize: 18 }}>
              Wi-fi Steaming
            </Text>
            <SoundQualityItem
              select={quality.wifi_streaming === "standard"}
              title="Standard"
              sub_title="1MB-2MB/ track"
              press={debounce(
                async () => await pressForSettingQuality("wifi", "standard"),
                300
              )}
            />
            <SoundQualityItem
              select={quality.wifi_streaming === "medium"}
              title="Medium"
              sub_title="3MB-4MB/ track"
              press={debounce(
                async () => await pressForSettingQuality("wifi", "medium"),
                300
              )}
            />
            <SoundQualityItem
              select={quality.wifi_streaming === "normal"}
              title="Normal"
              sub_title="6MB-10MB/ track. Get VIP to enjoy high quality tracks"
              press={debounce(
                async () => await pressForSettingQuality("wifi", "normal"),
                300
              )}
            />
            <SoundQualityItem
              select={quality.wifi_streaming === "high"}
              title="High"
              sub_title="20MB-30MB/ track. Get VIP to enjoy high quality tracks"
              press={debounce(
                async () => await pressForSettingQuality("wifi", "high"),
                300
              )}
            />
            <SoundQualityItem
              select={quality.wifi_streaming === "very_high"}
              title="Very High"
              sub_title="40MB-150MB/ piece. Get VIP to enjoy high quality tracks"
              press={debounce(
                async () => await pressForSettingQuality("wifi", "very_high"),
                300
              )}
            />
          </View>
        </View>

        <View style={{ ...styles.card, marginTop: 24 }}>
          <View style={styles.card_content}>
            <Text style={{ ...styles.header_text, fontSize: 18 }}>
              Data Steaming
            </Text>
            <SoundQualityItem
              select={quality.data_streaming === "standard"}
              title="Standard"
              sub_title="1MB-2MB/ track"
              press={debounce(
                async () => await pressForSettingQuality("data", "standard"),
                300
              )}
            />
            <SoundQualityItem
              select={quality.data_streaming === "medium"}
              title="Medium"
              sub_title="3MB-4MB/ track"
              press={debounce(
                async () => await pressForSettingQuality("data", "medium"),
                300
              )}
            />
            <SoundQualityItem
              select={quality.data_streaming === "normal"}
              title="Normal"
              sub_title="6MB-10MB/ track. Get VIP to enjoy high quality tracks"
              press={debounce(
                async () => await pressForSettingQuality("data", "normal"),
                300
              )}
            />
            <SoundQualityItem
              select={quality.data_streaming === "high"}
              title="High"
              sub_title="20MB-30MB/ track. Get VIP to enjoy high quality tracks"
              press={debounce(
                async () => await pressForSettingQuality("data", "high"),
                300
              )}
            />
            <SoundQualityItem
              select={quality.data_streaming === "very_high"}
              title="Very High"
              sub_title="40MB-150MB/ piece. Get VIP to enjoy high quality tracks"
              press={debounce(
                async () => await pressForSettingQuality("data", "very_high"),
                300
              )}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default StreamQuality;

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
    marginBottom: generalProperties.tabPlayerHeight + 24,
  },
  card: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#fff",
  },
  card_content: {
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
});
