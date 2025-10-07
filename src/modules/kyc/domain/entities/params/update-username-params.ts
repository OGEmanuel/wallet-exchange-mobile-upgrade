export interface UpdateUsernameParams {
  username: string;
  email: string;
  phone: string;
  avatar: {
    url: string;
    backgroundColor: string;
  };
}
