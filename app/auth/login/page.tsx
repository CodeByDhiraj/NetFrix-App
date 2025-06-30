"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, ArrowRight, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn, useSession } from "next-auth/react"
import toast from "react-hot-toast"
import axiosInstance from "@/lib/axiosInstance"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { status } = useSession()

  useEffect(() => {
    if (status === "authenticated") {
      setIsLoading(false)
    }
  }, [status])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error("Please enter your email address")
      return
    }

    setIsLoading(true)

    try {
      const response = await axiosInstance.post("/api/auth/login", {
        email: email.trim(),
        password: password.trim(),
      })

      const data = response.data

      if (data.success) {
        toast.success("OTP sent successfully!")
        router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}&type=login`)
      } else {
        toast.error(data.error || "Login failed")
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Network error. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    await signIn("google")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-5xl font-bold text-red-600 mb-2 hover:text-red-500 transition-colors">NetFrix</h1>
          </Link>
          <p className="text-gray-400 text-lg">Welcome back to unlimited entertainment</p>
        </div>

        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-800 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-white text-2xl font-bold">Sign In</CardTitle>
            <p className="text-gray-400 mt-2">Enter your email to continue</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 h-12 focus:border-red-500 focus:ring-red-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 h-12 focus:border-red-500 focus:ring-red-500"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-lg font-semibold transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <ArrowRight className="w-5 h-5 mr-2" />
                )}
                Send Login Code
              </Button>
            </form>

            <div className="text-center">
              <Link
                href="/auth/forgot-password"
                className="text-red-600 hover:text-red-500 text-sm font-medium transition-colors inline-flex items-center"
              >
                <Lock className="w-4 h-4 mr-1" />
                Forgot your password?
              </Link>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-900 px-2 text-gray-400">OR</span>
              </div>
            </div>

            <Button
              onClick={handleGoogleLogin}
              className="w-full h-12 bg-white hover:bg-gray-100 text-black font-semibold text-md border border-gray-300 shadow-sm flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <img
                    src="/google.png"
                    alt="Google logo"
                    className="w-5 h-5"
                  />
                  Continue with Google
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-gray-400 text-sm mt-4 mb-2">Don’t have an account?</p>
              <Link href="/auth/signup">
                <Button
                  variant="outline"
                  className="w-full border-gray-600 text-white hover:bg-gray-800 hover:text-white h-12 text-lg font-semibold bg-transparent"
                >
                  Create New Account
                </Button>
              </Link>
            </div>

            <div className="text-center pt-4">
              <p className="text-gray-500 text-xs">
                By signing in, you agree to our{" "}
                <a href="/terms" className="text-red-600 hover:underline">Terms of Service</a> and{" "}
                <a href="/privacy" className="text-red-600 hover:underline">Privacy Policy</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
