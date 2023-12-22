import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { RootStackScreenProps } from "../../types/global";
import { generalProperties } from "../../common/constant";
import globalState from "../../common/globalState";
import { Ionicons } from "@expo/vector-icons";
import LogoCard from "../../components/LogoCard";
import { FloatingLabelInput } from "react-native-floating-label-input";
import { useMutation } from "@tanstack/react-query";
import { AuthService } from "../../services/Auth.service";
import { useCommoneActions } from "../../store/user";
import PlayerHint from "../../components/PlayerHint";
import { LoginByEmailResponseData } from "../../types/response";

const height = Dimensions.get("screen").height;
const Confirm = ({
  navigation,
  route,
}: RootStackScreenProps<"Auth.login.forget.confirm">) => {
  const email = route.params.email;
  const [countDown, setCountDown] = useState(0);
  const setUserInfo = useCommoneActions().setUserInfo;
  const setToken = useCommoneActions().setToken;
  const setLoading = useCommoneActions().setLoading;
  const setIsError = useCommoneActions().setIsError;
  const [showHint, setShowHint] = useState(false);
  const [form, setForm] = useState({
    new_password: "",
    confirm_password: "",
    verifyCode: "",
  });
  const [showNPassword, setSNPassword] = useState(false);
  const [showNCPassword, setSNCPassword] = useState(false);

  const resetPassword = useMutation({
    mutationKey: ["reset"],
    mutationFn: AuthService.ResetPassword,
  });

  const sendCode = useMutation({
    mutationKey: ["sendcode"],
    mutationFn: AuthService.SendEmailForCode,
  });

  const clickForSendCode = async () => {
    setCountDown(60);
    await sendCode.mutateAsync(
      {
        email: email,
      },
      {
        onSuccess: () => {
          // Toast.show("Your verification code has been sent to your email", {
          //   duration: 5000,
          // });
        },
        onError: (e) => {
          if (e instanceof Error && e.message.split(" ")[0] === "Network") {
            setIsError(true);
          } else {
            Toast.show(e instanceof Error ? e.message : typeof e);
          }
        },
      }
    );
  };

  const clickForReset = async () => {
    await resetPassword.mutateAsync(
      {
        email: email.trim(),
        new_password: form.new_password.trim(),
        confirm_password: form.confirm_password.trim(),
        code: form.verifyCode.trim(),
      },
      {
        onSuccess: ({ user_info, token }: LoginByEmailResponseData) => {
          setToken(token);
          setUserInfo(user_info);
          console.log(user_info);

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
      }
    );
  };

  useEffect(() => {
    if (resetPassword.isLoading) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [resetPassword.isLoading]);

  useEffect(() => {
    let timer = setTimeout(() => {
      if (countDown >= 0) {
        setCountDown(countDown - 1);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [countDown]);

  useEffect(() => {
    setCountDown(60);
  }, []);

  useEffect(() => {
    countDown === 60 && setShowHint(true);
  }, [countDown]);

  return (
    <View style={globalState.container}>
      <View
        style={{
          width: "100%",
          alignItems: "center",
          zIndex: 999,
          top: 0.8 * height,
        }}
      >
        {
          // hint
        }
        {showHint && (
          <PlayerHint
            visible={showHint}
            setVisible={setShowHint}
            time={5000}
            text={"Your verification code has been sent to your email"}
          />
        )}
      </View>
      {
        //background
      }
      <View style={styles.background}>
        <Image
          source={require("../../../assets/backgrounds/sign_in.jpg")}
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
        <Text style={styles.header_text}>Forget Password</Text>
        <View style={{ width: 24 }}></View>
      </View>
      <View style={styles.content}>
        {/* <KeyboardAvoidingView
          style={{ width: "100%", alignItems: "center" }}
          keyboardVerticalOffset={100}
        > */}
        <ScrollView
          style={{ width: "100%" }}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        >
          <LogoCard />
          <View style={{ width: "100%", marginTop: 32, marginBottom: 16 }}>
            <FloatingLabelInput
              label="New Password"
              inputStyles={{
                color: "#fff",
                fontSize: 14,
                minHeight: 18,
                marginTop: 8,

                paddingVertical: 8,
              }}
              containerStyles={{
                borderColor: "#fff",
                borderWidth: 1,
                borderRadius: 4,
                paddingHorizontal: 10,
              }}
              customLabelStyles={{
                colorFocused: "#fff",
                fontSizeFocused: 10,
                fontSizeBlurred: 14,
                colorBlurred: "#fff",
              }}
              labelStyles={{
                width: "100%",
                fontFamily: "regular",
                fontSize: 10,
                lineHeight: 20,
                letterSpacing: -0.42,
              }}
              selectionColor={generalProperties.primary}
              style={{ marginBottom: 16 }}
              value={form.new_password}
              cursorColor={generalProperties.primary}
              togglePassword={showNPassword}
              isPassword={true}
              keyboardType="default"
              onChangeText={(value) =>
                setForm({ ...form, new_password: value })
              }
              customHidePasswordComponent={
                <TouchableOpacity onPress={() => setSNPassword(!showNPassword)}>
                  <Image
                    source={require("../../../assets/icons/Show.png")}
                    style={{ width: 24, height: 24, resizeMode: "contain" }}
                  />
                </TouchableOpacity>
              }
              customShowPasswordComponent={
                <TouchableOpacity onPress={() => setSNPassword(!showNPassword)}>
                  <Image
                    source={require("../../../assets/icons/Hide.png")}
                    style={{ width: 24, height: 24, resizeMode: "contain" }}
                  />
                </TouchableOpacity>
              }
            />
          </View>
          <View style={{ width: "100%", marginBottom: 16 }}>
            <FloatingLabelInput
              label="Confirm Password"
              inputStyles={{
                color: "#fff",
                fontSize: 14,
                minHeight: 18,
                marginTop: 8,
                paddingVertical: 8,
              }}
              containerStyles={{
                borderColor: "#fff",
                borderWidth: 1,
                borderRadius: 4,
                paddingHorizontal: 10,
              }}
              customLabelStyles={{
                colorFocused: "#fff",
                fontSizeFocused: 10,
                fontSizeBlurred: 14,
                colorBlurred: "#fff",
              }}
              labelStyles={{
                width: "100%",
                fontFamily: "regular",
                fontSize: 10,
                lineHeight: 20,
                letterSpacing: -0.42,
              }}
              selectionColor={generalProperties.primary}
              style={{ marginBottom: 16 }}
              value={form.confirm_password}
              cursorColor={generalProperties.primary}
              togglePassword={showNCPassword}
              isPassword={true}
              keyboardType="default"
              onChangeText={(value) =>
                setForm({ ...form, confirm_password: value })
              }
              customHidePasswordComponent={
                <TouchableOpacity
                  onPress={() => setSNCPassword(!showNCPassword)}
                >
                  <Image
                    source={require("../../../assets/icons/Show.png")}
                    style={{ width: 24, height: 24, resizeMode: "contain" }}
                  />
                </TouchableOpacity>
              }
              customShowPasswordComponent={
                <TouchableOpacity
                  onPress={() => setSNCPassword(!showNCPassword)}
                >
                  <Image
                    source={require("../../../assets/icons/Hide.png")}
                    style={{ width: 24, height: 24, resizeMode: "contain" }}
                  />
                </TouchableOpacity>
              }
            />
          </View>
          <View style={{ width: "100%", justifyContent: "center" }}>
            <FloatingLabelInput
              label="Verification Code"
              inputStyles={{
                color: "#fff",
                fontSize: 14,
                minHeight: 18,
                marginTop: 8,

                paddingVertical: 8,
              }}
              containerStyles={{
                borderColor: "#fff",
                borderWidth: 1,
                borderRadius: 4,
                paddingHorizontal: 10,
              }}
              customLabelStyles={{
                colorFocused: "#fff",
                fontSizeFocused: 10,
                fontSizeBlurred: 14,
                colorBlurred: "#fff",
              }}
              labelStyles={{
                width: "100%",
                fontFamily: "regular",
                fontSize: 10,
                lineHeight: 20,
                letterSpacing: -0.42,
              }}
              value={form.verifyCode}
              cursorColor={generalProperties.primary}
              keyboardType="decimal-pad"
              onChangeText={(value: string) =>
                setForm({ ...form, verifyCode: value })
              }
            />
            <Text style={styles.countDownText} onPress={clickForSendCode}>
              {countDown >= 0 ? countDown + "s" : "Resend"}
            </Text>
          </View>
          <View style={{ width: "100%", marginBottom: 24, marginTop: 8 }}>
            <Text
              style={{
                fontSize: 10,
                fontFamily: "regular",
                lineHeight: 12,
                color: "white",
                textAlign: "left",
              }}
            >
              Your verification code has been sent to your email
            </Text>
          </View>
          <TouchableOpacity
            style={{
              ...styles.button,
              borderColor: generalProperties.primary,
              backgroundColor: generalProperties.primary,
            }}
            onPress={clickForReset}
          >
            <Text
              style={{
                ...styles.button_text,
                color: "#fff",
              }}
            >
              Reset
            </Text>
          </TouchableOpacity>
        </ScrollView>
        {/* </KeyboardAvoidingView> */}
      </View>
    </View>
  );
};

export default Confirm;

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
    marginTop: 72,
    marginBottom: 64,
    paddingHorizontal: generalProperties.paddingX,
    alignItems: "center",
  },
  button: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 100,
  },
  button_text: {
    fontSize: 16,
    fontFamily: "regular",
    fontWeight: "400",
  },
  countDownText: {
    position: "absolute",
    fontSize: 14,
    fontFamily: "regular",
    right: 12,
    color: "#fff",
  },
});
