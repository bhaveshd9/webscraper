import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock the hooks and components
vi.mock('@/hooks/useScraper', () => ({
  useScraper: () => ({
    data: null,
    loading: false,
    error: null,
    success: false,
    priceHistory: new Map(),
    scrape: vi.fn(),
  }),
}));

vi.mock('@/components/SplashScreen', () => ({
  SplashScreen: ({ onComplete }: { onComplete: () => void }) => {
    // Auto-complete splash screen for testing
    setTimeout(onComplete, 0);
    return <div data-testid="splash-screen">Splash Screen</div>;
  },
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('Web Scraper Pro')).toBeInTheDocument();
  });

  it('shows splash screen initially', () => {
    render(<App />);
    expect(screen.getByTestId('splash-screen')).toBeInTheDocument();
  });

  it('renders main content after splash screen', async () => {
    render(<App />);
    // Wait for splash screen to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(screen.getByText('Advanced Web Scraper')).toBeInTheDocument();
  });
}); 