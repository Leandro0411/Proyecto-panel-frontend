export interface TokenData {
  token: string;
  expires: string;
}

export interface AuthTokens {
  access: TokenData;
  refresh: TokenData;
}
