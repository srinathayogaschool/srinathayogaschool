"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"

import { ChevronRight, Star, Clock, Calendar, ArrowUp, Award, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BannerCarousel } from "@/components/banner-carousel"
import { AnimatedCounter } from "@/components/animated-counter"
import { EducatorsSlider } from "@/components/educators-slider"
import { fetchCourses, fetchWorkshops, fetchProducts } from "@/lib/supabase-queries"
import type { Course as AppCourse, Workshop as AppWorkshop, Product as AppProduct } from "@/lib/app-data"

const stats = [
  { value: 200000, label: "Lives Transformed", suffix: "+" },
  { value: 1000000, label: "Students Trained", suffix: "+" },
  { value: 500, label: "Workshops Conducted", suffix: "+" },
  { value: 10, label: "Years Experience", suffix: "+" },
]

const sadhanaTitles = ["Yoga Sadhana Beginner", "Yoga Sadhana Intermediate", "Yoga Sadhana Advanced"]

const instagramPosts = [
  { title: "Boost Manipura Chakra for Self confidence", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=300&fit=crop" },
  { title: "Improve your Gut health", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=300&h=300&fit=crop" },
  { title: "Benefits of Cold Shower", image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=300&h=300&fit=crop" },
  { title: "How to balance Chakras", image: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=300&h=300&fit=crop" },
]

export default function HomePage() {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [courses, setCourses] = useState<AppCourse[]>([])
  const [workshops, setWorkshops] = useState<AppWorkshop[]>([])
  const [products, setProducts] = useState<AppProduct[]>([])

  useEffect(() => {
    fetchCourses().then(all => {
      setCourses(all.filter(c => sadhanaTitles.includes(c.title)))
    }).catch(() => {})
    fetchWorkshops().then(all => {
      setWorkshops(all.slice(0, 4))
    }).catch(() => {})
    fetchProducts().then(all => {
      setProducts(all.slice(0, 4))
    }).catch(() => {})
    const handleScroll = () => setShowScrollTop(window.scrollY > 500)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" })

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        {/* Banner Carousel */}
        <BannerCarousel />

        {/* Stats Section with Animated Counters */}
        <section className="py-16 bg-white border-y border-[#E5E5E5]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="text-center"
                >
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  <p className="text-[#264020]/60 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Programs - Satvic Horizontal Cards */}
        <section className="py-20 bg-[#FAF8F5]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl lg:text-4xl text-[#264020] mb-4">
                Upcoming Yoga Programs
              </h2>
              <p className="text-[#264020]/60 max-w-2xl mx-auto">
                Deepen your learnings over 3 levels
              </p>
            </div>

            <div className="space-y-6">
              {courses.map((course, index) => (
                <div
                  key={course.title}
                  className="animate-fade-in-up glass-card rounded-2xl overflow-hidden flex flex-col md:flex-row"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative md:w-2/5 h-64 md:h-auto">
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-white rounded shadow-sm px-3 py-2">
                      <p className="text-[#264020]/60 text-xs">Level</p>
                      <p className="text-[#264020] font-bold">{course.level}</p>
                    </div>
                  </div>

                  <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-center">
                    <h3 className="font-serif text-2xl text-[#264020] mb-3">
                      {course.title}
                    </h3>
                    <p className="text-[#264020]/70 mb-6 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mb-6">
                      <div className="flex items-center gap-2 bg-white border border-[#E5E5E5] px-4 py-2 rounded-full">
                        <Calendar className="w-4 h-4 text-[#264020]/60" />
                        <span className="text-[#264020] text-sm">{course.instructor}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white border border-[#E5E5E5] px-4 py-2 rounded-full">
                        <Clock className="w-4 h-4 text-[#264020]/60" />
                        <span className="text-[#264020] text-sm">{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white border border-[#E5E5E5] px-4 py-2 rounded-full">
                        <Star className="w-4 h-4 fill-[#264020] text-[#264020]/60" />
                        <span className="text-[#264020] text-sm">{course.rating}</span>
                      </div>
                    </div>

                    <div>
                      <Link href={`/app/courses/${course.id}`}>
                        <Button className="bg-[#264020] hover:bg-[#3a5a30] text-white px-8 py-5 text-base">
                          Register Now <span className="ml-2">&#8377;{course.price}</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link href="/courses">
                <Button variant="outline" className="border-[#264020] text-[#264020] hover:bg-[#264020] hover:text-white">
                  View All Programs
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Workshops Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="font-serif text-3xl lg:text-4xl text-[#264020] mb-2">
                  Workshops
                </h2>
                <p className="text-[#264020]/60">Deepen your practice through live sessions</p>
              </div>
              <Link href="/app">
                <Button variant="outline" className="border-[#264020] text-[#264020] hover:bg-[#264020] hover:text-white">
                  View All
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {workshops.map((workshop) => (
                <div key={workshop.id} className="glass-card rounded-2xl overflow-hidden group">
                  <div className="relative aspect-[4/3]">
                    <Image src={workshop.image} alt={workshop.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-white/95 rounded-lg">
                      <p className="text-xs font-bold text-[#264020]">{workshop.startDate}</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-lg text-[#264020] mb-2">{workshop.title}</h3>
                    <p className="text-sm text-[#264020]/60 line-clamp-2 mb-4">{workshop.description}</p>
                    <div className="flex items-center gap-2 text-sm text-[#264020]/60">
                      <Clock className="w-4 h-4" />
                      <span>{workshop.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Store Section */}
        <section className="py-20 bg-[#FAF8F5]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="font-serif text-3xl lg:text-4xl text-[#264020] mb-2">
                  Yoga Store
                </h2>
                <p className="text-[#264020]/60">Books, accessories & wellness products</p>
              </div>
              <Link href="/shop">
                <Button variant="outline" className="border-[#264020] text-[#264020] hover:bg-[#264020] hover:text-white">
                  View All
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="glass-card rounded-2xl overflow-hidden group">
                  <div className="relative aspect-square">
                    <Image src={product.image} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-sm text-[#264020] line-clamp-2 mb-2">{product.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#264020]">&#8377;{product.price.toLocaleString()}</span>
                      {product.originalPrice > 0 && (
                        <span className="text-xs text-[#264020]/40 line-through">&#8377;{product.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Meet The Educators */}
        <EducatorsSlider />

        {/* Instagram Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl lg:text-4xl text-[#264020] mb-4">
                Srinatha Yoga On Instagram
              </h2>
              <p className="text-[#264020]/60">For daily yogic wisdom and inspiration</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {instagramPosts.map((post, index) => (
                <div
                  key={post.title}
                  className="animate-fade-in-up relative aspect-square rounded overflow-hidden cursor-pointer group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Image src={post.image} alt={post.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-[#264020]/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                    <p className="text-white text-sm text-center font-medium">{post.title}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <a href="https://www.instagram.com/yogawithsrinatha/" target="_blank" rel="noopener noreferrer">
                <Button className="bg-[#264020] hover:bg-[#3a5a30] text-white">
                  Visit The Instagram Page
                </Button>
              </a>
            </div>
          </div>
        </section>

      </main>

      <Footer />

      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="animate-fade-in-up fixed bottom-8 right-8 w-12 h-12 bg-[#264020] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#3a5a30] transition-colors z-50"
        >
          <ArrowUp size={20} />
        </button>
      )}

      {/* WhatsApp Widget */}
      <a
        href="https://wa.me/919886512083"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 left-8 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#128C7E] transition-colors z-50"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </a>
    </div>
  )
}
