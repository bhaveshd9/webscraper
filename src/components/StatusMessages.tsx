import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface StatusMessagesProps {
  error: string | null;
  success: boolean;
}

export const StatusMessages: React.FC<StatusMessagesProps> = ({ error, success }) => {
  if (!error && !success) return null;

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 animate-fade-in">
          <AlertCircle size={20} />
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 text-green-600 rounded-lg flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={20} />
          Successfully scraped website!
        </div>
      )}
    </div>
  );
}; 