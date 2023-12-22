import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import React from "react";
import { generalProperties } from "../../common/constant";
import globalState from "../../common/globalState";
import { RootStackScreenProps } from "../../types/global";
import { Ionicons } from "@expo/vector-icons";
import SettingItem from "../../components/SettingItem";
import * as Linking from "expo-linking";
import { ClickToContact, ClickToShare } from "../../common/utils";
import { useRateLinks } from "../../store/user";

const Settings = ({
  navigation,
  route,
}: RootStackScreenProps<"User.settings">) => {
  const RateLinks = useRateLinks();
  return (
    <View
      style={{
        ...globalState.container,
        paddingHorizontal: generalProperties.paddingX,
      }}
    >
      <View style={styles.background}>
        <Image
          source={require("../../../assets/backgrounds/account_page.jpg")}
          style={{ width: "100%", height: "100%" }}
        />
      </View>
      <View style={styles.header}>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center" }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="ios-arrow-back-sharp" size={24} color="white" />
          <Text style={styles.header_text}>Settings</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <SettingItem
            icon="ac"
            title="Account"
            press={() => {
              navigation.push("User.settings.accounts");
            }}
          />
          <SettingItem
            icon="sb"
            title="Subscription & Benefits"
            press={() => {
              navigation.push("User.settings.subscription");
            }}
          />
          <SettingItem
            icon="sq"
            title="Streaming Quality"
            press={() => {
              navigation.push("User.settings.quality");
            }}
          />
          <SettingItem
            icon="toc"
            title="Terms and Conditions"
            press={() => {
              Linking.openURL("https://www.moodmusics.com/terms-conditions");
            }}
          />
          <SettingItem
            icon="pp"
            title="Privacy Policy"
            press={() => {
              Linking.openURL("https://www.moodmusics.com/privacy-policy");
            }}
          />
          <SettingItem
            icon="contact"
            title="Contact Us"
            press={ClickToContact}
          />
          {Platform.OS === "ios" && RateLinks.ios_download_url !== "" && (
            <SettingItem
              icon="rate"
              title="Rate Us in App Store"
              press={() => {
                Linking.openURL(RateLinks.ios_download_url);
              }}
            />
          )}
          {Platform.OS === "android" &&
            RateLinks.android_download_url !== "" && (
              <SettingItem
                icon="rate"
                title="Rate Us in Play Store"
                press={() => {
                  Linking.openURL(RateLinks.android_download_url);
                }}
              />
            )}
          <SettingItem
            icon="share"
            title="Share With Your Friends"
            press={ClickToShare}
          />
        </ScrollView>
      </View>
      {
        // bottom logo and version
      }
      <View
        style={{
          width: "100%",
          marginBottom: generalProperties.tabPlayerHeight + 24,
          alignItems: "center",
        }}
      >
        <Image
          source={require("../../../assets/banner/mood.png")}
          style={{
            width: "22%",
            minHeight: 24,
            resizeMode: "contain",
          }}
        />
        <Text
          style={{
            fontSize: 10,
            fontFamily: "regular",
            color: "#fff",
            textAlign: "center",
          }}
        >
          Version: 1.0.0
        </Text>
      </View>
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  header: {
    marginTop: generalProperties.marginTop,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  background: {
    ...(StyleSheet.absoluteFill as {}),
  },
  header_text: {
    fontSize: 24,
    fontFamily: "bold",
    marginLeft: 16,
    color: "#ffffff",
  },
  content: {
    flex: 1,
    width: "100%",
    marginTop: 32,
  },
});
