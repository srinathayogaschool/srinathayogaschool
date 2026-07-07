'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { teachers } from '@/lib/app-data'

export function EducatorsSlider() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = 220
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  return (
    <section className="py-20 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl lg:text-4xl text-[#264020] mb-4">
            Meet The Educators
          </h2>
          <p className="text-[#264020]/60">Leading Srinatha Movement&apos;s Yoga Wing</p>
        </div>

        <div className="relative">
          {/* Desktop Arrows */}
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white shadow-lg rounded-full items-center justify-center text-[#264020] hover:bg-[#264020] hover:text-white transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white shadow-lg rounded-full items-center justify-center text-[#264020] hover:bg-[#264020] hover:text-white transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto hide-scrollbar momentum-scroll pb-4 snap-x snap-mandatory"
          >
            {teachers.map((educator, index) => (
              <div
                key={educator.id}
                className="flex-shrink-0 w-40 md:w-48 snap-start flex flex-col items-center glass-card rounded-2xl p-4 glass-card-hover transition-all duration-300 cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative mb-4">
                  <div
                    className="w-36 h-48 md:w-44 md:h-56 rounded-lg"
                    style={{ backgroundColor: educator.bgColor }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-56 md:w-40 md:h-64">
                    <Image
                      src={educator.image}
                      alt={educator.name}
                      fill
                      className="object-cover object-top"
                      style={{ objectPosition: 'top' }}
                    />
                  </div>
                </div>
                <h3 className="font-serif text-[#264020] font-medium text-center">
                  {educator.name}
                </h3>
                <p className="text-[#264020]/60 text-xs text-center leading-relaxed mt-1">
                  {educator.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
