import { z } from "zod";

export const MECHANISMS = [
  "discount-at-charge",
  "discount-on-load",
  "cashback",
  "voucher",
  "bogo",
  "fee-reduction",
  "program-benefit",
] as const;

export const STATUSES = ["confirmed", "needs-detail", "stale-check", "user-supplied"] as const;

export const StoreSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  names: z.object({ he: z.string().min(1), en: z.string().min(1) }),
  aliases: z.array(z.string()),
  category: z.string().min(1),
});

export const ProgramSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  kind: z.enum(["credit-card", "club-card", "prepaid-gift-card", "bank-points", "cashback-club"]),
  issuer: z.string().min(1),
  names: z.object({ he: z.string().min(1), en: z.string().min(1) }),
  requires: z.string().min(1),
  url: z.string().url(),
});

export const OfferSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  program_id: z.string(),
  applies_to: z.object({
    stores: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
  }),
  channel: z.enum(["in-store", "online", "both"]),
  mechanism: z.enum(MECHANISMS),
  percent: z.number().positive().max(100).optional(),
  summary: z.string().min(1),
  conditions: z.string().min(1),
  source_url: z.string().url().startsWith("https://"),
  as_of: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(STATUSES),
});

export const WalletSchema = z.object({
  programs: z.array(z.string()),
});

export type Store = z.infer<typeof StoreSchema>;
export type Program = z.infer<typeof ProgramSchema>;
export type Offer = z.infer<typeof OfferSchema>;
export type Wallet = z.infer<typeof WalletSchema>;
export type Mechanism = (typeof MECHANISMS)[number];

export interface Dataset {
  stores: Store[];
  programs: Program[];
  offers: Offer[];
}
