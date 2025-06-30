/* ------------------------------------------------------------------
   components/NetMirrorNote.tsx   (TypeScript + Tailwind, fully typed)
------------------------------------------------------------------- */
import React from 'react';
import Image from 'next/image';

type NetFrixNoteProps = {
  className?: string;          // extra Tailwind classes if you need
};

const NetFrixNote: React.FC<NetFrixNoteProps> = ({ className = '' }) => {
  return (
    <section
      className={
        `bg-[#1a1a1a] border border-yellow-500 rounded-lg p-4 sm:p-6 my-6
         text-white w-full max-w-5xl mx-auto ${className}`
      }
    >
      <h2 className="text-yellow-400 text-lg sm:text-xl font-bold mb-2">
        Impotent&nbsp;Note
      </h2>

      <p className="text-sm leading-relaxed mb-2">
        This site link is temporary and it will change every month so
        download&nbsp;
        <span className="font-semibold">NetFrix</span> app on your mobile as
        soon as possible or visit our main&nbsp;site.
      </p>

      <p className="text-sm text-green-400 leading-relaxed mb-2">
        Bookmark Our Main Site for Latest APP and PC Site Related Updates
        <span className="hidden sm:inline">
          &nbsp;(New Site Available For Computer Users, Go and Check it).
        </span>
      </p>

      <p className="text-sm font-semibold text-yellow-300 mb-4">
        Main&nbsp;Site:&nbsp;
        <span className="text-white underline-offset-2 hover:underline">
          NetFrix.app
        </span>
      </p>

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        {/* Android APK */}
        <a
          href="#"
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
          href="#"
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

export default NetFrixNote;
