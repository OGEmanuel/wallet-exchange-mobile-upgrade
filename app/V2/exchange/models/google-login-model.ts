export interface GoogleLoginModel {
  access_token?: string;
  token_type?:   string;
  expires_in?:   number;
  scope?:        string;
  code?:        string;
  authuser?:     string;
  hd?:           string;
  prompt?:       string;
}
