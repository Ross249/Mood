import { ST_request } from "../common/utils";
import { PaginationRequest } from "../types/request";

export const HomeService = {
  getHomePage: async () =>
    await ST_request({
      method: "GET",
      path: "/app/v1/music/index",
    }),

  LikeSong: async (data: { id: string }) =>
    await ST_request({
      method: "POST",
      path: "/app/v1/music/like",
      data: data,
    }),

  UnLikeSong: async (data: { id: string }) =>
    await ST_request({
      method: "POST",
      path: "/app/v1/music/unlike",
      data: data,
    }),

  getSongDetail: async (data: { id: string }) =>
    await ST_request({
      method: "GET",
      path: `/app/v1/music/detail?id=${data.id}`,
    }),

  getPlayListDetailWithPaginantion: async (data: PaginationRequest) =>
    await ST_request({
      method: "GET",
      path: `/app/v1/playlist/detail?id=${data.id}&page=${data.page}&perPage=${data.perPage}`,
    }),

  getPlayListDetail: async (data: { id: string }) =>
    await ST_request({
      method: "GET",
      path: `/app/v1/playlist/musics?id=${data.id}`,
    }),

  LikePlayList: async (data: { id: string }) =>
    await ST_request({
      method: "POST",
      path: "/app/v1/playlist/like",
      data: data,
    }),

  UnLikePlayList: async (data: { id: string }) =>
    await ST_request({
      method: "POST",
      path: "/app/v1/playlist/unlike",
      data: data,
    }),

  getCategoryList: async () =>
    await ST_request({
      method: "GET",
      path: "/app/v1/category/index",
    }),

  getPlayListByCategory: async (data: { id: string } & PaginationRequest) =>
    await ST_request({
      method: "GET",
      path: `/app/v1/category/detail?id=${data.id}&page=${data.page}&perPage=${data.perPage}`,
    }),

  getRateLinks: async () =>
    await ST_request({
      method: "GET",
      path: "/app/v1/settings",
    }),
};
