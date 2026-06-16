import { clearAuthSession, getAccessToken, getRefreshToken, saveAuthTokens } from "./auth";

export type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
  error?: unknown;
};

export type ValidationFieldError = {
  field: string;
  message: string;
};

export class ApiError extends Error {
  status: number;
  error?: unknown;
  fields: ValidationFieldError[];

  constructor(message: string, status: number, error?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.error = error;
    this.fields = getValidationFields(error);
  }
}

function getValidationFields(error: unknown): ValidationFieldError[] {
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "VALIDATION_ERROR" &&
    "fields" in error &&
    Array.isArray(error.fields)
  ) {
    return error.fields.filter(
      (field): field is ValidationFieldError =>
        field &&
        typeof field === "object" &&
        "field" in field &&
        typeof field.field === "string" &&
        "message" in field &&
        typeof field.message === "string"
    );
  }

  return [];
}

type ApiOptions = RequestInit & {
  token?: string;
  skipAuthRefresh?: boolean;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch<T>(path: string, options: ApiOptions = {}) {
  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const token = options.token ?? getAccessToken();
  const hasBody = options.body !== undefined && options.body !== null;
  const headers = new Headers(options.headers);

  if (hasBody && !headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  let payload = {} as T;

  if (text) {
    try {
      payload = JSON.parse(text) as T;
    } catch {
      payload = { message: text } as T;
    }
  }

  if (response.status === 401 && !options.skipAuthRefresh) {
    const refreshToken = getRefreshToken();

    if (refreshToken) {
      try {
        const refreshed = await fetch(`${apiBaseUrl}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        const refreshPayload = (await refreshed.json()) as ApiResponse<{
          accessToken: string;
          refreshToken: string;
        }>;

        if (refreshed.ok && refreshPayload.data) {
          saveAuthTokens(refreshPayload.data);

          return apiFetch<T>(path, {
            ...options,
            token: refreshPayload.data.accessToken,
            skipAuthRefresh: true,
          });
        }
      } catch {
        clearAuthSession();
      }
    }
  }

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : `API request failed: ${response.status}`;
    const error =
      typeof payload === "object" && payload !== null && "error" in payload
        ? payload.error
        : undefined;

    throw new ApiError(message, response.status, error);
  }

  return payload;
}
