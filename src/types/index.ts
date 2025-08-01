import React from 'react';

export interface ScrapedData {
  title: string;
  headlines: Headline[];
  links: Link[];
  images: Image[];
  paragraphs: string[];
  prices: string[];
  metadata: Metadata;
  socialMedia: SocialMedia[];
  forms: Form[];
  tables: Table[];
  scripts: Script[];
  styles: Style[];
  wordCount: number;
  language: string;
  lastModified?: string;
  stats?: ScrapeStats;
}

export interface Headline {
  type: string;
  text: string;
}

export interface Link {
  href: string;
  text: string;
}

export interface Image {
  src: string;
  alt: string;
}

export interface Metadata {
  description: string;
  keywords: string[];
  author: string;
  viewport: string;
  robots: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: string;
  canonical: string;
}

export interface SocialMedia {
  platform: string;
  url: string;
  type: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'other';
}

export interface Form {
  action: string;
  method: string;
  inputs: FormInput[];
}

export interface FormInput {
  name: string;
  type: string;
  placeholder?: string;
  required: boolean;
}

export interface Table {
  headers: string[];
  rows: string[][];
}

export interface Script {
  src: string;
  type: string;
  content?: string;
}

export interface Style {
  href: string;
  media?: string;
}

export interface ScrapeOptions {
  includeImages: boolean;
  includeLinks: boolean;
  includeHeadlines: boolean;
  includeParagraphs: boolean;
  includeMetadata: boolean;
  includeSocialMedia: boolean;
  includeForms: boolean;
  includeTables: boolean;
  includeScripts: boolean;
  includeStyles: boolean;
  maxResults: number;
  extractEmails: boolean;
  extractPhones: boolean;
  extractAddresses: boolean;
  followRedirects: boolean;
  timeout: number;
  userAgent: string;
  // Anti-scraping bypass options
  referer?: string;
  cookies?: string;
  proxy?: string;
  randomDelay?: boolean;
  stealth?: boolean;
  mobile?: boolean;
  // Enhanced scraping options
  useBrowser?: boolean;
  useSelenium?: boolean;
  waitForSelector?: string;
  waitForTimeout?: number;
  scrollToBottom?: boolean;
  takeScreenshot?: boolean;
  interceptRequests?: boolean;
  userInteractions?: UserInteraction[];
}

export interface UserInteraction {
  type: 'click' | 'type' | 'scroll' | 'wait';
  selector?: string;
  value?: string;
  timeout?: number;
}

export interface ScrapingResult {
  success: boolean;
  data?: ScrapedData;
  error?: string;
  method: 'http' | 'browser';
  processingTime: number;
  pageSize: number;
  screenshot?: string;
}

export interface AntiScrapingTechnique {
  name: string;
  description: string;
  implementation: string;
}

export interface BypassMethod {
  blocker: string;
  methods: string[];
}

export interface AntiScrapingData {
  userAgents: string[];
  referers: string[];
  techniques: AntiScrapingTechnique[];
  commonBlockers: string[];
  bypassMethods: BypassMethod[];
}

export interface TestScrapingRequest {
  url: string;
  technique: 'stealth' | 'mobile' | 'slow' | 'default';
}

export interface PriceAlert {
  id: string;
  url: string;
  targetPrice: number;
  currentPrice: number | null;
  lastChecked: string | null;
  isActive: boolean;
}

export interface PriceHistory {
  timestamp: string;
  prices: string[];
}

export interface ScrapeRequest {
  url: string;
  options: ScrapeOptions;
}

export interface ScrapeResponse {
  success: boolean;
  data?: ScrapedData;
  error?: string;
  stats?: ScrapeStats;
}

export interface ScrapeStats {
  totalElements: number;
  processingTime: number;
  pageSize: number;
  wordCount: number;
  linkCount: number;
  imageCount: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export type TabType = 'headlines' | 'links' | 'images' | 'paragraphs' | 'prices' | 'metadata' | 'social' | 'forms' | 'tables' | 'scripts' | 'analytics';

export interface TabConfig {
  type: TabType;
  label: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  count: number;
  enabled: boolean;
}

export interface ScrapingSession {
  id: string;
  url: string;
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  data?: ScrapedData;
  error?: string;
}

export interface ScrapingHistory {
  sessions: ScrapingSession[];
  totalSessions: number;
  successRate: number;
  averageTime: number;
} 