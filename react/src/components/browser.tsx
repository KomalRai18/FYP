"use client"

import { useState } from "react"
import {
  Shield,
  AlertTriangle,
  Upload,
  Link,
  Type,
  Clock,
  TrendingUp,
  Eye,
  Share,
  CheckCircle,
  XCircle,
  Info,
  History,
  BookOpen,
} from "lucide-react"

interface AnalysisResult {
  id: string
  confidence: number
  verdict: "fake" | "real" | "uncertain"
  factors: {
    languagePattern: number
    accountCredibility: number
    contentConsistency: number
    temporalAnalysis: number
  }
  explanation: string
  timestamp: Date
  inputType: "url" | "text" | "image"
  preview: string
}
function Browser() {
  const [activeTab, setActiveTab] = useState("url")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [inputValue, setInputValue] = useState("")

  // Mock analysis function
  const analyzeContent = async () => {
    setIsAnalyzing(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const mockResult: AnalysisResult = {
      id: Date.now().toString(),
      confidence: Math.random() * 100,
      verdict: Math.random() > 0.5 ? "fake" : "real",
      factors: {
        languagePattern: Math.random() * 100,
        accountCredibility: Math.random() * 100,
        contentConsistency: Math.random() * 100,
        temporalAnalysis: Math.random() * 100,
      },
      explanation:
        "Based on our AI analysis, this content shows patterns consistent with misinformation due to unusual language patterns and inconsistent temporal markers.",
      timestamp: new Date(),
      inputType: activeTab as "url" | "text" | "image",
      preview: inputValue.slice(0, 100) + "...",
    }

    setResult(mockResult)
    setIsAnalyzing(false)
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "fake":
        return "text-red-600 bg-red-50 border-red-200"
      case "real":
        return "text-green-600 bg-green-50 border-green-200"
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
    }
  }

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case "fake":
        return <XCircle className="w-5 h-5" />
      case "real":
        return <CheckCircle className="w-5 h-5" />
      default:
        return <Info className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">TruthCheck AI</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                <History className="w-4 h-4" />
                <span>History</span>
              </button>
              <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                <BookOpen className="w-4 h-4" />
                <span>Learn</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Analysis Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <div className="text-center py-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Detect Fake News with AI</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Upload tweets, paste URLs, or enter text to analyze content authenticity using advanced AI algorithms
              </p>
            </div>

            {/* Input Section */}
            <div className="bg-white rounded-lg border shadow-lg">
              <div className="p-6 border-b">
                <h3 className="text-2xl font-semibold flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span>Analyze Content</span>
                </h3>
              </div>
              <div className="p-6">
                {/* Tab Navigation */}
                <div className="flex bg-gray-100 rounded-md p-1 mb-6">
                  <button
                    onClick={() => setActiveTab("url")}
                    className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-sm text-sm font-medium transition-all ${
                      activeTab === "url" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Link className="w-4 h-4" />
                    <span>Tweet URL</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("text")}
                    className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-sm text-sm font-medium transition-all ${
                      activeTab === "text" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Type className="w-4 h-4" />
                    <span>Text</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("image")}
                    className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-sm text-sm font-medium transition-all ${
                      activeTab === "image" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Screenshot</span>
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === "url" && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="https://twitter.com/username/status/..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full px-3 py-2 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                {activeTab === "text" && (
                  <div className="space-y-4">
                    <textarea
                      placeholder="Paste the tweet content here..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full min-h-32 px-3 py-2 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                {activeTab === "image" && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg text-gray-600 mb-2">Drop screenshot here or click to upload</p>
                      <p className="text-sm text-gray-500">Supports PNG, JPG, JPEG files</p>
                      <button className="mt-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                        Choose File
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={analyzeContent}
                  disabled={!inputValue || isAnalyzing}
                  className="w-full mt-6 px-8 py-3 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Analyze Content</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Results Section */}
            {result && (
              <div className="bg-white rounded-lg border shadow-lg">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-semibold flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      <span>Analysis Results</span>
                    </h3>
                    <div className="flex items-center space-x-1 px-2.5 py-0.5 text-xs font-semibold border rounded-full">
                      <Clock className="w-3 h-3" />
                      <span>{result.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {/* Main Verdict */}
                  <div className={`p-6 rounded-lg border-2 ${getVerdictColor(result.verdict)}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getVerdictIcon(result.verdict)}
                        <span className="text-2xl font-bold capitalize">{result.verdict}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">{result.confidence.toFixed(1)}%</div>
                        <div className="text-sm opacity-75">Confidence</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all"
                        style={{ width: `${result.confidence}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Detailed Analysis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Analysis Factors</h4>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Language Pattern</span>
                          <span className="font-medium">{result.factors.languagePattern.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${result.factors.languagePattern}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Account Credibility</span>
                          <span className="font-medium">{result.factors.accountCredibility.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${result.factors.accountCredibility}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Content Consistency</span>
                          <span className="font-medium">{result.factors.contentConsistency.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${result.factors.contentConsistency}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Temporal Analysis</span>
                          <span className="font-medium">{result.factors.temporalAnalysis.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${result.factors.temporalAnalysis}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">AI Explanation</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">{result.explanation}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4 border-t">
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                      <Share className="w-4 h-4" />
                      <span>Share Results</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Analyses */}
            <div className="bg-white rounded-lg border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <History className="w-5 h-5 text-gray-600" />
                  <span>Recent Analyses</span>
                </h3>
              </div>
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                          i % 2 === 0 ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {i % 2 === 0 ? "Fake" : "Real"}
                      </span>
                      <span className="text-xs text-gray-500">2h ago</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">Breaking: Major news event happening...</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-lg border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                  <span>Your Stats</span>
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">127</div>
                  <div className="text-sm text-gray-600">Total Analyses</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-semibold text-green-600">89</div>
                    <div className="text-xs text-gray-600">Real</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-red-600">38</div>
                    <div className="text-xs text-gray-600">Fake</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-lg border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-gray-600" />
                  <span>Detection Tips</span>
                </h3>
              </div>
              <div className="p-6 space-y-3">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <p className="text-sm text-blue-800">
                      Check the source credibility and cross-reference with multiple sources.
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <p className="text-sm text-blue-800">Look for emotional language and sensational claims.</p>
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

export default Browser
