interface WindowWithEnv extends Window {
    __ENV__?: {
      VITE_CAR_API_URL?: string;
    };
  }
  
  const CAR_API_BASE_URL = (typeof window !== 'undefined' && (window as WindowWithEnv).__ENV__?.VITE_CAR_API_URL) || 'http://localhost:5000';
  
  // TypeScript interfaces for car scraping
  interface CarData {
    modelName: string;
    brand: string;
    fuelType: string;
    transmission: string;
    bodyType: string;
    dimensions: {
      length: string;
      width: string;
      height: string;
      wheelbase: string;
      groundClearance: string;
    };
    engine: {
      type: string;
      capacity: string;
      horsepower: string;
      torque: string;
      mileage: string;
      fuelTankSize: string;
    };
    variants: Array<{
      name: string;
      features: string[];
      price: string;
    }>;
    imageUrls: string[];
    features: {
      interior: string[];
      exterior: string[];
      safety: string[];
      tech: string[];
    };
    brochureData?: any;
    platformData?: Array<{
      name: string;
      price: string;
      imageUrl: string;
      detailUrl: string;
    }>;
  }
  
  interface CarScrapeResponse {
    success: boolean;
    carData: CarData;
    error?: string;
    message?: string;
  }
  
  class CarApiError extends Error {
    constructor(
      message: string,
      public status: number,
      public code?: string
    ) {
      super(message);
      this.name = 'CarApiError';
    }
  }
  
  async function makeCarRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${CAR_API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
  
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new CarApiError(
        errorData.message || `HTTP ${response.status}`,
        response.status,
        errorData.code
      );
    }
  
    return response.json();
  }
  
  export const carApi = {
    async scrapeCar(url: string, options: any = {}): Promise<CarScrapeResponse> {
      return makeCarRequest<CarScrapeResponse>('/api/scrape-car', {
        method: 'POST',
        body: JSON.stringify({
          url,
          options
        }),
      });
    },
  
    async checkHealth(): Promise<{ status: string }> {
      return makeCarRequest<{ status: string }>('/health');
    }
  };
  
  export { CarApiError }; export type { CarData, CarScrapeResponse };
