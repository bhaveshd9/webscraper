import React from 'react';
import {
  Type,
  Link,
  Image,
  FileText,
  DollarSign,
  Tag,
  Share2,
  FormInput,
  Table,
  Code,
  BarChart3
} from 'lucide-react';
import type { TabType, TabConfig } from '@/types';

interface ResultsTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  tabConfigs: TabConfig[];
}

export const ResultsTabs: React.FC<ResultsTabsProps> = ({
  activeTab,
  onTabChange,
  tabConfigs,
}) => {
  const getTabIcon = (type: TabType) => {
    switch (type) {
      case 'headlines': return Type;
      case 'links': return Link;
      case 'images': return Image;
      case 'paragraphs': return FileText;
      case 'prices': return DollarSign;
      case 'metadata': return Tag;
      case 'social': return Share2;
      case 'forms': return FormInput;
      case 'tables': return Table;
      case 'scripts': return Code;
      case 'analytics': return BarChart3;
      default: return Type;
    }
  };

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {tabConfigs.map((config) => {
        const Icon = getTabIcon(config.type);
        return (
          <button
            key={config.type}
            onClick={() => onTabChange(config.type)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap ${
              activeTab === config.type
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
            disabled={!config.enabled}
          >
            <Icon size={20} />
            <span className="font-medium">{config.label}</span>
            <span className={`ml-1 px-2 py-0.5 text-sm rounded-full ${
              activeTab === config.type
                ? 'bg-white/20 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {config.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}; 