export const Role = {
  ADMIN: "admin",
  CREATOR: "creator",
  VISITOR: "visitor",
} as const;

export type IRole = (typeof Role)[keyof typeof Role];

export interface IResponse {
  success: boolean;
  message: string;
  data?: any;
}
