import type { UserRole } from "@phingo/shared";
import type { FastifyReply, FastifyRequest } from "fastify";

import { fail } from "../utils/response";

export function requireRole(roles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (error) {
      return fail(reply, "Unauthorized", error, 401);
    }

    if (!roles.includes(request.user.role)) {
      return fail(reply, "Forbidden", { requiredRoles: roles }, 403);
    }

    return undefined;
  };
}
