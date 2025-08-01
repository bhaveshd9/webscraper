import React from 'react';
import { BarChart3, TrendingUp, Clock, FileText, Link, Image, Hash, Activity } from 'lucide-react';
import type { ScrapeStats, ScrapedData } from '@/types';

interface AnalyticsPanelProps {
  data: ScrapedData;
  stats: ScrapeStats;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ data, stats }) => {
  const metrics = [
    {
      label: 'Total Elements',
      value: stats.totalElements,
      icon: Hash,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Processing Time',
      value: `${stats.processingTime}ms`,
      icon: Clock,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Page Size',
      value: `${(stats.pageSize / 1024).toFixed(1)}KB`,
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'Word Count',
      value: stats.wordCount.toLocaleString(),
      icon: FileText,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      label: 'Links Found',
      value: stats.linkCount,
      icon: Link,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50'
    },
    {
      label: 'Images Found',
      value: stats.imageCount,
      icon: Image,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50'
    }
  ];

  const contentDistribution = [
    { label: 'Headlines', count: data.headlines.length, color: 'bg-blue-500' },
    { label: 'Links', count: data.links.length, color: 'bg-green-500' },
    { label: 'Images', count: data.images.length, color: 'bg-purple-500' },
    { label: 'Paragraphs', count: data.paragraphs.length, color: 'bg-orange-500' },
    { label: 'Prices', count: data.prices.length, color: 'bg-red-500' },
    { label: 'Forms', count: data.forms.length, color: 'bg-indigo-500' },
    { label: 'Tables', count: data.tables.length, color: 'bg-pink-500' },
    { label: 'Scripts', count: data.scripts.length, color: 'bg-yellow-500' }
  ];

  const totalContent = contentDistribution.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-6 w-6 text-blue-500" />
        <h2 className="text-xl font-semibold text-gray-800">Analytics & Insights</h2>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className={`p-4 rounded-lg ${metric.bgColor}`}>
              <div className="flex items-center gap-3">
                <Icon className={`h-8 w-8 ${metric.color}`} />
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <p className="text-lg font-bold text-gray-900">{metric.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Distribution Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-500" />
          Content Distribution
        </h3>
        <div className="space-y-3">
          {contentDistribution.map((item) => {
            const percentage = totalContent > 0 ? (item.count / totalContent) * 100 : 0;
            return (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{item.label}</span>
                  <span className="text-gray-500">{item.count} ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${item.color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            Performance Score
          </h4>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {Math.round((stats.processingTime < 1000 ? 100 : Math.max(0, 100 - (stats.processingTime - 1000) / 50)))}%
          </div>
          <p className="text-sm text-gray-600">
            {stats.processingTime < 1000 ? 'Excellent performance!' : 'Good performance with room for optimization.'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-green-500" />
            Content Richness
          </h4>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {Math.round((stats.totalElements / 100) * 100)}%
          </div>
          <p className="text-sm text-gray-600">
            {stats.totalElements > 50 ? 'Rich content detected!' : 'Moderate content found.'}
          </p>
        </div>
      </div>

      {/* Language Detection */}
      {data.language && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Language Detected</h4>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">{data.language}</span>
          </div>
        </div>
      )}

      {/* Last Modified */}
      {data.lastModified && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Last Modified</h4>
          <p className="text-sm text-gray-600">{new Date(data.lastModified).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}; 