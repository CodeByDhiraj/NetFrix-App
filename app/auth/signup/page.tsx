"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, ArrowRight, User, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import GoogleAuthButton from "@/components/auth/GoogleAuthButton"
import axiosInstance from "@/lib/axiosInstance"
import toast from "react-hot-toast"


export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Please enter your name")
      return
    }

    if (!email.trim()) {
      toast.error("Please enter your email address")
      return
    }

    setIsLoading(true)

    try {
      const response = await axiosInstance.post("/api/auth/signup", {
        email: email.trim(),
        password: password.trim(),
        userName: name.trim(), // ✅ same as backend
      })

      const data = response.data

      if (data.success) {
        toast.success("Signup successful! OTP sent.")
        router.push(`/auth/verify-otp?email=${encodeURIComponent(email)}&type=signup&name=${encodeURIComponent(name)}`)
      } else {
        toast.error(data.error || "Signup failed")
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-5xl font-bold text-red-600 mb-2 hover:text-red-500 transition-colors">NetFrix</h1>
          </Link>
          <p className="text-gray-400 text-lg">Join the streaming revolution</p>
        </div>

        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-800 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-white text-2xl font-bold">Create Account</CardTitle>
            <p className="text-gray-400 mt-2">Start your unlimited entertainment journey</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-300">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 h-12 focus:border-red-500 focus:ring-red-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-300">
                  Email Address
                </label>
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
                <label htmlFor="password" className="text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter a strong password"
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
                Create Account
              </Button>
            </form>

            <GoogleAuthButton />

            <div className="relative mt-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-900 px-2 text-gray-400">Already have an account?</span>
              </div>
            </div>

            <div className="text-center mt-6">
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  className="w-full border-gray-600 text-white hover:bg-gray-800 hover:text-white h-12 text-lg font-semibold bg-transparent"
                >
                  Sign In Instead
                </Button>
              </Link>
            </div>

            <div className="text-center pt-6">
              <p className="text-gray-500 text-xs">
                By creating an account, you agree to our{" "}
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
