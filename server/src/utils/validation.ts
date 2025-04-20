import { z } from "zod";

export const mappedRowSchema = z.object({
  brand: z.string().regex(/^\d+$/).transform(Number),
  description: z.string().min(1),
  price: z
    .string()
    .regex(/^\d+(\.\d+)?$/)
    .transform(Number),
  volume: z.string().regex(/^\d+$/).transform(Number),
  classification: z.string().regex(/^\d+$/).transform(Number),
  vendorNumber: z.string().regex(/^\d+$/).transform(Number),
  vendorName: z.string().min(1),
});
