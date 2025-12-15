export interface AppleLoginModel {
  authorization?: AppleAuthorizationModel;
}

export interface AppleAuthorizationModel {
  code?: string;
  id_token?: string;
}
