import { useState, useEffect, useCallback } from 'react';
import type { PriceAlert } from '@/types';

const STORAGE_KEY = 'priceAlerts';

export const usePriceAlerts = () => {
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(priceAlerts));
  }, [priceAlerts]);

  const addPriceAlert = useCallback((alert: Omit<PriceAlert, 'id'>) => {
    const newAlert: PriceAlert = {
      ...alert,
      id: crypto.randomUUID(),
      isActive: true,
    };
    setPriceAlerts(prev => [...prev, newAlert]);
  }, []);

  const removePriceAlert = useCallback((id: string) => {
    setPriceAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const updatePriceAlert = useCallback((id: string, updates: Partial<PriceAlert>) => {
    setPriceAlerts(prev => 
      prev.map(alert => 
        alert.id === id ? { ...alert, ...updates } : alert
      )
    );
  }, []);

  const togglePriceAlert = useCallback((id: string) => {
    setPriceAlerts(prev => 
      prev.map(alert => 
        alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
      )
    );
  }, []);

  const clearAllAlerts = useCallback(() => {
    setPriceAlerts([]);
  }, []);

  return {
    priceAlerts,
    addPriceAlert,
    removePriceAlert,
    updatePriceAlert,
    togglePriceAlert,
    clearAllAlerts,
  };
}; 