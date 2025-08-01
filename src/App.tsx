import { useState, useMemo, useEffect } from 'react';
import { Globe, Download, Type, Link, Image, FileText, DollarSign, Tag, Share2, FormInput, Table, Code, BarChart3, Shield, TestTube, Car } from 'lucide-react';
import { useScraper } from '@/hooks/useScraper';
import { ScrapeForm } from '@/components/ScrapeForm';
import { EnhancedScrapeForm } from '@/components/EnhancedScrapeForm';
import { StatusMessages } from '@/components/StatusMessages';
import { ResultsTabs } from '@/components/ResultsTabs';
import { ResultsContent } from '@/components/ResultsContent';
import { SplashScreen } from '@/components/SplashScreen';
import { AntiScrapingPanel } from '@/components/AntiScrapingPanel';
import ScrapingMethodTester from './components/ScrapingMethodTester';
import CarScraper from './components/CarScraper';
import { FormComparisonTooltip, InfoTooltip } from '@/components/InfoTooltip';
import { validateUrl, sanitizeUrl } from '@/utils/validation';
import { CSVExporter } from '@/utils/csvExport';
import type { TabType, TabConfig, ScrapeOptions, TestScrapingRequest } from '@/types';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('headlines');
  const [currentUrl, setCurrentUrl] = useState('');
  const [showSplash, setShowSplash] = useState(true);
  const [splashProgress, setSplashProgress] = useState(0);
  const [splashStatus, setSplashStatus] = useState('Initializing...');
  const [showAntiScraping, setShowAntiScraping] = useState(false);
  const [useEnhancedForm, setUseEnhancedForm] = useState(false);
  const [showMethodTester, setShowMethodTester] = useState(false);
  const [showCarScraper, setShowCarScraper] = useState(false);
  const [showHiddenButton, setShowHiddenButton] = useState(false);
  
  const { data, loading, error, success, priceHistory, scrape } = useScraper();

  // Splash screen effect
  useEffect(() => {
    if (showSplash) {
      const steps = [
        { progress: 20, status: 'Loading components...' },
        { progress: 40, status: 'Initializing scraper...' },
        { progress: 60, status: 'Setting up analytics...' },
        { progress: 80, status: 'Preparing UI...' },
        { progress: 100, status: 'Ready!' }
      ];

      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep < steps.length) {
          setSplashProgress(steps[currentStep].progress);
          setSplashStatus(steps[currentStep].status);
          currentStep++;
        } else {
          clearInterval(interval);
        }
      }, 800);

      return () => clearInterval(interval);
    }
  }, [showSplash]);

  // Keyboard event listener for hidden car scraper
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl + Alt + C to show hidden car scraper button
      if (event.ctrlKey && event.altKey && event.key === 'c') {
        setShowHiddenButton(true);
        setTimeout(() => setShowHiddenButton(false), 5000); // Hide after 5 seconds
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Check for route-based access to car scraper
  useEffect(() => {
    if (window.location.hash === '#/scraper') {
      setShowCarScraper(true);
    }
  }, []);

  const handleScrape = async (url: string, options: ScrapeOptions) => {
    const sanitizedUrl = sanitizeUrl(url);
    
    if (!validateUrl(sanitizedUrl)) {
      return;
    }
    
    setCurrentUrl(sanitizedUrl);
    await scrape(sanitizedUrl, options);
  };

  const handleTestScraping = async (request: TestScrapingRequest) => {
    const sanitizedUrl = sanitizeUrl(request.url);
    
    if (!validateUrl(sanitizedUrl)) {
      return;
    }
    
    setCurrentUrl(sanitizedUrl);
    
    // Create options based on the technique
    const options: ScrapeOptions = {
      includeImages: true,
      includeLinks: true,
      includeHeadlines: true,
      includeParagraphs: true,
      includeMetadata: true,
      includeSocialMedia: true,
      includeForms: false,
      includeTables: false,
      includeScripts: false,
      includeStyles: false,
      maxResults: 10,
      extractEmails: true,
      extractPhones: true,
      extractAddresses: true,
      followRedirects: true,
      timeout: 30000,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      randomDelay: true
    };

    // Apply technique-specific options
    switch (request.technique) {
      case 'stealth':
        options.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
        options.stealth = true;
        options.randomDelay = true;
        break;
      case 'mobile':
        options.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1';
        options.mobile = true;
        break;
      case 'slow':
        options.timeout = 60000;
        options.randomDelay = true;
        break;
      default:
        break;
    }

    await scrape(sanitizedUrl, options);
  };

  const handleExport = () => {
    if (!data) return;
    
    const exportData = {
      url: currentUrl,
      scrapedAt: new Date().toISOString(),
      data,
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

  const handleCSVExport = () => {
    if (!data) return;
    
    // Check if it's automotive data
    const isAutomotive = data.title.toLowerCase().includes('chevrolet') || 
                        data.title.toLowerCase().includes('ford') || 
                        data.title.toLowerCase().includes('toyota') ||
                        data.title.toLowerCase().includes('honda') ||
                        data.title.toLowerCase().includes('bmw');
    
    if (isAutomotive) {
      CSVExporter.exportToFile(data, { 
        filename: `vehicle-data-${new Date().toISOString().split('T')[0]}`,
        includeMetadata: true,
        includeImages: true,
        includeLinks: false,
        includeScripts: false,
        includeStyles: false
      });
    } else {
      CSVExporter.exportToFile(data, { 
        filename: `scraped-data-${new Date().toISOString().split('T')[0]}`,
        includeMetadata: true,
        includeImages: true,
        includeLinks: true,
        includeScripts: false,
        includeStyles: false
      });
    }
  };

  const tabConfigs: TabConfig[] = useMemo(() => {
    if (!data) return [];
    
    return [
      {
        type: 'analytics',
        label: 'Analytics',
        icon: BarChart3,
        count: 0,
        enabled: true
      },
      {
        type: 'headlines',
        label: 'Headlines',
        icon: Type,
        count: data.headlines?.length || 0,
        enabled: true
      },
      {
        type: 'links',
        label: 'Links',
        icon: Link,
        count: data.links?.length || 0,
        enabled: true
      },
      {
        type: 'images',
        label: 'Images',
        icon: Image,
        count: data.images?.length || 0,
        enabled: true
      },
      {
        type: 'paragraphs',
        label: 'Paragraphs',
        icon: FileText,
        count: data.paragraphs?.length || 0,
        enabled: true
      },
      {
        type: 'prices',
        label: 'Prices',
        icon: DollarSign,
        count: data.prices?.length || 0,
        enabled: true
      },
      {
        type: 'metadata',
        label: 'Metadata',
        icon: Tag,
        count: 0,
        enabled: true
      },
      {
        type: 'social',
        label: 'Social',
        icon: Share2,
        count: data.socialMedia?.length || 0,
        enabled: true
      },
      {
        type: 'forms',
        label: 'Forms',
        icon: FormInput,
        count: data.forms?.length || 0,
        enabled: true
      },
      {
        type: 'tables',
        label: 'Tables',
        icon: Table,
        count: data.tables?.length || 0,
        enabled: true
      },
      {
        type: 'scripts',
        label: 'Scripts',
        icon: Code,
        count: data.scripts?.length || 0,
        enabled: true
      }
    ];
  }, [data]);

  if (showSplash) {
    return (
      <SplashScreen
        onComplete={() => setShowSplash(false)}
        progress={splashProgress}
        status={splashStatus}
      />
    );
  }

  // Show method tester if requested
  if (showMethodTester) {
    return <ScrapingMethodTester onBack={() => setShowMethodTester(false)} />;
  }

  // Show car scraper if requested
  if (showCarScraper) {
    return <CarScraper onBack={() => setShowCarScraper(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Globe size={32} className="text-blue-500 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Web Scraper Pro
              </h1>
              <p className="text-gray-600">Advanced Data Extraction Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMethodTester(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <TestTube size={20} />
              Method Tester
            </button>
            
            {/* Hidden Car Scraper Button - Only visible after Ctrl+Alt+C */}
            {showHiddenButton && (
              <button
                onClick={() => setShowCarScraper(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl animate-pulse"
              >
                <Car size={20} />
                Car Scraper
              </button>
            )}
            
            <div className="text-right">
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-sm font-medium text-green-600">Online</p>
            </div>
          </div>
        </div>
        
        {/* Form Toggle */}
        <div className="mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-800">Scraping Mode</h3>
              <FormComparisonTooltip />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUseEnhancedForm(false)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  !useEnhancedForm
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Simple
              </button>
              <button
                onClick={() => setUseEnhancedForm(true)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  useEnhancedForm
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Enhanced
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <div className="text-sm text-gray-600">
              {!useEnhancedForm ? (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Simple Mode: Basic scraping with essential options
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Enhanced Mode: Advanced features including browser automation, anti-scraping techniques, and method comparison
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Scrape Form */}
        {useEnhancedForm ? (
          <EnhancedScrapeForm onSubmit={handleScrape} loading={loading} />
        ) : (
          <ScrapeForm onSubmit={handleScrape} loading={loading} />
        )}
        
        {/* Anti-Scraping Panel Toggle - Only show in Enhanced mode */}
        {useEnhancedForm && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => setShowAntiScraping(!showAntiScraping)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Shield size={20} />
                {showAntiScraping ? 'Hide' : 'Show'} Anti-Scraping Techniques
              </button>
              <InfoTooltip
                content="Advanced techniques to bypass anti-scraping measures including stealth mode, user-agent rotation, proxy support, and more. Test different bypass methods to find what works for specific websites."
                title="Anti-Scraping Techniques"
                size="lg"
              />
            </div>

            {/* Anti-Scraping Panel */}
            {showAntiScraping && (
              <div className="mb-6 animate-in slide-in-from-top-2 duration-300">
                <AntiScrapingPanel onTestTechnique={handleTestScraping} loading={loading} />
              </div>
            )}
          </div>
        )}


        
        {/* Status Messages */}
        <StatusMessages error={error} success={success} />

        {data && (
          <div className="space-y-6">
            {/* Results Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Results for: {data.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Scraped at {new Date().toLocaleString()} • {data.wordCount?.toLocaleString()} words
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Download size={20} />
                    Export JSON
                  </button>
                  <button
                    onClick={handleCSVExport}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Download size={20} />
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <ResultsTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                tabConfigs={tabConfigs}
              />

              {/* Content */}
              <ResultsContent
                activeTab={activeTab}
                data={data}
                priceHistory={priceHistory}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500">
          <p className="text-sm">
            Web Scraper Pro • Built with React, TypeScript & Node.js • 
            <span className="text-blue-500 ml-1">Advanced Data Extraction</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App; 