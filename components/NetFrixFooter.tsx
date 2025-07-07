/* ------------------------------------------------------------------
   components/NetMirrorNote.tsx   (TypeScript + Tailwind, fully typed)
------------------------------------------------------------------- */
import React from 'react';
import Image from 'next/image';

type NetFrixFooter= {
  className?: string;          // extra Tailwind classes if you need
};

const NetFrixFooter: React.FC<NetFrixFooter> = ({ className = '' }) => {
  return (
    <section
      className={
        `bg-[#1a1a1a] border border-yellow-500 rounded-lg p-4 sm:p-6 my-6
         text-white w-full max-w-5xl mx-auto ${className}`
      }
    >
      <h2 className="text-red-700 text-center text-lg sm:text-xl font-bold mb-2">
    NetFrix – One UI to Explore the Future of OTT Platforms. (Demo Purposes Only)
      </h2>
      <br />

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        {/* Android APK */}
        <a
          href="install#android"
          className="flex items-center justify-center w-full sm:w-auto
                     bg-[#aa2e2e] hover:bg-[#902424] transition-colors
                     text-white rounded-md py-3 px-6 text-sm font-medium"
        >
          <Image
            src="/icons/android.png"     // put the icon in /public/icons
            alt="Android"
            width={140}
            height={20}
            className="mr-2"
          />
          Download&nbsp;APK
          <span className="ml-1 hidden xs:inline">Android&nbsp;App</span>
        </a>

        {/* iOS / Web */}
        <a
          href="install#ios"
          className="flex items-center justify-center w-full sm:w-auto
                     bg-[#aa2e2e] hover:bg-[#902424] transition-colors
                     text-white rounded-md py-3 px-6 text-sm font-medium"
        >
          <Image
            src="/icons/ios.png"
            alt="iOS"
            width={130}
            height={20}
            className="mr-2"
          />
          Make&nbsp;on&nbsp;Browser
          <span className="ml-1 hidden xs:inline">iOS&nbsp;App</span>
        </a>
      </div>
    </section>
  );
};

export default NetFrixFooter;
