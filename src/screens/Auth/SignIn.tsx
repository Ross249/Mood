import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  Pressable,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
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
import LogoCard from "../../components/LogoCard";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import * as Facebook from "expo-auth-session/providers/facebook";
import { useMutation } from "@tanstack/react-query";
import { AuthService } from "../../services/Auth.service";
import { useCommoneActions } from "../../store/user";
import { LoginByEmailResponseData } from "../../types/response";
import { ResponseType, makeRedirectUri } from "expo-auth-session";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Linking from "expo-linking";
import "react-native-get-random-values";
import { v4 as uuid } from "uuid";
import {
  AppleButton,
  appleAuthAndroid,
} from "@invertase/react-native-apple-authentication";

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;
WebBrowser.maybeCompleteAuthSession();
/**
 * sign in page
 * @param param0
 * @returns
 */
const SignIn = ({ navigation, route }: RootStackScreenProps<"Auth.signin">) => {
  const setToken = useCommoneActions().setToken;
  const setUserInfo = useCommoneActions().setUserInfo;
  const setLoading = useCommoneActions().setLoading;
  const setIsError = useCommoneActions().setIsError;
  const [buttonheight, setButtonHeight] = useState(0);

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
            navigation.pop(1);
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
        state,
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
              navigation.pop(1);
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
              navigation.pop(1);
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
              navigation.pop(1);
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
      <View style={styles.content}>
        {
          // head
        }
        <LogoCard />
        {
          // mid
        }
        <View style={{ width: "100%", alignItems: "center" }}>
          {Platform.OS === "ios" && (
            // <TouchableOpacity style={{ ...styles.login_container }}>
            //   <Image
            //     source={require("../../../assets/icons/apple.png")}
            //     style={styles.image}
            //   />
            //   <Text style={styles.click_text}>Sign in with Apple</Text>

            // </TouchableOpacity>
            <AppleAuthentication.AppleAuthenticationButton
              buttonStyle={
                AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
              }
              buttonType={
                AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
              }
              cornerRadius={100}
              style={{ ...styles.login_container, height: buttonheight }}
              onPress={AppleLogin}
            ></AppleAuthentication.AppleAuthenticationButton>
          )}
          {Platform.OS === "android" && appleAuthAndroid.isSupported && (
            <AppleButton
              style={{ ...styles.login_container, height: buttonheight }}
              cornerRadius={50}
              buttonStyle={AppleButton.Style.WHITE}
              buttonType={AppleButton.Type.SIGN_IN}
              onPress={() => doAppleLogin()}
              leftView={
                <Image
                  style={{
                    alignSelf: "center",
                    width: 20,
                    height: 20,
                    marginRight: 20,
                    resizeMode: "contain",
                  }}
                  source={require("../../../assets/icons/apple.png")}
                />
              }
            />
          )}

          <TouchableOpacity
            style={styles.login_container}
            onPress={() => promptAsync()}
            onLayout={(event) => {
              setButtonHeight(event.nativeEvent.layout.height);
            }}
          >
            <Image
              source={require("../../../assets/icons/google.png")}
              style={styles.image}
            />
            <Text style={styles.click_text}>Continue with Google</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={styles.login_container}
            onPress={async () => await facebookLogin.mutateAsync()}
          >
            <Image
              source={require("../../../assets/icons/facebook.png")}
              style={styles.image}
            />
            <Text style={styles.click_text}>Continue with Facebook</Text>
          </TouchableOpacity> */}
          <Text style={{ ...styles.bottom_text, fontSize: 12 }}>
            Already have an account?{" "}
            <Text
              style={{
                ...styles.bottom_text,
                fontSize: 12,
                fontFamily: "medium",
              }}
              onPress={() => navigation.push("Auth.login")}
            >
              Log in
            </Text>
          </Text>
        </View>
        {
          // bottom
        }
        <Text style={styles.bottom_text}>
          By Continuing, you agree to MOOD’s{" "}
          <Text
            style={{ ...styles.bottom_text, fontFamily: "medium" }}
            onPress={() => {
              Linking.openURL("https://www.moodmusics.com/terms-conditions");
            }}
          >
            Terms & Conditions
          </Text>{" "}
          and{" "}
          <Text
            style={{
              ...styles.bottom_text,
              fontFamily: "medium",
            }}
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

export default SignIn;

const styles = StyleSheet.create({
  background: {
    ...(StyleSheet.absoluteFill as {}),
  },
  content: {
    flex: 1,
    marginTop: height * 0.24,
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
  login_container: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 100,
    paddingVertical: 12,
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 20,
  },
  image: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },
  click_text: {
    marginLeft: 20,
    fontFamily: "regular",
    fontSize: 14,
    textAlign: "center",
  },
});
