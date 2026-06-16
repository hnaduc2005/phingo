import { z } from "zod";

export function emptyStringToUndefined(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? undefined : value;
}

export function emptyStringToNull(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? null : value;
}

export const requiredTrimmedString = (min = 1, message?: string) =>
  z.string().trim().min(min, message);

export const optionalTrimmedString = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().optional()
);

export const nullableTrimmedString = z.preprocess(
  emptyStringToNull,
  z.string().trim().nullable().optional()
);

export const optionalId = z.preprocess((value) => {
  if (value === null) {
    return undefined;
  }

  return emptyStringToUndefined(value);
}, z.string().trim().min(1).optional());

export const optionalUrlOrPath = z.preprocess(
  emptyStringToUndefined,
  z
    .string()
    .trim()
    .refine((value) => value.startsWith("/") || URL.canParse(value), {
      message: "Must be a valid URL or an internal path"
    })
    .optional()
);

export const requiredUrlOrPath = z
  .string()
  .trim()
  .min(1)
  .refine((value) => value.startsWith("/") || URL.canParse(value), {
    message: "Must be a valid URL or an internal path"
  });

export const nullableUrlOrPath = z.preprocess(
  emptyStringToNull,
  z
    .string()
    .trim()
    .refine((value) => value.startsWith("/") || URL.canParse(value), {
      message: "Must be a valid URL or an internal path"
    })
    .nullable()
    .optional()
);

export const optionalNumber = z.preprocess(
  emptyStringToUndefined,
  z.coerce.number().optional()
);

export const optionalPositiveInt = z.preprocess(
  emptyStringToUndefined,
  z.coerce.number().int().positive().optional()
);

export const nullableNumber = z.preprocess(
  emptyStringToNull,
  z.coerce.number().nullable().optional()
);

export const optionalDate = z.preprocess(
  emptyStringToUndefined,
  z.coerce.date().optional()
);

export const flexibleBoolean = z.preprocess((value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "true") {
      return true;
    }

    if (normalized === "false") {
      return false;
    }
  }

  return value;
}, z.boolean());

export const optionalFlexibleBoolean = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "true") {
      return true;
    }

    if (normalized === "false") {
      return false;
    }
  }

  return value;
}, z.boolean().optional());
