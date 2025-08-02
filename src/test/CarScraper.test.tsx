import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CarScraper from '../components/CarScraper';

// Mock fetch
global.fetch = vi.fn();

describe('CarScraper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders car scraper interface', () => {
    render(<CarScraper />);
    expect(screen.getByText('Car Data Scraper')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://www.chevrolet.com/vehicles/silverado-1500.html')).toBeInTheDocument();
  });

  it('shows advanced options when toggled', () => {
    render(<CarScraper />);
    const advancedOptions = screen.getByText('Advanced Options');
    expect(advancedOptions).toBeInTheDocument();
  });

  it('displays terminal log', () => {
    render(<CarScraper />);
    expect(screen.getByText('Terminal ready...')).toBeInTheDocument();
  });

  it('shows brochure options when include brochure is checked', () => {
    render(<CarScraper />);
    const brochureCheckbox = screen.getByText('Include brochure data');
    fireEvent.click(brochureCheckbox);
    expect(screen.getByText('Brochure PDF URL')).toBeInTheDocument();
  });
}); 