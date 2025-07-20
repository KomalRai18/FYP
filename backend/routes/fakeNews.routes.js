import express from 'express'
import { 
  analyzeText, 
  analyzeUrl, 
  analyzeContent, 
  checkAIServiceHealth 
} from '../controllers/fakeNews.controller.js'

const fakeNewsRouter = express.Router()

// Health check endpoint
fakeNewsRouter.get('/health', checkAIServiceHealth)

// Analyze text content
fakeNewsRouter.post('/analyze/text', analyzeText)

// Analyze Twitter URL
fakeNewsRouter.post('/analyze/url', analyzeUrl)

// Universal analyze endpoint
fakeNewsRouter.post('/analyze', analyzeContent)

export default fakeNewsRouter 