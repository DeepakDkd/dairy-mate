"use client";

import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Image from "next/image";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Link from "next/link";


// -------------------------------------
// ZOD SCHEMA
// -------------------------------------
const RegisterSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),

  phone: z
    .string()
    .min(10, "Phone must be 10 digits")
    .max(10, "Phone must be 10 digits"),

  email: z.string().email("Invalid email"),

  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),

  role: z.enum(["OWNER", "SELLER", "BUYER"], {
    message: "Select a valid role",
  }),

  address: z.string().min(1, "Address is required"),

  // Dairy Details (only required for owner)
  dairyName: z.string().optional(),
  dairyAddress: z.string().optional(),
  dairyEmail: z.string().optional(),
  dairyPhone: z.string().optional(),
  dairyMode: z.enum(["FAT_LR", "MAWA"]).optional(),
})
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })
  .refine((data) => {
    if (data.role === "OWNER" && !data.dairyName) return false;
    return true;
  }, {
    message: "Dairy name is required for owners",
    path: ["dairyName"],
  })
  .refine((data) => {
    if (data.role === "OWNER" && !data.dairyMode) return false;
    return true;
  }, {
    message: "Select dairy pricing mode",
    path: ["dairyMode"],
  });


type RegisterFormType = z.infer<typeof RegisterSchema>;


export default function RegisterForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormType>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      role: undefined,
    }, mode: "onBlur",
    reValidateMode: "onBlur"

  });

  const role = watch("role");
  const onSubmit = async (data: RegisterFormType) => {
    try {
      const res = await axios.post("/api/auth/register", data);

      if (res.status === 201) {
        router.push("/auth/login?registered=true");
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-montserrat relative">
      {/* <Image
        src="/login/bg1.jpg"
        alt="background"
        fill
        className="object-cover -z-10"
      /> */}

      <Card className="max-w-md md:max-w-2xl w-full bg-accent/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Register your Dairy Mate account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" >

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <Label>First Name*</Label>
                <Input  {...register("firstName")} />
                {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}
              </div>
              <div>
                <Label>Last Name*</Label>
                <Input {...register("lastName")} />
                {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <Label>Phone*</Label>
                <Input {...register("phone")} />
                {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
              </div>

              <div>
                <Label>Email*</Label>
                <Input type="email" {...register("email")} />
                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <Label>Password*</Label>
                <Input type="password" {...register("password")} />
                {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
              </div>

              <div>
                <Label>Confirm Password*</Label>
                <Input type="password" {...register("confirmPassword")} />
                {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div>
              <Label>Role*</Label>
              <Select
                onValueChange={(v) => setValue("role", v as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="OWNER">Owner / Admin</SelectItem>
                  <SelectItem value="SELLER">Seller</SelectItem>
                  <SelectItem value="BUYER">Buyer</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-red-500 text-xs">{errors.role.message}</p>}
            </div>

            <div>
              <Label>Address*</Label>
              <Input {...register("address")} />
              {errors.address && <p className="text-red-500 text-xs">{errors.address.message}</p>}
            </div>

            {role === "OWNER" && (
              <div className="p-4--- rounded-md bg-white/40--- border--- space-y-4">
                <h3 className="text-lg font-semibold">Dairy Details</h3>

                <div>
                  <Label>Dairy Name*</Label>
                  <Input {...register("dairyName")} />
                  {errors.dairyName && <p className="text-red-500 text-xs">{errors.dairyName.message}</p>}
                </div>

                <div>
                  <Label>Dairy Address</Label>
                  <Input {...register("dairyAddress")} />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <Label>Dairy Email</Label>
                    <Input {...register("dairyEmail")} />
                  </div>

                  <div>
                    <Label>Dairy Phone</Label>
                    <Input {...register("dairyPhone")} />
                  </div>
                </div>

                <div>
                  <Label>Pricing Mode*</Label>
                  <Select
                    onValueChange={(v) => setValue("dairyMode", v as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pricing mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FAT_LR">FAT + LR</SelectItem>
                      <SelectItem value="MAWA">MAWA</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.dairyMode && <p className="text-red-500 text-xs">{errors.dairyMode.message}</p>}
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#008ED6] hover:bg-[#007ac0] text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            <p className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Login here
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
