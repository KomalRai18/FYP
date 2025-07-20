import axios from 'axios'
import ApiError from '../common/helper/error.handler.js'

// AI Service configuration
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000'

// Analyze text content for fake news
export const analyzeText = async (req, res) => {
  try {
    const { text } = req.body

    // Validate input
    if (!text || !text.trim()) {
      throw new ApiError(400, "Text content is required")
    }

    // Call AI service
    const response = await axios.post(`${AI_SERVICE_URL}/analyze/text`, {
      text: text.trim()
    })

    // Return the AI service response
    res.status(200).json({
      success: true,
      message: "Analysis completed successfully",
      data: response.data
    })

  } catch (error) {
    console.error("Text Analysis Error:", error)

    if (error.response?.data) {
      // Error from AI service
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data.error || "Analysis failed",
        error: error.response.data
      })
    }

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: "AI service is currently unavailable. Please try again later."
      })
    }

    res.status(500).json({
      success: false,
      message: "Internal server error during analysis"
    })
  }
}

// Analyze Twitter URL for fake news
export const analyzeUrl = async (req, res) => {
  try {
    const { url } = req.body

    // Validate input
    if (!url || !url.trim()) {
      throw new ApiError(400, "URL is required")
    }

    // Basic URL validation
    const urlPattern = /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/
    if (!urlPattern.test(url.trim())) {
      throw new ApiError(400, "Please provide a valid Twitter/X URL")
    }

    // Call AI service
    const response = await axios.post(`${AI_SERVICE_URL}/analyze/url`, {
      url: url.trim()
    })

    // Return the AI service response
    res.status(200).json({
      success: true,
      message: "Analysis completed successfully",
      data: response.data
    })

  } catch (error) {
    console.error("URL Analysis Error:", error)

    if (error.response?.data) {
      // Error from AI service
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data.error || "Analysis failed",
        error: error.response.data
      })
    }

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: "AI service is currently unavailable. Please try again later."
      })
    }

    res.status(500).json({
      success: false,
      message: "Internal server error during analysis"
    })
  }
}

// Universal analyze endpoint
export const analyzeContent = async (req, res) => {
  try {
    const { text, url } = req.body

    // Validate input
    if (!text && !url) {
      throw new ApiError(400, "Either text or URL is required")
    }

    if (text && url) {
      throw new ApiError(400, "Please provide either text or URL, not both")
    }

    // Call AI service
    const response = await axios.post(`${AI_SERVICE_URL}/analyze`, {
      text: text?.trim(),
      url: url?.trim()
    })

    // Return the AI service response
    res.status(200).json({
      success: true,
      message: "Analysis completed successfully",
      data: response.data
    })

  } catch (error) {
    console.error("Content Analysis Error:", error)

    if (error.response?.data) {
      // Error from AI service
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data.error || "Analysis failed",
        error: error.response.data
      })
    }

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: "AI service is currently unavailable. Please try again later."
      })
    }

    res.status(500).json({
      success: false,
      message: "Internal server error during analysis"
    })
  }
}

// Health check for AI service
export const checkAIServiceHealth = async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/health`)
    
    res.status(200).json({
      success: true,
      message: "AI service is healthy",
      data: response.data
    })

  } catch (error) {
    console.error("AI Service Health Check Error:", error)

    res.status(503).json({
      success: false,
      message: "AI service is not available",
      error: error.message
    })
  }
} 