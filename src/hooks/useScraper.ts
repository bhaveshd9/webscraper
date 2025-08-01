import { useState, useCallback } from 'react';
import { api, ApiError } from '@/services/api';
import type { ScrapedData, ScrapeOptions, PriceHistory } from '@/types';

interface UseScraperReturn {
  data: ScrapedData | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  priceHistory: PriceHistory[];
  scrape: (url: string, options: ScrapeOptions) => Promise<void>;
  clearData: () => void;
  fetchPriceHistory: (url: string) => Promise<void>;
}

export const useScraper = (): UseScraperReturn => {
  const [data, setData] = useState<ScrapedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);

  const scrape = useCallback(async (url: string, options: ScrapeOptions) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setData(null);

    try {
      const response = await api.scrapeWebsite({ url, options });
      
      if (response.success && response.data) {
        setData(response.data);
        setSuccess(true);
        await fetchPriceHistory(url);
      } else {
        throw new Error(response.error || 'Failed to scrape website');
      }
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : err instanceof Error 
          ? err.message 
          : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Scraping error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPriceHistory = useCallback(async (url: string) => {
    try {
      const history = await api.getPriceHistory(url);
      setPriceHistory(history);
    } catch (err) {
      console.error('Error fetching price history:', err);
      // Don't set error state for price history as it's not critical
    }
  }, []);

  const clearData = useCallback(() => {
    setData(null);
    setError(null);
    setSuccess(false);
    setPriceHistory([]);
  }, []);

  return {
    data,
    loading,
    error,
    success,
    priceHistory,
    scrape,
    clearData,
    fetchPriceHistory,
  };
}; 