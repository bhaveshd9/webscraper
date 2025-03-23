import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

async function scrapeWebsite(url) {
  try {
    // Fetch the HTML content
    const response = await fetch(url);
    const html = await response.text();

    // Load the HTML content into cheerio
    const $ = cheerio.load(html);

    // Example: Extract all headlines from a news website
    const headlines = [];
    $('h1, h2, h3').each((i, element) => {
      const headline = $(element).text().trim();
      if (headline) {
        headlines.push(headline);
      }
    });

    return headlines;
  } catch (error) {
    console.error('Error scraping website:', error);
    return [];
  }
}

// Example usage
const url = 'https://news.ycombinator.com'; // Example URL
console.log('Starting web scraper...');
console.log('Scraping:', url);

scrapeWebsite(url)
  .then(headlines => {
    console.log('\nFound Headlines:');
    headlines.forEach((headline, index) => {
      console.log(`${index + 1}. ${headline}`);
    });
  })
  .catch(error => {
    console.error('Failed to run scraper:', error);
  });