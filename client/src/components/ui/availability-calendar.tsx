import { Card, CardContent } from "./card"
import { Button } from "./button"

export function AvailabilityCalendar() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const timeSlots = ["Morning", "Afternoon", "Evening"]
  
  const availability = {
    Mon: { Morning: true, Afternoon: true, Evening: false },
    Tue: { Morning: true, Afternoon: false, Evening: true },
    Wed: { Morning: false, Afternoon: true, Evening: true },
    Thu: { Morning: true, Afternoon: true, Evening: true },
    Fri: { Morning: true, Afternoon: false, Evening: false },
    Sat: { Morning: false, Afternoon: false, Evening: true },
    Sun: { Morning: false, Afternoon: false, Evening: false },
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-8 gap-2 text-sm">
        <div className="font-medium"></div>
        {days.map((day) => (
          <div key={day} className="font-medium text-center text-muted-foreground">
            {day}
          </div>
        ))}
        
        {timeSlots.map((slot) => (
          <div key={slot} className="col-span-8 grid grid-cols-8 gap-2">
            <div className="font-medium text-sm py-2">{slot}</div>
            {days.map((day) => (
              <div
                key={`${day}-${slot}`}
                className={`h-8 rounded flex items-center justify-center text-xs ${
                  availability[day as keyof typeof availability][slot as keyof typeof availability.Mon]
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-gray-100 text-gray-400 border border-gray-200"
                }`}
              >
                {availability[day as keyof typeof availability][slot as keyof typeof availability.Mon] ? (
                  <span>✓</span>
                ) : (
                  <span>✗</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      <div className="pt-4 border-t border-border">
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
            <span>Unavailable</span>
          </div>
        </div>
        
        <Button className="w-full">Book Appointment</Button>
      </div>
    </div>
  )
}
