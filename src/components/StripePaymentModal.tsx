import { StyleSheet, Text, View } from "react-native";
import {
  useStripe,
  initStripe,
  PresentPaymentSheetResult,
  PlatformPay,
  usePlatformPay,
} from "@stripe/stripe-react-native";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { UserService } from "../services/User.service";
import { CreateOrderRequest } from "../types/request";
import { useCommoneActions } from "../store/user";
import { OrderResponseData } from "../types/response";
import { paymentModal } from "../types/component";
import { SoundQualites, UserInfo } from "../types/common";

const StripePaymentModal = (props: paymentModal) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [trigger, setTrigger] = useState(false); // trigger for query user data again
  const setIsError = useCommoneActions().setIsError;
  const setUserInfo = useCommoneActions().setUserInfo;
  const setQualities = useCommoneActions().setSoundQualities;
  const createOrder = useMutation({
    mutationKey: ["createOrder"],
    mutationFn: UserService.createOrder,
  });

  const getUserInfo = useQuery<UserInfo & SoundQualites>({
    queryKey: ["user_info"],
    queryFn: UserService.getUserInfo,
    enabled: trigger,
  });

  const fetchPaymentSheetParams = async () => {
    const response = await createOrder.mutateAsync(
      {
        price_id: props.price_id,
        amount: props.amount,
        interval: props.interval,
      },
      {
        onError: (e) => {
          if (e instanceof Error && e.message.split(" ")[0] === "Network") {
            setIsError(true);
          } else {
            Toast.show(e instanceof Error ? e.message : typeof e, {
              duration: 2000,
            });
          }

          props.close();
        },
      }
    );

    if (!response.client_secret || !response.publishable_key) {
      return { client_secret: false };
    } else {
      return {
        client_secret: response.client_secret,
        publishable_key: response.publishable_key,
      };
    }
  };

  const initPay = async () => {
    const { client_secret, publishable_key } = await fetchPaymentSheetParams();
    console.log(`secret: ${client_secret}, key: ${publishable_key}`);

    if (!client_secret) {
      setIsError(true);
      // close it
      props.close();
    }

    await initStripe({ publishableKey: publishable_key, urlScheme: "mood" });

    const { error } = await initPaymentSheet({
      paymentIntentClientSecret: client_secret,
      allowsDelayedPaymentMethods: false,
      merchantDisplayName: "MOOD Lofi Musics",

      googlePay: {
        merchantCountryCode: "HK",
        testEnv: false,
      },
      applePay: {
        merchantCountryCode: "HK",
      },
    });

    let res = await presentPaymentSheet().catch((e) => {
      setIsError(true);
      Toast.show(e instanceof Error ? e.message : "");
      props.close();
    });

    console.log(res);

    if (error) {
      setIsError(true);
      // close it
      props.close();
    } else {
      !!res && !res.error && setTrigger(true);
      !!res && !res.error && Toast.show("Subscribe successfully!");
      props.close();
    }
  };

  useEffect(() => {
    if (getUserInfo.isSuccess && trigger) {
      console.log("update user info");

      setUserInfo(getUserInfo.data);
      setQualities({
        wifi_streaming: getUserInfo.data.wifi_streaming,
        data_streaming: getUserInfo.data.data_streaming,
      });
    }
    if (getUserInfo.isError) {
      setIsError(true);
    }
  }, [getUserInfo.isSuccess, getUserInfo.isError, trigger]);

  useEffect(() => {
    initPay().catch((err) => {
      // setIsError(true);
      // Toast.show(err instanceof Error ? err.message : "");
      props.close();
    });
  }, []);

  return <View style={styles.container}></View>;
};

export default StripePaymentModal;

const styles = StyleSheet.create({
  container: {
    ...(StyleSheet.absoluteFill as {}),
    backgroundColor: "rgba(0,0,0,0.7)",
  },
});
