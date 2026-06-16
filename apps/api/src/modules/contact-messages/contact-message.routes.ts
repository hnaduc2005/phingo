import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { emptyStringToNull, nullableTrimmedString, requiredTrimmedString } from "@phingo/shared";
import { ok } from "../../utils/response";

const contactMessageSchema = z.object({
  name: requiredTrimmedString(2),
  email: z.preprocess(emptyStringToNull, z.string().trim().email().nullable().optional()),
  phone: nullableTrimmedString,
  subject: nullableTrimmedString,
  message: requiredTrimmedString(5),
});

export async function contactMessageRoutes(app: FastifyInstance) {
  app.post("/", async (request, reply) => {
    const body = contactMessageSchema.parse(request.body);
    
    await app.prisma.contactMessage.create({
      data: {
        name: body.name,
        email: body.email ?? null,
        phone: body.phone ?? null,
        subject: body.subject ?? null,
        message: body.message,
      }
    });

    return ok(reply, "Message sent successfully", null, 201);
  });
}
