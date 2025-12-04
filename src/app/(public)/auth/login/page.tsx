"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from "react-hot-toast";


export default function LoginForm() {

  const router = useRouter();
  const { status } = useSession();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState("");
  const [dairies, setDairies] = useState<any[]>([]);
  const [selectedDairy, setSelectedDairy] = useState("");

  if (status === "authenticated") {
    router.replace("/dashboard");
    // router.push("/dashboard");
  }





  const [stage, setStage] = useState("password"); // password → otp

  const [otp, setOtp] = useState("");

  async function handlePasswordStep() {
    const res = await axios.post("/api/auth/login-password", { phone, password });
    if (res.data.success) {
      const res = await axios.post("/api/auth/send-otp", { phone });
      setRequestId(res.data.requestId);
      setStage("otp");
    }
  }

  async function handleOtpStep() {
    const res = await axios.post("/api/auth/verify-otp", { phone, otp, requestId });
    if (res.data.success) {

      // if user is owner
      if (res.data.owner) {
        const res = await signIn("credentials", {
          redirect: false,
          phone,
          role: "OWNER",
        });
        router.replace("/dashboard");
        return;
      }

      setStage("dairies");
      const dairies = res.data.dairies;
      if (dairies.length >= 1) {
        setDairies(dairies);
        // setSelectedDairy(dairies[0].id);
      }
    }
  }
  async function handleLogin() {
    if (!selectedDairy) {
      toast.error("Please select a dairy to continue");
      return;
    }
    setLoading(true);
    const result = await signIn("credentials", {
      redirect: false,
      phone,
      dairyId: selectedDairy,
    });
    setLoading(false);


    return;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-montserrat ">
      {/* <Image 
        src="/login/bg1.jpg" // Path to your image in the public folder
        alt="Background Cover" 
        layout="fill" // Ensures the image fills the parent container
        objectFit="cover" // Scales the image to cover the entire container
        className="-z-10" // Pushes the image behind other content
      /> */}


      <Card className="max-w-sm w-full bg-accent/50  shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-semibold text-center">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center">
            Login to your Dairy Mate account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                type="text"
                value={phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                placeholder="Enter your mobile number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#008ED6] hover:bg-[#007ac0] text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form> */}
          <div className="space-y-4">

            {stage === "password" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    type="text"
                    value={phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                    placeholder="Enter your mobile number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                {/* <button onClick={handlePasswordStep}>Continue</button> */}
                <Button
                  // type="submit"
                  // disabled={loading}
                  onClick={handlePasswordStep}
                  className="w-full bg-[#008ED6] hover:bg-[#007ac0] text-white"
                >
                  Continue
                </Button>
              </>
            )}

            {stage === "otp" && (
              <>
                <Input placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
                <Button
                  onClick={handleOtpStep}
                  className="w-full bg-[#008ED6] hover:bg-[#007ac0] text-white"
                >
                  Verify OTP
                </Button>
              </>
            )}
            {
              stage === "dairies" && (
                <div className="space-y-4" >
                  <div>
                    <Label className="text-lg font-semibold mb-4 w-full">Select Your Dairy</Label>
                    <Select onValueChange={(v) => setSelectedDairy(v)}  >
                      <SelectTrigger>
                        <SelectValue placeholder="Select dairy" />
                      </SelectTrigger>
                      <SelectContent>
                        {dairies.map((dairy) => (
                          <SelectItem value={dairy.id} key={dairy.id}  >
                            {dairy.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleLogin} disabled={loading} className="w-full bg-primary" >
                    Login
                  </Button>
                </div>
              )
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
