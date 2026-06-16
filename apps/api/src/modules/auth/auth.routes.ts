import { loginSchema, registerSchema, type UserRole } from "@phingo/shared";
import bcrypt from "bcryptjs";
import type { FastifyInstance } from "fastify";
import jwt, { type SignOptions } from "jsonwebtoken";
import { z } from "zod";

import { env } from "../../config/env";
import { fail, ok } from "../../utils/response";

type TokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

function publicUser(user: {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  status: string;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    status: user.status
  };
}

function createTokens(app: FastifyInstance, payload: TokenPayload) {
  const accessToken = app.jwt.sign(payload, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN
  });
  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"]
  });

  return { accessToken, refreshToken };
}

export async function authRoutes(app: FastifyInstance) {
  app.post("/register", async (request, reply) => {
    const body = registerSchema.parse(request.body);
    const existingUser = await app.prisma.user.findUnique({
      where: { email: body.email }
    });

    if (existingUser) {
      return fail(reply, "Email already exists", { email: body.email }, 409);
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await app.prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        name: body.name,
        phone: body.phone,
        role: "CUSTOMER",
        status: "ACTIVE"
      }
    });

    const tokens = createTokens(app, {
      sub: user.id,
      email: user.email,
      role: user.role as UserRole
    });

    return ok(reply, "Registered successfully", { user: publicUser(user), tokens }, 201);
  });

  app.post("/login", async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const user = await app.prisma.user.findUnique({
      where: { email: body.email }
    });

    if (!user || user.status !== "ACTIVE") {
      return fail(reply, "Invalid credentials", undefined, 401);
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.passwordHash);

    if (!isPasswordValid) {
      return fail(reply, "Invalid credentials", undefined, 401);
    }

    const tokens = createTokens(app, {
      sub: user.id,
      email: user.email,
      role: user.role as UserRole
    });

    return ok(reply, "Logged in successfully", { user: publicUser(user), tokens });
  });

  app.post("/refresh", async (request, reply) => {
    const body = z.object({ refreshToken: z.string().min(1) }).parse(request.body);

    try {
      const payload = jwt.verify(body.refreshToken, env.JWT_REFRESH_SECRET) as TokenPayload;
      const user = await app.prisma.user.findUnique({
        where: { id: payload.sub }
      });

      if (!user || user.status !== "ACTIVE") {
        return fail(reply, "Invalid refresh token", undefined, 401);
      }

      const tokens = createTokens(app, {
        sub: user.id,
        email: user.email,
        role: user.role as UserRole
      });

      return ok(reply, "Token refreshed", tokens);
    } catch (error) {
      return fail(reply, "Invalid refresh token", error, 401);
    }
  });

  app.post("/logout", async (_request, reply) => {
    // TODO: Persist and revoke refresh tokens before using this logout flow in production.
    return ok(reply, "Logged out successfully");
  });

  app.get("/me", { preHandler: app.authenticate }, async (request, reply) => {
    const user = await app.prisma.user.findUnique({
      where: { id: request.user.sub }
    });

    if (!user) {
      return fail(reply, "User not found", undefined, 404);
    }

    return ok(reply, "Current user", publicUser(user));
  });
}
