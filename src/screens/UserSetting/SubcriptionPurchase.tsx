import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  Pressable,
  ScrollView,
  Animated,
  Platform,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { RootStackScreenProps } from "../../types/global";
import globalState from "../../common/globalState";
import { generalProperties, productItems } from "../../common/constant";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { UserService } from "../../services/User.service";
import { useCommoneActions, useSubIndex, useUserInfo } from "../../store/user";
import { SubscriptionItems } from "../../types/response";
import StripePaymentModal from "../../components/StripePaymentModal";
import SubscriptionCard from "../../components/SubscriptionCard";
import {
  PlatformPay,
  PlatformPayButton,
  usePlatformPay,
} from "@stripe/stripe-react-native";
import { SoundQualites, UserInfo } from "../../types/common";
import Iap, {
  PurchaseError,
  Subscription,
  SubscriptionAndroid,
  SubscriptionIOS,
  requestSubscription,
  useIAP,
} from "react-native-iap";

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;
/**
 * subscription
 * @param param0
 * @returns
 */
const SubcriptionPurchase = ({
  navigation,
  route,
}: RootStackScreenProps<"User.settings.subscription">) => {
  const info = useUserInfo();
  const [selected, setSelected] = useState<Subscription>();
  const setIsLoading = useCommoneActions().setLoading;
  const setIsError = useCommoneActions().setIsError;
  const setUserInfo = useCommoneActions().setUserInfo;
  const setQualities = useCommoneActions().setSoundQualities;
  const subIndex = useSubIndex();
  const setSubIndex = useCommoneActions().setSubIndex;

  const {
    subscriptions,
    currentPurchase,
    finishTransaction,
    getSubscriptions,
    currentPurchaseError,
  } = useIAP();
  const receiptConfirm = useMutation({
    mutationFn: UserService.iapConfirm,
    mutationKey: ["receipt_confirm"],
  });

  const handleGetSubscriptions = async () => {
    try {
      await getSubscriptions({ skus: productItems });
    } catch (error) {
      // setIsError(true);
    }
  };

  const handlePurchaseSubscriptions = async () => {
    setIsLoading(true);
    if (
      (await getUserInfo.refetch()).data?.is_member === 0 &&
      currentPurchase?.productId === undefined
    ) {
      try {
        !!selected &&
          (await requestSubscription({
            sku: selected.productId,
            subscriptionOffers: [
              {
                sku: selected.productId,
                //@ts-ignore
                offerToken:
                  "subscriptionOfferDetails" in selected
                    ? selected?.subscriptionOfferDetails[0]?.offerToken
                    : "",
              },
            ],
          }));
      } catch (e) {
        // Toast.show(e instanceof Error ? e.message : "");
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
      Toast.show("You have already subscribed");
    }
  };

  const getUserInfo = useQuery<UserInfo & SoundQualites>({
    queryKey: ["user_info"],
    queryFn: UserService.getUserInfo,
  });

  // // get user info
  useEffect(() => {
    if (getUserInfo.isSuccess) {
      console.log("update user info");
      setUserInfo(getUserInfo.data);
      setQualities({
        wifi_streaming: getUserInfo.data.wifi_streaming,
        data_streaming: getUserInfo.data.data_streaming,
      });
    }
  }, [getUserInfo.isSuccess]);

  // confirm purchase
  useEffect(() => {
    const checkCurrentPurchase = async () => {
      try {
        if (currentPurchase?.productId) {
          console.log(currentPurchase);
          await receiptConfirm.mutateAsync({
            platform: Platform.OS === "ios" ? "ios" : "android",
            product_id: currentPurchase.productId,
            purchase_token:
              Platform.OS === "ios"
                ? !!currentPurchase?.transactionReceipt
                  ? currentPurchase?.transactionReceipt
                  : ""
                : !!currentPurchase?.purchaseToken
                ? currentPurchase?.purchaseToken
                : "",
          });
          await finishTransaction({
            purchase: currentPurchase,
            isConsumable: true,
          });
          setUserInfo({ ...info, is_member: 1 });
          setIsLoading(false);
        }
      } catch (e) {
        console.log(` ${e instanceof Error ? e.message : ""}`);
        // if (e instanceof PurchaseError) {
        //   Toast.show(`PurchaseError: ${e.message}}`);
        // } else {

        //   // Toast.show(e instanceof Error ? e.message : "");
        // }
        setIsLoading(false);
      }
    };
    let purchageCheck = setTimeout(
      async () => await checkCurrentPurchase(),
      7000
    );

    return () => clearTimeout(purchageCheck);
  }, [currentPurchase, finishTransaction]);

  useEffect(() => {
    subscriptions.length === 0 && handleGetSubscriptions();
  }, []);

  useEffect(() => {
    !!selected &&
      setSubIndex(
        subscriptions.findIndex((s) => s.productId === selected?.productId)
      );
  }, [selected]);

  // dev: for log info
  useEffect(() => {
    // console.log(`subscriptions: ${subscriptions.length}`);
    if (subscriptions.length > 0) {
      setSelected(subscriptions[subIndex]);
      console.log(`subscriptions[0]: ${JSON.stringify(subscriptions[1])}`);
    }
  }, [subscriptions]);

  return (
    <View style={globalState.container}>
      {
        //background
      }
      <View style={styles.background}></View>
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
        <Text style={styles.header_text}>Subscription & Benefits</Text>
        <View style={{ width: 24 }}></View>
      </View>
      <View style={styles.content}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ width: "100%" }}
        >
          <Image
            source={require("../../../assets/banner/sub_banner.png")}
            style={{
              backgroundColor: "black",
              width: width,
              maxHeight: width * 0.664,
              resizeMode: "contain",
            }}
          />
          <View style={styles.benefit_container}>
            <View style={{ ...styles.benefit_item, marginBottom: 8 }}>
              <Ionicons name="ios-checkmark-circle" size={20} color="white" />
              <Text style={{ ...styles.benefit_text, marginLeft: 16 }}>
                Ad-free music listening
              </Text>
            </View>
            <View style={{ ...styles.benefit_item, marginBottom: 8 }}>
              <Ionicons name="ios-checkmark-circle" size={20} color="white" />
              <Text style={{ ...styles.benefit_text, marginLeft: 16 }}>
                Over 2,000+ lofi musics in the app
              </Text>
            </View>
            <View style={styles.benefit_item}>
              <Ionicons name="ios-checkmark-circle" size={20} color="white" />
              <Text style={{ ...styles.benefit_text, marginLeft: 16 }}>
                Cancel subscription anytime
              </Text>
            </View>
          </View>
          <View style={styles.sub}>
            {subscriptions.length > 0 &&
              subscriptions.map((item, index) => {
                return (
                  <SubscriptionCard
                    key={item.productId}
                    selected={selected}
                    setSelected={setSelected}
                    items={item}
                    index={index}
                  />
                );
              })}
          </View>
        </ScrollView>
        <View style={{ paddingHorizontal: 32 }}>
          <TouchableOpacity
            style={styles.button}
            onPress={handlePurchaseSubscriptions}
          >
            <Text style={styles.button_text}>Try free and subscribe</Text>
          </TouchableOpacity>
          <Text
            style={{ ...styles.button_text, textAlign: "center", fontSize: 12 }}
            onPress={() => {
              getUserInfo.refetch();
            }}
          >
            Restore Purchase
          </Text>
        </View>
      </View>
    </View>
  );
};

export default SubcriptionPurchase;

const styles = StyleSheet.create({
  background: {
    ...(StyleSheet.absoluteFill as {}),
    backgroundColor: "#000",
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
    marginTop: 24,
    marginBottom: generalProperties.tabPlayerHeight,
    justifyContent: "space-between",
  },
  benefit_container: {
    paddingLeft: 32,
    marginVertical: 24,
  },
  benefit_item: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
  },
  benefit_text: {
    fontSize: 14,
    fontFamily: "regular",
    color: "#fff",
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
  sub: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 32,
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  label: {
    flex: 0,
    flexDirection: "row",
    backgroundColor: generalProperties.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  sub_container: {
    display: "flex",
    alignItems: "flex-start",
    borderRadius: 2,
    borderWidth: 1,
    width: 0.375 * width,
    marginRight: 16,
    marginTop: 24,
    backgroundColor: "#000",
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,

    elevation: 7,
  },
  sub_decs_layout: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
