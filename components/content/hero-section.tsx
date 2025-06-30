"use client"

import { Info, Play } from "lucide-react"
import { useState } from "react"
import "swiper/css"
import "swiper/css/pagination"
import { Autoplay, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

import { Button } from "@/components/ui/button"

const featuredItems = [
  {
    id: "685ea7fa3be8267662dd0900",
    title: "Squid Game - S3",
    description:
      "Gi‑hun returns to the deadly games with a mission to dismantle the organization from within.",
    backgroundImage:
      "https://res.cloudinary.com/duksmkzhl/image/upload/v1751033782/huraamosqqzdencgrb0r.jpg",
    genre: ["Action", "Thriller", "Deadly Games"],
    rating: "TV-MA",
    year: 2025,
  },
  {
    id: "685f8a95830976f214eda767",
    title: "Panchayat - S4",
    description:
      "A comedy-drama, which captures the journey of an engineering graduate Abhishek, who for lack of a better job option joins as secretary of a Panchayat office in a remote village of Uttar Pradesh.",
    backgroundImage:
      "https://res.cloudinary.com/duksmkzhl/image/upload/v1751088347/panchayat_tlzfnx.jpg",
    genre: ["Politict Drama", "Comedy", "Drama"],
    rating: "TV-14",
    year: 2025,
  },
  {
    id: "685f8e57830976f214eda769",
    title: "The Wednesday",
    description:
      "At Nevermore Academy, gothic teen Wednesday Addams hones her psychic abilities and unravels a chilling supernatural mystery tied to her family’s dark past.",
    backgroundImage:
      "https://res.cloudinary.com/duksmkzhl/image/upload/v1751009825/mf6o8itxd68r5l3mgjos.jpg",
    genre: ["Mystery", "Fantasy", "Comedy Drama", "Supernatural Thriller"],
    rating: "TV-14",
    year: 2021,
  },

{
    id: "85e66cde3be8267662dd03433",
    title: " Breaking Bad",
    description:
      "A high-school chemistry teacher diagnosed with lung cancer turns to cooking and selling methamphetamine with a former student, embracing a life of crime to secure his family's future. His alter ego Heisenberg evolves amid danger and moral collapse.",
    backgroundImage:
      "https://res.cloudinary.com/duksmkzhl/image/upload/v1751086926/breakingbad_j3s72l.jpg",
    genre: ["Crime Drama", "Thriller", "Neo‑Western", "Dark Comedy", "Thriller"],
    rating: "TV-MA",
    year: 2013,
  },


{
    id: "85e66cde3be8267662dd43432",
    title: "The Dark Knight",
    description:
      "Batman teams up with Lt. Gordon and DA Harvey Dent to dismantle organized crime in Gotham, but faces escalating chaos when the anarchist Joker emerges to test his limits.",
    backgroundImage:
      "https://res.cloudinary.com/duksmkzhl/image/upload/v1751086927/dark_knight_ej5g4i.jpg",
    genre: ["Action", "Crime", "Thriller", "Superhero"],
    rating: "PG-13",
    year: 2008,
  },

{
    id: "85e66cde3be8267662dd85741",
    title: "Money Heist",
    description:
      "A criminal genius “Professor” recruits a ragtag crew to pull off the greatest heist in Spain: robbing the Royal Mint and later the Bank of Spain. High-stakes suspense, emotional gambits, and iconic red jumpsuits mask intrigue and betrayal.",
    backgroundImage:
      "https://res.cloudinary.com/duksmkzhl/image/upload/v1751086926/money_heist_syfnuk.jpg",
    genre: ["Heist", "Crime Drama", "Thriller ",],
    rating: "TV-MA",
    year: 2021,
  },


  {
    id: "85e66cde3be8267662dd12367",
    title: "Attack on Titan",
    description:
      "In a post‑apocalyptic world, humanity is confined within massive Walls to shield against giant man‑eating Titans. When the Colossal Titan breaches Wall Maria, young Eren Jaeger vows revenge and joins the Survey Corps to fight back—and uncover deep conspiracies.",
    backgroundImage:
      "https://res.cloudinary.com/duksmkzhl/image/upload/v1751086925/aot_nidljs.jpg",
    genre: ["Action", "Dark Fantasy", "Adventure", "Anime"],
    rating: "TV-MA",
    year: 2023,
  },

  {
    id: "85e66cde3be8267662dd54532",
    title: "Game of Thrones",
    description:
      "Noble families vie for control of Westeros, battling political intrigue, dragons, and ancient supernatural threats like the White Walkers.",
    backgroundImage:
      "https://res.cloudinary.com/duksmkzhl/image/upload/v1751087222/photo_2025-06-28_10-36-38_y2zsp2.jpg",
    genre: ["Drama", "Fantasy", "Action", "Adventure"],
    rating: "TV-MA",
    year: 2019,
  },

  {
    id: "85e66cde3be8267662dd05434",
    title: "Inception",
    description:
      "A master “extractor” infiltrates dreams to steal secrets—but when tasked to plant an idea, he and his elite team embark on a perilous, multi‑layered mission that pushes the boundaries of reality.",
    backgroundImage:
      "https://res.cloudinary.com/duksmkzhl/image/upload/v1751086926/inception_o2ecuv.jpg",
    genre: ["Sci‑Fi", "Action", "Thriller", "Heist"],
    rating: "PG-13",
    year: 2010,
  },

  {
    id: "85e66cde3be8267662dd57732",
    title: "Sacred Games",
    description:
      "Honest Mumbai cop Sartaj Singh receives a cryptic warning from fugitive gangster Ganesh Gaitonde that the city will end in 25 days. The series alternates between present-day Mumbai and flashbacks exploring Gaitonde’s rise, revealing a sprawling web of crime, politics, religion, and conspiracy.",
    backgroundImage:
      "https://res.cloudinary.com/duksmkzhl/image/upload/v1751086926/sacredgames_hx6alk.jpg",
    genre: ["Mystery", "Fantasy", "Comedy Drama", "Supernatural Thriller"],
    rating: "TV-MA",
    year: 2019,
  },

  {
    id: "85e66cde3be8267662dd85345",
    title: "John Wick chapter 4",
    description:
      "John Wick is a former hitman grieving the loss of his true love. When his home is broken into, robbed, and his dog killed, he is forced to return to action to exact revenge.",
    backgroundImage:
      "https://res.cloudinary.com/duksmkzhl/image/upload/v1751086925/john_wick_idpa9t.jpg",
    genre: ["Action", "Revenge", "Neo‑Noir", "Thriller", "Martial-Arts", "Crime"],
    rating: "TV-14",
    year: 2023,
  },

  {
    id: "85e66cde3be8267662dd04442",
    title: "Naruto: Shippuden",
    description:
      "Naruto Uzumaki, is a loud, hyperactive, adolescent ninja who constantly searches for approval and recognition, as well as to become Hokage, who is acknowledged as the leader and strongest of all ninja in the village.",
    backgroundImage:
      "https://res.cloudinary.com/duksmkzhl/image/upload/v1751087623/Naruto_yvqbow.jpg",
    genre: ["Action", "Fantasy", "Adventure", "Martial Arts", "Anime", "Shonen","Drama"],
    rating: "TV-14",
    year: 2017,
  },

  {
    id: "85e66cde3be8267662dd05967",
    title: " The Boys",
    description:
      "A group of vigilantes set out to take down corrupt superheroes who abuse their superpowers.",
    backgroundImage:
      "https://res.cloudinary.com/duksmkzhl/image/upload/v1751086925/The_boys_sbzbbn.jpg",
    genre: ["Action", "Black Comedy", "Drama", "Satire", "Superhero", "Thriller", "Science Fiction"],
    rating: "TV-MA",
    year: 2024,
  },

  {
    id: "85e66cde3be8267662dd0123456",
    title: "Stranger Things",
    description:
      "In 1980s Indiana, a group of young friends witness supernatural forces and secret government exploits. As they search for answers, the children unravel a series of extraordinary mysteries.",
    backgroundImage:
      "https://res.cloudinary.com/duksmkzhl/image/upload/v1751086925/Stranger_things_pdhac7.jpg",
    genre: ["Sci‑Fi", "Horror", "Drama", "Mystery", "Adventure"],
    rating: "TV-14",
    year: 2022,
  },

  {
    id: "85e66cde3be8267662dd02386",
    title: "Jujutsu Kaisen",
    description:
      "A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself. He enters a shaman's school to be able to locate the demon's other body parts and thus exorcise himself.",
    backgroundImage:
      "https://res.cloudinary.com/duksmkzhl/image/upload/v1751086925/jujutsu_kaisen_pqeadt.jpg",
    genre: ["Action", " Dark Fantasy", "Supernatural", "Shounen", "Anime"],
    rating: "TV-MA",
    year: 2020,
  },

  {
    id: "85e66cde3be8267662dd64678",
    title: "Chernobyl",
    description:
      "In April 1986, the city of Chernobyl in the Soviet Union suffers one of the worst nuclear disasters in the history of mankind. Consequently, many heroes put their lives on the line in the following days, weeks and months.",
    backgroundImage:
      "https://res.cloudinary.com/duksmkzhl/image/upload/v1751086925/chernobyl_u2xu0z.jpg",
    genre: ["Historical Thriller", "Disaster", "PoliticaDrama", "Drama", "Miniseries"],
    rating: "TV-MA",
    year: 2019,
  },
]
export default function HeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0)
  const current = featuredItems[activeIndex]

  return (
    <section className="relative h-screen overflow-hidden">
      <Swiper
        slidesPerView={1}
        loop
        autoplay={{ delay: 7000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        onSlideChange={({ realIndex }) => setActiveIndex(realIndex)}
        modules={[Autoplay, Pagination]}
        className="h-full"
      >
        {featuredItems.map((item) => (
          <SwiperSlide key={item.id}>
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-500"
              style={{ backgroundImage: `url(${item.backgroundImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />

            <div className="relative z-10 flex items-center h-full">
              <div className="container mx-auto px-4 max-w-2xl">
                <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white">
                  {item.title}
                </h1>
                <div className="flex items-center space-x-4 mb-4 text-sm text-gray-300">
                  <span className="bg-red-600 px-2 py-1 rounded text-white font-semibold">
                    {item.rating}
                  </span>
                  <span>{item.year}</span>
                  <div className="flex space-x-2">
                    {item.genre.map((g) => (
                      <span
                        key={g}
                        className="border border-gray-500 px-2 py-1 rounded"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center space-x-4">
                  <Button
                    size="lg"
                    className="bg-white text-black hover:bg-gray-200 font-semibold"
                    onClick={() => (window.location.href = `/watch/${item.id}`)}
                  >
                    <Play className="w-5 h-5 mr-2" /> Play
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-gray-600/80 text-white hover:bg-gray-600"
                    onClick={() => (window.location.href = `/content/${item.id}`)}
                  >
                    <Info className="w-5 h-5 mr-2" /> More Info
                  </Button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}
