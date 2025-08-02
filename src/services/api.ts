import type { ScrapeRequest, ScrapeResponse, PriceHistory } from '@/types';

const API_BASE_URL = 'https://webscraper-backend-js-production.up.railway.app';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new ApiError(
      errorData.message || `HTTP ${response.status}`,
      response.status,
      errorData.code
    );
  }

  return response.json();
}

export const api = {
  async scrapeWebsite(request: ScrapeRequest): Promise<ScrapeResponse> {
    return makeRequest<ScrapeResponse>('/api/scrape', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async getPriceHistory(url: string): Promise<PriceHistory[]> {
    return makeRequest<PriceHistory[]>(`/api/price-history?url=${encodeURIComponent(url)}`);
  },

  async checkHealth(): Promise<{ status: string }> {
    return makeRequest<{ status: string }>('/api/health');
  },
};

export { ApiError }; 