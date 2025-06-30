// ✅ File: app/auth/reset-password/page.tsx
"use client"

import { useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle, RefreshCw } from "lucide-react"
import toast from "react-hot-toast"
import axiosInstance from "@/lib/axiosInstance"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ResetPasswordPage() {
    const searchParams = useSearchParams()
    const email = searchParams.get("email") || ""

    const [otp, setOtp] = useState(["", "", "", "", "", ""])
    const [password, setPassword] = useState("")
    const [step, setStep] = useState("otp")
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return
        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)
        if (value && index < 5) inputRefs.current[index + 1]?.focus()
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpCode = otp.join("");
        if (otpCode.length !== 6) return toast.error("Enter all 6 digits");

        setIsLoading(true);
        try {
            console.log("👉 Sending OTP Verify Request:", { email, otp: otpCode });

            const res = await axiosInstance.post("/api/auth/verify", {
                email,
                otp: otpCode,
            });

            console.log("✅ Server response:", res.data);

            if (res.data.success) {
                toast.success("OTP verified! Enter new password");
                setStep("new-password");
            } else {
                toast.error(res.data.error || "Invalid OTP");
                setOtp(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
            }
        } catch (error: any) {
            console.error("❌ OTP Verify Error:", error.response?.data || error.message);
            toast.error(error.response?.data?.error || "Network error");
        } finally {
            setIsLoading(false);
        }
    };


    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password.length < 6) return toast.error("Password must be at least 6 characters")

        setIsLoading(true)
        try {
            const res = await axiosInstance.post("/api/auth/reset-password", {
                email,
                otp: otp.join(""),
                newPassword: password,
            })
            if (res.data.success) {
                setIsSuccess(true)
                toast.success("Password reset successful!")
            } else {
                toast.error(res.data.error || "Reset failed")
            }
        } catch (error: any) {
            console.log("❌ FULL ERROR", error.response?.data || error.message);
            toast.error(error.response?.data?.error || "Network error");
        }
        finally {
            setIsLoading(false)
        }
    }

    const handleResendCode = async () => {
        try {
            await axiosInstance.post("/api/auth/forgot-password", { email })
            setOtp(["", "", "", "", "", ""])
            inputRefs.current[0]?.focus()
            toast.success("OTP resent to email")
        } catch {
            toast.error("Failed to resend code")
        }
    }

    // ✅ Render Success UI
    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-800 shadow-2xl">
                        <CardContent className="text-center py-12">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                            <h2 className="text-2xl font-bold text-white mb-4">Password Reset Successful!</h2>
                            <p className="text-gray-400 mb-8">You can now sign in using your new password.</p>
                            <Link href="/auth/login">
                                <Button className="w-full bg-red-600 hover:bg-red-700 h-12">Continue to Sign In</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Link href="/auth/forgot-password">
                    <Button variant="ghost" className="text-white mb-6 hover:bg-gray-800">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                </Link>

                <div className="text-center mb-8">
                    <Link href="/">
                        <h1 className="text-5xl font-bold text-red-600 mb-2 hover:text-red-500 transition-colors">NetFrix</h1>
                    </Link>
                    <p className="text-gray-400 text-lg">
                        {step === "otp" ? "Enter your reset code" : "Set your new password"}
                    </p>
                </div>

                <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-800 shadow-2xl">
                    <CardHeader className="text-center pb-6">
                        <CardTitle className="text-white text-2xl font-bold">
                            {step === "otp" ? "Reset Password" : "Create New Password"}
                        </CardTitle>
                        {step === "otp" && (
                            <p className="text-gray-400 mt-2">
                                Enter the 6-digit code sent to <span className="text-white font-medium">{email}</span>
                            </p>
                        )}
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={step === "otp" ? handleOtpSubmit : handleResetPassword} className="space-y-6">
                            {step === "otp" ? (
                                <div className="flex justify-center space-x-3">
                                    {otp.map((digit, index) => (
                                        <Input
                                            key={index}
                                            ref={(el) => {
                                                inputRefs.current[index] = el
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
                            ) : (
                                <Input
                                    type="password"
                                    placeholder="Enter your new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-gray-800 border-gray-700 text-white h-12 focus:border-red-500 focus:ring-red-500"
                                    required
                                />
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-red-600 hover:bg-red-700 h-12 text-lg font-semibold"
                                disabled={isLoading || (step === "otp" && otp.join("").length !== 6)}
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                ) : null}
                                {step === "otp" ? "Verify OTP" : "Save New Password"}
                            </Button>

                            {step === "otp" && (
                                <div className="text-center">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="text-red-600 hover:text-red-500"
                                        onClick={handleResendCode}
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" /> Resend Code
                                    </Button>
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
