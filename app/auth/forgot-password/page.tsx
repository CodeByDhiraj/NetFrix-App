"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import toast from "react-hot-toast"
import axiosInstance from "@/lib/axiosInstance"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await axiosInstance.post("/api/auth/forgot-password", { email }) // ✅ FIXED URL
      const data = response.data

      if (data.success) {
        toast.success("Reset code sent successfully!")
        setIsEmailSent(true)
      } else {
        toast.error(data.error || "Failed to send reset code")
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = () => {
    setIsEmailSent(false)
    setEmail("")
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-800 shadow-2xl">
            <CardContent className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-4">Check Your Email</h2>
              <p className="text-gray-400 mb-6">
                We've sent a password reset code to <span className="text-white font-medium">{email}</span>
              </p>
              <p className="text-gray-500 text-sm mb-8">
                The code will expire in 10 minutes. Check your spam folder if you don't see it.
              </p>

              <div className="space-y-4">
                <Link href={`/auth/reset-password?email=${email}`}>
                  <Button className="w-full bg-red-600 hover:bg-red-700 h-12">Enter Reset Code</Button>
                </Link>

                <Button
                  variant="outline"
                  onClick={handleResendCode}
                  className="w-full border-gray-600 text-white hover:bg-gray-800"
                >
                  Send to Different Email
                </Button>

                <Link href="/auth/login">
                  <Button variant="ghost" className="w-full text-gray-400 hover:text-white">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/auth/login">
          <Button variant="ghost" className="text-white mb-6 hover:bg-gray-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Button>
        </Link>

        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-5xl font-bold text-red-600 mb-2 hover:text-red-500 transition-colors">NetFrix</h1>
          </Link>
          <p className="text-gray-400 text-lg">Reset your password</p>
        </div>

        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-800 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-white text-2xl font-bold">Forgot Password?</CardTitle>
            <p className="text-gray-400 mt-2">No worries! Enter your email and we'll send you a reset code.</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 h-12 focus:border-red-500 focus:ring-red-500"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 h-12 text-lg font-semibold transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <ArrowRight className="w-5 h-5 mr-2" />
                )}
                Send Reset Code
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-gray-500 text-sm">
                Remember your password?{" "}
                <Link href="/auth/login" className="text-red-600 hover:text-red-500 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
