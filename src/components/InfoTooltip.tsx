import React, { useState, useRef, useEffect } from 'react';
import { Info, X } from 'lucide-react';

interface InfoTooltipProps {
  content: string;
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ 
  content, 
  title, 
 
  size = 'md',
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node) &&
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return { minWidth: '256px', maxWidth: '320px' };
      case 'md': return { minWidth: '320px', maxWidth: '480px' };
      case 'lg': return { minWidth: '480px', maxWidth: '640px' };
      case 'xl': return { minWidth: '640px', maxWidth: '800px' };
      case '2xl': return { minWidth: '800px', maxWidth: '1200px' };
      default: return { minWidth: '320px', maxWidth: '480px' };
    }
  };

  const getPositionStyles = () => {
    const sizeStyles = getSizeStyles();
    const maxWidth = parseInt(sizeStyles.maxWidth as string);
    
    // Calculate position based on trigger element
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipWidth = Math.min(maxWidth, window.innerWidth - 40);
      const tooltipHeight = 200; // Approximate height
      
      let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
      let top = rect.top - tooltipHeight - 10;
      
      // Adjust if tooltip goes off screen
      if (left < 20) left = 20;
      if (left + tooltipWidth > window.innerWidth - 20) {
        left = window.innerWidth - tooltipWidth - 20;
      }
      if (top < 20) {
        top = rect.bottom + 10;
      }
      
      return {
        position: 'fixed' as const,
        zIndex: 9999,
        left: `${left}px`,
        top: `${top}px`,
        maxWidth: `${tooltipWidth}px`,
        width: 'fit-content'
      };
    }
    
    // Fallback to center positioning
    return {
      position: 'fixed' as const,
      zIndex: 9999,
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      maxWidth: `${Math.min(maxWidth, window.innerWidth - 40)}px`,
      width: 'fit-content'
    };
  };

  const handleToggle = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={triggerRef}
        onClick={handleToggle}
        className="inline-flex items-center justify-center w-5 h-5 text-gray-400 hover:text-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
        aria-label="Information"
      >
        <Info size={16} />
      </button>

      {isVisible && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
            onClick={() => setIsVisible(false)}
          />
          
          {/* Tooltip */}
          <div
            ref={tooltipRef}
            className="bg-gray-900 text-white rounded-lg shadow-2xl border border-gray-700 animate-fade-in-up"
            style={getPositionStyles()}
          >
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h4 className="font-semibold text-lg">{title}</h4>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="p-4">
              <div 
                className="text-base leading-relaxed whitespace-pre-wrap font-normal"
                style={{ width: '100%', wordWrap: 'break-word' }}
              >
                {content}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Predefined tooltip content for common scraping options
export const SCRAPING_OPTIONS_INFO = {
  includeImages: {
    title: 'Include Images',
    content: 'Extract all images from the webpage including their source URLs and alt text. Useful for media analysis and content discovery.'
  },
  includeLinks: {
    title: 'Include Links',
    content: 'Extract all hyperlinks from the webpage. This includes internal links, external links, and their associated text.'
  },
  includeHeadlines: {
    title: 'Include Headlines',
    content: 'Extract all heading elements (H1, H2, H3) from the webpage. Useful for understanding the page structure and main topics.'
  },
  includeParagraphs: {
    title: 'Include Paragraphs',
    content: 'Extract all paragraph text from the webpage. This is useful for content analysis and text processing.'
  },
  includeMetadata: {
    title: 'Include Metadata',
    content: 'Extract meta tags including description, keywords, author, viewport settings, and Open Graph/Twitter card data.'
  },
  includeSocialMedia: {
    title: 'Include Social Media',
    content: 'Extract social media links and sharing buttons from the webpage. Identifies Facebook, Twitter, Instagram, LinkedIn, and YouTube links.'
  },
  includeForms: {
    title: 'Include Forms',
    content: 'Extract form elements including input fields, their types, names, and validation requirements. Useful for understanding user interaction points.'
  },
  includeTables: {
    title: 'Include Tables',
    content: 'Extract table data including headers and rows. Useful for data extraction from structured content like product lists or data tables.'
  },
  includeScripts: {
    title: 'Include Scripts',
    content: 'Extract JavaScript files and inline scripts. Useful for understanding the page functionality and external dependencies.'
  },
  includeStyles: {
    title: 'Include Styles',
    content: 'Extract CSS files and style information. Useful for understanding the page design and styling approach.'
  },
  maxResults: {
    title: 'Maximum Results',
    content: 'Limit the number of items extracted for each category. Higher values provide more comprehensive data but may take longer to process.'
  },
  extractEmails: {
    title: 'Extract Emails',
    content: 'Search for and extract email addresses from the webpage content. Useful for contact information gathering.'
  },
  extractPhones: {
    title: 'Extract Phone Numbers',
    content: 'Search for and extract phone numbers from the webpage content. Supports various formats including international numbers.'
  },
  extractAddresses: {
    title: 'Extract Addresses',
    content: 'Search for and extract physical addresses from the webpage content. Looks for common address patterns and street names.'
  },
  followRedirects: {
    title: 'Follow Redirects',
    content: 'Automatically follow HTTP redirects (301, 302, etc.) to reach the final destination page. Recommended for most scraping tasks.'
  },
  timeout: {
    title: 'Request Timeout',
    content: 'Maximum time to wait for a response from the server (in milliseconds). Higher values are useful for slow-loading pages.'
  },
  userAgent: {
    title: 'User Agent',
    content: 'The browser identifier sent with requests. Different user agents can help bypass some anti-scraping measures.'
  },
  randomDelay: {
    title: 'Random Delay',
    content: 'Add random delays between requests to avoid rate limiting and detection. Recommended for ethical scraping practices.'
  },
  stealth: {
    title: 'Stealth Mode',
    content: 'Use advanced anti-detection techniques including realistic headers, referers, and browser-like behavior patterns.'
  },
  mobile: {
    title: 'Mobile User Agent',
    content: 'Use a mobile browser user agent. Some websites serve different content to mobile devices, which may be easier to scrape.'
  },
  // Enhanced scraper options
  useBrowser: {
    title: 'Use Headless Browser (Puppeteer)',
    content: 'Use Puppeteer browser automation for JavaScript-heavy websites. Handles dynamic content, user interactions, and complex JavaScript applications.'
  },
  useSelenium: {
    title: 'Use Selenium WebDriver',
    content: 'Use Selenium WebDriver as an alternative to Puppeteer. Provides cross-browser compatibility and is often more stable for complex websites.'
  },
  waitForSelector: {
    title: 'Wait for Selector',
    content: 'Wait for a specific CSS selector to appear before scraping. Useful for dynamic content that loads after the initial page load.'
  },
  waitForTimeout: {
    title: 'Wait Timeout',
    content: 'Maximum time to wait for content to load (in milliseconds). Higher values ensure dynamic content is fully loaded before scraping.'
  },
  scrollToBottom: {
    title: 'Scroll to Bottom',
    content: 'Automatically scroll to the bottom of the page to trigger lazy-loaded content. Useful for infinite scroll pages or content that loads on scroll.'
  },
  takeScreenshot: {
    title: 'Take Screenshot',
    content: 'Capture a screenshot of the page after scraping. Useful for verification, debugging, or documentation purposes.'
  },
  interceptRequests: {
    title: 'Intercept Requests',
    content: 'Monitor and log network requests made by the page. Useful for discovering hidden APIs or understanding page dependencies.'
  },
  userInteractions: {
    title: 'User Interactions',
    content: 'Perform automated user actions like clicking buttons, filling forms, or scrolling. Essential for accessing content behind user interactions.'
  }
};

// Helper component for option labels with tooltips
interface OptionLabelProps {
  option: keyof typeof SCRAPING_OPTIONS_INFO;
  children: React.ReactNode;
  className?: string;
}

export const OptionLabel: React.FC<OptionLabelProps> = ({ option, children, className = '' }) => {
  const info = SCRAPING_OPTIONS_INFO[option];
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span>{children}</span>
      <InfoTooltip 
        title={info.title} 
        content={info.content}
        position="top"
        size="md"
      />
    </div>
  );
};

// Form comparison tooltip
export const FormComparisonTooltip: React.FC = () => {
  const comparisonContent = `📊 Standard Form:
• Basic HTTP scraping with Cheerio
• Fast and lightweight
• Good for static websites
• Limited JavaScript support
• Basic anti-scraping bypass

🚀 Enhanced Form:
• Headless browser with Puppeteer OR Selenium
• Full JavaScript execution
• Dynamic content support
• User interaction automation
• Advanced anti-scraping techniques
• Screenshot capabilities
• Network request monitoring
• Cross-browser compatibility (Selenium)

💡 When to use Enhanced:
• JavaScript-heavy websites (React, Vue, Angular)
• Sites with dynamic content loading
• Pages requiring user interactions
• Anti-scraping protected sites
• When you need screenshots or network data
• When Puppeteer fails, try Selenium`;

  return (
    <InfoTooltip
      title="Form Comparison"
      content={comparisonContent}
      position="bottom"
      size="2xl"
      className="ml-2"
    />
  );
}; 