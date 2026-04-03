import { useState, useEffect, useRef } from "react"
import { Footer } from "../components/ui/footer"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Link } from "react-router-dom"

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  // Healthcare images for slider
  const sliderImages = [
    {
      src: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop",
      alt: "Doctor consulting with patient",
    },
    {
      src: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=600&fit=crop",
      alt: "Medical team collaboration",
    },
    {
      src: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=800&h=600&fit=crop",
      alt: "Telemedicine consultation",
    },
    {
      src: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&h=600&fit=crop",
      alt: "Healthcare technology",
    },
    {
      src: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&h=600&fit=crop",
      alt: "Rural healthcare support",
    },
  ]

  // Auto-slide logic
  useEffect(() => {
    if (!isPaused && !isHovering) {
      autoSlideRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % sliderImages.length)
      }, 3000) // 3 seconds
    }

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current)
      }
    }
  }, [isPaused, isHovering, sliderImages.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length)
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="bg-hero-gradient text-white py-16 md:py-24 animate-fade-in transition-colors duration-300 border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="animate-slide-up">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-balance bg-gradient-to-r from-sky-800 via-teal-800 to-emerald-700 dark:from-cyan-300 dark:via-cyan-200 dark:to-teal-200 bg-clip-text text-transparent">Healthcare at Your Fingertips</h1>
                <p className="text-lg md:text-xl opacity-90 mb-8 text-balance text-foreground/80">
                  CARE SOUL brings quality healthcare access to rural communities. Book appointments, consult doctors
                  online, and manage your health records—all in one place.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" variant="default" asChild>
                    <Link to="/register">Get Started Free</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-foreground/5" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                </div>
              </div>
              <div className="hidden md:flex justify-center animate-scale-in">
                <div
                  className="relative w-full aspect-[4/3] max-w-lg bg-white/3 rounded-xl overflow-hidden backdrop-blur-md border border-white/[0.08] shadow-navy-xl group hover:shadow-glow-blue transition-all duration-300"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  {/* Image slider container */}
                  <div
                    className="flex h-full transition-transform duration-500 ease-out"
                    style={{
                      transform: `translateX(-${currentSlide * 100}%)`,
                    }}
                  >
                    {sliderImages.map((image, index) => (
                      <div key={index} className="min-w-full h-full flex-shrink-0">
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {/* Subtle gradient overlay for depth */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                      </div>
                    ))}
                  </div>

                  {/* Navigation controls - subtle and appear on hover */}
                  <button
                    onClick={goToPrevious}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/20 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-label="Previous image"
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    onClick={goToNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/20 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-label="Next image"
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Play/Pause control */}
                  <button
                    onClick={togglePause}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/20 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-label={isPaused ? "Play auto-slide" : "Pause auto-slide"}
                  >
                    <svg
                      className="w-3.5 h-3.5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {isPaused ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.868v4.264a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                      )}
                    </svg>
                  </button>

                  {/* Progress dots indicator */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {sliderImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                          currentSlide === index
                            ? "bg-white w-6"
                            : "bg-white/40 hover:bg-white/60"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 animate-slide-up">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How CARE SOUL Works</h2>
              <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                Four simple steps to connect with quality healthcare in your community.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  number: "1",
                  title: "Find a Doctor",
                  description: "Browse and search from a network of verified doctors in your area.",
                },
                {
                  number: "2",
                  title: "Book Appointment",
                  description: "Choose a convenient time slot and book your appointment instantly.",
                },
                {
                  number: "3",
                  title: "Consult Remotely",
                  description: "Connect via video call or chat from the comfort of your home.",
                },
                {
                  number: "4",
                  title: "Get Help in Emergencies",
                  description: "Quick access to emergency services and urgent care when needed.",
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className="group relative animate-slide-up hover:scale-105 transition-all duration-300 cursor-pointer"
                  style={{
                    animation: `slideUp 0.5s ease-out ${i * 0.1}s both`,
                  }}
                >
                  <Card className="h-full border-2 border-transparent hover:border-primary dark:hover:border-blue-500 transition-all duration-300">
                    <CardContent className="pt-6">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold mb-4 group-hover:scale-110 transition-transform duration-300">
                          {step.number}
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg mb-2 text-foreground group-hover:text-primary transition-colors duration-200">
                        {step.title}
                      </h3>
                      <p className="text-text-secondary text-sm">{step.description}</p>
                    </CardContent>
                  </Card>
                  {i < 3 && (
                    <div className="hidden md:block absolute top-12 -right-6 w-12 h-0.5 bg-gradient-to-r from-primary to-transparent group-hover:shadow-lg transition-all duration-300" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-surface transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 animate-slide-up">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Complete Healthcare Solutions</h2>
              <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                Everything you need to manage your health and wellness in rural areas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: "📅",
                  title: "Easy Appointments",
                  description: "Book appointments with qualified doctors in minutes, no waiting queues.",
                },
                {
                  icon: "🎥",
                  title: "Telemedicine",
                  description: "Consult specialists from home via secure video calls and chat.",
                },
                {
                  icon: "📋",
                  title: "Health Records",
                  description: "Access all your medical history and prescriptions in one secure place.",
                },
                {
                  icon: "🚨",
                  title: "Emergency Service",
                  description: "Quick access to emergency services and urgent care when needed.",
                },
              ].map((feature, i) => (
                <Card
                  key={i}
                  className="hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group"
                  style={{
                    animation: `slideUp 0.5s ease-out ${i * 0.1}s both`,
                  }}
                >
                  <CardContent className="pt-0">
                    <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-foreground group-hover:text-primary transition-colors duration-200">
                      {feature.title}
                    </h3>
                    <p className="text-text-secondary text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 md:py-24 bg-background border-y border-border transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 animate-slide-up">
              {[
                { number: "50K+", label: "Active Patients" },
                { number: "2K+", label: "Verified Doctors" },
                { number: "100+", label: "Rural Clinics" },
                { number: "99.9%", label: "Uptime" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="text-center transition-transform duration-300 hover:scale-110"
                  style={{
                    animation: `slideUp 0.5s ease-out ${i * 0.1}s both`,
                  }}
                >
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.number}
                  </div>
                  <p className="text-text-secondary">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground animate-fade-in transition-colors duration-300">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Take Control of Your Health?</h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of patients accessing quality healthcare in rural communities. Start your journey today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                Sign Up Now
              </Button>
              <Button size="lg" variant="ghost" className="border border-white hover:bg-white/10 text-white">
                Learn More
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
