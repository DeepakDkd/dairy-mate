"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Link from "next/link";

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
import { 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  MapPin, 
  Building2, 
  Sparkles, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ClipboardList
} from "lucide-react";

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
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.enum(["OWNER", "SELLER", "BUYER"], {
    message: "Select a valid role",
  }),
  address: z.string().min(1, "Address is required"),
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    }, 
    mode: "onBlur",
    reValidateMode: "onBlur"
  });

  const role = watch("role");

  const onSubmit = async (data: RegisterFormType) => {
    if (isSubmitting) return;

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
    <div className="min-h-screen w-full flex items-center justify-center p-4 font-montserrat relative overflow-hidden bg-gradient-to-br from-background via-muted/50 to-background">
      {/* Decorative Blur Background Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 md:w-96 md:h-96 bg-primary/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-72 h-72 md:w-96 md:h-96 bg-secondary/15 rounded-full blur-[80px] md:blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />

      <div className="w-full max-w-2xl z-10 flex flex-col items-center">
        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 mb-3 border border-white/20">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Create Account</h2>
          <p className="text-sm text-muted-foreground">Register your Dairy Mate account</p>
        </div>

        <Card className="w-full bg-card/65 backdrop-blur-xl shadow-2xl border border-border/60 transition-all duration-300 hover:shadow-primary/5 rounded-2xl">
          <CardHeader className="text-center pb-2">
            <CardDescription>
              Please enter your details below to set up your account.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Account Details Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-border/30">
                  <User className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Personal Details</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name*</Label>
                    <Input 
                      id="firstName"
                      {...register("firstName")} 
                      className={`h-11 rounded-lg bg-background/50 border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 ${errors.firstName ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''}`}
                    />
                    {errors.firstName && <p className="text-destructive text-xs font-semibold">{errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name*</Label>
                    <Input 
                      id="lastName"
                      {...register("lastName")} 
                      className={`h-11 rounded-lg bg-background/50 border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 ${errors.lastName ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''}`}
                    />
                    {errors.lastName && <p className="text-destructive text-xs font-semibold">{errors.lastName.message}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number*</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="phone"
                        type="tel"
                        maxLength={10}
                        {...register("phone")} 
                        className={`pl-9 h-11 rounded-lg bg-background/50 border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 ${errors.phone ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''}`}
                      />
                    </div>
                    {errors.phone && <p className="text-destructive text-xs font-semibold">{errors.phone.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address*</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="email"
                        type="email" 
                        {...register("email")} 
                        className={`pl-9 h-11 rounded-lg bg-background/50 border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 ${errors.email ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''}`}
                      />
                    </div>
                    {errors.email && <p className="text-destructive text-xs font-semibold">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password*</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="password"
                        type={showPassword ? "text" : "password"} 
                        {...register("password")} 
                        className={`pl-9 pr-10 h-11 rounded-lg bg-background/50 border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 ${errors.password ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-destructive text-xs font-semibold">{errors.password.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password*</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"} 
                        {...register("confirmPassword")} 
                        className={`pl-9 pr-10 h-11 rounded-lg bg-background/50 border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 ${errors.confirmPassword ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-destructive text-xs font-semibold">{errors.confirmPassword.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role-select">Registering As*</Label>
                  <Select
                    disabled={isSubmitting}
                    onValueChange={(v) => setValue("role", v as any)}
                  >
                    <SelectTrigger id="role-select" className="h-11 rounded-lg bg-background/50 border-border/80">
                      <SelectValue placeholder="Choose your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OWNER">Owner / Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && <p className="text-destructive text-xs font-semibold">{errors.role.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address*</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="address"
                      {...register("address")} 
                      className={`pl-9 h-11 rounded-lg bg-background/50 border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 ${errors.address ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''}`}
                    />
                  </div>
                  {errors.address && <p className="text-destructive text-xs font-semibold">{errors.address.message}</p>}
                </div>
              </div>

              {/* Dairy Details Section (Visible only when role is OWNER) */}
              {role === "OWNER" && (
                <div className="space-y-4 pt-4 border-t border-border/40 transition-all duration-300 animate-in fade-in slide-in-from-top-4">
                  <div className="flex items-center gap-2 pb-1 border-b border-border/30">
                    <Building2 className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Dairy Business Details</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dairyName">Dairy Business Name*</Label>
                    <Input 
                      id="dairyName"
                      {...register("dairyName")} 
                      className={`h-11 rounded-lg bg-background/50 border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 ${errors.dairyName ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''}`}
                    />
                    {errors.dairyName && <p className="text-destructive text-xs font-semibold">{errors.dairyName.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dairyAddress">Dairy Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="dairyAddress"
                        {...register("dairyAddress")} 
                        className="pl-9 h-11 rounded-lg bg-background/50 border-border/80"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dairyEmail">Dairy Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          id="dairyEmail"
                          type="email"
                          {...register("dairyEmail")} 
                          className="pl-9 h-11 rounded-lg bg-background/50 border-border/80"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dairyPhone">Dairy Contact Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          id="dairyPhone"
                          type="tel"
                          maxLength={10}
                          {...register("dairyPhone")} 
                          className="pl-9 h-11 rounded-lg bg-background/50 border-border/80"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dairy-mode-select">Milk Pricing Mode*</Label>
                    <Select
                      disabled={isSubmitting}
                      onValueChange={(v) => setValue("dairyMode", v as any)}
                    >
                      <SelectTrigger id="dairy-mode-select" className="h-11 rounded-lg bg-background/50 border-border/80">
                        <SelectValue placeholder="Select dairy rate pricing scheme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FAT_LR">FAT + LR Calculation</SelectItem>
                        <SelectItem value="MAWA">MAWA Flat Rate</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.dairyMode && <p className="text-destructive text-xs font-semibold">{errors.dairyMode.message}</p>}
                  </div>
                </div>
              )}

              {/* Submit Button & Links */}
              <div className="space-y-4 pt-4 border-t border-border/30">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-primary hover:bg-primary/95 text-white font-semibold rounded-lg shadow-lg shadow-primary/20 transition-all hover:shadow-primary/10 flex items-center justify-center cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating Account...
                    </>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      Create Account <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-primary hover:text-primary/80 hover:underline font-semibold transition-colors">
                    Login here
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
