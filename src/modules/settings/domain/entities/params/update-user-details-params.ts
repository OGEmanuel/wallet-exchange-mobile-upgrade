export interface IUpdateUserDetailsParams {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: {
    url: string;
    backgroundColor: string;
  };
}
