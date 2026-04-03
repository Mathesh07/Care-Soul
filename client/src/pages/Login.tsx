import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { authService } from "../services/authService"
import { useAuth } from "../contexts/AuthContext"
import { Heart, Stethoscope, Mail, Lock, Eye, EyeOff, User, Activity, ArrowLeft } from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [stage, setStage] = useState<"credentials" | "otp">("credentials")
  const [resendCountdown, setResendCountdown] = useState(0)
  const [success, setSuccess] = useState("")
  const navigate = useNavigate()
  const { login } = useAuth()
  const [searchParams] = useSearchParams()

  // Check for token expiry redirect on component mount
  useEffect(() => {
    const tokenExpired = searchParams.get("tokenExpired")
    const emailParam = searchParams.get("email")

    if (tokenExpired === "true" && emailParam) {
      const decodedEmail = decodeURIComponent(emailParam)
      setEmail(decodedEmail)
      setStage("otp")
      setSuccess("Your session has expired. Please verify with OTP to continue.")
    }
  }, [searchParams])

  // Handle resend countdown
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCountdown])

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const response = await authService.login({ email, password })

      // If token is present, user is logged in (no OTP needed)
      if (response.token && response.user) {
        login(response.token, response.user)
        // Redirect based on user role
        const redirectPath = response.user.role === 'doctor' ? '/doctor/dashboard' : 
          response.user.role === 'admin' ? '/admin' : 
          '/patient/dashboard'
        navigate(redirectPath)
      } else if (response.requiresOtp) {
        // OTP required
        setStage("otp")
        setPassword("")
        setSuccess("OTP sent to your email. Please verify to continue.")
      } else {
        setError(response.message || "Login failed")
      }
    } catch (err: any) {
      // Check if the error is about unverified email (requiresOtp)
      const errorResponse = err.response?.data
      if (err.response?.status === 403 && errorResponse?.requiresOtp) {
        setStage("otp")
        setPassword("")
        setSuccess("OTP sent to your email. Please verify to continue.")
      } else {
        setError(errorResponse?.message || "An error occurred during login")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      return
    }

    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const response = await authService.verifyOtp(email, otp)

      if (response.token && response.user) {
        login(response.token, response.user)
        // Redirect based on user role
        const redirectPath = response.user.role === 'doctor' ? '/doctor/dashboard' : 
          response.user.role === 'admin' ? '/admin' : 
          '/patient/dashboard'
        navigate(redirectPath)
      } else {
        setError(response.message || "OTP verification failed")
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred during OTP verification")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    try {
      setLoading(true)
      setError("")
      setSuccess("")

      const response = await authService.resendOtp(email)

      setSuccess("OTP resent to your email")
      setResendCountdown(60)
      setOtp("")
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend OTP")
    } finally {
      setLoading(false)
    }
  }

  const handleBackToCredentials = () => {
    setStage("credentials")
    setOtp("")
    setError("")
    setSuccess("")
    setResendCountdown(0)
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
              {stage === "credentials" && (
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h2>
                  <p className="text-foreground/70">Sign in to access your healthcare dashboard</p>
                </div>
              )}

              {stage === "otp" && (
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-foreground mb-2">Verify Your Email</h2>
                  <p className="text-foreground/70">Enter the OTP sent to {email}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Credentials Stage */}
              {stage === "credentials" && (
                <form onSubmit={handleCredentialsSubmit} className="space-y-6">
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
              )}

              {/* OTP Stage */}
              {stage === "otp" && (
                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground/80 flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Enter OTP
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                        className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all duration-200 bg-background/80 backdrop-blur-sm"
                        placeholder="000000"
                        required
                      />
                    </div>
                    <p className="text-xs text-foreground/50 text-center">Enter the 6-digit code sent to your email</p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg" 
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Verifying...
                      </div>
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>

                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCountdown > 0 || loading}
                      className="text-sm text-primary hover:text-primary/80 transition-colors disabled:text-foreground/40 disabled:cursor-not-allowed font-medium"
                    >
                      {resendCountdown > 0 ? `Resend OTP in ${resendCountdown}s` : "Resend OTP"}
                    </button>

                    <button
                      type="button"
                      onClick={handleBackToCredentials}
                      className="flex items-center justify-center gap-2 text-sm text-foreground/70 hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Login
                    </button>
                  </div>
                </form>
              )}

              {/* Sign Up Link */}
              {stage === "credentials" && (
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
              )}
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
