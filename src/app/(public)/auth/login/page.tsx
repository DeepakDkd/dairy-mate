"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";

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
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs";

import { Loader2 } from "lucide-react";


export default function LoginForm() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [role, setRole] = useState<"OWNER" | "BUYER">("OWNER");

  const [stage, setStage] =
    useState<"password" | "otp" | "dairies">("password");

  const [requestId, setRequestId] = useState("");
  const [dairies, setDairies] = useState<any[]>([]);
  const [selectedDairy, setSelectedDairy] = useState("");

  const [loading, setLoading] = useState(false);


  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!phone) return toast.error("Enter phone number");
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
        toast.success("OTP sent to your email");

        setRequestId(otpRes.data.requestId);
        setStage("otp");
      }
    } catch {
      toast.error("Invalid credentials");
    }

    setLoading(false);
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();

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
        await signIn("credentials", {
          redirect: false,
          phone,
          role: "OWNER"
        });
        router.replace("/dashboard");
        return;
      }

      // Buyer/Seller/Staff must choose dairy
      setDairies(res.data.dairies || []);
      setStage("dairies");

    } catch {
      toast.error("OTP verification failed");
    }

    setLoading(false);
  }


  async function handleDairySubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedDairy) return toast.error("Select a dairy");

    setLoading(true);

    await signIn("credentials", {
      redirect: false,
      phone,
      dairyId: selectedDairy,
      role: "BUYER"
    });

    setLoading(false);
    router.replace("/dashboard");
  }

  function goBack() {
    if (stage === "otp") setStage("password");
    else if (stage === "dairies") setStage("otp");
  }


  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-montserrat">
      <Tabs
        defaultValue="owner"
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
        <TabsList className="grid grid-cols-2 w-full max-w-sm mx-auto">
          <TabsTrigger value="owner">Owner / Staff</TabsTrigger>
          <TabsTrigger value="buyer">Buyer / Seller</TabsTrigger>
        </TabsList>

        <Card className="max-w-sm w-full bg-accent/40 shadow-xl mt-4 border border-white/20">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Login to your Dairy Mate account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">

            {stage === "password" && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">

                <div className="space-y-1">
                  <Label>Mobile Number</Label>
                  <Input
                    disabled={loading}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>

                {role === "OWNER" && (
                  <div className="space-y-1">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      disabled={loading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                    />
                  </div>
                )}

                <Button
                  disabled={loading}
                  className="w-full bg-primary text-white"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Continue
                </Button>

              </form>
            )}

            {stage === "otp" && (
              <form onSubmit={handleOtpSubmit} className="space-y-4">

                <div className="space-y-1">
                  <Label>Enter OTP</Label>
                  <Input
                    disabled={loading}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="6-digit OTP"
                  />
                </div>

                <Button disabled={loading} className="w-full bg-primary">
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Verify OTP
                </Button>

                <button
                  type="button"
                  onClick={goBack}
                  disabled={loading}
                  className="text-sm text-primary underline mx-auto block"
                >
                  ← Back
                </button>

              </form>
            )}

            {stage === "dairies" && (
              <form onSubmit={handleDairySubmit} className="space-y-4">

                <Label>Select Your Dairy</Label>

                <Select
                  onValueChange={(v) => setSelectedDairy(v)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select dairy" />
                  </SelectTrigger>
                  <SelectContent>
                    {dairies.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button disabled={loading} className="w-full bg-primary">
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Login
                </Button>

                <button
                  type="button"
                  onClick={goBack}
                  disabled={loading}
                  className="text-sm text-primary underline mx-auto block"
                >
                  ← Back
                </button>

              </form>
            )}

          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
