import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { Button } from "../components/ui/button"
import { authService } from "../services/authService"
import { useAuth } from "../contexts/AuthContext"
import { Heart, User, Mail, Lock, Eye, EyeOff, Check, AlertCircle, ArrowRight, Shield, Activity } from "lucide-react"

export default function Register() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [focusedField, setFocusedField] = useState("")
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    try {
      setLoading(true)
      setError("")
      setSuccess("")
      
      const response = await authService.signup({ name, email, password })
      
      // Store pending registration data for OTP verification
      localStorage.setItem('pendingEmail', email)
      localStorage.setItem('pendingName', name)
      localStorage.setItem('pendingPassword', password)
      
      // For signup, the backend sends OTP verification email
      if (response.message) {
        setSuccess("Registration successful! Please check your email for OTP verification.")
        setTimeout(() => {
          navigate("/verify-otp", { state: { email } })
        }, 1500)
      } else {
        setError(response.message || "Registration failed")
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred during registration")
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { strength: 0, text: "Too short", color: "text-red-500" }
    if (password.length < 8) return { strength: 1, text: "Weak", color: "text-orange-500" }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return { strength: 2, text: "Fair", color: "text-yellow-500" }
    return { strength: 3, text: "Strong", color: "text-green-500" }
  }
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          {/* Back to Home */}
          <div className="mb-8">
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm text-foreground/70 hover:text-foreground transition-colors"
            >
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Back to sign in
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
                <p className="text-foreground/70">Get started with CareSoul today</p>
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 text-sm font-medium">Something went wrong</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-3">
              <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                <Check className="w-3 h-3 text-white" />
              </div>
              <div>
                <p className="text-emerald-800 text-sm font-medium">Check your email</p>
                <p className="text-emerald-700 text-sm mt-1">{success}</p>
              </div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground/80 mb-2">
                Full name
              </label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField('')}
                  className={`w-full px-4 py-3 pl-11 border rounded-xl transition-all duration-200 bg-background ${
                    focusedField === 'name' 
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                      : 'border-border hover:border-border/80'
                  }`}
                  placeholder="John Doe"
                  required
                />
                <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                  focusedField === 'name' ? 'text-emerald-500' : 'text-foreground/40'
                }`} />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-2">
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  className={`w-full px-4 py-3 pl-11 border rounded-xl transition-all duration-200 bg-background ${
                    focusedField === 'email' 
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                      : 'border-border hover:border-border/80'
                  }`}
                  placeholder="john@example.com"
                  required
                />
                <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                  focusedField === 'email' ? 'text-emerald-500' : 'text-foreground/40'
                }`} />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground/80 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  className={`w-full px-4 py-3 pl-11 pr-11 border rounded-xl transition-all duration-200 bg-background ${
                    focusedField === 'password' 
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                      : 'border-border hover:border-border/80'
                  }`}
                  placeholder="Create a strong password"
                  required
                  minLength={6}
                />
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                  focusedField === 'password' ? 'text-emerald-500' : 'text-foreground/40'
                }`} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-foreground/40 hover:text-foreground/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2 flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[0, 1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1 w-8 rounded-full transition-colors ${
                          level <= getPasswordStrength(password).strength
                            ? getPasswordStrength(password).strength === 0
                              ? 'bg-red-500'
                              : getPasswordStrength(password).strength === 1
                              ? 'bg-orange-500'
                              : getPasswordStrength(password).strength === 2
                              ? 'bg-yellow-500'
                              : 'bg-emerald-500'
                            : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-xs font-medium ${getPasswordStrength(password).color}`}>
                    {getPasswordStrength(password).text}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground/80 mb-2">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField('')}
                  className={`w-full px-4 py-3 pl-11 pr-11 border rounded-xl transition-all duration-200 bg-background ${
                    focusedField === 'confirmPassword' 
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                      : 'border-border hover:border-border/80'
                  }`}
                  placeholder="Confirm your password"
                  required
                  minLength={6}
                />
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${
                  focusedField === 'confirmPassword' ? 'text-emerald-500' : 'text-foreground/40'
                }`} />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-foreground/40 hover:text-foreground/70 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className="mt-2 flex items-center space-x-2">
                  {password === confirmPassword ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs text-emerald-600 font-medium">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-xs text-red-600 font-medium">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 w-4 h-4 text-emerald-600 border-border rounded focus:ring-emerald-500"
              />
              <label htmlFor="terms" className="ml-3 text-sm text-foreground/70">
                I agree to the{' '}
                <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || password !== confirmPassword || password.length < 6}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-muted disabled:to-muted text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-8 text-center">
            <p className="text-foreground/70">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Hero Section */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 items-center justify-center p-16 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full transform translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative z-10 text-white text-center max-w-lg">
          {/* Icon */}
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Activity className="w-10 h-10 text-white" />
          </div>

          {/* Content */}
          <h2 className="text-4xl font-bold mb-6">Join thousands taking control of their health</h2>
          <p className="text-lg opacity-90 mb-8 leading-relaxed">
            Experience healthcare that puts you first. Book appointments instantly, 
            connect with top doctors, and manage your health journey all in one place.
          </p>

          {/* Features */}
          <div className="space-y-4 text-left">
            <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Secure & Private</h3>
                <p className="text-sm opacity-80">Your health data is encrypted and protected</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Personalized Care</h3>
                <p className="text-sm opacity-80">Tailored healthcare solutions for your needs</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">24/7 Access</h3>
                <p className="text-sm opacity-80">Book appointments anytime, anywhere</p>
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-xl p-6 text-left">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <span className="text-lg font-bold">JD</span>
              </div>
              <div>
                <p className="font-semibold">Jane Doe</p>
                <p className="text-sm opacity-80">Patient since 2024</p>
              </div>
            </div>
            <p className="text-sm italic opacity-90">
              "CareSoul made managing my health so much easier. I can book appointments 
              with the best doctors in just a few clicks!"
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
