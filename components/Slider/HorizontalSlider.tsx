'use client'

import { useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode, Scrollbar } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/scrollbar'

interface Props<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  slidesPerViewMobile?: number   // default 2
  space?: number                 // default 12
}

export default function HorizontalSlider<T>({
  items,
  renderItem,
  slidesPerViewMobile = 2,
  space = 12,
}: Props<T>) {
  /* inject style once */
  useEffect(() => {
    if (document.getElementById('nf-swiper-scrollbar')) return
    const style = document.createElement('style')
    style.id = 'nf-swiper-scrollbar'
    style.textContent = `
      /* internal bar lives inside Swiper container */
      .swiper-horizontal > .swiper-scrollbar {
        position: relative;        /* keep it inside, not fixed */
        margin-top: 24px;          /* ⬅️ pushes bar below cards */
        height: 8px !important;    /* thickness */
        background: transparent;
      }
      .swiper-scrollbar-drag {
        background: #4b0000 !important;
        border-radius: 4px;
      }
    `
    document.head.appendChild(style)
  }, [])

  return (
    <Swiper
      modules={[FreeMode, Scrollbar]}
      freeMode
      grabCursor
      loop={false}
      spaceBetween={space}
      slidesPerView={slidesPerViewMobile}
      scrollbar={{ draggable: true }}   /* ← internal bar */
      breakpoints={{
        640:  { slidesPerView: 3 },
        1024: { slidesPerView: 5 },
      }}
      className="w-full pb-10 select-none" /* bottom padding for safety */
    >
      {items.map((itm, idx) => (
        <SwiperSlide key={idx}>{renderItem(itm)}</SwiperSlide>
      ))}
    </Swiper>
  )
}
