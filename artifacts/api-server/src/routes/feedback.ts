import { randomUUID } from "node:crypto";
import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db, feedbackTable, feedbackUploadsTable } from "@workspace/db";
import { and, count, desc, eq, gte, isNull } from "drizzle-orm";
import { pendingFile, pendingPath, publishedFile, signUpload, verifyImage } from "../lib/feedbackStorage";

const router: IRouter = Router();
const categories = ["cups", "perfumes", "beauty", "cosmetics", "bodycare", "flowers", "printing"] as const;
const types = ["image/jpeg", "image/png", "image/webp"];
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX = 5 * 1024 * 1024;
class InvalidImageError extends Error {
  constructor(cause: unknown) {
    super("Image is missing, invalid or exceeds 5MB", { cause });
  }
}
function category(value: unknown): value is typeof categories[number] {
  return typeof value === "string" && categories.includes(value as typeof categories[number]);
}
function requireUser(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Log in to continue" });
  return next();
}
function sameOrigin(req: Request, res: Response, next: NextFunction) {
  const origin = req.get("origin");
  const host = req.get("x-forwarded-host")?.split(",")[0].trim() ?? req.get("host");
  const protocol = req.get("x-forwarded-proto")?.split(",")[0].trim() ?? req.protocol;
  if (!origin || !host || (() => {
    try {
      const url = new URL(origin);
      return url.host !== host || url.protocol !== `${protocol}:`;
    } catch { return true; }
  })()) return res.status(403).json({ error: "Same-origin request required" });
  return next();
}
function item(row: typeof feedbackTable.$inferSelect, viewer?: string) {
  return {
    id: row.id, category: row.category, authorName: row.authorName, text: row.text,
    imageUrl: row.imagePath ? `/api/feedback/images/${row.id}` : null,
    createdAt: row.createdAt.toISOString(), canDelete: !!viewer && row.authorId === viewer,
  };
}
function displayName(req: Request) {
  const user = req.user!;
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name.slice(0, 150) || "Customer";
}
router.get("/feedback", async (req, res) => {
  if (!category(req.query.category)) return res.status(400).json({ error: "Invalid category" });
  const rows = await db.select().from(feedbackTable).where(eq(feedbackTable.category, req.query.category))
    .orderBy(desc(feedbackTable.createdAt), desc(feedbackTable.id)).limit(100);
  return res.json({ items: rows.map(row => item(row, req.user?.id)) });
});

router.post("/feedback/upload", requireUser, sameOrigin, async (req, res) => {
  const { contentType, size } = req.body ?? {};
  if (!types.includes(contentType) || !Number.isInteger(size) || size < 1 || size > MAX) return res.status(400).json({ error: "Only JPEG, PNG or WebP images up to 5MB are supported" });
  const [{ value }] = await db.select({ value: count() }).from(feedbackUploadsTable)
    .where(and(eq(feedbackUploadsTable.ownerId, req.user!.id), gte(feedbackUploadsTable.createdAt, new Date(Date.now() - 3600000))));
  if (value >= 20) return res.status(429).json({ error: "Upload limit reached; try again later" });
  const id = randomUUID();
  const uploadURL = await signUpload(id);
  const objectPath = pendingPath(id);
  await db.insert(feedbackUploadsTable).values({ objectPath, ownerId: req.user!.id, contentType, size });
  return res.json({ uploadURL, objectPath });
});

router.post("/feedback", requireUser, sameOrigin, async (req, res) => {
  const { category: selected, text: raw, imagePath } = req.body ?? {};
  const text = typeof raw === "string" ? raw.trim() : "";
  if (!category(selected) || text.length < 3 || text.length > 2000 || (imagePath !== undefined && (typeof imagePath !== "string" || !/^\/objects\/feedback-pending\/[0-9a-f-]{36}$/.test(imagePath)))) {
    return res.status(400).json({ error: "Invalid category, text or image path (text must be 3–2000 characters)" });
  }
  const [{ value }] = await db.select({ value: count() }).from(feedbackTable)
    .where(and(eq(feedbackTable.authorId, req.user!.id), gte(feedbackTable.createdAt, new Date(Date.now() - 3600000))));
  if (value >= 10) return res.status(429).json({ error: "Feedback limit reached; try again later" });
  let upload: typeof feedbackUploadsTable.$inferSelect | undefined;
  let source: ReturnType<typeof pendingFile> | undefined;
  if (imagePath) {
    [upload] = await db.select().from(feedbackUploadsTable).where(and(
      eq(feedbackUploadsTable.objectPath, imagePath), eq(feedbackUploadsTable.ownerId, req.user!.id), isNull(feedbackUploadsTable.consumedAt),
      gte(feedbackUploadsTable.createdAt, new Date(Date.now() - 30 * 60000)),
    ));
    if (!upload) return res.status(400).json({ error: "Image upload is unavailable or not owned by you" });
    source = pendingFile(imagePath.split("/").pop()!);
  }
  const id = randomUUID();
  let row: typeof feedbackTable.$inferSelect | null;
  try {
    row = await db.transaction(async tx => {
      if (upload && source) {
        const [claimed] = await tx.update(feedbackUploadsTable).set({ consumedAt: new Date() })
          .where(and(eq(feedbackUploadsTable.objectPath, upload.objectPath), isNull(feedbackUploadsTable.consumedAt))).returning();
        if (!claimed) return null;
        // The pending signed URL can be reused until expiry. Validate the
        // server-only published copy, never the mutable upload source.
        try {
          await source.copy(publishedFile(id));
          await verifyImage(publishedFile(id), upload.contentType, upload.size);
        } catch (error) {
          throw new InvalidImageError(error);
        }
      }
      const [created] = await tx.insert(feedbackTable).values({
        id, category: selected, text, authorId: req.user!.id, authorName: displayName(req),
        imagePath: upload ? `/objects/feedback-published/${id}` : null,
      }).returning();
      return created;
    });
  } catch (error) {
    if (upload) {
      try {
        await publishedFile(id).delete({ ignoreNotFound: true });
      } catch (cleanupError) {
        req.log.error({ error: cleanupError }, "Rejected image cleanup failed");
      }
    }
    if (error instanceof InvalidImageError) {
      req.log.info({ error: error.cause }, "Feedback image rejected");
      return res.status(400).json({ error: error.message });
    }
    throw error;
  }
  if (!row) return res.status(409).json({ error: "Image upload was already used" });
  return res.status(201).json(item(row, req.user!.id));
});

router.delete("/feedback/:id", requireUser, sameOrigin, async (req, res) => {
  const id = req.params.id;
  if (typeof id !== "string" || !uuid.test(id)) return res.status(404).json({ error: "Feedback not found" });
  const [row] = await db.delete(feedbackTable).where(and(eq(feedbackTable.id, id), eq(feedbackTable.authorId, req.user!.id))).returning();
  if (!row) return res.status(404).json({ error: "Feedback not found" });
  if (row.imagePath) publishedFile(id).delete({ ignoreNotFound: true }).catch(error => req.log.error({ error }, "Image cleanup failed"));
  return res.json({ success: true });
});

router.get("/feedback/images/:id", async (req, res) => {
  const id = req.params.id;
  if (typeof id !== "string" || !uuid.test(id)) return res.status(404).json({ error: "Image not found" });
  const [row] = await db.select({ imagePath: feedbackTable.imagePath }).from(feedbackTable).where(eq(feedbackTable.id, id));
  if (!row?.imagePath || row.imagePath !== `/objects/feedback-published/${id}`) return res.status(404).json({ error: "Image not found" });
  const file = publishedFile(id);
  try {
    const [meta] = await file.getMetadata();
    if (!types.includes(meta.contentType ?? "") || Number(meta.size) > MAX) return res.status(404).json({ error: "Image not found" });
    res.set({ "Content-Type": meta.contentType, "Content-Length": String(meta.size), "Cache-Control": "public, max-age=300", "X-Content-Type-Options": "nosniff" });
    file.createReadStream().on("error", error => {
      req.log.error({ error }, "Image stream failed");
      if (!res.headersSent) res.status(502).json({ error: "Image unavailable" });
      else res.destroy(error);
    }).pipe(res);
    return;
  } catch {
    return res.status(404).json({ error: "Image not found" });
  }
});
export default router;