"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";


export default function LoginForm() {

  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [role, setRole] = useState<"OWNER" | "BUYER">("OWNER");

  const [stage, setStage] = useState<"password" | "otp" | "dairies">("password");

  const [dairies, setDairies] = useState<any[]>([]);
  const [selectedDairy, setSelectedDairy] = useState("");

  const [requestId, setRequestId] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!phone) return toast.error("Enter phone number");
    if (role === "OWNER" && !password) return toast.error("Enter password");

    try {
      const res = await axios.post("/api/auth/login-password", {
        phone,
        password: role === "OWNER" ? password : undefined,
        role
      });
      console.log("Login response:", res.data);
      if (res.data.success) {
        const otpRes = await axios.post("/api/auth/send-otp", { phone });
        setRequestId(otpRes.data.requestId);
        setStage("otp");
      }

    } catch {
      toast.error("Invalid credentials");
    }
  }


  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await axios.post("/api/auth/verify-otp", {
        phone,
        otp,
        requestId,
      });

      if (!res.data.success) return toast.error("Invalid OTP");

      if (res.data.owner) {
        await signIn("credentials", {
          redirect: false,
          phone,
          role: "OWNER",
        });
        router.replace("/dashboard");
        return;
      }

      setDairies(res.data.dairies || []);
      setStage("dairies");

    } catch (error) {
      toast.error("OTP verification failed");
    }
  }


  async function handleDairySubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedDairy) return toast.error("Select a dairy");

    setLoading(true);
    await signIn("credentials", {
      redirect: false,
      phone,
      dairyId: selectedDairy,
      role: "BUYER",
    });

    setLoading(false);
    router.replace("/dashboard");
  }


  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-montserrat">
      <Tabs
        defaultValue="owner"
        onValueChange={(v: any) => {
          setRole(v === "owner" ? "OWNER" : "BUYER");
          setStage("password");
        }}
      >
        <TabsList>
          <TabsTrigger value="owner">Owner / Staff</TabsTrigger>
          <TabsTrigger value="buyer">Buyer / Seller</TabsTrigger>
        </TabsList>

        <Card className="max-w-sm w-full bg-accent/50 shadow-lg mt-4">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Login to Dairy Mate
            </CardDescription>
          </CardHeader>

          <CardContent>

            {/* ============= PASSWORD STEP ============= */}
            {stage === "password" && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">

                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <Input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter mobile number"
                  />
                </div>

                {role === "OWNER" && (
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                    />
                  </div>
                )}

                <Button type="submit" className="w-full bg-primary text-white">
                  Continue
                </Button>

              </form>
            )}

          
            {stage === "otp" && (
              <form onSubmit={handleOtpSubmit} className="space-y-4">

                <Input
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />

                <Button type="submit" className="w-full bg-primary text-white">
                  Verify OTP
                </Button>

              </form>
            )}

         
            {stage === "dairies" && (
              <form onSubmit={handleDairySubmit} className="space-y-4">

                <Label>Select Your Dairy</Label>

                <Select onValueChange={(v) => setSelectedDairy(v)}>
                  <SelectTrigger><SelectValue placeholder="Select dairy" /></SelectTrigger>
                  <SelectContent>
                    {dairies.map((d) => (
                      <SelectItem value={String(d.id)} key={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white"
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>

              </form>
            )}

          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
