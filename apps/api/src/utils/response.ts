import type { FastifyReply } from "fastify";
import type { ZodError } from "zod";

export function ok<T>(reply: FastifyReply, message: string, data?: T, statusCode = 200) {
  return reply.code(statusCode).send({
    success: true,
    message,
    data
  });
}

export function fail(reply: FastifyReply, message: string, error?: unknown, statusCode = 400) {
  return reply.code(statusCode).send({
    success: false,
    message,
    error
  });
}

export function formatZodError(error: ZodError) {
  return {
    code: "VALIDATION_ERROR",
    fields: error.issues.map((issue) => ({
      field: issue.path.length ? issue.path.join(".") : "root",
      message: issue.message
    }))
  };
}
