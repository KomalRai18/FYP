import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to run Python script
const runPythonScript = (mode, input) => {
    return new Promise((resolve, reject) => {
        const pythonScriptPath = path.join(__dirname, '..', 'ml_model', 'fake_news_detector.py');
        const pythonProcess = spawn('python3', [pythonScriptPath, mode, input]);
        
        let dataString = '';
        let errorString = '';
        
        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });
        
        pythonProcess.on('close', (code) => {
            if (code === 0) {
                try {
                    const result = JSON.parse(dataString);
                    resolve(result);
                } catch (parseError) {
                    reject({
                        error: 'Failed to parse Python script output',
                        details: parseError.message,
                        raw_output: dataString
                    });
                }
            } else {
                reject({
                    error: 'Python script execution failed',
                    exit_code: code,
                    stderr: errorString,
                    stdout: dataString
                });
            }
        });
        
        pythonProcess.on('error', (error) => {
            reject({
                error: 'Failed to start Python process',
                details: error.message
            });
        });
    });
};

// Analyze text for fake news detection
export const analyzeText = async (req, res) => {
    try {
        const { text } = req.body;
        
        // Validate input
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Text input is required and must be a non-empty string'
            });
        }
        
        if (text.length > 10000) {
            return res.status(400).json({
                success: false,
                error: 'Text input is too long. Maximum 10,000 characters allowed.'
            });
        }
        
        // Run prediction
        const result = await runPythonScript('predict_text', text);
        
        if (result.error) {
            return res.status(500).json({
                success: false,
                error: result.error,
                details: result
            });
        }
        
        // Return successful response
        res.status(200).json({
            success: true,
            data: {
                input_text: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
                prediction: result.prediction,
                confidence: Math.round(result.confidence * 100) / 100,
                probability_real: Math.round(result.probability_real * 100) / 100,
                probability_fake: Math.round(result.probability_fake * 100) / 100,
                analysis_type: 'text'
            },
            message: `The news appears to be ${result.prediction} with ${Math.round(result.confidence * 100)}% confidence.`
        });
        
    } catch (error) {
        console.error('Error in analyzeText:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during text analysis',
            details: error.message
        });
    }
};

// Analyze URL for fake news detection
export const analyzeUrl = async (req, res) => {
    try {
        const { url } = req.body;
        
        // Validate input
        if (!url || typeof url !== 'string' || url.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'URL input is required and must be a non-empty string'
            });
        }
        
        // Basic URL validation
        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        if (!urlPattern.test(url)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid URL format. Please provide a valid HTTP/HTTPS URL.'
            });
        }
        
        // Ensure URL has protocol
        let processedUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            processedUrl = 'https://' + url;
        }
        
        // Run prediction
        const result = await runPythonScript('predict_url', processedUrl);
        
        if (result.error) {
            return res.status(500).json({
                success: false,
                error: result.error,
                details: result
            });
        }
        
        // Return successful response
        res.status(200).json({
            success: true,
            data: {
                input_url: processedUrl,
                extracted_text: result.extracted_text || 'Text extraction failed',
                prediction: result.prediction,
                confidence: Math.round(result.confidence * 100) / 100,
                probability_real: Math.round(result.probability_real * 100) / 100,
                probability_fake: Math.round(result.probability_fake * 100) / 100,
                analysis_type: 'url'
            },
            message: `The news from the URL appears to be ${result.prediction} with ${Math.round(result.confidence * 100)}% confidence.`
        });
        
    } catch (error) {
        console.error('Error in analyzeUrl:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during URL analysis',
            details: error.message
        });
    }
};

// Train the model (admin functionality)
export const trainModel = async (req, res) => {
    try {
        const { texts, labels } = req.body;
        
        // Validate input
        if (!texts || !labels || !Array.isArray(texts) || !Array.isArray(labels)) {
            return res.status(400).json({
                success: false,
                error: 'Both texts and labels arrays are required for training'
            });
        }
        
        if (texts.length !== labels.length) {
            return res.status(400).json({
                success: false,
                error: 'Texts and labels arrays must have the same length'
            });
        }
        
        if (texts.length < 10) {
            return res.status(400).json({
                success: false,
                error: 'Minimum 10 training samples required'
            });
        }
        
        // Validate labels (should be 0 for fake, 1 for real)
        const validLabels = labels.every(label => label === 0 || label === 1);
        if (!validLabels) {
            return res.status(400).json({
                success: false,
                error: 'Labels must be 0 (fake) or 1 (real)'
            });
        }
        
        // Create training data file
        const trainingData = { texts, labels };
        const trainingDataPath = path.join(__dirname, '..', 'ml_model', 'training_data.json');
        
        // Write training data to file
        await import('fs/promises').then(fs => 
            fs.writeFile(trainingDataPath, JSON.stringify(trainingData, null, 2))
        );
        
        // Run training
        const result = await runPythonScript('train', trainingDataPath);
        
        if (result.error) {
            return res.status(500).json({
                success: false,
                error: result.error,
                details: result
            });
        }
        
        // Clean up training data file
        await import('fs/promises').then(fs => 
            fs.unlink(trainingDataPath).catch(() => {})
        );
        
        // Return successful response
        res.status(200).json({
            success: true,
            data: {
                accuracy: Math.round(result.accuracy * 100) / 100,
                training_samples: texts.length,
                model_saved: true
            },
            message: `Model trained successfully with ${Math.round(result.accuracy * 100)}% accuracy.`
        });
        
    } catch (error) {
        console.error('Error in trainModel:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error during model training',
            details: error.message
        });
    }
};

// Get model status
export const getModelStatus = async (req, res) => {
    try {
        const modelPath = path.join(__dirname, '..', 'ml_model', 'fake_news_model.h5');
        const tokenizerPath = path.join(__dirname, '..', 'ml_model', 'tokenizer.pkl');
        
        const fs = await import('fs/promises');
        
        const modelExists = await fs.access(modelPath).then(() => true).catch(() => false);
        const tokenizerExists = await fs.access(tokenizerPath).then(() => true).catch(() => false);
        
        let modelStats = null;
        if (modelExists) {
            try {
                const stats = await fs.stat(modelPath);
                modelStats = {
                    size: Math.round(stats.size / 1024 / 1024 * 100) / 100, // Size in MB
                    created: stats.birthtime,
                    modified: stats.mtime
                };
            } catch (error) {
                console.error('Error getting model stats:', error);
            }
        }
        
        res.status(200).json({
            success: true,
            data: {
                model_trained: modelExists && tokenizerExists,
                model_exists: modelExists,
                tokenizer_exists: tokenizerExists,
                model_stats: modelStats,
                ready_for_prediction: modelExists && tokenizerExists
            },
            message: modelExists && tokenizerExists 
                ? 'Model is trained and ready for predictions'
                : 'Model needs to be trained before making predictions'
        });
        
    } catch (error) {
        console.error('Error in getModelStatus:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while checking model status',
            details: error.message
        });
    }
};

// Health check endpoint
export const healthCheck = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: {
                service: 'Fake News Detection API',
                status: 'healthy',
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            },
            message: 'Service is running normally'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Health check failed',
            details: error.message
        });
    }
};