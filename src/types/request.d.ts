import { SoundQuality } from "./common";

export type LoginByEmailData = {
  email: string;
  password: string;
};

export type ResetPasswordData = Omit<LoginByEmailData, "password"> & {
  new_password: string;
  confirm_password: string;
  code: string;
};

export type PaginationRequest = {
  id: string;
  page: number;
  perPage: number;
};

export type CreateOrderRequest = {
  price_id: string;
  amount: string;
  interval: string;
};

export type SubScriptionError = {
  order_id: string;
  error: "Failed" | "Canceled" | "Unknown";
};

export type SubScriptionPurchase = {
  purchase_token: string;
  product_id: string;
  platform: "android" | "ios";
};
