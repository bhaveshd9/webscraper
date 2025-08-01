import React, { useState, useRef, useEffect } from 'react';
import { 
  Car, 
  Download, 
  FileText, 
  Globe, 
  Loader2, 
  Play, 
  Settings, 
  ArrowLeft, 
  Copy, 
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Database,
  Image as ImageIcon,
  DollarSign,
  Gauge,
  Fuel,
  Wrench
} from 'lucide-react';

interface CarData {
  modelName: string;
  brand: string;
  fuelType: string;
  transmission: string;
  bodyType: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
    wheelbase: string;
    groundClearance: string;
  };
  engine: {
    type: string;
    capacity: string;
    horsepower: string;
    torque: string;
    mileage: string;
    fuelTankSize: string;
  };
  variants: Array<{
    name: string;
    features: string[];
    price: string;
  }>;
  imageUrls: string[];
  features: {
    interior: string[];
    exterior: string[];
    safety: string[];
    tech: string[];
  };
  brochureData?: any;
  platformData?: Array<{
    name: string;
    price: string;
    imageUrl: string;
    detailUrl: string;
  }>;
}

interface ScrapingOptions {
  includeBrochure: boolean;
  brochureUrl?: string;
  fullPlatformScrape: boolean;
  platformUrl?: string;
  usePlaywright: boolean;
  waitForImages: boolean;
  extractPricing: boolean;
  extractSpecs: boolean;
}

const CarScraper: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [carData, setCarData] = useState<CarData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [options, setOptions] = useState<ScrapingOptions>({
    includeBrochure: false,
    brochureUrl: '',
    fullPlatformScrape: false,
    platformUrl: '',
    usePlaywright: true,
    waitForImages: true,
    extractPricing: true,
    extractSpecs: true
  });
  const [copied, setCopied] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const handleScrape = async () => {
    if (!url.trim()) {
      setError('Please enter a URL to scrape');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCarData(null);
    clearLogs();
    setCopied(false);

    addLog('🚗 Starting car data extraction...');
    addLog(`📋 Target URL: ${url}`);

    try {
      // Use Python Flask API for car scraping
      const response = await fetch('http://localhost:5000/api/scrape-car', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          options
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setCarData(data.carData);
        addLog('✅ Car data extraction completed successfully!');
        addLog(`📊 Extracted data for: ${data.carData.modelName || 'Unknown Model'}`);
      } else {
        throw new Error(data.error || data.message || 'Failed to scrape car data');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error occurred';
      setError(`Scraping failed: ${errorMessage}`);
      addLog(`❌ Error: ${errorMessage}`);
      console.error('Scraping error:', err);
      
      // Reset loading state and clear any partial data
      setCarData(null);
    } finally {
      setIsLoading(false);
      addLog('🏁 Scraping session ended');
    }
  };

  const copyToClipboard = async () => {
    if (!carData) return;

    try {
      const jsonData = JSON.stringify(carData, null, 2);
      await navigator.clipboard.writeText(jsonData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addLog('📋 Data copied to clipboard');
    } catch (err) {
      addLog('❌ Failed to copy data');
    }
  };

  const exportToFile = () => {
    if (!carData) return;

    const jsonData = JSON.stringify(carData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `car-data-${carData.modelName || 'unknown'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLog('💾 Data exported to file');
  };

  const renderCarData = () => {
    if (!carData) return null;

    return (
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-500" />
            Vehicle Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Basic Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Model:</span>
                  <span className="font-medium">{carData.modelName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Brand:</span>
                  <span className="font-medium">{carData.brand || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Fuel Type:</span>
                  <span className="font-medium">{carData.fuelType || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Transmission:</span>
                  <span className="font-medium">{carData.transmission || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Body Type:</span>
                  <span className="font-medium">{carData.bodyType || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Engine Specifications</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Engine Type:</span>
                  <span className="font-medium">{carData.engine?.type || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Capacity:</span>
                  <span className="font-medium">{carData.engine?.capacity || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Horsepower:</span>
                  <span className="font-medium">{carData.engine?.horsepower || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Torque:</span>
                  <span className="font-medium">{carData.engine?.torque || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Mileage:</span>
                  <span className="font-medium">{carData.engine?.mileage || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dimensions */}
        {carData.dimensions && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Gauge className="w-5 h-5 text-green-500" />
              Dimensions
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{carData.dimensions.length || 'N/A'}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Length</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{carData.dimensions.width || 'N/A'}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Width</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{carData.dimensions.height || 'N/A'}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Height</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{carData.dimensions.wheelbase || 'N/A'}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Wheelbase</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{carData.dimensions.groundClearance || 'N/A'}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Ground Clearance</div>
              </div>
            </div>
          </div>
        )}

        {/* Variants */}
        {carData.variants && carData.variants.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Variants & Pricing
            </h3>
            
            <div className="space-y-4">
              {carData.variants.map((variant, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">{variant.name}</h4>
                    <span className="text-lg font-bold text-green-600">{variant.price}</span>
                  </div>
                  {variant.features && variant.features.length > 0 && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Features:</span> {variant.features.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        {carData.features && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-purple-500" />
              Features
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {carData.features.interior && carData.features.interior.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Interior</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {carData.features.interior.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {carData.features.exterior && carData.features.exterior.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Exterior</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {carData.features.exterior.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {carData.features.safety && carData.features.safety.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Safety</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {carData.features.safety.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {carData.features.tech && carData.features.tech.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Technology</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {carData.features.tech.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Images */}
        {carData.imageUrls && carData.imageUrls.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-500" />
              Images ({carData.imageUrls.length})
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {carData.imageUrls.slice(0, 8).map((imageUrl, index) => (
                <div key={index} className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <img 
                    src={imageUrl} 
                    alt={`Car image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
            
            {carData.imageUrls.length > 8 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                +{carData.imageUrls.length - 8} more images
              </p>
            )}
          </div>
        )}

        {/* Platform Data */}
        {carData.platformData && carData.platformData.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-orange-500" />
              Platform Data ({carData.platformData.length} vehicles)
            </h3>
            
            <div className="space-y-4">
              {carData.platformData.map((vehicle, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    {vehicle.imageUrl && (
                      <div className="w-20 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={vehicle.imageUrl} 
                          alt={vehicle.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{vehicle.name}</h4>
                      <p className="text-lg font-bold text-green-600">{vehicle.price}</p>
                      {vehicle.detailUrl && (
                        <a 
                          href={vehicle.detailUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        >
                          View Details →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Export Data</h3>
          
          <div className="flex gap-4">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy JSON'}
            </button>
            
            <button
              onClick={exportToFile}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export File
            </button>
          </div>
        </div>
      </div>
    );
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
              <Car className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Car Data Scraper
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Extract comprehensive vehicle information from car websites
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Input Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Car Model URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.chevrolet.com/vehicles/silverado-1500.html"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={handleScrape}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  Scrape Data
                </button>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Advanced Options
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={options.usePlaywright}
                      onChange={(e) => setOptions(prev => ({ ...prev, usePlaywright: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Use Playwright (for dynamic sites)</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={options.waitForImages}
                      onChange={(e) => setOptions(prev => ({ ...prev, waitForImages: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Wait for images to load</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={options.extractPricing}
                      onChange={(e) => setOptions(prev => ({ ...prev, extractPricing: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Extract pricing information</span>
                  </label>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={options.extractSpecs}
                      onChange={(e) => setOptions(prev => ({ ...prev, extractSpecs: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Extract technical specifications</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={options.includeBrochure}
                      onChange={(e) => setOptions(prev => ({ ...prev, includeBrochure: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Include brochure data</span>
                  </label>
                  
                  {options.includeBrochure && (
                    <div className="ml-6 mt-2">
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Brochure URL
                      </label>
                      <input
                        type="url"
                        value={options.brochureUrl || ''}
                        onChange={(e) => setOptions(prev => ({ ...prev, brochureUrl: e.target.value }))}
                        placeholder="https://example.com/brochure.html"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Provide a link to the brochure for enhanced data extraction
                      </p>
                    </div>
                  )}
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={options.fullPlatformScrape}
                      onChange={(e) => setOptions(prev => ({ ...prev, fullPlatformScrape: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Full platform scrape</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Terminal */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Scraping Log</span>
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
              className="bg-black text-green-400 font-mono text-sm p-4 rounded-md h-48 overflow-y-auto border border-gray-600"
            >
              {logs.length === 0 ? (
                <div className="text-gray-500">
                  <div>Terminal ready...</div>
                  <div>Enter a car model URL and click "Scrape Data" to start</div>
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
              {isLoading && (
                <div className="text-yellow-400 animate-pulse">
                  ⏳ Scraping in progress...
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Results */}
          {renderCarData()}
        </div>
      </div>
    </div>
  );
};

export default CarScraper; 