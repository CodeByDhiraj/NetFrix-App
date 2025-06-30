'use client';

import { motion } from 'framer-motion';

export default function PrivacyPage() {
  return (
    <motion.div
      className="p-6 max-w-4xl mx-auto text-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-3 text-lg">
        Your privacy is important to us. NetFrix does not collect personal information without your consent...
      </p>
      <ul className="list-disc ml-5 space-y-2">
        <li>We use cookies only for session handling.</li>
        <li>Your data is never shared with third parties.</li>
        <li>Only verified admins have access to sensitive info.</li>
      </ul>
      <p className="mt-6">Last updated: June 2025</p>
    </motion.div>
  );
}
