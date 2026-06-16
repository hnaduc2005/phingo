export type AuthUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: "CUSTOMER" | "ADMIN";
  status: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthSession = {
  user: AuthUser;
  tokens: AuthTokens;
};

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "authUser";

function storage() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.localStorage;
}

export function getAccessToken() {
  return storage()?.getItem(ACCESS_TOKEN_KEY) ?? undefined;
}

export function getRefreshToken() {
  return storage()?.getItem(REFRESH_TOKEN_KEY) ?? undefined;
}

export function getStoredUser(): AuthUser | undefined {
  const raw = storage()?.getItem(USER_KEY);

  if (!raw) {
    return undefined;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    clearAuthSession();
    return undefined;
  }
}

export function saveAuthSession(session: AuthSession) {
  const target = storage();

  if (!target) {
    return;
  }

  target.setItem(ACCESS_TOKEN_KEY, session.tokens.accessToken);
  target.setItem(REFRESH_TOKEN_KEY, session.tokens.refreshToken);
  target.setItem(USER_KEY, JSON.stringify(session.user));
  window.dispatchEvent(new Event("phingo-auth-change"));
}

export function saveAuthTokens(tokens: AuthTokens) {
  const target = storage();

  if (!target) {
    return;
  }

  target.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  target.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  window.dispatchEvent(new Event("phingo-auth-change"));
}

export function saveAuthUser(user: AuthUser) {
  storage()?.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("phingo-auth-change"));
}

export function clearAuthSession() {
  const target = storage();

  if (!target) {
    return;
  }

  target.removeItem(ACCESS_TOKEN_KEY);
  target.removeItem(REFRESH_TOKEN_KEY);
  target.removeItem(USER_KEY);
  window.dispatchEvent(new Event("phingo-auth-change"));
}
