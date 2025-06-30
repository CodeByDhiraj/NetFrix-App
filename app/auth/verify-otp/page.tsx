"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axiosInstance from "@/lib/axiosInstance";

export default function VerifyOTPPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const type = searchParams.get("type") || "login";
  const name = searchParams.get("name") || "User";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) return toast.error("Please enter all 6 digits");

    setIsLoading(true);
    try {
      const { data } = await axiosInstance.post("/api/auth/verify", {
        email,
        otp: otpCode,
        type,
        name,
      });

      if (data.success) {
        toast.success("OTP Verified!");

        // ✅ Fetch session to get role from cookie-based auth
        const sessionRes = await axiosInstance.get("/api/auth/session");
        const user = sessionRes.data?.user;

        if (user?.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/");
        }
      } else {
        toast.error(data.error || "Invalid OTP");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      const endpoint = type === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const body = type === "signup" ? { email, name } : { email };

      const { data } = await axiosInstance.post(endpoint, body);
      if (data.success) {
        toast.success("New OTP sent!");
        setCountdown(60);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        toast.error(data.error || "Failed to resend OTP");
      }
    } catch (err) {
      toast.error("Error resending OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button variant="ghost" className="text-white mb-6 hover:bg-gray-800" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-600 mb-2">NetFrix</h1>
          <p className="text-gray-400">Enter verification code</p>
        </div>

        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-800 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white text-center text-2xl">
              {type === "signup" ? "Complete Registration" : "Verify Login"}
            </CardTitle>
            <p className="text-gray-400 text-center text-sm">
              We sent a 6-digit code to <span className="text-white font-medium">{email}</span>
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-bold bg-gray-800 border-gray-700 text-white focus:border-red-500 focus:ring-red-500"
                  />
                ))}
              </div>

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-lg font-semibold"
                disabled={isLoading || otp.join("").length !== 6}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : null}
                {type === "signup" ? "Complete Registration" : "Verify & Continue"}
              </Button>

              <div className="text-center">
                {canResend ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-red-600 hover:text-red-500 hover:bg-gray-800"
                    onClick={handleResendOTP}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend OTP
                  </Button>
                ) : (
                  <p className="text-gray-400 text-sm">Resend OTP in {countdown}s</p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
