import { TypedNavigator } from "@react-navigation/native";
import { NavigationState } from "@react-navigation/routers";
import { RootStackParamList } from "../types/global";
import Account from "../screens/UserSetting/Account";
import Settings from "../screens/UserSetting/Settings";
import Info from "../screens/UserSetting/Info";
import DeleteAccount from "../screens/UserSetting/DeleteAccount";
import SubcriptionPurchase from "../screens/UserSetting/SubcriptionPurchase";
import StreamQuality from "../screens/UserSetting/StreamQuality";
import { withIAPContext } from "react-native-iap";

export default function (
  Stack: TypedNavigator<RootStackParamList, NavigationState, {}, any, any>
) {
  return (
    <Stack.Group screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="User.account"
        component={Account}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="User.settings"
        component={Settings}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="User.settings.accounts"
        component={Info}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="User.settings.accounts.delete"
        component={DeleteAccount}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="User.settings.subscription"
        component={withIAPContext(SubcriptionPurchase)}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="User.settings.quality"
        component={StreamQuality}
        options={{ animation: "slide_from_right" }}
      />
    </Stack.Group>
  );
}
