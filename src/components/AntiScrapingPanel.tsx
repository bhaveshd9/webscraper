import React, { useState, useEffect } from 'react';
import { Shield, Zap, Globe, Users, AlertTriangle, Info, ExternalLink, CheckCircle } from 'lucide-react';
import type { AntiScrapingData, TestScrapingRequest } from '@/types';

interface AntiScrapingPanelProps {
  onTestTechnique: (request: TestScrapingRequest) => void;
  loading?: boolean;
}

export const AntiScrapingPanel: React.FC<AntiScrapingPanelProps> = ({ onTestTechnique, loading }) => {
  const [techniques, setTechniques] = useState<AntiScrapingData | null>(null);
  const [selectedTechnique, setSelectedTechnique] = useState<string>('stealth');
  const [testUrl, setTestUrl] = useState<string>('');

  useEffect(() => {
    fetchAntiScrapingTechniques();
  }, []);

  const fetchAntiScrapingTechniques = async () => {
    try {
      const response = await fetch('/api/anti-scraping-techniques');
      const data = await response.json();
      if (data.success) {
        setTechniques(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch anti-scraping techniques:', error);
    }
  };

  const handleTestTechnique = () => {
    if (testUrl.trim()) {
      onTestTechnique({
        url: testUrl,
        technique: selectedTechnique as 'stealth' | 'mobile' | 'slow' | 'default'
      });
    }
  };

  if (!techniques) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="text-blue-600" size={24} />
        <h2 className="text-2xl font-bold text-gray-800">Anti-Scraping Bypass</h2>
      </div>

      {/* Quick Test Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Zap className="text-yellow-600" size={20} />
          Quick Test
        </h3>
        <div className="flex gap-3 mb-3">
          <input
            type="url"
            placeholder="Enter URL to test..."
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedTechnique}
            onChange={(e) => setSelectedTechnique(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="stealth">Stealth Mode</option>
            <option value="mobile">Mobile User Agent</option>
            <option value="slow">Slow & Steady</option>
            <option value="default">Default</option>
          </select>
          <button
            onClick={handleTestTechnique}
            disabled={loading || !testUrl.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Globe size={16} />
            )}
            Test
          </button>
        </div>
      </div>

      {/* Techniques Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Shield className="text-green-600" size={20} />
            Bypass Techniques
          </h3>
          <div className="space-y-3">
            {techniques.techniques.map((technique, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 mt-1" size={16} />
                  <div>
                    <h4 className="font-medium text-gray-800">{technique.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{technique.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{technique.implementation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="text-red-600" size={20} />
            Common Blockers
          </h3>
          <div className="space-y-3">
            {techniques.commonBlockers.map((blocker, index) => (
              <div key={index} className="bg-red-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-red-500" size={16} />
                  <span className="font-medium text-gray-800">{blocker}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bypass Methods */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Users className="text-purple-600" size={20} />
          Bypass Methods by Blocker
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {techniques.bypassMethods.map((method, index) => (
            <div key={index} className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">{method.blocker}</h4>
              <ul className="space-y-1">
                {method.methods.map((bypassMethod, methodIndex) => (
                  <li key={methodIndex} className="text-sm text-gray-600 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    {bypassMethod}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* User Agents & Referers */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Globe className="text-blue-600" size={20} />
            User Agents
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {techniques.userAgents.map((agent, index) => (
              <div key={index} className="bg-blue-50 rounded p-2">
                <code className="text-xs text-gray-700 break-all">{agent}</code>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <ExternalLink className="text-green-600" size={20} />
            Referers
          </h3>
          <div className="space-y-2">
            {techniques.referers.map((referer, index) => (
              <div key={index} className="bg-green-50 rounded p-2">
                <code className="text-xs text-gray-700">{referer}</code>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-6 bg-yellow-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Info className="text-yellow-600" size={20} />
          Important Tips
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2"></div>
            Always respect robots.txt and website terms of service
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2"></div>
            Use reasonable delays between requests (1-3 seconds minimum)
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2"></div>
            Consider using residential proxies for high-volume scraping
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2"></div>
            Monitor for CAPTCHA challenges and implement solving services if needed
          </li>
          <li className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2"></div>
            Keep user agents and headers up-to-date with current browser versions
          </li>
        </ul>
      </div>
    </div>
  );
}; 