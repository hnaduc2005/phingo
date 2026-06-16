export function normalizeEmptyToUndefined(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? undefined : value;
}

export function normalizeEmptyToNull(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? null : value;
}

export function toNumberOrUndefined(value: unknown) {
  const normalized = normalizeEmptyToUndefined(value);

  if (normalized === undefined) {
    return undefined;
  }

  const numberValue = Number(normalized);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

export function toNumberOrNull(value: unknown) {
  const normalized = normalizeEmptyToNull(value);

  if (normalized === null) {
    return null;
  }

  const numberValue = Number(normalized);
  return Number.isFinite(numberValue) ? numberValue : null;
}

export function toBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.trim().toLowerCase() === "true";
  }

  return Boolean(value);
}

export function trimPayload<T extends Record<string, unknown>>(payload: T) {
  return Object.entries(payload).reduce<Record<string, unknown>>((acc, [key, value]) => {
    if (value === undefined) {
      return acc;
    }

    acc[key] = typeof value === "string" ? value.trim() : value;
    return acc;
  }, {});
}
