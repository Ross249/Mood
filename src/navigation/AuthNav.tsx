import { TypedNavigator } from "@react-navigation/native";
import { NavigationState } from "@react-navigation/routers";
import { RootStackParamList } from "../types/global";
import SignIn from "../screens/Auth/SignIn";
import Login from "../screens/Auth/Login";
import Forget from "../screens/Auth/Forget";
import Confirm from "../screens/Auth/Confirm";

export default function (
  Stack: TypedNavigator<RootStackParamList, NavigationState, {}, any, any>
) {
  return (
    <Stack.Group
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen
        name="Auth.signin"
        component={SignIn}
        options={{
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="Auth.login"
        component={Login}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="Auth.login.forget"
        component={Forget}
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="Auth.login.forget.confirm"
        component={Confirm}
        options={{ animation: "slide_from_right" }}
      />
    </Stack.Group>
  );
}
