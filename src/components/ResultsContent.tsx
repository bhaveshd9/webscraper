import React from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';
import type { TabType, ScrapedData, PriceHistory } from '@/types';
import { AnalyticsPanel } from './AnalyticsPanel';
import { MetadataPanel } from './MetadataPanel';

interface ResultsContentProps {
  activeTab: TabType;
  data: ScrapedData;
  priceHistory: PriceHistory[];
}

export const ResultsContent: React.FC<ResultsContentProps> = ({
  activeTab,
  data,
  priceHistory,
}) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'headlines':
        return (
          <div className="space-y-4">
            {data.headlines.map((headline, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded mb-2">
                      {headline.type.toUpperCase()}
                    </span>
                    <p className="text-gray-800 font-medium">{headline.text}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(headline.text, index)}
                    className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {copiedIndex === index ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        );

      case 'links':
        return (
          <div className="space-y-3">
            {data.links.map((link, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium truncate block"
                  >
                    {link.text}
                  </a>
                  <p className="text-sm text-gray-500 truncate">{link.href}</p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <ExternalLink size={16} />
                  </a>
                  <button
                    onClick={() => copyToClipboard(link.href, index)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {copiedIndex === index ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        );

      case 'images':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.images.map((image, index) => (
              <div key={index} className="bg-gray-50 rounded-lg overflow-hidden">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCAxMDBDODAgODkuNTQ0IDg4LjU0NCA4MSA5OSA4MUMxMDkuNDU2IDgxIDExOCA4OS41NDQgMTE4IDEwMEMxMTggMTEwLjQ1NiAxMDkuNDU2IDExOSA5OSAxMTlDOC41NDQgMTE5IDgwIDExMC40NTYgODAgMTAwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCAxMjBIMTQwVjEwMEgxNjBWMTIwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCAxNDBIMTQwVjEyMEgxNjBWMTQwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCAxNjBIMTQwVjE0MEgxNjBWMTYwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCAxODBIMTQwVjE2MEgxNjBWMTgwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCAyMDBIMTQwVjE4MEgxNjBWMjAwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCAyMjBIMTQwVjIwMEgxNjBWMjIwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCAyNDBIMTQwVjIyMEgxNjBWMjQwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCAyNjBIMTQwVjI0MEgxNjBWMjYwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCAyODBIMTQwVjI2MEgxNjBWMjgwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCAzMDBIMTQwVjI4MEgxNjBWMzAwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCAzMjBIMTQwVjMwMEgxNjBWMzIwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCAzNDBIMTQwVjMyMEgxNjBWMzQwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCAzNjBIMTQwVjM0MEgxNjBWMzYwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCAzODBIMTQwVjM2MEgxNjBWMzgwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCA0MDBIMTQwVjM4MEgxNjBWNDAwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCA0MjBIMTQwVjQwMEgxNjBWNDIwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCA0NDBIMTQwVjQyMEgxNjBWNDQwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCA0NjBIMTQwVjQ0MEgxNjBWNDYwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCA0ODBIMTQwVjQ2MEgxNjBWNDgwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCA1MDBIMTQwVjQ4MEgxNjBWNTAwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCA1MjBIMTQwVjUwMEgxNjBWNTIwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCA1NDBIMTQwVjUyMEgxNjBWNTQwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCA1NjBIMTQwVjU0MEgxNjBWNTYwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCA1ODBIMTQwVjU2MEgxNjBWNTgwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCA2MDBIMTQwVjU4MEgxNjBWNjAwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCA2MjBIMTQwVjYwMEgxNjBWNjIwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCA2NDBIMTQwVjYyMEgxNjBWNjQwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCA2NjBIMTQwVjY0MEgxNjBWNjYwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCA2ODBIMTQwVjY2MEgxNjBWNjgwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCA3MDBIMTQwVjY4MEgxNjBWNzAwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCA3MjBIMTQwVjcwMEgxNjBWNzIwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCA3NDBIMTQwVjcyMEgxNjBWNzQwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCA3NjBIMTQwVjc0MEgxNjBWNzYwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCA3ODBIMTQwVjc2MEgxNjBWNzgwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCA4MDBIMTQwVjc4MEgxNjBWODAwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCA4MjBIMTQwVjgwMEgxNjBWODIwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCA4NDBIMTQwVjgyMEgxNjBWODQwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCA4NjBIMTQwVjg0MEgxNjBWODYwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCA4ODBIMTQwVjg2MEgxNjBWODgwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCA5MDBIMTQwVjg4MEgxNjBWOTAwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCA5MjBIMTQwVjkwMEgxNjBWOTIwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCA5NDBIMTQwVjkyMEgxNjBWOTQwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCA5NjBIMTQwVjk0MEgxNjBWOTYwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCA5ODBIMTQwVjk2MEgxNjBWOTgwWiIgZmlsbD0iI0QxRDVEM0EiLz4KPHBhdGggZD0iTTE2MCAxMDAwSDE0MFY5ODBIMTYwVjEwMDBaIiBmaWxsPSIjRDFENUQzQSIvPgo8L3N2Zz4K';
                  }}
                />
                <div className="p-3">
                  <p className="text-sm text-gray-600 truncate">{image.alt || 'No alt text'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <a
                      href={image.src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <ExternalLink size={12} />
                      View
                    </a>
                    <button
                      onClick={() => copyToClipboard(image.src, index)}
                      className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                      {copiedIndex === index ? <Check size={12} /> : <Copy size={12} />}
                      Copy URL
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'paragraphs':
        return (
          <div className="space-y-4">
            {data.paragraphs.map((paragraph, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <p className="text-gray-800 leading-relaxed flex-1">{paragraph}</p>
                  <button
                    onClick={() => copyToClipboard(paragraph, index)}
                    className="ml-3 p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                  >
                    {copiedIndex === index ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        );

      case 'prices':
        return (
          <div className="space-y-6">
            {/* Current Prices */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Prices</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.prices.map((price, index) => (
                  <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-800">{price}</span>
                      <button
                        onClick={() => copyToClipboard(price, index)}
                        className="p-1 text-green-600 hover:text-green-800 transition-colors"
                      >
                        {copiedIndex === index ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price History */}
            {priceHistory.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Price History</h3>
                <div className="space-y-3">
                  {priceHistory.map((entry, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {entry.prices.map((price, priceIndex) => (
                          <span
                            key={priceIndex}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                          >
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
        );

      case 'metadata':
        return <MetadataPanel metadata={data.metadata} socialMedia={data.socialMedia} />;

      case 'social':
        return (
          <div className="space-y-4">
            {data.socialMedia.map((social, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {social.type === 'facebook' ? '🔵' : 
                       social.type === 'twitter' ? '🐦' : 
                       social.type === 'instagram' ? '📷' : 
                       social.type === 'linkedin' ? '💼' : 
                       social.type === 'youtube' ? '📺' : '🔗'}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800 capitalize">{social.platform}</p>
                      <p className="text-sm text-gray-600">{social.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <button
                      onClick={() => copyToClipboard(social.url, index)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {copiedIndex === index ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'forms':
        return (
          <div className="space-y-4">
            {data.forms.map((form, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="mb-3">
                  <h4 className="font-medium text-gray-800">Form {index + 1}</h4>
                  <p className="text-sm text-gray-600">
                    Action: {form.action} | Method: {form.method}
                  </p>
                </div>
                <div className="space-y-2">
                  {form.inputs.map((input, inputIndex) => (
                    <div key={inputIndex} className="flex items-center gap-3 p-2 bg-white rounded border">
                      <span className="text-sm font-medium text-gray-700">{input.name}</span>
                      <span className="text-xs text-gray-500">({input.type})</span>
                      {input.required && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Required</span>
                      )}
                      {input.placeholder && (
                        <span className="text-xs text-gray-500">"{input.placeholder}"</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 'tables':
        return (
          <div className="space-y-6">
            {data.tables.map((table, index) => (
              <div key={index} className="bg-gray-50 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h4 className="font-medium text-gray-800">Table {index + 1}</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        {table.headers.map((header, headerIndex) => (
                          <th key={headerIndex} className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {table.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-gray-200">
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-2 text-sm text-gray-800">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        );

      case 'scripts':
        return (
          <div className="space-y-4">
            {data.scripts.map((script, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-800">Script {index + 1}</h4>
                    <p className="text-sm text-gray-600">Type: {script.type}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(script.src || script.content || '', index)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {copiedIndex === index ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                {script.src && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-700 break-all">{script.src}</p>
                  </div>
                )}
                {script.content && (
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    <code>{script.content.substring(0, 200)}...</code>
                  </pre>
                )}
              </div>
            ))}
          </div>
        );

      case 'analytics':
        return (
          <AnalyticsPanel 
            data={data} 
            stats={{
              totalElements: data.headlines.length + data.links.length + data.images.length + data.paragraphs.length + data.prices.length + data.forms.length + data.tables.length + data.scripts.length,
              processingTime: data.stats?.processingTime || 0,
              pageSize: data.stats?.pageSize || 0,
              wordCount: data.wordCount || data.paragraphs.join(' ').split(' ').length,
              linkCount: data.links.length,
              imageCount: data.images.length
            }} 
          />
        );

      default:
        return <div className="text-gray-500">Select a tab to view content</div>;
    }
  };

  return (
    <div className="min-h-[400px]">
      {renderContent()}
    </div>
  );
}; 