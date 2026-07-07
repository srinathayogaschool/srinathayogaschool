'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getBanners } from '@/lib/supabase-queries'

interface Banner {
  title: string
  subtitle: string
  image: string
  link: string
  cta: string
}

const defaultBanners: Banner[] = [
  {
    title: 'Traditional Mysore Yoga',
    subtitle: 'Learn the authentic Mysore style Ashtanga yoga from certified masters',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&h=600&fit=crop',
    link: '/courses',
    cta: 'Explore Programs',
  },
  {
    title: 'Yoga Workshops',
    subtitle: 'Deepen your practice with expert-led live workshops',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=1200&h=600&fit=crop',
    link: '/app',
    cta: 'View Workshops',
  },
  {
    title: 'Yoga Store',
    subtitle: 'Books, mats, accessories and more for your practice',
    image: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=1200&h=600&fit=crop',
    link: '/shop',
    cta: 'Shop Now',
  },
]

export function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>(defaultBanners)
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  useEffect(() => {
    getBanners().then(dbBanners => {
      if (dbBanners.length > 0) {
        setBanners(dbBanners.map(b => ({
          title: b.title,
          subtitle: b.subtitle || '',
          image: b.image,
          link: b.cta_link || '/',
          cta: b.cta_text || 'Learn More',
        })))
      }
    })
  }, [])

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrent(((index % banners.length) + banners.length) % banners.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }, [isTransitioning, banners.length])

  const next = useCallback(() => goTo(current + 1), [goTo, current])
  const prev = useCallback(() => goTo(current - 1), [goTo, current])

  useEffect(() => {
    intervalRef.current = setInterval(next, 4000)
    return () => clearInterval(intervalRef.current)
  }, [next])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    clearInterval(intervalRef.current)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > 50) {
      if (diff > 0) next()
      else prev()
    }
    intervalRef.current = setInterval(next, 4000)
  }

  return (
    <section className="relative overflow-hidden bg-[#264020]">
      <div
        className="relative h-[400px] md:h-[500px]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {banners.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-500 ease-in-out ${
              index === current
                ? 'opacity-100 translate-x-0'
                : index < current
                  ? 'opacity-0 -translate-x-full'
                  : 'opacity-0 translate-x-full'
            }`}
          >
            <Image
              src={banner.image}
              alt={banner.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#264020]/80 via-[#264020]/50 to-transparent" />
            <div className="relative z-10 h-full flex items-center">
              <div className="max-w-7xl mx-auto px-4 w-full">
                <div className="max-w-xl">
                  <h2 className="font-serif text-3xl md:text-5xl text-white mb-4">
                    {banner.title}
                  </h2>
                  <p className="text-white/80 text-lg mb-8">
                    {banner.subtitle}
                  </p>
                  <Link
                    href={banner.link}
                    className="inline-flex items-center gap-2 bg-white text-[#264020] px-8 py-4 rounded-xl font-medium hover:bg-[#FAF8F5] transition-colors"
                  >
                    {banner.cta}
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
        aria-label="Previous"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
        aria-label="Next"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === current
                ? 'bg-white scale-125'
                : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
