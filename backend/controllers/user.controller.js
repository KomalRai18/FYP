import { User } from "../database/user.db.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import nodemailer from "nodemailer"
import ApiError from "../common/helper/error.handler.js"

// Configure nodemailer (you'll need to set up your email service)
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT, // or your email service
  auth: {
    user: process.env.MAILTRAP_AUTH_USER,
    pass: process.env.MAILTRAP_AUTH_PASS,
  },
})

// Signup Controller
export const signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phoneNumber } = req.body

    // Check if all required fields are provided
    if (!name || !email || !password || !confirmPassword || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    })

    if (existingUser) {
      throw new ApiError(409, "User with email or phone number already exists")
    }

    // Create new user (password hashing will be handled by pre-save middleware)
    const newUser = new User({
      name,
      email,
      password,
      confirmPassword,
      phoneNumber,
    })

    // Save user to database
    const savedUser = await newUser.save()

    // Remove password and confirmPassword from response
    const userResponse = savedUser.toObject()
    delete userResponse.password
    delete userResponse.confirmPassword

    // Generate tokens
    const accessToken = savedUser.generateAccessToken()
    const refreshToken = savedUser.generateRefreshToken()

    // Set cookies
    const cookieOptions = {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }

    res
      .status(201)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }) // 7 days
      .json({
        success: true,
        message: "User registered successfully",
        data: {
          user: userResponse,
          accessToken,
          refreshToken,
        },
      })
  } catch (error) {
    console.error("Signup Error:", error)

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      })
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0]
      return res.status(409).json({
        success: false,
        message: `${field} already exists`,
      })
    }

    res.status(500).json({
      success: false,
      message: "Internal server error during signup",
    })
  }
}

// Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      })
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    // Generate tokens
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    // Remove password from response
    const userResponse = user.toObject()
    delete userResponse.password
    delete userResponse.confirmPassword

    // Set cookies
    const cookieOptions = {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }

    res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }) // 7 days
      .json({
        success: true,
        message: "Login successful",
        data: {
          user: userResponse,
          accessToken,
          refreshToken,
        },
      })
  } catch (error) {
    console.error("Login Error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error during login",
    })
  }
}

// Forgot Password Controller
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      })
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email address",
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex")

    // Set reset token and expiry (you'll need to add these fields to your schema)
    user.passwordResetToken = resetTokenHash
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000 // 10 minutes

    await user.save({ validateBeforeSave: false })

    // Create reset URL
    const resetURL = `${req.protocol}://${req.get("host")}/api/users/reset-password/${resetToken}`

    // Email message
    const message = `
            <h2>Password Reset Request</h2>
            <p>You have requested a password reset for your TruthCheck AI account.</p>
            <p>Please click the link below to reset your password:</p>
            <a href="${resetURL}" style="display: inline-block; padding: 10px 20px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>This link will expire in 10 minutes.</p>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <br>
            <p>Best regards,<br>TruthCheck AI Team</p>
        `

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Password Reset Request - TruthCheck AI",
        html: message,
      })

      res.status(200).json({
        success: true,
        message: "Password reset email sent successfully",
      })
    } catch (emailError) {
      console.error("Email Error:", emailError)

      // Remove reset token if email fails
      user.passwordResetToken = undefined
      user.passwordResetExpires = undefined
      await user.save({ validateBeforeSave: false })

      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email",
      })
    }
  } catch (error) {
    console.error("Forgot Password Error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error during password reset request",
    })
  }
}

// Reset Password Controller
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params
    const { password, confirmPassword } = req.body

    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password are required",
      })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password do not match",
      })
    }

    // Hash the token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      })
    }

    // Update password
    user.password = password
    user.confirmPassword = confirmPassword
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined

    await user.save()

    // Generate new tokens
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    // Set cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }

    res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 })
      .json({
        success: true,
        message: "Password reset successful",
        data: {
          accessToken,
          refreshToken,
        },
      })
  } catch (error) {
    console.error("Reset Password Error:", error)

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      })
    }

    res.status(500).json({
      success: false,
      message: "Internal server error during password reset",
    })
  }
}

// Logout Controller
export const logout = async (req, res) => {
  try {
    res.status(200).clearCookie("accessToken").clearCookie("refreshToken").json({
      success: true,
      message: "Logout successful",
    })
  } catch (error) {
    console.error("Logout Error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error during logout",
    })
  }
}

// Refresh Token Controller
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token not provided",
      })
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN)

    // Find user
    const user = await User.findById(decoded._id)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      })
    }

    // Generate new access token
    const newAccessToken = user.generateAccessToken()

    // Set new access token cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }

    res
      .status(200)
      .cookie("accessToken", newAccessToken, cookieOptions)
      .json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          accessToken: newAccessToken,
        },
      })
  } catch (error) {
    console.error("Refresh Token Error:", error)
    res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    })
  }
}
