'use client';

import { motion } from 'framer-motion';

export default function TermsPage() {
  return (
    <motion.div
      className="p-6 max-w-4xl mx-auto text-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-3xl font-bold mb-4">Terms & Conditions</h1>
      <p className="mb-3 text-lg">
        Welcome to NetFrix. By using our services, you agree to comply with and be bound by the following terms...
      </p>
      <ul className="list-disc ml-5 space-y-2">
        <li>No piracy or re-distribution of content is allowed.</li>
        <li>Your access may be revoked for violating our community rules.</li>
        <li>All video streams are hosted securely and tracked for abuse.</li>
      </ul>
      <p className="mt-6">Last updated: June 2025</p>
    </motion.div>
  );
}
