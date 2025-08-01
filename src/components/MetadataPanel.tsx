import React from 'react';
import { Tag, Share2, Globe, Calendar, User, Eye, ExternalLink } from 'lucide-react';
import type { Metadata, SocialMedia } from '@/types';

interface MetadataPanelProps {
  metadata: Metadata;
  socialMedia: SocialMedia[];
}

export const MetadataPanel: React.FC<MetadataPanelProps> = ({ metadata, socialMedia }) => {
  const metaItems = [
    { label: 'Description', value: metadata.description, icon: Tag },
    { label: 'Author', value: metadata.author, icon: User },
    { label: 'Viewport', value: metadata.viewport, icon: Eye },
    { label: 'Robots', value: metadata.robots, icon: Globe },
    { label: 'Canonical', value: metadata.canonical, icon: ExternalLink },
  ];

  const ogItems = [
    { label: 'OG Title', value: metadata.ogTitle, icon: Tag },
    { label: 'OG Description', value: metadata.ogDescription, icon: Tag },
    { label: 'OG Image', value: metadata.ogImage, icon: ExternalLink },
    { label: 'Twitter Card', value: metadata.twitterCard, icon: Share2 },
  ];

  const getSocialIcon = (type: string) => {
    switch (type) {
      case 'facebook': return '🔵';
      case 'twitter': return '🐦';
      case 'instagram': return '📷';
      case 'linkedin': return '💼';
      case 'youtube': return '📺';
      default: return '🔗';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Tag className="h-6 w-6 text-blue-500" />
        <h2 className="text-xl font-semibold text-gray-800">SEO & Metadata</h2>
      </div>

      {/* Basic Metadata */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-green-500" />
          Basic Metadata
        </h3>
        <div className="space-y-3">
          {metaItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Icon className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700">{item.label}</p>
                  <p className="text-sm text-gray-600 break-words">
                    {item.value || 'Not specified'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Keywords */}
      {metadata.keywords.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {metadata.keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Open Graph & Twitter */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Share2 className="h-5 w-5 text-purple-500" />
          Social Media Tags
        </h3>
        <div className="space-y-3">
          {ogItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <Icon className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700">{item.label}</p>
                  <p className="text-sm text-gray-600 break-words">
                    {item.value || 'Not specified'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Social Media Links */}
      {socialMedia.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Share2 className="h-5 w-5 text-pink-500" />
            Social Media Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {socialMedia.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-2xl">{getSocialIcon(social.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 capitalize">{social.platform}</p>
                  <p className="text-sm text-gray-500 truncate">{social.url}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* SEO Score */}
      <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Tag className="h-4 w-4 text-green-500" />
          SEO Score
        </h4>
        <div className="flex items-center gap-4">
          <div className="text-3xl font-bold text-green-600">
            {Math.min(100, Math.round(
              (metadata.description ? 20 : 0) +
              (metadata.keywords.length > 0 ? 20 : 0) +
              (metadata.ogTitle ? 15 : 0) +
              (metadata.ogDescription ? 15 : 0) +
              (metadata.ogImage ? 10 : 0) +
              (metadata.canonical ? 10 : 0) +
              (socialMedia.length > 0 ? 10 : 0)
            ))}%
          </div>
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round(
                    (metadata.description ? 20 : 0) +
                    (metadata.keywords.length > 0 ? 20 : 0) +
                    (metadata.ogTitle ? 15 : 0) +
                    (metadata.ogDescription ? 15 : 0) +
                    (metadata.ogImage ? 10 : 0) +
                    (metadata.canonical ? 10 : 0) +
                    (socialMedia.length > 0 ? 10 : 0)
                  ))}%`
                }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {metadata.description && metadata.keywords.length > 0 ? 'Excellent SEO setup!' : 'Good SEO foundation with room for improvement.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 