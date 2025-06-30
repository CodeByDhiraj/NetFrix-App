'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const InstallGuidePage: React.FC = () => {
  const [tab, setTab] = useState<'android' | 'ios'>('android');

  return (
    <div className="bg-[#121212] text-white min-h-screen py-10 px-4">
      {/* ───────── Tabs (with icons) ───────── */}
      <div className="flex justify-around border-b border-gray-600 mb-6">
        {(['android', 'ios'] as const).map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`flex items-center gap-2 px-4 py-2 uppercase text-sm font-bold border-b-4 transition-all duration-200
              ${tab === item ? 'border-red-600 text-white' : 'border-transparent text-gray-400 hover:text-white'}
            `}
          >
            <Image
              src={item === 'android' ? '/icons/playstore.png' : '/icons/apple.png'}
              alt={item}
              width={110}
              height={20}
              className={`opacity-${tab === item ? '100' : '60'}`}
            />
            {item}
          </button>
        ))}
      </div>

      {/* ───────── ANDROID STEPS ───────── */}
      {tab === 'android' && (
        <div className="space-y-6">
          <p className="text-gray-300 text-sm mb-4 text-center">
            Follow 2 Easy steps to install&nbsp;
            <span className="text-red-500 font-semibold">NetFrix</span>&nbsp;app on your Android mobile.
            Use Google Chrome for all steps.
          </p>

          {/* Step 1 */}
          <div className="bg-black border-2 border-red-700 rounded-xl p-4">
            <h3 className="bg-red-700 text-white font-bold text-lg px-4 py-2 rounded mb-3">Step: 1</h3>
            <p className="text-center font-medium mb-3">Download our APK and install it.</p>
            <div className="flex justify-center">
              <a href="https://app.fallmodz.in/netfrix/" target="_blank" rel="noopener noreferrer">
                <Image src="/icons/android.png" alt="Download APK" width={250} height={100} className="rounded-xl hover:opacity-90 transition" />
              </a>

            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Enable “Install unknown apps” at Settings › Security & privacy › Install unknown apps › Chrome.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-black border-2 border-red-700 rounded-xl p-4">
            <h3 className="bg-red-700 text-white font-bold text-lg px-4 py-2 rounded mb-3">Step: 2</h3>
            <p className="text-center font-medium mb-2">Ready to use — open it and enjoy.</p>
            <div className="flex justify-center">
              <Image src="/icons/appinstall.png" alt="App installed" width={250} height={100} className="rounded-xl" />
            </div>
          </div>
        </div>
      )}

      {/* ───────── iOS STEPS ───────── */}
      {tab === 'ios' && (
        <div className="space-y-6">
          <p className="text-gray-300 text-sm mb-4 text-center">
            Follow 3 Easy steps to install&nbsp;
            <span className="text-red-700 font-semibold">DODO Webview</span>&nbsp;on your iPhone.
          </p>

          {/* Step 1 */}
          <div className="bg-black border-2 border-red-700 rounded-xl p-4">
            <h3 className="bg-red-700 text-white font-bold text-lg px-4 py-2 rounded mb-3">Step: 1</h3>
            <p className="text-center font-medium mb-3">
              Search and install&nbsp;
              <span className="text-green-500 font-semibold">DODO Webview</span>&nbsp;from the App Store.
            </p>
            <div className="flex justify-center">
              <Image src="/icons/ios11.png" alt="Search Dodo" width={280} height={100} className="rounded-xl" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-black border-2 border-red-700 rounded-xl p-4">
            <h3 className="bg-red-700 text-white font-bold text-lg px-4 py-2 rounded mb-3">Step: 2</h3>
            <p className="text-white font-medium mb-3 text-center">Type Site <span className="text-green-600 font-bold">URL</span>.</p>
            <div className="flex justify-center">
              <Image src="/icons/ios12.png" alt="Enter URL" width={280} height={100} className="rounded-xl" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-black border-2 border-red-700 rounded-xl p-4">
            <h3 className="bg-red-700 text-white font-bold text-lg px-4 py-2 rounded mb-3">Step: 3</h3>
            <p className="text-white font-medium mb-3 text-center">
              Turn ON all 3 Buttons and click on <span className="text-green-600 font-bold">Open Webview</span>.
            </p>
            <div className="flex justify-center">
              <Image src="/icons/ios13.png" alt="Enable toggles" width={280} height={100} className="rounded-xl" />
            </div>
          </div>

          <p className="text-red-500 text-xs mt-3 text-center">
            NOTE: DODO Webview is a 3-party app; we only load our site inside it like a normal browser.
          </p>
        </div>
      )}
    </div>
  );
};

export default InstallGuidePage;
