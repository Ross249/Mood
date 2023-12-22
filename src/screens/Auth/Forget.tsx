import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { generalProperties } from "../../common/constant";
import { RootStackScreenProps } from "../../types/global";
import globalState from "../../common/globalState";
import { Ionicons } from "@expo/vector-icons";
import LogoCard from "../../components/LogoCard";
import { FloatingLabelInput } from "react-native-floating-label-input";
import { useMutation } from "@tanstack/react-query";
import { AuthService } from "../../services/Auth.service";
import { useCommoneActions } from "../../store/user";

const Forget = ({
  navigation,
  route,
}: RootStackScreenProps<"Auth.login.forget">) => {
  const [email, setEmail] = useState("");
  const sendCode = useMutation({
    mutationKey: ["sendcode"],
    mutationFn: AuthService.SendEmailForCode,
  });

  const setLoading = useCommoneActions().setLoading;
  const setError = useCommoneActions().setIsError;

  const clickForSendCode = async () => {
    await sendCode.mutateAsync(
      {
        email: email.trim(),
      },
      {
        onSuccess: () => {
          navigation.push("Auth.login.forget.confirm", { email: email });
        },
        onError: (e) => {
          if (e instanceof Error && e.message.split(" ")[0] === "Network") {
            setError(true);
          } else {
            Toast.show(e instanceof Error ? e.message : typeof e);
          }
        },
      }
    );
  };

  useEffect(() => {
    if (sendCode.isLoading) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [sendCode.isLoading]);

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
        <Text style={styles.header_text}>Forget Password</Text>
        <View style={{ width: 24 }}></View>
      </View>
      <View style={styles.content}>
        <LogoCard />
        <View style={{ marginTop: 32, marginBottom: 24, width: "100%" }}>
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
            value={email}
            cursorColor={generalProperties.primary}
            keyboardType="email-address"
            onChangeText={(value: string) => setEmail(value)}
          />
        </View>
        <TouchableOpacity
          style={{
            ...styles.button,
            borderColor:
              email.length > 0 ? generalProperties.primary : "#6B6B6B",
            backgroundColor:
              email.length > 0 ? generalProperties.primary : "rgba(0,0,0,0)",
          }}
          onPress={clickForSendCode}
        >
          <Text
            style={{
              ...styles.button_text,
              color: email.length > 0 ? "#fff" : "#6B6B6B",
            }}
          >
            Send
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Forget;

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
});
