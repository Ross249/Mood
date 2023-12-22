import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import ErrorBoundary from "react-native-error-boundary";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Navigation from "./src/navigation";
import { useCallback, useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import * as ToastView from "react-native-toast-notifications";
import {
  useCommoneActions,
  useIsError,
  useIsFirstTime,
  useLoading,
  useUserInfo,
} from "./src/store/user";
import NetWorkHandling from "./src/components/NetWorkHandling";
import NeonLoading from "./src/components/NeonLoading";
import { useSetupPlayer } from "./src/hooks/useSetupPlayer";

import { StripePublicKey } from "./src/common/constant";
import Intro from "./src/components/Intro";
import { StripeProvider } from "@stripe/stripe-react-native";

declare var global: typeof globalThis & { AppToken: string | null };

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});
global.AppToken = null;

SplashScreen.preventAutoHideAsync();

export default function App() {
  const isPlayerReady = useSetupPlayer();
  const loading = useLoading();
  const isError = useIsError();
  const isFirst = useIsFirstTime();

  // const userInfo = useUserInfo();
  //const [showed, setShowed] = useState(false);

  // const { isLoaded, isClosed, load, show } = useRewardedInterstitialAd(
  //   TestIds.REWARDED_INTERSTITIAL,
  //   {
  //     requestNonPersonalizedAdsOnly: true,
  //   }
  // );
  const actions = useCommoneActions();

  const setIsFirst = actions.setFirstTime;
  const [fontsLoaded] = useFonts({
    regular: require("./assets/fonts/Poppins-Regular.ttf"),
    bold: require("./assets/fonts/Poppins-Bold.ttf"),
    light: require("./assets/fonts/Poppins-Light.ttf"),
    medium: require("./assets/fonts/Poppins-Medium.ttf"),
    semibold: require("./assets/fonts/Poppins-SemiBold.ttf"),
    dotty: require("./assets/fonts/dotty.regular.ttf"),
  });
  // const onLayoutRootView = useCallback(async () => {
  //   if (fontsLoaded && isPlayerReady) {
  //     await SplashScreen.hideAsync();
  //   }
  // }, [fontsLoaded, isPlayerReady]);

  // useEffect(() => {
  //   if (userInfo.is_member === 1) {
  //     setShowed(true);
  //     return;
  //   } else {
  //     !showed && load();
  //   }
  // }, [load, showed]);

  // useEffect(() => {
  //   if (isLoaded) {
  //     userInfo.is_member === 0 && show();
  //   }
  //   if (isClosed || userInfo.is_member === 1) {
  //     setShowed(true);
  //   }
  // }, [isLoaded, isClosed]);

  // useEffect(() => {
  //   console.log(`is member ${userInfo.is_member === 1}`);

  //   if (userInfo.is_member === 1) {
  //     setShowed(true);
  //     return;
  //   }

  //   const timer = setTimeout(() => {
  //     console.log("in timer");

  //     if (!showed) {
  //       setShowed(true);
  //     }
  //   }, 8000);

  //   return () => clearTimeout(timer);
  // }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ErrorBoundary
      onError={(error) => {
        console.log(error.name, error.message);
      }}
    >
      {/* <SafeAreaProvider onLayout={onLayoutRootView}> */}
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StripeProvider
            publishableKey={StripePublicKey}
            urlScheme="mood" // required for 3D Secure and bank redirects
            merchantIdentifier="merchant.com.mood.moodmusics" // required for Apple Pay
          >
            <Navigation />
          </StripeProvider>
        </QueryClientProvider>
        <StatusBar style="auto" />
        <NetWorkHandling visible={isError} setVisible={actions.setIsError} />
        <Intro visible={isFirst} setVisible={setIsFirst} />
        <NeonLoading visible={loading} setVisible={actions.setLoading} />
        <ToastView.default
          offsetBottom={150}
          style={{ borderRadius: 30, paddingHorizontal: 20 }}
          offset={150}
          duration={1500}
          ref={(ref) => {
            Toast = ref!;
          }}
        />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
