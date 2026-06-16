import type { FastifyInstance } from "fastify";

import { fail, ok } from "../../utils/response";

export async function contentRoutes(app: FastifyInstance) {
  app.get<{ Params: { slug: string } }>("/:slug", async (request, reply) => {
    const page = await app.prisma.contentPage.findUnique({
      where: { slug: request.params.slug }
    });

    if (!page || page.status !== "PUBLISHED") {
      return fail(reply, "Content page not found", undefined, 404);
    }

    return ok(reply, "Content page fetched", page);
  });
}
