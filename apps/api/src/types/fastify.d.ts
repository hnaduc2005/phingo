import type { PrismaClient } from "@phingo/database";
import type { UserRole } from "@phingo/shared";
import type { FastifyReply, FastifyRequest } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      sub: string;
      email: string;
      role: UserRole;
    };
    user: {
      sub: string;
      email: string;
      role: UserRole;
    };
  }
}
