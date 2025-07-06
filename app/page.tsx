import { Suspense } from "react"
import Navbar from "@/components/layout/navbar"
import ContentGrid from "@/components/content/content-grid"
import HeroSection from "@/components/content/hero-section"
import JetLoader from "@/components/ui/jet-loader"
import OTTRow from '@/components/home/OTTRow'
import AnnouncementBell from "@/components/ui/AnnouncementBell"
//import NetFrixrNote from '@/components/NetFrixNote';
import NetFrixFooter from '@/components/NetFrixFooter';



export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main>
        <HeroSection />
        <div className="px-4 py-8">
          <div className="container mx-auto mb-6">
            <OTTRow />
          </div>
          <Suspense fallback={<JetLoader />}>
            <ContentGrid />
          </Suspense>
          <NetFrixFooter />
        </div>
      </main>
    </div>
  )
}
