import { UserInfo } from "./common";

export type LoginByEmailResponseData = {
  token: string;
  token_type: string;
  user_info: UserInfo;
};

export type Song = {
  type: string;
  id: string; //音乐ID
  title: string; //音乐名称
  category_id?: number;
  lyrics: string;
  album_id: number;
  album_cover: string; //封面图
  length: number; //总时长（秒）
  liked: boolean; //是否喜欢（false 否，true 是）
  total_play_count: number; //总播放次数
  track: number;
  disc: number;
  genre: string; //音乐类别
  year: null;
  created_at: string; //创建时间
};

export type PlayList = {
  id: number; //播放列表 ID
  name: string; //播放列表名称
  rules: null;
  folder_id: string;
  cover: string;
  is_smart: boolean;
  category_id: number;
  category_name: string;
  is_like: 0 | 1;
  songs: Song[];
};

export type Category = {
  id: number;
  name: string; //分类名称
  cover: string; //背景图
  type: "song" | "playlist";
};

export type IndexPageResponseData = {
  new: Song[];
  most_people_listen: Song[];
  one_hour_lofi: PlayList[];
  two_hour_lofi: PlayList[];
  four_hour_lofi: PlayList[];
  categories: Category[];
};

export type MyPlayListResponseData = {
  row_count: number; //当前页条数
  limit: number; //每页多少条
  page: number; //当前页码
  total: number; //总条数
  is_more: number; //是否有更多
  list: Song[];
  playlists: PlayList[];
};

export type PlayListResponseData = Omit<
  MyPlayListResponseData,
  "list" | "playlists"
> & { list: Song[] | PlayList[] };

export type SongDetailResponseData = {
  id: string;
  album_cover: string;
  is_like: 0 | 1;
  title: string;
};

export type PlayListDetailResponseData = Omit<
  MyPlayListResponseData,
  "playlists"
> & {
  playlist_info: PlayListInfo;
};

export type PlayListInfo = {
  id: number;
  is_like: 0 | 1;
  cover: string;
  name: string;
  category_name: string;
};

export type SubscriptionItems = {
  product_id: string; //产品 ID
  name: string; //产品名称
  description: string; //产品描述
  price_id: string; //价格 ID（订阅会用到）
  unit_amount: number; //单价
  unit_amount_format: string; //单价格式化
  interval: string; //间隔
};

export type OrderResponseData = {
  order_id: number; //订单ID
  payment_amount: number; //支付金额
  subscription_id: string; //订阅ID
  client_secret: string; //客户端密钥
  publishable_key: string;
};

export type SongStatisticsItem = {
  key: number;
  value: number;
  for_humans: string | 0;
  date: string[];
};

export type GenereStatisticsItem = {
  genre: string;
  count: number;
};

export type AccountStatisticsResponse = {
  total_duration: strng | 0;
  song: SongStatisticsItem[];
  genre: GenereStatisticsItem[];
  most_category: string;
};
