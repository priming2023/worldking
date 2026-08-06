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

export const chuseokDeviceSchema = z.object({
  deviceId: z.string().uuid(),
});

export const chuseokClaimBodySchema = z.object({
  deviceId: z.string().uuid(),
  /** 카운터 직원 확인 PIN */
  staffPin: z.string().min(1).max(32),
});

export const chuseokQuizBodySchema = z.object({
  deviceId: z.string().uuid(),
  answer: z.string().min(1).max(100),
});

export const chuseokScanBodySchema = z.object({
  deviceId: z.string().uuid(),
  qrPayload: z.string().min(1).max(4096),
  /** 순서 경고 후 사용자가 확인한 경우 */
  confirmOutOfOrder: z.boolean().optional(),
});

export const chuseokStepUpdateSchema = z.object({
  stepOrder: z.number().int().min(1).max(10),
  question: z.string().min(1).max(500),
  answer: z.string().min(1).max(100),
  answerDisplay: z.string().min(2).max(500),
  locationHint: z.string().min(1).max(200),
});

export const halloweenDeviceSchema = z.object({
  deviceId: z.string().uuid(),
});

export const halloweenClaimBodySchema = z.object({
  deviceId: z.string().uuid(),
  staffPin: z.string().min(1).max(32),
});

export const halloweenQuizBodySchema = z.object({
  deviceId: z.string().uuid(),
  answer: z.string().min(1).max(100),
});

export const halloweenScanBodySchema = z.object({
  deviceId: z.string().uuid(),
  qrPayload: z.string().min(1).max(4096),
  confirmOutOfOrder: z.boolean().optional(),
});

export const halloweenStepUpdateSchema = z.object({
  stepOrder: z.number().int().min(1).max(10),
  question: z.string().min(1).max(500),
  answer: z.string().min(1).max(100),
  answerDisplay: z.string().min(2).max(500),
  locationHint: z.string().min(1).max(200),
});
