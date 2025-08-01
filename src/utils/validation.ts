export const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

export const sanitizeUrl = (url: string): string => {
  // Remove leading/trailing whitespace
  let sanitized = url.trim();
  
  // Add protocol if missing
  if (!sanitized.startsWith('http://') && !sanitized.startsWith('https://')) {
    sanitized = 'https://' + sanitized;
  }
  
  return sanitized;
};

export const validatePrice = (price: string): boolean => {
  const priceRegex = /^\d+(\.\d{1,2})?$/;
  return priceRegex.test(price) && parseFloat(price) > 0;
};

export const extractPriceFromText = (text: string): string[] => {
  const priceRegex = /\$?\d+(?:,\d{3})*(?:\.\d{2})?/g;
  return text.match(priceRegex) || [];
};

export const validateScrapeOptions = (options: unknown): boolean => {
  if (typeof options !== 'object' || options === null) return false;
  
  const opts = options as Record<string, unknown>;
  
  return (
    typeof opts.includeImages === 'boolean' &&
    typeof opts.includeLinks === 'boolean' &&
    typeof opts.includeHeadlines === 'boolean' &&
    typeof opts.includeParagraphs === 'boolean' &&
    typeof opts.maxResults === 'number' &&
    opts.maxResults > 0 &&
    opts.maxResults <= 100
  );
}; 