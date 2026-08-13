export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  roleId: string;
  workspaceId: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
