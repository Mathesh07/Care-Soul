import { Link } from "react-router-dom"
import { Heart, Mail, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-card to-card/80 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-foreground">CARE SOUL</h3>
            </div>
            <p className="text-sm text-foreground/60">
              Bridging healthcare gaps in rural communities with technology and compassion.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="#" className="text-foreground/60 hover:text-primary transition-colors duration-200 font-medium">
                  Appointments
                </Link>
              </li>
              <li>
                <Link to="#" className="text-foreground/60 hover:text-primary transition-colors duration-200 font-medium">
                  Telemedicine
                </Link>
              </li>
              <li>
                <Link to="#" className="text-foreground/60 hover:text-primary transition-colors duration-200 font-medium">
                  Health Records
                </Link>
              </li>
              <li>
                <Link to="#" className="text-foreground/60 hover:text-primary transition-colors duration-200 font-medium">
                  Emergency Services
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="#" className="text-foreground/60 hover:text-primary transition-colors duration-200 font-medium">
                  About
                </Link>
              </li>
              <li>
                <Link to="#" className="text-foreground/60 hover:text-primary transition-colors duration-200 font-medium">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="#" className="text-foreground/60 hover:text-primary transition-colors duration-200 font-medium">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="#" className="text-foreground/60 hover:text-primary transition-colors duration-200 font-medium">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="#" className="text-foreground/60 hover:text-primary transition-colors duration-200 font-medium">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="text-foreground/60 hover:text-primary transition-colors duration-200 font-medium">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="#" className="text-foreground/60 hover:text-primary transition-colors duration-200 font-medium">
                  Compliance
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Get In Touch</h4>
            <div className="space-y-3">
              <a href="mailto:contact@caresoul.com" className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors duration-200 text-sm font-medium">
                <Mail className="w-4 h-4" />
                contact@caresoul.com
              </a>
              <a href="tel:+1234567890" className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors duration-200 text-sm font-medium">
                <Phone className="w-4 h-4" />
                +1 (800) CARE-SOUL
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/40 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm text-foreground/50 font-medium">© 2026 CARE SOUL. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-foreground/60 hover:text-primary transition-colors duration-200 font-medium text-sm">
                Twitter
              </a>
              <a href="#" className="text-foreground/60 hover:text-primary transition-colors duration-200 font-medium text-sm">
                LinkedIn
              </a>
              <a href="#" className="text-foreground/60 hover:text-primary transition-colors duration-200 font-medium text-sm">
                Facebook
              </a>
              <a href="#" className="text-foreground/60 hover:text-primary transition-colors duration-200 font-medium text-sm">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
