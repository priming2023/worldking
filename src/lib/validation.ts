import { z } from "zod";

export const deviceIdSchema = z.object({
  deviceId: z.string().uuid(),
});

export const scanBodySchema = z.object({
  deviceId: z.string().uuid(),
  qrPayload: z.string().min(1).max(4096),
});

export const claimBodySchema = z.object({
  deviceId: z.string().uuid(),
});
