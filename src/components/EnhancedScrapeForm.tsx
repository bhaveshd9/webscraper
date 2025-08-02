import React, { useState } from 'react';
import { Search, Settings, Zap, Shield, Database, Globe, ChevronDown, ChevronUp, Monitor, MousePointer } from 'lucide-react';
import type { ScrapeOptions, UserInteraction } from '@/types';
import { OptionLabel } from './InfoTooltip';

interface EnhancedScrapeFormProps {
  onSubmit: (url: string, options: ScrapeOptions) => void;
  loading: boolean;
}

export const EnhancedScrapeForm: React.FC<EnhancedScrapeFormProps> = ({ onSubmit, loading }) => {
  const [url, setUrl] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showBrowserOptions, setShowBrowserOptions] = useState(false);

  const [selectedPreset, setSelectedPreset] = useState<string>('Basic');
  const [options, setOptions] = useState<ScrapeOptions>({
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
    maxResults: 50,
    extractEmails: true,
    extractPhones: true,
    extractAddresses: true,
    followRedirects: true,
    timeout: 30000,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    // Anti-scraping options
    randomDelay: false,
    stealth: false,
    mobile: false,
    // Enhanced options
    useBrowser: false,
    useSelenium: false,
    waitForSelector: '',
    waitForTimeout: 10000,
    scrollToBottom: false,
    takeScreenshot: false,
    interceptRequests: false,
    userInteractions: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim(), options);
    }
  };

  const updateOption = (key: keyof ScrapeOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const addUserInteraction = () => {
    const newInteraction: UserInteraction = {
      type: 'click',
      selector: '',
      value: '',
      timeout: 1000
    };
    setOptions(prev => ({
      ...prev,
      userInteractions: [...(prev.userInteractions || []), newInteraction]
    }));
  };

  const updateUserInteraction = (index: number, field: keyof UserInteraction, value: any) => {
    setOptions(prev => ({
      ...prev,
      userInteractions: prev.userInteractions?.map((interaction, i) => 
        i === index ? { ...interaction, [field]: value } : interaction
      ) || []
    }));
  };

  const removeUserInteraction = (index: number) => {
    setOptions(prev => ({
      ...prev,
      userInteractions: prev.userInteractions?.filter((_, i) => i !== index) || []
    }));
  };

  const quickPresets = [
    {
      name: 'Basic',
      icon: Globe,
      options: {
        includeImages: true,
        includeLinks: true,
        includeHeadlines: true,
        includeParagraphs: true,
        includeMetadata: false,
        includeSocialMedia: false,
        includeForms: false,
        includeTables: false,
        includeScripts: false,
        includeStyles: false,
        maxResults: 25,
        extractEmails: false,
        extractPhones: false,
        extractAddresses: false,
        followRedirects: true,
        timeout: 30000,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        randomDelay: false,
        stealth: false,
        mobile: false,
        useBrowser: false,
        waitForSelector: '',
        waitForTimeout: 10000,
        scrollToBottom: false,
        takeScreenshot: false,
        interceptRequests: false,
        userInteractions: []
      }
    },
    {
      name: 'Complete',
      icon: Database,
      options: {
        includeImages: true,
        includeLinks: true,
        includeHeadlines: true,
        includeParagraphs: true,
        includeMetadata: true,
        includeSocialMedia: true,
        includeForms: true,
        includeTables: true,
        includeScripts: true,
        includeStyles: true,
        maxResults: 100,
        extractEmails: true,
        extractPhones: true,
        extractAddresses: true,
        followRedirects: true,
        timeout: 30000,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        randomDelay: true,
        stealth: true,
        mobile: false,
        useBrowser: true,
        waitForSelector: '',
        waitForTimeout: 10000,
        scrollToBottom: true,
        takeScreenshot: false,
        interceptRequests: false,
        userInteractions: []
      }
    },
    {
      name: 'Fast',
      icon: Zap,
      options: {
        includeImages: false,
        includeLinks: true,
        includeHeadlines: true,
        includeParagraphs: false,
        includeMetadata: false,
        includeSocialMedia: false,
        includeForms: false,
        includeTables: false,
        includeScripts: false,
        includeStyles: false,
        maxResults: 10,
        extractEmails: false,
        extractPhones: false,
        extractAddresses: false,
        followRedirects: true,
        timeout: 15000,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        randomDelay: false,
        stealth: false,
        mobile: false,
        useBrowser: false,
        waitForSelector: '',
        waitForTimeout: 5000,
        scrollToBottom: false,
        takeScreenshot: false,
        interceptRequests: false,
        userInteractions: []
      }
    },
    {
      name: 'Browser',
      icon: Monitor,
      options: {
        includeImages: true,
        includeLinks: true,
        includeHeadlines: true,
        includeParagraphs: true,
        includeMetadata: true,
        includeSocialMedia: true,
        includeForms: true,
        includeTables: true,
        includeScripts: false,
        includeStyles: false,
        maxResults: 50,
        extractEmails: true,
        extractPhones: true,
        extractAddresses: true,
        followRedirects: true,
        timeout: 60000,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        randomDelay: true,
        stealth: true,
        mobile: false,
        useBrowser: true,
        waitForSelector: '',
        waitForTimeout: 10000,
        scrollToBottom: true,
        takeScreenshot: false,
        interceptRequests: false,
        userInteractions: []
      }
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* URL Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL (e.g., https://example.com)"
            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required
          />
        </div>

        {/* Quick Presets */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Settings className="h-4 w-4" />
            Quick Presets
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickPresets.map((preset) => {
              const Icon = preset.icon;
              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => {
                    setOptions(preset.options);
                    setSelectedPreset(preset.name);
                  }}
                  className={`flex items-center gap-2 p-3 border rounded-lg transition-all duration-200 ${
                    selectedPreset === preset.name
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${
                    selectedPreset === preset.name ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                  <span className="text-sm font-medium">{preset.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Browser Options Toggle */}
        <div className="border-t pt-4">
          <button
            type="button"
            onClick={() => setShowBrowserOptions(!showBrowserOptions)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
          >
            {showBrowserOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <Monitor className="h-4 w-4" />
            Browser Automation
          </button>
        </div>

        {/* Browser Options */}
        {showBrowserOptions && (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.useBrowser || false}
                    onChange={(e) => updateOption('useBrowser', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <OptionLabel option="useBrowser" className="text-sm font-medium text-gray-700">
                    Use Headless Browser
                  </OptionLabel>
                </label>
                <p className="text-xs text-gray-500 mt-1">Execute JavaScript and handle dynamic content</p>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.useSelenium || false}
                    onChange={(e) => updateOption('useSelenium', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Use Selenium (Alternative)
                  </span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Use Selenium WebDriver instead of Puppeteer</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.scrollToBottom || false}
                    onChange={(e) => updateOption('scrollToBottom', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <OptionLabel option="scrollToBottom" className="text-sm font-medium text-gray-700">
                    Scroll to Bottom
                  </OptionLabel>
                </label>
                <p className="text-xs text-gray-500 mt-1">Load lazy-loaded content</p>
              </div>
            </div>

            {options.useBrowser && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <OptionLabel option="waitForSelector">
                        Wait for Selector
                      </OptionLabel>
                    </label>
                    <input
                      type="text"
                      value={options.waitForSelector || ''}
                      onChange={(e) => updateOption('waitForSelector', e.target.value)}
                      placeholder=".product-list, #content, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">CSS selector to wait for before scraping</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <OptionLabel option="waitForTimeout">
                        Wait Timeout: {(options.waitForTimeout || 0) / 1000}s
                      </OptionLabel>
                    </label>
                    <input
                      type="range"
                      min="1000"
                      max="30000"
                      step="1000"
                      value={options.waitForTimeout || 10000}
                      onChange={(e) => updateOption('waitForTimeout', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1s</span>
                      <span>30s</span>
                    </div>
                  </div>
                </div>

                {/* User Interactions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">User Interactions</h4>
                      <OptionLabel option="userInteractions">
                        User Interactions
                      </OptionLabel>
                    </div>
                    <button
                      type="button"
                      onClick={addUserInteraction}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      <MousePointer size={12} />
                      Add Action
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {options.userInteractions?.map((interaction, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <select
                          value={interaction.type}
                          onChange={(e) => updateUserInteraction(index, 'type', e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="click">Click</option>
                          <option value="type">Type</option>
                          <option value="scroll">Scroll</option>
                          <option value="wait">Wait</option>
                        </select>
                        
                        <input
                          type="text"
                          value={interaction.selector || ''}
                          onChange={(e) => updateUserInteraction(index, 'selector', e.target.value)}
                          placeholder="CSS Selector"
                          className="flex-1 text-xs border border-gray-300 rounded px-2 py-1"
                        />
                        
                        {interaction.type === 'type' && (
                          <input
                            type="text"
                            value={interaction.value || ''}
                            onChange={(e) => updateUserInteraction(index, 'value', e.target.value)}
                            placeholder="Text to type"
                            className="flex-1 text-xs border border-gray-300 rounded px-2 py-1"
                          />
                        )}
                        
                        {interaction.type === 'wait' && (
                          <input
                            type="number"
                            value={interaction.timeout || 1000}
                            onChange={(e) => updateUserInteraction(index, 'timeout', parseInt(e.target.value))}
                            placeholder="Timeout (ms)"
                            className="w-20 text-xs border border-gray-300 rounded px-2 py-1"
                          />
                        )}
                        
                        <button
                          type="button"
                          onClick={() => removeUserInteraction(index)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Advanced Options Toggle */}
        <div className="border-t pt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
          >
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Advanced Options
          </button>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
            {/* Data Extraction Options */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Content Types</h4>
                <div className="space-y-2">
                  {[
                    { key: 'includeHeadlines' as const, label: 'Headlines' },
                    { key: 'includeParagraphs' as const, label: 'Paragraphs' },
                    { key: 'includeLinks' as const, label: 'Links' },
                    { key: 'includeImages' as const, label: 'Images' },
                    { key: 'includeMetadata' as const, label: 'Metadata' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={options[key] as boolean}
                        onChange={(e) => updateOption(key, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <OptionLabel option={key}>
                        <span className="text-sm text-gray-700">{label}</span>
                      </OptionLabel>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Advanced Features</h4>
                <div className="space-y-2">
                  {[
                    { key: 'includeSocialMedia' as const, label: 'Social Media' },
                    { key: 'includeForms' as const, label: 'Forms' },
                    { key: 'includeTables' as const, label: 'Tables' },
                    { key: 'includeScripts' as const, label: 'Scripts' },
                    { key: 'includeStyles' as const, label: 'Styles' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={options[key] as boolean}
                        onChange={(e) => updateOption(key, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <OptionLabel option={key}>
                        <span className="text-sm text-gray-700">{label}</span>
                      </OptionLabel>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Information Extraction */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Contact Information</h4>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'extractEmails' as const, label: 'Emails' },
                  { key: 'extractPhones' as const, label: 'Phone Numbers' },
                  { key: 'extractAddresses' as const, label: 'Addresses' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={options[key] as boolean}
                      onChange={(e) => updateOption(key, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <OptionLabel option={key}>
                      <span className="text-sm text-gray-700">{label}</span>
                    </OptionLabel>
                  </label>
                ))}
              </div>
            </div>

            {/* Performance Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <OptionLabel option="maxResults">
                    Max Results: {options.maxResults}
                  </OptionLabel>
                </label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={options.maxResults}
                  onChange={(e) => updateOption('maxResults', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10</span>
                  <span>200</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <OptionLabel option="timeout">
                    Timeout: {options.timeout / 1000}s
                  </OptionLabel>
                </label>
                <input
                  type="range"
                  min="5000"
                  max="120000"
                  step="5000"
                  value={options.timeout}
                  onChange={(e) => updateOption('timeout', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5s</span>
                  <span>120s</span>
                </div>
              </div>
            </div>

            {/* User Agent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User Agent
              </label>
              <select
                value={options.userAgent}
                onChange={(e) => updateOption('userAgent', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36">
                  Chrome (Windows)
                </option>
                <option value="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36">
                  Chrome (Mac)
                </option>
                <option value="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0">
                  Firefox (Windows)
                </option>
                <option value="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15">
                  Safari (Mac)
                </option>
                <option value="Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1">
                  Safari (iPhone)
                </option>
              </select>
            </div>

            {/* Follow Redirects */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.followRedirects}
                  onChange={(e) => updateOption('followRedirects', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <OptionLabel option="followRedirects">
                  <span className="text-sm font-medium text-gray-700">Follow Redirects</span>
                </OptionLabel>
              </label>
            </div>

            {/* Anti-Scraping Options */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Shield className="text-blue-600" size={20} />
                Anti-Scraping Bypass
              </h4>
              <div className="grid grid-cols-1 gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.randomDelay || false}
                    onChange={(e) => updateOption('randomDelay', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <OptionLabel option="randomDelay">
                    <span className="text-sm text-gray-700">Random Delay</span>
                  </OptionLabel>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.stealth || false}
                    onChange={(e) => updateOption('stealth', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <OptionLabel option="stealth">
                    <span className="text-sm text-gray-700">Stealth Mode</span>
                  </OptionLabel>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={options.mobile || false}
                    onChange={(e) => updateOption('mobile', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <OptionLabel option="mobile">
                    <span className="text-sm text-gray-700">Mobile User Agent</span>
                  </OptionLabel>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Scraping...
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              Start Enhanced Scraping
            </>
          )}
        </button>
      </form>
    </div>
  );
}; 