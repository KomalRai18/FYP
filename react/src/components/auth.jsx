"use client"
import { useState } from "react"
import { Shield, Eye, EyeOff, Mail, Lock, User, ArrowRight, Phone } from "lucide-react"
import axios from "axios"
import toast, { Toaster } from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { setUser, setLoading } from "../redux/userSlicer.jsx"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api"

function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  // Form states
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")

  const navigate = useNavigate()
  const dispatch = useDispatch()

  // FIX: Change from store.data.isLoading to store.user.isLoading
  const isLoading = useSelector((store) => store.user.isLoading)

  function loginHandler() {
    setIsLogin(!isLogin)
    // Clear form when switching
    setName("")
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setPhoneNumber("")
  }

  async function getInputData(e) {
    e.preventDefault()
    dispatch(setLoading(true))

    if (isLogin) {
      // Login Logic
      const user = { email, password }
      try {
        const res = await axios.post(`${API_BASE_URL}/users/login`, user, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        })

        console.log(res)
        if (res.data.success) {
          toast.success(res.data.message || "Login successful!")
          dispatch(setUser(res.data.data.user))
          navigate("/dashboard") // or wherever you want to redirect
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Login failed!")
        console.log("User failed to Log in!", error)
      } finally {
        dispatch(setLoading(false))
      }
    } else {
      // Signup Logic
      const user = { name, email, password, confirmPassword, phoneNumber }
      try {
        const res = await axios.post(`${API_BASE_URL}/users/signup`, user, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        })

        console.log(res)
        if (res.data.success) {
          toast.success(res.data.message || "Account created successfully!")
          dispatch(setUser(res.data.data.user))
          navigate("/dashboard") // or wherever you want to redirect
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Signup failed!")
        console.log("User failed to sign up", error)
      } finally {
        dispatch(setLoading(false))
      }
    }

    // Clear form
    setEmail("")
    setName("")
    setPassword("")
    setConfirmPassword("")
    setPhoneNumber("")
  }

  async function handleForgotPassword(e) {
    e.preventDefault()
    dispatch(setLoading(true))

    try {
      const res = await axios.post(
        `${API_BASE_URL}/users/forgot-password`,
        { email: forgotPasswordEmail },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      )

      if (res.data.success) {
        toast.success(res.data.message || "Password reset email sent!")
        setForgotPasswordEmail("")
        setShowForgotPassword(false)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset email!")
      console.log("Forgot password failed!", error)
    } finally {
      dispatch(setLoading(false))
    }
  }

  // Show forgot password form
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Toaster position="top-right" />
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Shield className="w-10 h-10 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">TruthCheck AI</h1>
            </div>
            <p className="text-gray-600">Reset your password</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg border">
            <div className="p-6">
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label htmlFor="forgotEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="forgotEmail"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <span>Send Reset Email</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">TruthCheck AI</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center p-4 pt-16">
        <div className="max-w-md w-full">
          {/* Hero Text */}
          <div className="text-center mb-8">
            <p className="text-gray-600">
              {isLogin ? "Welcome back! Sign in to your account" : "Create your account to get started"}
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-white rounded-lg shadow-lg border">
            {/* Tab Switcher */}
            <div className="flex bg-gray-50 rounded-t-lg">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-4 px-6 text-center font-medium rounded-tl-lg transition-all ${
                  isLogin ? "bg-white text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-4 px-6 text-center font-medium rounded-tr-lg transition-all ${
                  !isLogin ? "bg-white text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <div className="p-6">
              <form onSubmit={getInputData} className="space-y-4">
                {/* Name Field (Sign Up Only) */}
                {!isLogin && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your full name"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                {/* Phone Number Field (Sign Up Only) */}
                {!isLogin && (
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+92xxxxxxxxxx"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field (Sign Up Only) */}
                {!isLogin && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Confirm your password"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                )}

                {/* Forgot Password (Login Only) */}
                {isLogin && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}

                {/* Terms and Conditions (Sign Up Only) */}
                {!isLogin && (
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="terms"
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      required
                    />
                    <label htmlFor="terms" className="text-sm text-gray-600">
                      I agree to the{" "}
                      <button type="button" className="text-blue-600 hover:text-blue-800 hover:underline">
                        Terms of Service
                      </button>{" "}
                      and{" "}
                      <button type="button" className="text-blue-600 hover:text-blue-800 hover:underline">
                        Privacy Policy
                      </button>
                    </label>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <span>{isLogin ? "Sign In" : "Create Account"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <span
                    className="text-blue-600 cursor-pointer hover:text-blue-800 hover:underline font-medium"
                    onClick={loginHandler}
                  >
                    {isLogin ? "Sign up here" : "Sign in here"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Secure & Private</h4>
                <p className="text-sm text-blue-800 mt-1">
                  Your data is encrypted and protected. We never share your information with third parties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth
