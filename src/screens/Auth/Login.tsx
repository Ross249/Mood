import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { RootStackScreenProps } from "../../types/global";
import globalState from "../../common/globalState";
import {
  AppleServicesID,
  AppleSigninRedirectURI,
  FACEBOOK_APPID,
  androidClientId,
  clientId,
  generalProperties,
  iosClientId,
} from "../../common/constant";
import { Ionicons } from "@expo/vector-icons";
import LogoCard from "../../components/LogoCard";
import { FloatingLabelInput } from "react-native-floating-label-input";
import { useMutation } from "@tanstack/react-query";
import { AuthService } from "../../services/Auth.service";
import { useCommoneActions } from "../../store/user";
import { LoginByEmailResponseData } from "../../types/response";
import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
import * as WebBrowser from "expo-web-browser";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Linking from "expo-linking";
import { appleAuthAndroid } from "@invertase/react-native-apple-authentication";
import "react-native-get-random-values";
import { v4 as uuid } from "uuid";

WebBrowser.maybeCompleteAuthSession();

/**
 * Login page about somebody already has an account
 * @param param0
 * @returns
 */
const Login = ({ navigation, route }: RootStackScreenProps<"Auth.login">) => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [show, setShow] = useState(false);
  const setLoading = useCommoneActions().setLoading;
  const setIsError = useCommoneActions().setIsError;
  const setToken = useCommoneActions().setToken;
  const setUserInfo = useCommoneActions().setUserInfo;

  const Login = useMutation({
    mutationKey: ["LoginByEmail"],
    mutationFn: AuthService.LoginByEmail,
  });

  const facebookLoginOrRegister = useMutation({
    mutationKey: ["FBLogin"],
    mutationFn: AuthService.LoginByFacebook,
  });

  const googleLoginOrRegister = useMutation({
    mutationKey: ["GoogleLogin"],
    mutationFn: AuthService.LoginByGoogle,
  });

  const appleLoginOrRegister = useMutation({
    mutationKey: ["AppleLogin"],
    mutationFn: AuthService.LoginByApple,
  });

  const doAppleLogin = async () => {
    const rawNoce = uuid();
    const state = uuid();
    try {
      appleAuthAndroid.configure({
        clientId: AppleServicesID,
        redirectUri: AppleSigninRedirectURI,
        scope: appleAuthAndroid.Scope.ALL,
        responseType: appleAuthAndroid.ResponseType.ALL,
        nonce: rawNoce,
        state: state,
      });

      const response = await appleAuthAndroid.signIn();
      if (response) {
        const code = response.code; // Present if selected ResponseType.ALL / ResponseType.CODE
        const id_token = response.id_token; // Present if selected ResponseType.ALL / ResponseType.ID_TOKEN
        const user = response.user; // Present when user first logs in using appleId
        const state = response.state; // A copy of the state value that was passed to the initial request.
        console.log("Got auth code", code);
        console.log("Got id_token", id_token);
        console.log("Got user", user);
        console.log("Got state", state);
        return appleLoginOrRegister.mutateAsync(
          {
            identity_token: id_token as string,
          },
          {
            onSuccess: ({ user_info, token }: LoginByEmailResponseData) => {
              setLoading(false);
              setToken(token);
              setUserInfo(user_info);
              navigation.pop(2);
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
      }
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case appleAuthAndroid.Error.NOT_CONFIGURED:
            console.log("appleAuthAndroid not configured yet.");
            break;
          case appleAuthAndroid.Error.SIGNIN_FAILED:
            console.log("Apple signin failed.");
            break;
          case appleAuthAndroid.Error.SIGNIN_CANCELLED:
            console.log("User cancelled Apple signin.");
            break;
          default:
            break;
        }
      }
    }
  };

  const AppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });
      console.log(credential);

      if (!!credential) {
        return appleLoginOrRegister.mutateAsync(
          {
            identity_token: credential.identityToken as string,
          },
          {
            onSuccess: ({ user_info, token }: LoginByEmailResponseData) => {
              setLoading(false);
              setToken(token);
              setUserInfo(user_info);
              navigation.pop(2);
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
      }
    } catch (e) {}
  };

  const [_, __, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: FACEBOOK_APPID,
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: clientId,
    iosClientId: iosClientId,
    androidClientId: androidClientId,
  });

  const facebookLogin = useMutation(async () => {
    setLoading(true);
    const response = await fbPromptAsync();
    console.log(response);

    if (response.type === "success") {
      const { access_token } = response.params;
      console.log(access_token);
      console.log("token above");

      return facebookLoginOrRegister.mutateAsync(
        {
          access_token: access_token,
        },
        {
          onSuccess: ({ user_info, token }: LoginByEmailResponseData) => {
            setLoading(false);
            setToken(token);
            setUserInfo(user_info);
            navigation.pop(2);
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
    }
    setLoading(false);
  });

  const ClickToLogin = async () => {
    setLoading(true);
    await Login.mutateAsync(
      {
        email: form.email.trim(),
        password: form.password.trim(),
      },
      {
        onSuccess: (data: LoginByEmailResponseData) => {
          setToken(data.token);
          setUserInfo(data.user_info);
          setLoading(false);
          navigation.pop(2);
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
    setLoading(false);
  };

  useEffect(() => {
    async function Google() {
      setLoading(true);

      if (
        !!response &&
        response.type === "success" &&
        !!response.authentication?.accessToken
      ) {
        console.log(response.authentication?.accessToken);

        return googleLoginOrRegister.mutateAsync(
          {
            access_token: response.authentication?.accessToken,
          },
          {
            onSuccess: ({ user_info, token }: LoginByEmailResponseData) => {
              setLoading(false);
              setToken(token);
              setUserInfo(user_info);
              navigation.pop(2);
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
      }
      setLoading(false);
    }
    Google();
  }, [response]);

  return (
    <View style={globalState.container}>
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
        <Text style={styles.header_text}>Log in</Text>
        <View style={{ width: 24 }}></View>
      </View>
      {
        // content
      }
      <View style={styles.content}>
        {/* <KeyboardAvoidingView
          style={{ width: "100%", alignItems: "center" }}
          keyboardVerticalOffset={300}
        > */}
        <ScrollView
          style={{ width: "100%" }}
          showsVerticalScrollIndicator={false}
        >
          <LogoCard />
          <View style={{ width: "100%", marginTop: 32 }}>
            <View style={{ width: "100%", marginBottom: 16 }}>
              <FloatingLabelInput
                label="Email Address"
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
                value={form.email}
                cursorColor={generalProperties.primary}
                keyboardType="email-address"
                onChangeText={(value) => setForm({ ...form, email: value })}
              />
            </View>
            <View style={{ width: "100%", marginBottom: 16 }}>
              <FloatingLabelInput
                label="Password"
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
                value={form.password}
                cursorColor={generalProperties.primary}
                togglePassword={show}
                isPassword={true}
                keyboardType="default"
                onChangeText={(value) => setForm({ ...form, password: value })}
                customHidePasswordComponent={
                  <TouchableOpacity onPress={() => setShow(!show)}>
                    <Image
                      source={require("../../../assets/icons/Show.png")}
                      style={{ width: 24, height: 24, resizeMode: "contain" }}
                    />
                  </TouchableOpacity>
                }
                customShowPasswordComponent={
                  <TouchableOpacity onPress={() => setShow(!show)}>
                    <Image
                      source={require("../../../assets/icons/Hide.png")}
                      style={{ width: 24, height: 24, resizeMode: "contain" }}
                    />
                  </TouchableOpacity>
                }
              />
            </View>
            <Text
              style={{
                fontSize: 12,
                color: "#fff",
                fontFamily: "regular",
              }}
              onPress={() => navigation.push("Auth.login.forget")}
            >
              Forget Password?
            </Text>
            <TouchableOpacity
              style={{
                ...styles.button,
                backgroundColor:
                  form.email.length > 0 && form.password.length > 0
                    ? generalProperties.primary
                    : "rgba(80, 98, 255,0.2)",
              }}
              onPress={ClickToLogin}
            >
              <Text
                style={{
                  ...styles.button_text,
                  color:
                    form.email.length > 0 && form.password.length > 0
                      ? "#fff"
                      : "rgba(255, 255, 255,0.2)",
                }}
              >
                Log in
              </Text>
            </TouchableOpacity>
            {
              // gap
            }
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 26,
              }}
            >
              <View
                style={{ width: "32%", backgroundColor: "white", height: 1 }}
              ></View>
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "#regular",
                  fontWeight: "400",
                  color: "#fff",
                }}
              >
                Or
              </Text>
              <View
                style={{ width: "32%", backgroundColor: "white", height: 1 }}
              ></View>
            </View>
            {
              // login button
            }
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
                gap: 20,
              }}
            >
              {Platform.OS === "ios" && (
                <AppleAuthentication.AppleAuthenticationButton
                  buttonStyle={
                    AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                  }
                  buttonType={
                    AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
                  }
                  cornerRadius={100}
                  style={{ ...styles.login_button }}
                  onPress={AppleLogin}
                >
                  <Image
                    source={require("../../../assets/icons/apple.png")}
                    style={{ width: 20, height: 20, resizeMode: "contain" }}
                  />
                </AppleAuthentication.AppleAuthenticationButton>
              )}
              {Platform.OS === "android" && appleAuthAndroid.isSupported && (
                <TouchableOpacity
                  style={styles.login_button}
                  onPress={doAppleLogin}
                >
                  <Image
                    source={require("../../../assets/icons/apple.png")}
                    style={{ width: 20, height: 20, resizeMode: "contain" }}
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={{ ...styles.login_button }}
                onPress={() => promptAsync()}
              >
                <Image
                  source={require("../../../assets/icons/google.png")}
                  style={{ width: 20, height: 20, resizeMode: "contain" }}
                />
              </TouchableOpacity>
              {/* <TouchableOpacity
                style={styles.login_button}
                onPress={async () => await facebookLogin.mutateAsync()}
              >
                <Image
                  source={require("../../../assets/icons/facebook.png")}
                  style={{ width: 20, height: 20, resizeMode: "contain" }}
                />
              </TouchableOpacity> */}
            </View>
          </View>
        </ScrollView>
        {/* </KeyboardAvoidingView> */}
        {
          // bottom
        }
        <Text style={styles.bottom_text}>
          By Continuing, you agree to MOOD’s{" "}
          <Text
            style={{ ...styles.bottom_text, fontWeight: "700" }}
            onPress={() => {
              Linking.openURL("https://www.moodmusics.com/terms-conditions");
            }}
          >
            Terms & Conditions
          </Text>{" "}
          and{" "}
          <Text
            style={{ ...styles.bottom_text, fontWeight: "700" }}
            onPress={() => {
              Linking.openURL("https://www.moodmusics.com/privacy-policy");
            }}
          >
            Privacy Policy
          </Text>
        </Text>
      </View>
    </View>
  );
};

export default Login;

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
    justifyContent: "space-between",
    alignItems: "center",
  },
  bottom_text: {
    color: "#fff",
    fontSize: 10,
    textAlign: "center",
    fontFamily: "regular",
  },
  button: {
    backgroundColor: generalProperties.primary,
    width: "100%",
    borderRadius: 100,
    marginVertical: 26,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  button_text: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "regular",
    fontWeight: "400",
  },
  login_button: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    backgroundColor: "white",
  },
});
