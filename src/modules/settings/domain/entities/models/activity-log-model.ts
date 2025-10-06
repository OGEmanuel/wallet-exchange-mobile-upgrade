export interface ActivityLogModel {
  _id: string;
  userId: string;
  v1UserId: string;
  type: "LOGIN" | "OTP";
  description: string;
  data: Record<string, unknown>;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
