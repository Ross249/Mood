import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Switch,
} from "react-native";
import React, { useState, useEffect } from "react";
import { RootStackScreenProps } from "../../types/global";
import globalState from "../../common/globalState";
import { generalProperties } from "../../common/constant";
import { Ionicons } from "@expo/vector-icons";
import { useCommoneActions } from "../../store/user";
import { useMutation } from "@tanstack/react-query";
import { AuthService } from "../../services/Auth.service";
import TrackPlayer from "react-native-track-player";
/**
 * delete account page
 * @param param0
 * @returns
 */
const DeleteAccount = ({
  navigation,
  route,
}: RootStackScreenProps<"User.settings.accounts.delete">) => {
  const [confirm, setConfirm] = useState(false);
  const setLoading = useCommoneActions().setLoading;
  const setIsError = useCommoneActions().setIsError;
  const setToken = useCommoneActions().setToken;
  const setUserInfo = useCommoneActions().setUserInfo;
  const setFirstTime = useCommoneActions().setFirstTime;
  const deleteAccount = useMutation({
    mutationKey: ["delete_account"],
    mutationFn: AuthService.DeleteAccount,
    onSuccess: () => {
      TrackPlayer.reset();
      setUserInfo({
        uid: "",
        nickname: "",
        email: "",
        is_member: 0,
        google: null,
        facebook: null,
        apple: null,
        create_at: "",
        subscription_time: "",
        expiration_time: "",
        is_cancel_subscription: 0,
      });
      setToken("");
      // setFirstTime(true);
      setLoading(false);
      navigation.popToTop();
    },
    onError: (e) => {
      setLoading(false);
      if (e instanceof Error && e.message.split(" ")[0] === "Network") {
        setIsError(true);
      } else {
        Toast.show(e instanceof Error ? e.message : typeof e);
      }
    },
  });

  const ClickForDeleteAccount = async () => {
    await deleteAccount.mutateAsync();
  };

  useEffect(() => {
    if (deleteAccount.isLoading) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [deleteAccount.isLoading]);

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
        <Text style={styles.header_text}>Delete Accounts</Text>
        <View style={{ width: 24 }}></View>
      </View>
      <View style={styles.content}>
        <View style={{ width: "100%" }}>
          <View style={styles.card}>
            <Text style={{ ...styles.card_text, marginBottom: 32 }}>
              Please note:{" "}
            </Text>
            <Text style={{ ...styles.card_text, marginBottom: 32 }}>
              If you’re looking to delete your account, your subscription fees
              will not be refunded to you.
            </Text>
            <Text style={styles.card_text}>
              You will permanently lose all your data. This action cannot be
              undone.
            </Text>
          </View>
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Switch
              trackColor={{
                false: "#72777E",
                true: generalProperties.primary,
              }}
              thumbColor={"#fff"}
              value={confirm}
              onValueChange={() => setConfirm(!confirm)}
            />
            <Text style={{ ...styles.card_text, marginLeft: 16 }}>
              I understand.
            </Text>
          </View>
        </View>
        <View style={{ alignItems: "center" }}>
          <TouchableOpacity
            style={{
              ...styles.button,
              borderColor: confirm ? generalProperties.primary : "#6B6B6B",
              backgroundColor: confirm
                ? generalProperties.primary
                : "rgba(0,0,0,0)",
            }}
            disabled={!confirm}
            onPress={ClickForDeleteAccount}
          >
            <Text
              style={{
                ...styles.button_text,
                fontSize: 16,
                color: confirm ? "#fff" : "#6B6B6B",
              }}
            >
              Confirm
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default DeleteAccount;

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
    textAlign: "center",
  },
  content: {
    flex: 1,
    width: "100%",
    marginTop: 32,
    paddingHorizontal: generalProperties.paddingX,
    marginBottom: generalProperties.tabPlayerHeight,
    justifyContent: "space-between",
  },
  card: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 20,
    marginBottom: 24,
  },
  card_text: {
    fontFamily: "regular",
    fontSize: 14,
    color: "#fff",
    lineHeight: 20,
    flexWrap: "wrap",
  },
  button: {
    borderRadius: 100,
    width: "34%",
    paddingVertical: 12,
    borderWidth: 1,
    marginBottom: 64,
  },
  button_text: {
    fontFamily: "regular",
    textAlign: "center",
  },
});
