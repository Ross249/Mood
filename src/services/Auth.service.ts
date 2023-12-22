import { ST_request } from "../common/utils";
import { LoginByEmailData, ResetPasswordData } from "../types/request";

export const AuthService = {
  LoginByEmail: async (data: LoginByEmailData) =>
    await ST_request({
      method: "POST",
      path: "/app/v1/loginByPassword",
      data: data,
    }),
  Logout: async () =>
    await ST_request({
      method: "GET",
      path: "/app/v1/logout",
    }),
  LoginByFacebook: async (data: { access_token: string }) =>
    await ST_request({
      method: "POST",
      path: "/app/v1/loginByFacebook",
      data: data,
    }),
  LoginByGoogle: async (data: { access_token: string }) =>
    await ST_request({
      method: "POST",
      path: "/app/v1/loginByGoogle",
      data: data,
    }),

  LoginByApple: async (data: { identity_token: string }) =>
    await ST_request({
      method: "POST",
      path: "/app/v1/loginByApple",
      data: data,
    }),
  SendEmailForCode: async (data: { email: string }) =>
    await ST_request({
      method: "POST",
      path: "/app/v1/sendEmail",
      data: data,
    }),
  ResetPassword: async (data: ResetPasswordData) =>
    await ST_request({
      method: "POST",
      path: "/app/v1/resetPassword",
      data: data,
    }),

  DeleteAccount: async () =>
    await ST_request({
      method: "POST",
      path: "/app/v1/deleteAccount",
    }),
};
