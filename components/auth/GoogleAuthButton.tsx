"use client"

import { signIn } from "next-auth/react"
import { FcGoogle } from "react-icons/fc"

export default function GoogleAuthButton() {
  return (
    <button
      onClick={() => signIn("google")}
      className="flex items-center justify-center gap-2 w-full h-12 px-4 border border-gray-600 rounded-md bg-white text-gray-900 hover:bg-gray-100 transition-colors"
    >
      <FcGoogle className="w-6 h-6" />
      <span className="text-sm font-medium">Continue with Google</span>
    </button>
  )
}
