import { z } from "zod";
// Only for owner registration
export const RegisterOwnerSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  phone: z.string().min(8, "Invalid phone"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),

  address: z.string().optional(),
  role: z.literal("OWNER"),

  dairyName: z.string().min(2, "Dairy name is required"),
  dairyAddress: z.string().optional(),
  dairyPhone: z.string().optional(),

  dairyEmail: z.string().email().optional().or(z.literal("")),
  dairyMode: z.enum(["FAT_LR", "MAWA"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});