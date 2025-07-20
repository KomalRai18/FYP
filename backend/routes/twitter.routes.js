import express from 'express';
import { 
    analyzeText, 
    analyzeUrl, 
    trainModel, 
    getModelStatus, 
    healthCheck 
} from '../controllers/twitter.controller.js';

const twitterRouter = express.Router();

// Health check endpoint
twitterRouter.get('/health', healthCheck);

// Model status endpoint
twitterRouter.get('/model/status', getModelStatus);

// Text analysis endpoint
twitterRouter.post('/analyze/text', analyzeText);

// URL analysis endpoint
twitterRouter.post('/analyze/url', analyzeUrl);

// Model training endpoint (admin functionality)
twitterRouter.post('/model/train', trainModel);

export default twitterRouter;