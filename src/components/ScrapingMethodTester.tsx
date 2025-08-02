import React, { useState, useRef, useEffect } from 'react';
import { Play, Loader2, CheckCircle, XCircle, BarChart3, Zap, Globe, Terminal, ArrowLeft } from 'lucide-react';

interface TestResult {
  http: any;
  puppeteer: any;
  selenium: any;
  comparison: {
    speed: {
      http: number;
      puppeteer: number;
      selenium: number;
      fastest: string;
    };
    dataQuality: {
      http: any;
      puppeteer: any;
      selenium: any;
    };
    success: {
      http: boolean;
      puppeteer: boolean;
      selenium: boolean;
    };
    recommendations: {
      fastest: string;
      mostReliable: string;
      bestForDynamic: string;
    };
  };
}

interface LogEntry {
  timestamp: string;
  method: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'progress';
}

interface ScrapingMethodTesterProps {
  onBack?: () => void;
}

const ScrapingMethodTester: React.FC<ScrapingMethodTesterProps> = ({ onBack }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (method: string, message: string, type: 'info' | 'success' | 'error' | 'progress' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, method, message, type }]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const handleTest = async () => {
    if (!url.trim()) {
      setError('Please enter a URL to test');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults(null);
    clearLogs();
    
    addLog('SYSTEM', '🚀 Starting scraping method comparison...', 'info');
    addLog('SYSTEM', `📋 Target URL: ${url}`, 'info');
    addLog('SYSTEM', '⏳ This may take up to 60 seconds...', 'info');

    try {
      // Set up a timeout for the entire operation
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Test timeout - taking too long')), 60000);
      });

      const testPromise = fetch(`https://webscraper-backend-js-production.up.railway.app/api/compare-scraping-methods?url=${encodeURIComponent(url)}`)
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setResults(data.results);
            addLog('SYSTEM', '✅ All tests completed successfully!', 'success');
            
            // Log individual results
            if (data.results.http && !data.results.http.error) {
              addLog('HTTP', `✅ Completed in ${formatTime(data.results.http.processingTime)}`, 'success');
              addLog('HTTP', `📊 Found: ${data.results.http.headlines?.length || 0} headlines, ${data.results.http.links?.length || 0} links, ${data.results.http.images?.length || 0} images`, 'info');
            } else {
              addLog('HTTP', `❌ Failed: ${data.results.http?.error || 'Unknown error'}`, 'error');
            }

            if (data.results.puppeteer && !data.results.puppeteer.error) {
              addLog('PUPPETEER', `✅ Completed in ${formatTime(data.results.puppeteer.processingTime)}`, 'success');
              addLog('PUPPETEER', `📊 Found: ${data.results.puppeteer.headlines?.length || 0} headlines, ${data.results.puppeteer.links?.length || 0} links, ${data.results.puppeteer.images?.length || 0} images`, 'info');
            } else {
              addLog('PUPPETEER', `❌ Failed: ${data.results.puppeteer?.error || 'Unknown error'}`, 'error');
            }

            if (data.results.selenium && !data.results.selenium.error) {
              addLog('SELENIUM', `✅ Completed in ${formatTime(data.results.selenium.processingTime)}`, 'success');
              addLog('SELENIUM', `📊 Found: ${data.results.selenium.headlines?.length || 0} headlines, ${data.results.selenium.links?.length || 0} links, ${data.results.selenium.images?.length || 0} images`, 'info');
            } else {
              addLog('SELENIUM', `❌ Failed: ${data.results.selenium?.error || 'Unknown error'}`, 'error');
            }

            // Log comparison results
            if (data.results.comparison?.speed?.fastest) {
              addLog('COMPARISON', `🏆 Fastest method: ${data.results.comparison.speed.fastest.toUpperCase()}`, 'success');
              addLog('COMPARISON', `📈 Speed ranking: HTTP(${formatTime(data.results.comparison.speed.http)}) | Puppeteer(${formatTime(data.results.comparison.speed.puppeteer)}) | Selenium(${formatTime(data.results.comparison.speed.selenium)})`, 'info');
            }
          } else {
            throw new Error(data.error || 'Failed to compare methods');
          }
        });

      await Promise.race([testPromise, timeoutPromise]);

    } catch (err: any) {
      if (err.message.includes('timeout')) {
        setError(`Test timed out after 60 seconds. The website may be slow or blocking requests.`);
        addLog('SYSTEM', '⏰ Test timed out after 60 seconds', 'error');
      } else {
        setError(`Test failed: ${err.message}`);
        addLog('SYSTEM', `❌ Test failed: ${err.message}`, 'error');
      }
      console.error('Test error:', err);
    } finally {
      setIsLoading(false);
      addLog('SYSTEM', '🏁 Test session ended', 'info');
    }
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'progress': return '⏳';
      default: return 'ℹ️';
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'progress': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack || (() => window.history.back())}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Scraping Method Tester
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Compare HTTP, Puppeteer, and Selenium scraping methods
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Test URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleTest}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Test Methods
              </button>
            </div>
          </div>

          {/* Terminal Display */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Test Terminal</span>
              </div>
              {logs.length > 0 && (
                <button
                  onClick={clearLogs}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Clear Logs
                </button>
              )}
            </div>
            
            <div 
              ref={terminalRef}
              className="bg-black text-green-400 font-mono text-sm p-4 rounded-md h-64 overflow-y-auto border border-gray-600"
            >
              {logs.length === 0 ? (
                <div className="text-gray-500">
                  <div>Terminal ready...</div>
                  <div>Enter a URL and click "Test Methods" to start</div>
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    <span className="text-gray-500">[{log.timestamp}]</span>
                    <span className="text-blue-400 ml-2">[{log.method}]</span>
                    <span className={`ml-2 ${getLogColor(log.type)}`}>
                      {getLogIcon(log.type)} {log.message}
                    </span>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="text-yellow-400 animate-pulse">
                  <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>
                  <span className="text-blue-400 ml-2">[SYSTEM]</span>
                  <span className="ml-2">⏳ Testing in progress...</span>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {results && (
            <div className="space-y-6">
              {/* Method Results */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* HTTP Method */}
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="w-5 h-5 text-blue-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">HTTP Method</h4>
                    {getStatusIcon(results.http && !results.http.error)}
                  </div>
                  
                  {results.http && !results.http.error ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Speed:</span>
                        <span className="font-medium">{formatTime(results.http.processingTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Headlines:</span>
                        <span className="font-medium">{results.http.headlines?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Links:</span>
                        <span className="font-medium">{results.http.links?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Images:</span>
                        <span className="font-medium">{results.http.images?.length || 0}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      {results.http?.error || 'Failed to test'}
                    </p>
                  )}
                </div>

                {/* Puppeteer Method */}
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-purple-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">Puppeteer</h4>
                    {getStatusIcon(results.puppeteer && !results.puppeteer.error)}
                  </div>
                  
                  {results.puppeteer && !results.puppeteer.error ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Speed:</span>
                        <span className="font-medium">{formatTime(results.puppeteer.processingTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Headlines:</span>
                        <span className="font-medium">{results.puppeteer.headlines?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Links:</span>
                        <span className="font-medium">{results.puppeteer.links?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Images:</span>
                        <span className="font-medium">{results.puppeteer.images?.length || 0}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      {results.puppeteer?.error || 'Failed to test'}
                    </p>
                  )}
                </div>

                {/* Selenium Method */}
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-green-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">Selenium</h4>
                    {getStatusIcon(results.selenium && !results.selenium.error)}
                  </div>
                  
                  {results.selenium && !results.selenium.error ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Speed:</span>
                        <span className="font-medium">{formatTime(results.selenium.processingTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Headlines:</span>
                        <span className="font-medium">{results.selenium.headlines?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Links:</span>
                        <span className="font-medium">{results.selenium.links?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Images:</span>
                        <span className="font-medium">{results.selenium.images?.length || 0}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-red-600 dark:text-red-400 text-sm">
                      {results.selenium?.error || 'Failed to test'}
                    </p>
                  )}
                </div>
              </div>

              {/* Comparison */}
              {results.comparison && Object.keys(results.comparison).length > 0 && (
                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Comparison</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Speed Comparison */}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {results.comparison.speed.fastest?.toUpperCase() || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Fastest Method</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        HTTP: {formatTime(results.comparison.speed.http)} | 
                        Puppeteer: {formatTime(results.comparison.speed.puppeteer)} |
                        Selenium: {formatTime(results.comparison.speed.selenium)}
                      </div>
                    </div>

                    {/* Data Quality */}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {results.comparison.dataQuality.http.headlines + results.comparison.dataQuality.http.links + results.comparison.dataQuality.http.images}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">HTTP Elements</div>
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {results.comparison.dataQuality.puppeteer.headlines + results.comparison.dataQuality.puppeteer.links + results.comparison.dataQuality.puppeteer.images}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Puppeteer Elements</div>
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {results.comparison.dataQuality.selenium.headlines + results.comparison.dataQuality.selenium.links + results.comparison.dataQuality.selenium.images}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Selenium Elements</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Recommendations</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  {results.comparison?.recommendations ? (
                    <>
                      <li>• <strong>Fastest:</strong> {results.comparison.recommendations.fastest} method</li>
                      <li>• <strong>Most Reliable:</strong> {results.comparison.recommendations.mostReliable} method</li>
                      <li>• <strong>Best for Dynamic Content:</strong> {results.comparison.recommendations.bestForDynamic} method</li>
                      {results.comparison.recommendations.fastest === 'http' && (
                        <li>• HTTP is fastest for simple content extraction</li>
                      )}
                      {(results.comparison.recommendations.bestForDynamic === 'puppeteer' || results.comparison.recommendations.bestForDynamic === 'selenium') && (
                        <li>• Browser automation handles JavaScript-heavy sites better</li>
                      )}
                    </>
                  ) : (
                    <>
                      <li>• Multiple methods available - choose based on your needs</li>
                      <li>• HTTP is fastest for simple content extraction</li>
                      <li>• Puppeteer and Selenium handle JavaScript-heavy sites better</li>
                      <li>• Try different methods if one fails</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScrapingMethodTester; 