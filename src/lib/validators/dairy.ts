import { z } from "zod";

export const CreateDairySchema = z.object({
  dairyName: z.string().trim().min(2, "Dairy name is required"),
  dairyAddress: z.string().trim().min(2, "Dairy address is required"),
  dairyPhone: z.string().trim().min(8, "Dairy phone is required"),
  dairyEmail: z.union([
    z.string().trim().email("Invalid dairy email"),
    z.literal(""),
  ]).optional(),
  dairyMode: z.enum(["FAT_LR", "MAWA"]),
});

export type CreateDairyInput = z.infer<typeof CreateDairySchema>;
