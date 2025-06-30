// HeroSlider.tsx – cleaned, deduped, typed
'use client'

import { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

import { Button } from '@/components/ui/button'
import { Play, Info } from 'lucide-react'

/* ───── Types ───── */
interface Badge { label: string; color: string }
interface FeaturedItem {
  id: string
  title: string
  description: string
  backgroundImage: string
  genre: string[]
  rating: string
  year: number
  badge?: Badge[]
}

/* ───── Data (trimmed sample) ───── */
const featuredItems: FeaturedItem[] = [
  {
    id: '685ea7fa3be8267662dd0900',
    title: 'Squid Game – S3',
    description: 'Gi‑hun returns to the deadly games with a mission to dismantle the organization from within.',
    backgroundImage: 'https://res.cloudinary.com/duksmkzhl/image/upload/v1751033782/huraamosqqzdencgrb0r.jpg',
    genre: ['Action', 'Thriller', 'Deadly Games'],
    rating: 'TV‑MA',
    year: 2025,
    badge: [
      { label: '1080p', color: 'bg-red-600 text-white' },
      { label: 'Hindi',  color: 'bg-yellow-500 text-black' },
    ],
  },
  {
    id: '685f8a95830976f214eda767',
    title: 'Panchayat – S4',
    description: 'An engineering graduate joins a Panchayat office in a remote UP village.',
    backgroundImage: 'https://res.cloudinary.com/duksmkzhl/image/upload/v1751088347/panchayat_tlzfnx.jpg',
    genre: ['Political Drama', 'Comedy', 'Drama'],
    rating: 'TV‑14',
    year: 2025,
    badge: [{ label: 'Trending', color: 'bg-yellow-600 text-black' }],
  },
  {
    id: '685f8e57830976f214eda769',
    title: 'Wednesday',
    description: "Wednesday Addams unravels a chilling supernatural mystery at Nevermore Academy.",
    backgroundImage: 'https://res.cloudinary.com/duksmkzhl/image/upload/v1751009825/mf6o8itxd68r5l3mgjos.jpg',
    genre: ['Mystery', 'Fantasy', 'Comedy‑Drama'],
    rating: 'TV‑14',
    year: 2021,
    badge: [{ label: 'Popular', color: 'bg-blue-600 text-white' }],
  },
  {
    id: "85e66cde3be8267662dd03433",
    title: "Breaking Bad",
    description: "A chemistry teacher turns to making meth to secure his family's future, descending into the criminal underworld.",
    backgroundImage: "https://res.cloudinary.com/duksmkzhl/image/upload/v1751086926/breakingbad_j3s72l.jpg",
    genre: ["Crime Drama", "Thriller", "Neo‑Western", "Dark Comedy"],
    rating: "TV-MA",
    year: 2013,
    badge: [{ label: 'Classic', color: 'bg-purple-700 text-white' }],
  },
  {
    id: "85e66cde3be8267662dd43432",
    title: "The Dark Knight",
    description: "Batman faces chaos as the Joker tests Gotham’s limits in this iconic superhero thriller.",
    backgroundImage: "https://res.cloudinary.com/duksmkzhl/image/upload/v1751086927/dark_knight_ej5g4i.jpg",
    genre: ["Action", "Crime", "Thriller", "Superhero"],
    rating: "PG-13",
    year: 2008,
    badge: [{ label: 'Blockbuster', color: 'bg-indigo-700 text-white' }],
  },
  {
    id: "85e66cde3be8267662dd85741",
    title: "Money Heist",
    description: "A mastermind and his crew attempt the greatest heist in Spain, facing danger and betrayal at every turn.",
    backgroundImage: "https://res.cloudinary.com/duksmkzhl/image/upload/v1751086926/money_heist_syfnuk.jpg",
    genre: ["Heist", "Crime Drama", "Thriller"],
    rating: "TV-MA",
    year: 2021,
    badge: [{ label: 'Heist', color: 'bg-red-700 text-white' }],
  },
  {
    id: "85e66cde3be8267662dd12367",
    title: "Attack on Titan",
    description: "Eren and his friends fight for survival against giant man-eating Titans in a walled world.",
    backgroundImage: "https://res.cloudinary.com/duksmkzhl/image/upload/v1751086925/aot_nidljs.jpg",
    genre: ["Action", "Dark Fantasy", "Adventure", "Anime"],
    rating: "TV-MA",
    year: 2023,
    badge: [{ label: 'Anime', color: 'bg-pink-600 text-white' }],
  },
  {
    id: "85e66cde3be8267662dd54532",
    title: "Game of Thrones",
    description: "Noble families battle for the Iron Throne as ancient threats rise in Westeros.",
    backgroundImage: "https://res.cloudinary.com/duksmkzhl/image/upload/v1751087222/photo_2025-06-28_10-36-38_y2zsp2.jpg",
    genre: ["Drama", "Fantasy", "Action", "Adventure"],
    rating: "TV-MA",
    year: 2019,
    badge: [{ label: 'Epic', color: 'bg-yellow-800 text-white' }],
  },
  {
    id: "85e66cde3be8267662dd05434",
    title: "Inception",
    description: "A skilled thief enters dreams to plant ideas, blurring the line between reality and imagination.",
    backgroundImage: "https://res.cloudinary.com/duksmkzhl/image/upload/v1751086926/inception_o2ecuv.jpg",
    genre: ["Sci‑Fi", "Action", "Thriller", "Heist"],
    rating: "PG-13",
    year: 2010,
    badge: [{ label: 'Mind-Bending', color: 'bg-blue-800 text-white' }],
  },
  {
    id: "85e66cde3be8267662dd57732",
    title: "Sacred Games",
    description: "A Mumbai cop uncovers a deadly countdown and a web of crime, politics, and religion.",
    backgroundImage: "https://res.cloudinary.com/duksmkzhl/image/upload/v1751086926/sacredgames_hx6alk.jpg",
    genre: ["Mystery", "Fantasy", "Comedy Drama", "Supernatural Thriller"],
    rating: "TV-MA",
    year: 2019,
    badge: [{ label: 'Indian Original', color: 'bg-green-700 text-white' }],
  },
  {
    id: "85e66cde3be8267662dd85345",
    title: "John Wick Chapter 4",
    description: "John Wick returns for vengeance, facing deadly new enemies in a relentless action spree.",
    backgroundImage: "https://res.cloudinary.com/duksmkzhl/image/upload/v1751086925/john_wick_idpa9t.jpg",
    genre: ["Action", "Revenge", "Neo‑Noir", "Thriller", "Martial-Arts", "Crime"],
    rating: "TV-14",
    year: 2023,
    badge: [{ label: 'Action', color: 'bg-gray-800 text-white' }],
  },
  {
    id: "85e66cde3be8267662dd04442",
    title: "Naruto: Shippuden",
    description: "Naruto strives to become Hokage and protect his village, facing powerful foes and personal trials.",
    backgroundImage: "https://res.cloudinary.com/duksmkzhl/image/upload/v1751087623/Naruto_yvqbow.jpg",
    genre: ["Action", "Fantasy", "Adventure", "Martial Arts", "Anime", "Shonen", "Drama"],
    rating: "TV-14",
    year: 2017,
    badge: [{ label: 'Anime', color: 'bg-orange-500 text-white' }],
  },
  {
    id: "85e66cde3be8267662dd05967",
    title: "The Boys",
    description: "A group of vigilantes fights back against corrupt superheroes abusing their powers.",
    backgroundImage: "https://res.cloudinary.com/duksmkzhl/image/upload/v1751086925/The_boys_sbzbbn.jpg",
    genre: ["Action", "Black Comedy", "Drama", "Satire", "Superhero", "Thriller", "Science Fiction"],
    rating: "TV-MA",
    year: 2024,
    badge: [{ label: 'Superhero', color: 'bg-yellow-700 text-white' }],
  },
  {
    id: "85e66cde3be8267662dd0123456",
    title: "Stranger Things",
    description: "A group of kids in 1980s Indiana faces supernatural forces and government secrets.",
    backgroundImage: "https://res.cloudinary.com/duksmkzhl/image/upload/v1751086925/Stranger_things_pdhac7.jpg",
    genre: ["Sci‑Fi", "Horror", "Drama", "Mystery", "Adventure"],
    rating: "TV-14",
    year: 2022,
    badge: [{ label: 'Fan Favorite', color: 'bg-pink-700 text-white' }],
  },
  {
    id: "85e66cde3be8267662dd02386",
    title: "Jujutsu Kaisen",
    description: "A cursed boy joins a shaman school to fight evil spirits and break his own curse.",
    backgroundImage: "https://res.cloudinary.com/duksmkzhl/image/upload/v1751086925/jujutsu_kaisen_pqeadt.jpg",
    genre: ["Action", "Dark Fantasy", "Supernatural", "Shounen", "Anime"],
    rating: "TV-MA",
    year: 2020,
    badge: [{ label: 'Anime', color: 'bg-purple-600 text-white' }],
  },
  {
    id: "85e66cde3be8267662dd64678",
    title: "Chernobyl",
    description: "The true story of the 1986 nuclear disaster and the heroes who risked everything to contain it.",
    backgroundImage: "https://res.cloudinary.com/duksmkzhl/image/upload/v1751086925/chernobyl_u2xu0z.jpg",
    genre: ["Historical Thriller", "Disaster", "PoliticaDrama", "Drama", "Miniseries"],
    rating: "TV-MA",
    year: 2019,
    badge: [{ label: 'Based on True Events', color: 'bg-gray-700 text-white' }],
  },
]

/* ───── Component ───── */
export default function HeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section className="relative h-screen overflow-hidden">
      <Swiper
        slidesPerView={1}
        loop
        autoplay={{ delay: 7000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        onSlideChange={({ realIndex }) => setActiveIndex(realIndex)}
        modules={[Autoplay, Pagination]}
        className="h-full custom-swiper"
      >
        {featuredItems.map((item) => (
          <SwiperSlide key={item.id}>
            {/* background */}
            <div className="absolute inset-0 bg-cover bg-center transition-all duration-500" style={{ backgroundImage: `url(${item.backgroundImage})` }} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />

            <div className="relative z-10 flex items-center h-full">
              <div className="container mx-auto px-4 max-w-2xl">
                <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white drop-shadow-lg">
                  {item.title}
                </h1>

                {/* meta row */}
                <div className="flex flex-wrap items-center gap-2 mb-2 text-xs sm:text-sm lg:text-base text-gray-300">
                  <span className="bg-red-600 px-2 py-0.5 rounded font-semibold">{item.rating}</span>
                  <span>{item.year}</span>
                  {item.genre.map((g) => (
                    <span key={g} className="border border-gray-500/70 px-2 py-0.5 rounded">
                      {g}
                    </span>
                  ))}
                </div>

                {/* badges */}
                {item.badge?.length && (
                  <div className="flex flex-wrap gap-2 mb-4 text-xs sm:text-sm lg:text-base">
                    {item.badge.map((b, i) => (
                      <span key={i} className={`px-2 py-0.5 rounded font-semibold ${b.color}`}>{b.label}</span>
                    ))}
                  </div>
                )}

                <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed max-w-prose">
                  {item.description}
                </p>

                <div className="flex items-center gap-4">
                  <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-semibold" onClick={() => (window.location.href = `/watch/${item.id}`)}>
                    <Play className="w-5 h-5 mr-2" /> Play
                  </Button>
                  <Button size="lg" variant="secondary" className="bg-gray-600/80 text-white hover:bg-gray-600" onClick={() => (window.location.href = `/content/${item.id}`)}>
                    <Info className="w-5 h-5 mr-2" /> More Info
                  </Button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* red pagination bullets */}
      <style jsx global>{`
  .custom-swiper .swiper-pagination {
    position: absolute !important;
    bottom: 48px !important; /* Move bullets further down */
    left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    z-index: 20;
    pointer-events: auto;
  }
  .custom-swiper .swiper-pagination-bullet {
    width: auto !important;
    height: auto !important;
    margin: 0 8px !important;
    background: rgba(255,255,255,0.4) !important;
    opacity: 0 !important;
    border-radius: 20%;
    border: 10px solid #ef4444;
    transition: background 0.2s, transform 0.2s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
  }
  .custom-swiper .swiper-pagination-bullet-active {
    background: #ef4444 !important;
    transform: scale(1.25);
    border-color: #fff;
    box-shadow: 0 0 0 4px rgba(239,68,68,0.2);
  }
`}</style>
    </section>
  )
}
