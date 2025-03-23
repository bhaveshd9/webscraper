import React, { useState, useEffect } from 'react';
import { Search, Link, Image, Type, FileText, Settings, Download, Loader2, AlertCircle, CheckCircle2, Globe, DollarSign, LineChart, Bell, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface ScrapedData {
  title: string;
  headlines: { type: string; text: string }[];
  links: { href: string; text: string }[];
  images: { src: string; alt: string }[];
  paragraphs: string[];
  prices: string[];
}

interface ScrapeOptions {
  includeImages: boolean;
  includeLinks: boolean;
  includeHeadlines: boolean;
  includeParagraphs: boolean;
  maxResults: number;
}

interface PriceAlert {
  url: string;
  targetPrice: number;
  currentPrice: number | null;
  lastChecked: string | null;
}

interface PriceHistory {
  timestamp: string;
  prices: string[];
}

function App() {
  const [url, setUrl] = useState('');
  const [data, setData] = useState<ScrapedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'headlines' | 'links' | 'images' | 'paragraphs' | 'prices'>('headlines');
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState<ScrapeOptions>({
    includeImages: true,
    includeLinks: true,
    includeHeadlines: true,
    includeParagraphs: true,
    maxResults: 50
  });
  const [success, setSuccess] = useState(false);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    const saved = localStorage.getItem('priceAlerts');
    return saved ? JSON.parse(saved) : [];
  });
  const [newAlertPrice, setNewAlertPrice] = useState('');

  useEffect(() => {
    localStorage.setItem('priceAlerts', JSON.stringify(priceAlerts));
  }, [priceAlerts]);

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const fetchPriceHistory = async (url: string) => {
    try {
      const response = await fetch(`/api/price-history?url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error('Failed to fetch price history');
      const history = await response.json();
      setPriceHistory(history);
    } catch (error) {
      console.error('Error fetching price history:', error);
    }
  };

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid URL (including http:// or https://)');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    setData(null);
    
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, options }),
      });
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response from server. Expected JSON.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to scrape website');
      }
      
      const scrapedData = await response.json();
      
      if (!scrapedData || typeof scrapedData !== 'object') {
        throw new Error('Invalid data received from server');
      }

      setData(scrapedData);
      setSuccess(true);
      await fetchPriceHistory(url);

      // Auto-select first non-empty tab
      const firstNonEmptyTab = 
        (scrapedData.prices?.length > 0) ? 'prices' :
        (options.includeHeadlines && scrapedData.headlines?.length > 0) ? 'headlines' :
        (options.includeLinks && scrapedData.links?.length > 0) ? 'links' :
        (options.includeImages && scrapedData.images?.length > 0) ? 'images' :
        (options.includeParagraphs && scrapedData.paragraphs?.length > 0) ? 'paragraphs' :
        'headlines';
      setActiveTab(firstNonEmptyTab);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred while scraping the website');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPriceAlert = () => {
    if (!url || !newAlertPrice) return;
    
    const targetPrice = parseFloat(newAlertPrice);
    if (isNaN(targetPrice)) {
      setError('Please enter a valid price');
      return;
    }

    const currentPrice = data?.prices[0] ? parseFloat(data.prices[0].replace('$', '')) : null;

    setPriceAlerts(prev => [
      ...prev,
      {
        url,
        targetPrice,
        currentPrice,
        lastChecked: new Date().toISOString()
      }
    ]);
    setNewAlertPrice('');
  };

  const handleRemovePriceAlert = (alertUrl: string) => {
    setPriceAlerts(prev => prev.filter(alert => alert.url !== alertUrl));
  };

  const handleExport = () => {
    if (!data) return;
    
    const exportData = {
      url,
      scrapedAt: new Date().toISOString(),
      data: {
        title: data.title,
        ...(options.includeHeadlines && { headlines: data.headlines }),
        ...(options.includeLinks && { links: data.links }),
        ...(options.includeImages && { images: data.images }),
        ...(options.includeParagraphs && { paragraphs: data.paragraphs }),
        prices: data.prices
      },
      priceHistory
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scrape-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const TabButton = ({ tab, icon: Icon, label, count }: { tab: typeof activeTab; icon: any; label: string; count: number }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        activeTab === tab
          ? 'bg-blue-500 text-white'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
      disabled={!options[`include${label}`] && tab !== 'prices'}
    >
      <Icon size={20} />
      <span>{label}</span>
      <span className="ml-1 px-2 py-0.5 text-sm rounded-full bg-opacity-20 bg-current">
        {count}
      </span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Globe size={32} className="text-blue-500" />
            <h1 className="text-4xl font-bold text-gray-800">
              Advanced Web Scraper
            </h1>
          </div>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
          >
            <Settings size={20} />
            Options
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handleScrape} className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Globe size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter website URL to scrape (e.g., https://example.com)..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
              </div>
              {showOptions && (
                <div className="mt-4 grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <label className="flex items-center gap-2 p-2 hover:bg-white rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={options.includeHeadlines}
                      onChange={(e) => setOptions(prev => ({ ...prev, includeHeadlines: e.target.checked }))}
                      className="rounded text-blue-500"
                    />
                    Include Headlines
                  </label>
                  <label className="flex items-center gap-2 p-2 hover:bg-white rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={options.includeLinks}
                      onChange={(e) => setOptions(prev => ({ ...prev, includeLinks: e.target.checked }))}
                      className="rounded text-blue-500"
                    />
                    Include Links
                  </label>
                  <label className="flex items-center gap-2 p-2 hover:bg-white rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={options.includeImages}
                      onChange={(e) => setOptions(prev => ({ ...prev, includeImages: e.target.checked }))}
                      className="rounded text-blue-500"
                    />
                    Include Images
                  </label>
                  <label className="flex items-center gap-2 p-2 hover:bg-white rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={options.includeParagraphs}
                      onChange={(e) => setOptions(prev => ({ ...prev, includeParagraphs: e.target.checked }))}
                      className="rounded text-blue-500"
                    />
                    Include Paragraphs
                  </label>
                  <div className="col-span-2 p-2 hover:bg-white rounded transition-colors">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Results per Section
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={options.maxResults}
                      onChange={(e) => setOptions(prev => ({ ...prev, maxResults: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center gap-2 transition-colors min-w-[140px] justify-center"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Scrape
                </>
              )}
            </button>
          </form>
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} />
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 p-4 bg-green-50 text-green-600 rounded-lg flex items-center gap-2">
              <CheckCircle2 size={20} />
              Successfully scraped website!
            </div>
          )}
        </div>

        {data && (
          <div className="space-y-6">
            {/* Price Alerts Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Bell size={20} className="text-blue-500" />
                Price Alerts
              </h2>
              <div className="flex gap-4 mb-4">
                <input
                  type="number"
                  value={newAlertPrice}
                  onChange={(e) => setNewAlertPrice(e.target.value)}
                  placeholder="Enter target price..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                />
                <button
                  onClick={handleAddPriceAlert}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Alert
                </button>
              </div>
              <div className="space-y-2">
                {priceAlerts.map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">Target: ${alert.targetPrice}</p>
                      <p className="text-sm text-gray-500">
                        Current: {alert.currentPrice ? `$${alert.currentPrice}` : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-400">
                        Last checked: {alert.lastChecked ? format(new Date(alert.lastChecked), 'PPp') : 'Never'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemovePriceAlert(alert.url)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Results Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Results for: {data.title}
                </h2>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Download size={20} />
                  Export JSON
                </button>
              </div>

              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <TabButton 
                  tab="prices" 
                  icon={DollarSign} 
                  label="Prices" 
                  count={data.prices?.length || 0} 
                />
                <TabButton 
                  tab="headlines" 
                  icon={Type} 
                  label="Headlines" 
                  count={data.headlines?.length || 0} 
                />
                <TabButton 
                  tab="links" 
                  icon={Link} 
                  label="Links" 
                  count={data.links?.length || 0} 
                />
                <TabButton 
                  tab="images" 
                  icon={Image} 
                  label="Images" 
                  count={data.images?.length || 0} 
                />
                <TabButton 
                  tab="paragraphs" 
                  icon={FileText} 
                  label="Paragraphs" 
                  count={data.paragraphs?.length || 0} 
                />
              </div>

              <div className="space-y-4">
                {activeTab === 'prices' && (
                  <div className="space-y-6">
                    <div className="grid gap-3">
                      {data.prices?.map((price, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between">
                          <span className="text-xl font-semibold text-gray-800">{price}</span>
                          <LineChart size={20} className="text-blue-500" />
                        </div>
                      ))}
                    </div>
                    
                    {priceHistory.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Price History</h3>
                        <div className="space-y-2">
                          {priceHistory.map((record, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-500">
                                {format(new Date(record.timestamp), 'PPp')}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-2">
                                {record.prices.map((price, priceIndex) => (
                                  <span key={priceIndex} className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                    {price}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'headlines' && data.headlines && (
                  <div className="grid gap-3">
                    {data.headlines.map((headline, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <span className="text-sm font-medium text-blue-500 uppercase">{headline.type}</span>
                        <p className="mt-1 text-gray-800">{headline.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'links' && data.links && (
                  <div className="grid gap-3">
                    {data.links.map((link, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline flex items-center gap-2"
                        >
                          <Link size={16} />
                          <span className="flex-1">{link.text}</span>
                          <span className="text-sm text-gray-500 truncate max-w-[300px]">
                            {link.href}
                          </span>
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'images' && data.images && (
                  <div className="grid grid-cols-2 gap-4">
                    {data.images.map((image, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="relative aspect-video mb-2">
                          <img
                            src={image.src}
                            alt={image.alt}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                            }}
                          />
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {image.alt || 'No description available'}
                        </p>
                        <a
                          href={image.src}
                          target="_blank"
                          rel="no opener noreferrer"
                          className="text-blue-500 hover:underline text-sm mt-1 block truncate"
                        >
                          {image.src}
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'paragraphs' && data.paragraphs && (
                  <div className="grid gap-3">
                    {data.paragraphs.map((text, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <p className="text-gray-800 leading-relaxed">{text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;