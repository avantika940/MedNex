/**
 * History Component
 * 
 * Displays user's search history with detailed analysis results and comprehensive analytics
 * PROTECTED ROUTE - Requires authentication
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  History, 
  Clock, 
  Trash2, 
  Download, 
  Search,
  TrendingUp,
  Calendar,
  FileText,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Target,
  AlertCircle,
  CheckCircle,
  Brain,
  Loader2
} from 'lucide-react';
import { getDiagnosisHistory, deleteDiagnosis } from '@/lib/customer-api';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

interface HistoryEntry {
  id: string;
  timestamp: Date;
  symptoms: string[];
  predicted_diseases: any[];
  originalQuery?: string;
  confidence: number;
}

function HistoryPageContent() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'confidence'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load history from backend API on component mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getDiagnosisHistory(0, 100);
      
      // Transform backend data to match frontend format
      const transformedHistory = data.map((entry: any) => ({
        id: entry.id,
        timestamp: new Date(entry.timestamp),
        symptoms: entry.symptoms || [],
        predicted_diseases: entry.predicted_diseases || [],
        originalQuery: entry.symptoms?.join(', ') || 'Symptom check',
        // Calculate average confidence from predicted diseases
        confidence: entry.predicted_diseases?.length > 0
          ? Math.round(
              entry.predicted_diseases.reduce((sum: number, disease: any) => sum + (disease.confidence || 0), 0) /
              entry.predicted_diseases.length
            )
          : 0
      }));
      
      setHistory(transformedHistory);
      setFilteredHistory(transformedHistory);
    } catch (err: any) {
      console.error('Failed to fetch history:', err);
      if (err.message?.includes('Not authenticated') || err.message?.includes('Failed to fetch')) {
        setError('Please log in to view your diagnosis history');
        // Redirect to login after a short delay
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError('Failed to load diagnosis history. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort history
  useEffect(() => {
    let filtered = history.filter(entry => 
      (entry.originalQuery || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.symptoms.some(symptom => 
        symptom.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    // Filter by confidence level
    if (filterBy !== 'all') {
      filtered = filtered.filter(entry => {
        if (filterBy === 'high') return entry.confidence >= 70;
        if (filterBy === 'medium') return entry.confidence >= 40 && entry.confidence < 70;
        if (filterBy === 'low') return entry.confidence < 40;
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return b.timestamp.getTime() - a.timestamp.getTime();
      } else {
        return b.confidence - a.confidence;
      }
    });

    setFilteredHistory(filtered);
  }, [history, searchTerm, sortBy, filterBy]);

  const clearHistory = async () => {
    if (confirm('Are you sure you want to clear all history? This will delete all your diagnosis records.')) {
      try {
        // Delete all entries from backend
        for (const entry of history) {
          await deleteDiagnosis(entry.id);
        }
        setHistory([]);
        setFilteredHistory([]);
      } catch (err) {
        console.error('Failed to clear history:', err);
        alert('Failed to clear history. Please try again.');
      }
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      await deleteDiagnosis(id);
      const updatedHistory = history.filter(entry => entry.id !== id);
      setHistory(updatedHistory);
      setFilteredHistory(filteredHistory.filter(entry => entry.id !== id));
    } catch (err) {
      console.error('Failed to delete entry:', err);
      alert('Failed to delete entry. Please try again.');
    }
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mednex-history-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'text-green-600 bg-green-100';
    if (confidence >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 70) return 'High';
    if (confidence >= 40) return 'Medium';
    return 'Low';
  };

  // Analytics calculations
  const getAnalytics = () => {
    if (history.length === 0) return null;

    // Confidence distribution
    const highConfidence = history.filter(h => h.confidence >= 70).length;
    const mediumConfidence = history.filter(h => h.confidence >= 40 && h.confidence < 70).length;
    const lowConfidence = history.filter(h => h.confidence < 40).length;

    // Most common symptoms
    const symptomFrequency: Record<string, number> = {};
    history.forEach(entry => {
      entry.symptoms.forEach(symptom => {
        symptomFrequency[symptom] = (symptomFrequency[symptom] || 0) + 1;
      });
    });
    const topSymptoms = Object.entries(symptomFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Most common predictions
    const predictionFrequency: Record<string, number> = {};
    history.forEach(entry => {
      entry.predicted_diseases.forEach((prediction: any) => {
        predictionFrequency[prediction.name] = (predictionFrequency[prediction.name] || 0) + 1;
      });
    });
    const topPredictions = Object.entries(predictionFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Activity over time (last 7 days)
    const now = new Date();
    const dayActivity = Array(7).fill(0);
    history.forEach(entry => {
      const daysDiff = Math.floor((now.getTime() - entry.timestamp.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < 7) {
        dayActivity[6 - daysDiff]++;
      }
    });

    return {
      confidenceDistribution: { high: highConfidence, medium: mediumConfidence, low: lowConfidence },
      topSymptoms,
      topPredictions,
      dayActivity,
      avgSymptoms: Math.round(history.reduce((acc, entry) => acc + entry.symptoms.length, 0) / history.length),
      avgPredictions: Math.round(history.reduce((acc, entry) => acc + entry.predicted_diseases.length, 0) / history.length)
    };
  };

  const analytics = getAnalytics();

  return (
    <div className="min-h-screen gradient-medical pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="glass-card rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-blue-100">
                <History className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Search History</h1>
                <p className="text-white mt-1">
                  Review your previous symptom analyses and predictions
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={exportHistory}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
                disabled={history.length === 0}
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
              <button
                onClick={clearHistory}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300"
                disabled={history.length === 0}
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-white" />
                <div>
                  <p className="text-2xl font-bold text-white">{history.length}</p>
                  <p className="text-white text-sm font-medium">Total Searches</p>
                </div>
              </div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-6 w-6 text-white" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {history.length > 0 
                      ? Math.round(history.reduce((acc, entry) => acc + entry.confidence, 0) / history.length)
                      : 0}%
                  </p>
                  <p className="text-white text-sm font-medium">Avg Confidence</p>
                </div>
              </div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Activity className="h-6 w-6 text-white" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {analytics?.avgSymptoms || 0}
                  </p>
                  <p className="text-white text-sm font-medium">Avg Symptoms</p>
                </div>
              </div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Target className="h-6 w-6 text-white" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {analytics?.avgPredictions || 0}
                  </p>
                  <p className="text-white text-sm font-medium">Avg Predictions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-95 text-gray-900 placeholder-gray-500 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'confidence')}
              className="px-4 py-2 bg-white bg-opacity-95 text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="date">Sort by Date</option>
              <option value="confidence">Sort by Confidence</option>
            </select>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as 'all' | 'high' | 'medium' | 'low')}
              className="px-4 py-2 bg-white bg-opacity-95 text-gray-900 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Confidence</option>
              <option value="high">High (70%+)</option>
              <option value="medium">Medium (40-69%)</option>
              <option value="low">Low (&lt;40%)</option>
            </select>
          </div>
        </div>

        {/* Analytics Dashboard - Only show if there's data */}
        {analytics && history.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Confidence Distribution Chart */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <PieChart className="h-6 w-6 text-black" />
                <h3 className="text-xl font-bold text-black">Confidence Distribution</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                    <span className="text-white font-medium">High Confidence (70%+)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-bold text-lg">{analytics.confidenceDistribution.high}</span>
                    <span className="text-green-200 text-sm ml-2">
                      ({Math.round((analytics.confidenceDistribution.high / history.length) * 100)}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${(analytics.confidenceDistribution.high / history.length) * 100}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                    <span className="text-white font-medium">Medium (40-69%)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-bold text-lg">{analytics.confidenceDistribution.medium}</span>
                    <span className="text-yellow-200 text-sm ml-2">
                      ({Math.round((analytics.confidenceDistribution.medium / history.length) * 100)}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${(analytics.confidenceDistribution.medium / history.length) * 100}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-red-400 rounded-full"></div>
                    <span className="text-white font-medium">Low (&lt;40%)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-bold text-lg">{analytics.confidenceDistribution.low}</span>
                    <span className="text-red-200 text-sm ml-2">
                      ({Math.round((analytics.confidenceDistribution.low / history.length) * 100)}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-red-400 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${(analytics.confidenceDistribution.low / history.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <BarChart3 className="h-6 w-6 text-black" />
                <h3 className="text-xl font-bold text-black">7-Day Activity</h3>
              </div>
              <div className="space-y-3">
                {analytics.dayActivity.map((count, index) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (6 - index));
                  const maxCount = Math.max(...analytics.dayActivity, 1);
                  
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-16 text-white text-sm font-medium">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-700 rounded-full h-6 relative">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2" 
                            style={{ width: `${Math.max((count / maxCount) * 100, count > 0 ? 10 : 0)}%` }}
                          >
                            {count > 0 && (
                              <span className="text-white text-xs font-medium">{count}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Symptoms */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <AlertCircle className="h-6 w-6 text-black" />
                <h3 className="text-xl font-bold text-black">Most Common Symptoms</h3>
              </div>
              <div className="space-y-4">
                {analytics.topSymptoms.length > 0 ? (
                  analytics.topSymptoms.map(([symptom, count], index) => (
                    <div key={symptom} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-full bg-orange-500 bg-opacity-20 flex items-center justify-center">
                          <span className="text-orange-200 text-xs font-bold">{index + 1}</span>
                        </div>
                        <span className="text-white font-medium">{symptom}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-orange-400 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${(count / analytics.topSymptoms[0][1]) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-orange-200 text-sm font-medium">{count}x</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-white text-center">No symptoms data yet</p>
                )}
              </div>
            </div>

            {/* Top Predictions */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Brain className="h-6 w-6 text-black" />
                <h3 className="text-xl font-bold text-black">Most Common Predictions</h3>
              </div>
              <div className="space-y-4">
                {analytics.topPredictions.length > 0 ? (
                  analytics.topPredictions.map(([prediction, count], index) => (
                    <div key={prediction} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center">
                          <span className="text-green-200 text-xs font-bold">{index + 1}</span>
                        </div>
                        <span className="text-white font-medium">{prediction}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-400 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${(count / analytics.topPredictions[0][1]) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-green-200 text-sm font-medium">{count}x</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-white text-center">No predictions data yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Insights Section */}
        {analytics && history.length > 0 && (
          <div className="glass-card rounded-2xl p-6 mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <CheckCircle className="h-6 w-6 text-black" />
              <h3 className="text-xl font-bold text-black">Health Insights</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <h4 className="text-lg font-bold text-gray-900">Search Patterns</h4>
                <p className="text-black text-sm">
                  You've conducted {history.length} health searches with an average of {analytics.avgSymptoms} symptoms per query.
                </p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <h4 className="text-lg font-bold text-gray-900">Accuracy Trends</h4>
                <p className="text-black text-sm">
                  {analytics.confidenceDistribution.high > analytics.confidenceDistribution.low 
                    ? "Most of your searches result in high-confidence predictions, indicating clear symptom patterns."
                    : "Consider providing more specific symptoms for better prediction accuracy."
                  }
                </p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <h4 className="text-lg font-bold text-gray-900">Health Monitoring</h4>
                <p className="text-black text-sm">
                  {analytics.topSymptoms.length > 0 
                    ? `Your most common symptom is "${analytics.topSymptoms[0][0]}". Consider discussing recurring symptoms with a healthcare provider.`
                    : "Start using the diagnosis tool to track your health patterns."
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* History Entries */}
        {loading ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Loader2 className="h-16 w-16 text-blue-300 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold text-white mb-2">Loading History...</h3>
            <p className="text-white">Please wait while we fetch your diagnosis history.</p>
          </div>
        ) : error ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <AlertCircle className="h-16 w-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Error Loading History</h3>
            <p className="text-white mb-4">{error}</p>
            <button
              onClick={fetchHistory}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
            >
              Try Again
            </button>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <History className="h-16 w-16 text-blue-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {history.length === 0 ? 'No History Yet' : 'No Results Found'}
            </h3>
            <p className="text-white">
              {history.length === 0 
                ? 'Start using MedNex to see your search history here.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredHistory.map((entry) => (
              <div key={entry.id} className="glass-card rounded-xl p-6 hover:bg-white hover:bg-opacity-15 transition-all duration-300 border border-white border-opacity-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-3 rounded-lg bg-blue-500 bg-opacity-20 flex-shrink-0">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                        "{entry.originalQuery}"
                      </h3>
                      <div className="flex items-center space-x-4 text-sm">
                        <p className="text-black font-medium">
                          📅 {entry.timestamp.toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-black font-medium">
                          🕒 {entry.timestamp.toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <div className="text-right">
                      <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                        entry.confidence >= 70 
                          ? 'bg-green-500 text-black' 
                          : entry.confidence >= 40 
                          ? 'bg-yellow-500 text-black' 
                          : 'bg-red-500 text-white'
                      }`}>
                        {entry.confidence}% {getConfidenceLabel(entry.confidence)}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500 hover:bg-opacity-20 rounded-lg transition-all duration-300"
                      title="Delete entry"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Symptoms Section */}
                  <div className="bg-white bg-opacity-10 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      <h4 className="text-lg font-bold text-gray-900">Symptoms Identified</h4>
                      <span className="px-2 py-1 bg-orange-500 bg-opacity-20 text-orange-700 rounded-full text-xs font-medium">
                        {entry.symptoms.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {entry.symptoms.map((symptom, idx) => (
                        <span key={idx} className="px-3 py-2 bg-white bg-opacity-90 text-gray-900 rounded-lg text-sm font-medium border border-blue-400 border-opacity-30 shadow-sm">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Predictions Section */}
                  <div className="bg-white bg-opacity-10 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Brain className="h-5 w-5 text-green-600" />
                      <h4 className="text-lg font-bold text-gray-900">Top Predictions</h4>
                      <span className="px-2 py-1 bg-green-500 bg-opacity-20 text-green-700 rounded-full text-xs font-medium">
                        {entry.predicted_diseases.length}
                      </span>
                    </div>
                    {entry.predicted_diseases.length > 0 ? (
                      <div className="space-y-3">
                        {entry.predicted_diseases.slice(0, 3).map((prediction: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between bg-white bg-opacity-20 rounded-lg p-3 border border-white border-opacity-10">
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 rounded-full bg-green-500 bg-opacity-20 flex items-center justify-center">
                                <span className="text-green-700 text-xs font-bold">{idx + 1}</span>
                              </div>
                              <span className="text-gray-900 font-semibold">{prediction.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-600 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-500" 
                                  style={{ width: `${prediction.confidence}%` }}
                                ></div>
                              </div>
                              <span className={`text-sm font-bold ${
                                prediction.confidence >= 70 ? 'text-green-300' :
                                prediction.confidence >= 40 ? 'text-yellow-300' : 'text-red-300'
                              }`}>
                                {prediction.confidence}%
                              </span>
                            </div>
                          </div>
                        ))}
                        {entry.predicted_diseases.length > 3 && (
                          <div className="text-center text-gray-900 text-sm font-medium">
                            +{entry.predicted_diseases.length - 3} more predictions
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-900 text-center italic">No predictions available</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Wrap with ProtectedRoute to require authentication
export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <HistoryPageContent />
    </ProtectedRoute>
  );
}
