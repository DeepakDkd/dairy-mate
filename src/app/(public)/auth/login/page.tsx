"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

import {
  Tabs,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

import {
  Loader2,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Building2,
  KeyRound,
  CheckCircle2,
  Sparkles
} from "lucide-react";

function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const [local, domain] = parts;
  if (local.length <= 2) {
    return local[0] + "*".repeat(local.length - 1) + "@" + domain;
  }
  const start = local[0];
  const end = local[local.length - 1];
  const middle = "*".repeat(local.length - 2);
  return `${start}${middle}${end}@${domain}`;
}

export default function LoginForm() {
  const router = useRouter();
  const { status } = useSession();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // New states for Forgot Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [role, setRole] = useState<"OWNER" | "BUYER">("OWNER");
  const [stage, setStage] = useState<"password" | "otp" | "dairies" | "forgot_request" | "forgot_reset">("password");

  const [requestId, setRequestId] = useState("");
  const [dairies, setDairies] = useState<any[]>([]);
  const [selectedDairy, setSelectedDairy] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/portal");
    }
  }, [status, router]);

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (!phone) return toast.error("Enter phone number");
    if (phone.length < 10) return toast.error("Phone number must be at least 10 digits");
    if (role === "OWNER" && !password) return toast.error("Enter password");

    setLoading(true);
    try {
      const res = await axios.post("/api/auth/login-password", {
        phone,
        password: role === "OWNER" ? password : undefined,
        role
      });

      if (res.data.success) {
        const otpRes = await axios.post("/api/auth/send-otp", { phone });
        const email = otpRes.data.email || "";
        const masked = maskEmail(email);
        toast.success(`OTP sent to ${masked}`);
        setRequestId(otpRes.data.requestId);
        setStage("otp");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (!otp) return toast.error("Enter OTP");

    setLoading(true);
    try {
      const res = await axios.post("/api/auth/verify-otp", {
        phone,
        otp,
        requestId
      });

      if (!res.data.success) {
        setLoading(false);
        return toast.error("Invalid OTP");
      }

      if (res.data.owner) {
        const result = await signIn("credentials", {
          redirect: false,
          phone,
          role: "OWNER"
        });

        if (result?.error) {
          toast.error("Login failed");
          setLoading(false);
          return;
        }

        router.replace("/portal");
        return;
      }

      setDairies(res.data.dairies || []);
      setStage("dairies");
    } catch {
      toast.error("OTP verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDairySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (!selectedDairy) return toast.error("Select a dairy");

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        phone,
        dairyId: selectedDairy,
        role: "BUYER"
      });

      if (result?.error) {
        toast.error("Login failed");
        return;
      }

      router.replace("/portal");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotRequestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (!phone) return toast.error("Enter phone number");
    if (phone.length < 10) return toast.error("Phone number must be at least 10 digits");

    setLoading(true);
    try {
      const res = await axios.post("/api/auth/forgot-password/request", { phone });
      if (res.data.success) {
        const masked = maskEmail(res.data.email || "");
        toast.success(`Verification code sent to ${masked}`);
        setRequestId(res.data.requestId);
        setStage("forgot_reset");
        setOtp("");
        setNewPassword("");
        setConfirmNewPassword("");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "User account not found");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (!otp) return toast.error("Enter OTP");
    if (!newPassword) return toast.error("Enter new password");
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    if (newPassword !== confirmNewPassword) return toast.error("Passwords do not match");

    setLoading(true);
    try {
      const res = await axios.post("/api/auth/forgot-password/reset", {
        phone,
        otp,
        requestId,
        newPassword
      });

      if (res.data.success) {
        toast.success("Password reset successfully. Please login.");
        setStage("password");
        setPassword("");
        setOtp("");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    if (stage === "otp") setStage("password");
    else if (stage === "dairies") setStage("otp");
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 font-montserrat relative overflow-hidden bg-gradient-to-br from-background via-muted/50 to-background">
      {/* Decorative Blur Background Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 md:w-96 md:h-96 bg-primary/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-72 h-72 md:w-96 md:h-96 bg-secondary/15 rounded-full blur-[80px] md:blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />

      <div className="w-full max-w-md z-10 flex flex-col items-center">
        {/* Logo and Brand Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 mb-3 border border-white/20">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Dairy Mate</h2>
          <p className="text-sm text-muted-foreground">Premium Dairy Management Platform</p>
        </div>

        {/* User Role Tabs */}
        <Tabs
          defaultValue="owner"
          className="w-full"
          onValueChange={(v: any) => {
            setRole(v === "owner" ? "OWNER" : "BUYER");
            setStage("password");
            setPhone("");
            setPassword("");
            setOtp("");
            setDairies([]);
            setSelectedDairy("");
          }}
        >
          <TabsList className="grid grid-cols-2 w-full h-12 max-w-sm mx-auto mb-4  bg-muted/65 p-1  rounded-xl border border-border/40">
            <TabsTrigger
              value="owner"
              disabled={loading || stage === "forgot_request" || stage === "forgot_reset"}
              className="rounded-lg py-2 text-sm font-semibold transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Owner / Staff
            </TabsTrigger>
            <TabsTrigger
              value="buyer"
              disabled={loading || stage === "forgot_request" || stage === "forgot_reset"}
              className="rounded-lg py-2 text-sm font-semibold transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              Buyer / Seller
            </TabsTrigger>
          </TabsList>

          <Card className="w-full bg-card/65 backdrop-blur-xl shadow-2xl border border-border/60 transition-all duration-300 hover:shadow-primary/5 rounded-2xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold tracking-tight">
                {stage === "password" && "Welcome Back"}
                {stage === "otp" && "Verification"}
                {stage === "dairies" && "Select Dairy"}
                {stage === "forgot_request" && "Reset Password"}
                {stage === "forgot_reset" && "Verify & Reset"}
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                {stage === "password" && `Login as ${role === "OWNER" ? "Owner or Staff" : "Buyer or Seller"}`}
                {stage === "otp" && "Enter the verification code sent to your email"}
                {stage === "dairies" && "Choose which dairy portal you want to access"}
                {stage === "forgot_request" && "Enter your registered mobile number to receive an OTP code"}
                {stage === "forgot_reset" && "Enter the OTP code and configure your new password"}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4">
              {/* Steps Progress Indicator */}
              {stage !== "forgot_request" && stage !== "forgot_reset" ? (
                <div className="flex items-center justify-center gap-2 mb-6 px-2">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${stage === 'password' ? 'bg-primary text-white scale-110 shadow-md shadow-primary/20' : 'bg-primary/20 text-primary'}`}>
                      1
                    </div>
                    <span className={`text-[11px] font-medium ${stage === 'password' ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>Credentials</span>
                  </div>
                  <div className="w-8 h-px bg-border" />
                  <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${stage === 'otp' ? 'bg-primary text-white scale-110 shadow-md shadow-primary/20' : stage === 'dairies' ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                      {stage === 'dairies' ? <CheckCircle2 className="w-4 h-4" /> : '2'}
                    </div>
                    <span className={`text-[11px] font-medium ${stage === 'otp' ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>OTP</span>
                  </div>
                  {role === "BUYER" && (
                    <>
                      <div className="w-8 h-px bg-border" />
                      <div className="flex items-center gap-1.5">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${stage === 'dairies' ? 'bg-primary text-white scale-110 shadow-md shadow-primary/20' : 'bg-muted text-muted-foreground'}`}>
                          3
                        </div>
                        <span className={`text-[11px] font-medium ${stage === 'dairies' ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>Dairy</span>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 mb-6 px-2">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${stage === 'forgot_request' ? 'bg-primary text-white scale-110 shadow-md shadow-primary/20' : 'bg-primary/20 text-primary'}`}>
                      1
                    </div>
                    <span className={`text-[11px] font-medium ${stage === 'forgot_request' ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>Request Reset</span>
                  </div>
                  <div className="w-8 h-px bg-border" />
                  <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${stage === 'forgot_reset' ? 'bg-primary text-white scale-110 shadow-md shadow-primary/20' : 'bg-muted text-muted-foreground'}`}>
                      2
                    </div>
                    <span className={`text-[11px] font-medium ${stage === 'forgot_reset' ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>Configure Password</span>
                  </div>
                </div>
              )}

              {/* Stage 1: Credentials Input */}
              {stage === "password" && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Mobile Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        disabled={loading}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                        type="tel"
                        maxLength={10}
                        className="pl-9 h-11 rounded-lg bg-background/50 border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  {role === "OWNER" && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="password">Password</Label>
                        <button
                          type="button"
                          onClick={() => {
                            setStage("forgot_request");
                            setOtp("");
                          }}
                          className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          disabled={loading}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password"
                          className="pl-9 pr-10 h-11 rounded-lg bg-background/50 border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <Button
                    disabled={loading}
                    type="submit"
                    className="w-full h-11 mt-2 bg-primary hover:bg-primary/95 text-white font-semibold rounded-lg shadow-lg shadow-primary/20 transition-all hover:shadow-primary/10 flex items-center justify-center cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {loading ? "Please wait..." : "Continue"}
                  </Button>
                </form>
              )}

              {/* Stage 2: OTP Verification */}
              {stage === "otp" && (
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter Verification Code</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="otp"
                        disabled={loading}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="6-digit OTP"
                        maxLength={6}
                        className="pl-9 h-11 rounded-lg bg-background/50 border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-center tracking-widest font-mono text-lg"
                      />
                    </div>
                  </div>

                  <Button
                    disabled={loading}
                    type="submit"
                    className="w-full h-11 mt-2 bg-primary hover:bg-primary/95 text-white font-semibold rounded-lg shadow-lg shadow-primary/20 transition-all cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {loading ? "Verifying..." : "Verify OTP"}
                  </Button>

                  <button
                    type="button"
                    onClick={goBack}
                    disabled={loading}
                    className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-1.5 mx-auto block py-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </form>
              )}

              {/* Stage 3: Select Dairy (For Buyers/Sellers/Staff) */}
              {stage === "dairies" && (
                <form onSubmit={handleDairySubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dairy-select">Select Your Dairy</Label>
                    <Select
                      onValueChange={(v) => setSelectedDairy(v)}
                      disabled={loading}
                    >
                      <SelectTrigger id="dairy-select" className="h-11 rounded-lg bg-background/50 border-border/80">
                        <SelectValue placeholder="Select dairy from list" />
                      </SelectTrigger>
                      <SelectContent>
                        {dairies.map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              <span>{d.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    disabled={loading}
                    type="submit"
                    className="w-full h-11 mt-2 bg-primary hover:bg-primary/95 text-white font-semibold rounded-lg shadow-lg shadow-primary/20 transition-all cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {loading ? "Logging in..." : "Login"}
                  </Button>

                  <button
                    type="button"
                    onClick={goBack}
                    disabled={loading}
                    className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-1.5 mx-auto block py-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </form>
              )}

              {/* Stage: Forgot Password Request OTP */}
              {stage === "forgot_request" && (
                <form onSubmit={handleForgotRequestSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-phone">Mobile Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="forgot-phone"
                        disabled={loading}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                        type="tel"
                        maxLength={10}
                        className="pl-9 h-11 rounded-lg bg-background/50 border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <Button
                    disabled={loading}
                    type="submit"
                    className="w-full h-11 mt-2 bg-primary hover:bg-primary/95 text-white font-semibold rounded-lg shadow-lg shadow-primary/20 transition-all hover:shadow-primary/10 flex items-center justify-center cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {loading ? "Sending..." : "Send Verification OTP"}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setStage("password")}
                    disabled={loading}
                    className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-1.5 mx-auto block py-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                  </button>
                </form>
              )}

              {/* Stage: Forgot Password Verify & Reset */}
              {stage === "forgot_reset" && (
                <form onSubmit={handleForgotResetSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-otp">Verification Code</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="forgot-otp"
                        disabled={loading}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="6-digit OTP"
                        maxLength={6}
                        className="pl-9 h-11 rounded-lg bg-background/50 border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-center tracking-widest font-mono text-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        disabled={loading}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="pl-9 pr-10 h-11 rounded-lg bg-background/50 border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirm-new-password"
                        type={showConfirmNewPassword ? "text" : "password"}
                        disabled={loading}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="pl-9 pr-10 h-11 rounded-lg bg-background/50 border-border/80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    disabled={loading}
                    type="submit"
                    className="w-full h-11 mt-2 bg-primary hover:bg-primary/95 text-white font-semibold rounded-lg shadow-lg shadow-primary/20 transition-all hover:shadow-primary/10 flex items-center justify-center cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {loading ? "Resetting..." : "Reset Password"}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setStage("forgot_request")}
                    disabled={loading}
                    className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-1.5 mx-auto block py-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </form>
              )}

              {/* Link to Registration */}
              <div className="mt-6 pt-4 border-t border-border/30 text-center">
                <p className="text-xs text-muted-foreground">
                  New to Dairy Mate?{" "}
                  <Link
                    href="/auth/register"
                    className="text-primary hover:text-primary/80 hover:underline font-semibold transition-colors ml-0.5"
                  >
                    Create an account
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
}
