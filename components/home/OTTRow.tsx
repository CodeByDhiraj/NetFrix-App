'use client'

import Link from 'next/link'
import './ottrow.css'
import { useRef, useEffect, useState } from 'react'

export default function OTTRow() {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [isHovered, setIsHovered] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const popupTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const ottList = [
        { name: 'Netflix', logo: '/ott/netflix.png' },
        { name: 'Prime Video', logo: '/ott/Amazon_prime.png' },
        { name: 'Disney+', logo: '/ott/disney+.png' },
        { name: 'Jio Hotstar', logo: '/ott/jiohotstar.png' },
        { name: 'Sony Liv', logo: '/ott/sonyliv.png' },
        { name: 'Crunchyroll', logo: '/ott/Crunchyroll.png' },
        { name: 'HBO Max', logo: '/ott/HBO Max.png' },
        { name: 'Apple TV+', logo: '/ott/appletv.png' },
        { name: 'Hulu', logo: '/ott/hulu.png' },
        { name: 'MX Player', logo: '/ott/Mx-Player.png' },
        { name: 'Paramount+', logo: '/ott/paramountt.png' },
        { name: 'MGM+', logo: '/ott/mgm.png' },
        { name: 'LIONSGATE PLAY', logo: '/ott/lionsgate.png' },
        { name: 'Discovery+', logo: '/ott/discovery.png' },
        { name: 'ZEE5', logo: '/ott/zee5.png' },
        { name: 'AMC+', logo: '/ott/amc.png' },
        { name: 'VOOT', logo: '/ott/voot.png' },
        { name: 'hoichoi', logo: '/ott/hoichoi.png' },
        { name: 'erosnow', logo: '/ott/erosnow.png' },
        { name: 'Hayu', logo: '/ott/hayu.png' },
        { name: 'hallmarkmovies', logo: '/ott/hallmarkmovies.png' }
    ]

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null
        let timeout: NodeJS.Timeout | null = null

        const scrollStep = () => {
            const container = scrollRef.current
            if (!container) return

            if (
                container.scrollLeft + container.clientWidth >= container.scrollWidth - 5
            ) {
                clearInterval(interval!)
                timeout = setTimeout(() => {
                    container.scrollTo({ left: 0, behavior: 'smooth' })
                    timeout = setTimeout(() => {
                        if (!isHovered) {
                            interval = setInterval(scrollStep, 20)
                        }
                    }, 2000)
                }, 1500)
            } else {
                container.scrollBy({ left: 4, behavior: 'smooth' })
            }
        }

        if (!isHovered) {
            interval = setInterval(scrollStep, 20)
        }

        return () => {
            clearInterval(interval!)
            clearTimeout(timeout!)
            if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current)
        }
    }, [isHovered])

    const scroll = (dir: 'left' | 'right') => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                left: dir === 'left' ? -300 : 300,
                behavior: 'smooth'
            })
        }
    }

    const activeOTTs = ['/']

    return (
        <div className="ott-wrapper">
            <h2 className="ott-title">More OTT Apps Coming Soon</h2>
            <div className="ott-row-container">
                <div
                    className="ott-scroll-container"
                    ref={scrollRef}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className="ott-scroll-inner">
                        {ottList.map((ott) => {
                            const ottSlug = ott.name.toLowerCase().replace(/\s+/g, '-')
                            const isActive = activeOTTs.includes(ottSlug)

                            return (
                                <div
                                    key={ott.name}
                                    className="ott-box cursor-pointer"
                                    onClick={(e) => {
                                        if (isActive) {
                                            window.location.href = `/ott/${ottSlug}`
                                        } else {
                                            e.preventDefault()
                                            if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current)

                                            // Show again even if already shown
                                            setShowToast(false)
                                            setTimeout(() => setShowToast(true), 10)

                                            const audio = new Audio('/Alert.mp3')
                                            audio.play().catch(err => {
                                                console.warn('Sound failed to play:', err)
                                            })

                                            popupTimeoutRef.current = setTimeout(() => {
                                                setShowToast(false)
                                            }, 4000) // Total show time matches CSS fadeOut animation
                                        }
                                    }}

                                >
                                    <img
                                        src={ott.logo}
                                        alt={ott.name}
                                        className="max-h-[60%] max-w-[70%] object-contain"
                                    />
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Toast Alert */}
            {showToast && (
                <div className="toast-message">
                    <span className="popup-icon">⚠️</span>
                    <p>
                        <b>OTT Specific Content Coming Soon</b> <br />
                        All OTTs section will be opened soon.
                    </p>
                </div>
            )}
        </div>
    )
}
