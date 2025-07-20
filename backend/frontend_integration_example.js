// Frontend Integration Example for Fake News Detection API
// This file shows how to integrate the API with your React frontend

// API Service Class
class FakeNewsAPI {
  constructor(baseURL = 'http://localhost:3000/api/twitter') {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Check API health
  async checkHealth() {
    return this.request('/health');
  }

  // Check model status
  async getModelStatus() {
    return this.request('/model/status');
  }

  // Analyze text for fake news
  async analyzeText(text) {
    return this.request('/analyze/text', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  // Analyze URL for fake news
  async analyzeURL(url) {
    return this.request('/analyze/url', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  // Train model (admin function)
  async trainModel(texts, labels) {
    return this.request('/model/train', {
      method: 'POST',
      body: JSON.stringify({ texts, labels }),
    });
  }
}

// React Hook for Fake News Detection
export const useFakeNewsDetection = () => {
  const [api] = useState(() => new FakeNewsAPI());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const analyzeText = async (text) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.analyzeText(text);
      setResult(response);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const analyzeURL = async (url) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.analyzeURL(url);
      setResult(response);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkModelStatus = async () => {
    try {
      const response = await api.getModelStatus();
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    analyzeText,
    analyzeURL,
    checkModelStatus,
    loading,
    error,
    result,
  };
};

// React Component Example
export const FakeNewsDetector = () => {
  const { analyzeText, analyzeURL, checkModelStatus, loading, error, result } = useFakeNewsDetection();
  const [inputText, setInputText] = useState('');
  const [inputURL, setInputURL] = useState('');
  const [activeTab, setActiveTab] = useState('text');
  const [modelStatus, setModelStatus] = useState(null);

  useEffect(() => {
    // Check model status on component mount
    checkModelStatus()
      .then(setModelStatus)
      .catch(console.error);
  }, []);

  const handleTextAnalysis = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      await analyzeText(inputText);
    } catch (err) {
      console.error('Text analysis failed:', err);
    }
  };

  const handleURLAnalysis = async (e) => {
    e.preventDefault();
    if (!inputURL.trim()) return;

    try {
      await analyzeURL(inputURL);
    } catch (err) {
      console.error('URL analysis failed:', err);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPredictionIcon = (prediction) => {
    return prediction === 'real' ? '✅' : '❌';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-6">
        Fake News Detection
      </h2>

      {/* Model Status */}
      {modelStatus && (
        <div className={`mb-6 p-4 rounded-lg ${
          modelStatus.data.ready_for_prediction 
            ? 'bg-green-100 border-green-500' 
            : 'bg-red-100 border-red-500'
        } border`}>
          <p className="font-semibold">
            Model Status: {modelStatus.data.ready_for_prediction ? 'Ready' : 'Not Ready'}
          </p>
          <p className="text-sm text-gray-600">{modelStatus.message}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex mb-6 border-b">
        <button
          className={`px-4 py-2 font-semibold ${
            activeTab === 'text' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('text')}
        >
          Analyze Text
        </button>
        <button
          className={`px-4 py-2 font-semibold ${
            activeTab === 'url' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-600'
          }`}
          onClick={() => setActiveTab('url')}
        >
          Analyze URL
        </button>
      </div>

      {/* Text Analysis Form */}
      {activeTab === 'text' && (
        <form onSubmit={handleTextAnalysis} className="mb-6">
          <div className="mb-4">
            <label htmlFor="newsText" className="block text-sm font-medium text-gray-700 mb-2">
              Enter news text to analyze:
            </label>
            <textarea
              id="newsText"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="6"
              placeholder="Paste the news article text here..."
              maxLength="10000"
            />
            <p className="text-sm text-gray-500 mt-1">
              {inputText.length}/10,000 characters
            </p>
          </div>
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Analyze Text'}
          </button>
        </form>
      )}

      {/* URL Analysis Form */}
      {activeTab === 'url' && (
        <form onSubmit={handleURLAnalysis} className="mb-6">
          <div className="mb-4">
            <label htmlFor="newsURL" className="block text-sm font-medium text-gray-700 mb-2">
              Enter news article URL:
            </label>
            <input
              type="url"
              id="newsURL"
              value={inputURL}
              onChange={(e) => setInputURL(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/news-article"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !inputURL.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyzing...' : 'Analyze URL'}
          </button>
        </form>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Analyzing content...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Results */}
      {result && result.success && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Analysis Results</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-700 mb-2">Prediction</h4>
              <p className="text-2xl font-bold">
                {getPredictionIcon(result.data.prediction)} {result.data.prediction.toUpperCase()}
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-700 mb-2">Confidence</h4>
              <p className={`text-2xl font-bold ${getConfidenceColor(result.data.confidence)}`}>
                {Math.round(result.data.confidence * 100)}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-700 mb-2">Probability Real</h4>
              <p className="text-lg text-green-600">
                {Math.round(result.data.probability_real * 100)}%
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-700 mb-2">Probability Fake</h4>
              <p className="text-lg text-red-600">
                {Math.round(result.data.probability_fake * 100)}%
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 font-medium">{result.message}</p>
          </div>

          {result.data.extracted_text && (
            <div className="mt-4 bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-700 mb-2">Extracted Text Preview</h4>
              <p className="text-sm text-gray-600 line-clamp-3">
                {result.data.extracted_text}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Usage in your main App component:
/*
import { FakeNewsDetector } from './components/FakeNewsDetector';

function App() {
  return (
    <div className="App">
      <FakeNewsDetector />
    </div>
  );
}
*/