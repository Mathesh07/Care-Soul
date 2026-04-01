import { useState, useEffect } from "react"
import { Card, CardContent } from "./card"

interface HealthHighlightsProps {
  autoplayInterval?: number
}

export function HealthHighlights({ autoplayInterval = 3000 }: HealthHighlightsProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const highlights = HEALTH_HIGHLIGHTS

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % highlights.length)
    }, autoplayInterval)

    return () => clearInterval(interval)
  }, [autoplayInterval, highlights.length])

  return (
    <Card>
      <CardContent className="p-6">
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {highlights.map((highlight, index) => (
              <div key={index} className="min-w-full">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{highlight.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{highlight.title}</h4>
                    <p className={`text-2xl font-bold ${highlight.color}`}>{highlight.value}</p>
                    <p className="text-sm text-muted-foreground">{highlight.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Navigation dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            {highlights.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index
                    ? "bg-primary w-6"
                    : "bg-muted hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const HEALTH_HIGHLIGHTS = [
  {
    title: "Blood Pressure",
    value: "120/80",
    status: "Normal",
    icon: "❤️",
    color: "text-green-600",
  },
  {
    title: "Heart Rate",
    value: "72 bpm",
    status: "Healthy",
    icon: "💓",
    color: "text-red-600",
  },
  {
    title: "Blood Sugar",
    value: "95 mg/dL",
    status: "Normal",
    icon: "🩸",
    color: "text-blue-600",
  },
  {
    title: "BMI",
    value: "22.5",
    status: "Healthy",
    icon: "⚖️",
    color: "text-purple-600",
  },
  {
    title: "Temperature",
    value: "98.6°F",
    status: "Normal",
    icon: "🌡️",
    color: "text-orange-600",
  },
]
