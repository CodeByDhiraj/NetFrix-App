// File: components/ProfilePopup.tsx
"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect } from "react"
import Image from "next/image"

interface Props {
  onClose: () => void
  isOpen: boolean
}

export default function ProfilePopup({ onClose, isOpen }: Props) {
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const popup = document.getElementById("profile-popup")
      if (popup && !popup.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick)
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-transparent flex items-start justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            id="profile-popup"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 160, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="pointer-events-auto rounded-xl shadow-2xl bg-[#e0e0e0] text-center px-8 py-6 w-[280px]"
          >
            <Image
              src="/netfrix-logo.png" // 
              alt="logo"
              width={90}
              height={90}
              className="mx-auto mb-4 rounded-full border-[5px] border-red-600"
            />
            <div className="text-black font-bold text-xl leading-snug tracking-wide uppercase">
              PROFILE<br />ACTIVATED<br />AFTER 1 MONTH
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
