import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { authService } from "../services/authService"
import { useAuth } from "../contexts/AuthContext"
import { Heart, Stethoscope, Mail, Lock, Eye, EyeOff, User, Activity } from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    try {
      setLoading(true)
      setError("")
      
      const response = await authService.login({ email, password })
      
      // Check if response contains token (successful login)
      if (response.token && response.user) {
        login(response.token, response.user)
        navigate("/") // Redirect to home page instead of dashboard
      } else {
        setError(response.message || "Login failed")
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred during login")
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-accent/20 flex items-center justify-center p-4 text-foreground">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="bg-card/85 backdrop-blur-lg rounded-3xl shadow-2xl border border-border/60 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Login Form */}
            <div className="w-full lg:w-1/2 p-8 lg:p-12">
              {/* Logo */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Heart className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">CareSoul</h1>
                    <p className="text-sm text-foreground/70">Your Health, Our Priority</p>
                  </div>
                </div>
              </div>

              {/* Welcome Message */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h2>
                <p className="text-foreground/70">Sign in to access your healthcare dashboard</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 pl-12 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all duration-200 bg-background/80 backdrop-blur-sm"
                      placeholder="Enter your email"
                      required
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/80 flex items-center">
                    <Lock className="w-4 h-4 mr-2" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pl-12 pr-12 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all duration-200 bg-background/80 backdrop-blur-sm"
                      placeholder="Enter your password"
                      required
                    />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/40" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-foreground/40 hover:text-foreground/70 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="w-4 h-4 text-primary border-border rounded focus:ring-primary/40" />
                    <span className="ml-2 text-sm text-foreground/70">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-primary hover:text-primary/80 transition-colors">
                    Forgot password?
                  </a>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <User className="w-5 h-5 mr-2" />
                      Sign In
                    </div>
                  )}
                </Button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-8 text-center">
                <p className="text-foreground/70">
                  Don't have an account?{" "}
                  <Link 
                    to="/register" 
                    className="text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Sign up now
                  </Link>
                </p>
              </div>
            </div>

            {/* Right Side - Hero Section */}
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 p-8 lg:p-12 flex items-center justify-center">
              <div className="text-white text-center space-y-8">
                {/* Icon */}
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto">
                  <Stethoscope className="w-12 h-12 text-white" />
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-3xl font-bold mb-4">Your Health Journey Starts Here</h3>
                  <p className="text-lg opacity-90 mb-6">
                    Connect with trusted healthcare professionals, book appointments instantly, and manage your health records all in one place.
                  </p>
                  
                  {/* Features */}
                  <div className="grid grid-cols-1 gap-4 text-left">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Expert Doctors</h4>
                        <p className="text-sm opacity-80">Access qualified healthcare professionals</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <Heart className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Personal Care</h4>
                        <p className="text-sm opacity-80">Tailored healthcare solutions for you</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Secure Platform</h4>
                        <p className="text-sm opacity-80">Your health data is protected</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
