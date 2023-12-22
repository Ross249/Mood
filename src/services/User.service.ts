import { ST_request } from "../common/utils";
import { SoundQualites } from "../types/common";
import {
  CreateOrderRequest,
  PaginationRequest,
  SubScriptionError,
  SubScriptionPurchase,
} from "../types/request";

export const UserService = {
  getUserInfo: async () =>
    await ST_request({
      method: "GET",
      path: "/app/v1/getUserInfo",
    }),

  getLikePageWithPagination: async (data: Omit<PaginationRequest, "id">) =>
    await ST_request({
      method: "GET",
      path: `/app/v1/playlist/liked?page=${data.page}&perPage=${data.perPage}`,
    }),

  getRecommendPageWithPagination: async (data: Omit<PaginationRequest, "id">) =>
    await ST_request({
      method: "GET",
      path: `/app/v1/playlist/recommended?page=${data.page}&perPage=${data.perPage}`,
    }),

  getSubscriptionItems: async () =>
    await ST_request({
      method: "GET",
      path: "/app/v1/order/getProducts",
    }),

  createOrder: async (data: CreateOrderRequest) =>
    await ST_request({
      method: "POST",
      path: "/app/v1/order/subscribe",
      data: data,
    }),

  cancelSubscription: async () =>
    await ST_request({
      method: "POST",
      path: "/app/v1/order/unsubscribe",
    }),

  changeSoundQuality: async (data: SoundQualites) =>
    await ST_request({
      method: "POST",
      path: "/app/v1/setStreamingQuality",
      data: data,
    }),

  getAccountStatistics: async (data: "Week" | "Month" | "Year") =>
    await ST_request({
      method: "GET",
      path: `/app/v1/statistic/index?interval=${data}`,
    }),

  sendSubscriptionError: async (data: SubScriptionError) =>
    await ST_request({
      method: "POST",
      path: "/app/v1/order/clientPaymentError",
      data: data,
    }),

  iapConfirm: async (data: SubScriptionPurchase) =>
    await ST_request({
      method: "POST",
      path: "/app/v1/order/iapSubscribe",
      data: data,
    }),
};
