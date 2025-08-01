import React, { useState } from 'react';
import { Bell, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { format } from 'date-fns';
import type { PriceAlert } from '@/types';
import { validatePrice } from '@/utils/validation';

interface PriceAlertsProps {
  priceAlerts: PriceAlert[];
  onAddAlert: (alert: Omit<PriceAlert, 'id'>) => void;
  onRemoveAlert: (id: string) => void;
  onToggleAlert: (id: string) => void;
  currentUrl: string;
  currentPrices: string[];
}

export const PriceAlerts: React.FC<PriceAlertsProps> = ({
  priceAlerts,
  onAddAlert,
  onRemoveAlert,
  onToggleAlert,
  currentUrl,
  currentPrices,
}) => {
  const [newAlertPrice, setNewAlertPrice] = useState('');

  const handleAddPriceAlert = () => {
    if (!currentUrl || !newAlertPrice) return;
    
    if (!validatePrice(newAlertPrice)) {
      return;
    }

    const targetPrice = parseFloat(newAlertPrice);
    const currentPrice = currentPrices[0] ? parseFloat(currentPrices[0].replace(/[$,]/g, '')) : null;

    onAddAlert({
      url: currentUrl,
      targetPrice,
      currentPrice,
      lastChecked: new Date().toISOString(),
      isActive: true,
    });
    setNewAlertPrice('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddPriceAlert();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Bell size={20} className="text-blue-500" />
        Price Alerts
      </h2>
      
      <div className="flex gap-4 mb-4">
        <input
          type="number"
          value={newAlertPrice}
          onChange={(e) => setNewAlertPrice(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter target price..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          step="0.01"
          min="0"
        />
        <button
          onClick={handleAddPriceAlert}
          disabled={!newAlertPrice || !validatePrice(newAlertPrice)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          Add Alert
        </button>
      </div>
      
      <div className="space-y-2">
        {priceAlerts.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No price alerts set</p>
        ) : (
          priceAlerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-800">Target: ${alert.targetPrice}</p>
                  <button
                    onClick={() => onToggleAlert(alert.id)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    {alert.isActive ? (
                      <ToggleRight size={16} className="text-green-500" />
                    ) : (
                      <ToggleLeft size={16} className="text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Current: {alert.currentPrice ? `$${alert.currentPrice}` : 'N/A'}
                </p>
                <p className="text-xs text-gray-400">
                  Last checked: {alert.lastChecked ? format(new Date(alert.lastChecked), 'PPp') : 'Never'}
                </p>
              </div>
              <button
                onClick={() => onRemoveAlert(alert.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 