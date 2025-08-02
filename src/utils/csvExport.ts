import type { ScrapedData } from '@/types';

export interface CSVExportOptions {
  includeHeaders?: boolean;
  includeImages?: boolean;
  includeLinks?: boolean;
  includeHeadlines?: boolean;
  includeParagraphs?: boolean;
  includePrices?: boolean;
  includeMetadata?: boolean;
  includeSocialMedia?: boolean;
  includeForms?: boolean;
  includeTables?: boolean;
  includeScripts?: boolean;
  includeStyles?: boolean;
  filename?: string;
}

export class CSVExporter {
  static exportData(data: ScrapedData, options: CSVExportOptions = {}): string {
    const {

      includeImages = true,
      includeLinks = true,
      includeHeadlines = true,
      includeParagraphs = true,
      includePrices = true,
      includeMetadata = true,
      includeSocialMedia = true,
      includeForms = true,
      includeTables = true,
      includeScripts = false,
      includeStyles = false,

    } = options;

    const csvData: string[] = [];

    // Add metadata section
    if (includeMetadata) {
      csvData.push('=== METADATA ===');
      csvData.push('Field,Value');
      csvData.push(`Title,"${this.escapeCSV(data.title)}"`);
      csvData.push(`Description,"${this.escapeCSV(data.metadata.description)}"`);
      csvData.push(`Keywords,"${this.escapeCSV(data.metadata.keywords.join(', '))}"`);
      csvData.push(`Author,"${this.escapeCSV(data.metadata.author)}"`);
      csvData.push(`Language,"${this.escapeCSV(data.language)}"`);
      csvData.push(`Word Count,"${data.wordCount}"`);
      csvData.push(`Last Modified,"${this.escapeCSV(data.lastModified || '')}"`);
      csvData.push('');
    }

    // Add headlines section
    if (includeHeadlines && data.headlines.length > 0) {
      csvData.push('=== HEADLINES ===');
      csvData.push('Type,Text');
      data.headlines.forEach(headline => {
        csvData.push(`${headline.type},"${this.escapeCSV(headline.text)}"`);
      });
      csvData.push('');
    }

    // Add links section
    if (includeLinks && data.links.length > 0) {
      csvData.push('=== LINKS ===');
      csvData.push('Text,URL');
      data.links.forEach(link => {
        csvData.push(`"${this.escapeCSV(link.text)}","${this.escapeCSV(link.href)}"`);
      });
      csvData.push('');
    }

    // Add images section
    if (includeImages && data.images.length > 0) {
      csvData.push('=== IMAGES ===');
      csvData.push('Alt Text,URL');
      data.images.forEach(image => {
        csvData.push(`"${this.escapeCSV(image.alt)}","${this.escapeCSV(image.src)}"`);
      });
      csvData.push('');
    }

    // Add paragraphs section
    if (includeParagraphs && data.paragraphs.length > 0) {
      csvData.push('=== PARAGRAPHS ===');
      csvData.push('Content');
      data.paragraphs.forEach(paragraph => {
        csvData.push(`"${this.escapeCSV(paragraph)}"`);
      });
      csvData.push('');
    }

    // Add prices section
    if (includePrices && data.prices.length > 0) {
      csvData.push('=== PRICES ===');
      csvData.push('Price');
      data.prices.forEach(price => {
        csvData.push(`"${this.escapeCSV(price)}"`);
      });
      csvData.push('');
    }

    // Add social media section
    if (includeSocialMedia && data.socialMedia.length > 0) {
      csvData.push('=== SOCIAL MEDIA ===');
      csvData.push('Platform,Type,URL');
      data.socialMedia.forEach(social => {
        csvData.push(`${social.platform},${social.type},"${this.escapeCSV(social.url)}"`);
      });
      csvData.push('');
    }

    // Add forms section
    if (includeForms && data.forms.length > 0) {
      csvData.push('=== FORMS ===');
      csvData.push('Action,Method,Input Name,Input Type,Placeholder,Required');
      data.forms.forEach(form => {
        if (form.inputs.length > 0) {
          form.inputs.forEach(input => {
            csvData.push(`"${this.escapeCSV(form.action)}","${form.method}","${this.escapeCSV(input.name)}","${input.type}","${this.escapeCSV(input.placeholder || '')}","${input.required}"`);
          });
        } else {
          csvData.push(`"${this.escapeCSV(form.action)}","${form.method}","","","",""`);
        }
      });
      csvData.push('');
    }

    // Add tables section
    if (includeTables && data.tables.length > 0) {
      csvData.push('=== TABLES ===');
      data.tables.forEach((table, tableIndex) => {
        csvData.push(`--- TABLE ${tableIndex + 1} ---`);
        if (table.headers.length > 0) {
          csvData.push(table.headers.map(header => this.escapeCSV(header)).join(','));
        }
        table.rows.forEach(row => {
          csvData.push(row.map(cell => this.escapeCSV(cell)).join(','));
        });
        csvData.push('');
      });
    }

    // Add scripts section
    if (includeScripts && data.scripts.length > 0) {
      csvData.push('=== SCRIPTS ===');
      csvData.push('Type,Source URL');
      data.scripts.forEach(script => {
        csvData.push(`${script.type},"${this.escapeCSV(script.src)}"`);
      });
      csvData.push('');
    }

    // Add styles section
    if (includeStyles && data.styles.length > 0) {
      csvData.push('=== STYLES ===');
      csvData.push('URL,Media');
      data.styles.forEach(style => {
        csvData.push(`"${this.escapeCSV(style.href)}","${this.escapeCSV(style.media || '')}"`);
      });
      csvData.push('');
    }

    return csvData.join('\n');
  }

  static exportToFile(data: ScrapedData, options: CSVExportOptions = {}): void {
    const csvContent = this.exportData(data, options);
    const filename = options.filename || 'scraped-data';
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  static exportVehicleData(data: ScrapedData, _options: CSVExportOptions = {}): string {
    // Specialized export for automotive data
    const csvData: string[] = [];
    
    csvData.push('=== VEHICLE DATA ===');
    csvData.push('Field,Value');
    csvData.push(`Title,"${this.escapeCSV(data.title)}"`);
    
    // Extract vehicle information from title and content
    const vehicleInfo = this.extractVehicleInfo(data);
    csvData.push(`Make,"${this.escapeCSV(vehicleInfo.make)}"`);
    csvData.push(`Model,"${this.escapeCSV(vehicleInfo.model)}"`);
    csvData.push(`Year,"${this.escapeCSV(vehicleInfo.year)}"`);
    csvData.push(`Trim,"${this.escapeCSV(vehicleInfo.trim)}"`);
    
    // Add prices
    if (data.prices.length > 0) {
      csvData.push('');
      csvData.push('=== PRICING ===');
      csvData.push('Price');
      data.prices.forEach(price => {
        csvData.push(`"${this.escapeCSV(price)}"`);
      });
    }
    
    // Add specifications from headlines and paragraphs
    const specs = this.extractSpecifications(data);
    if (specs.length > 0) {
      csvData.push('');
      csvData.push('=== SPECIFICATIONS ===');
      csvData.push('Specification,Value');
      specs.forEach(spec => {
        csvData.push(`"${this.escapeCSV(spec.name)}","${this.escapeCSV(spec.value)}"`);
      });
    }
    
    // Add images
    if (data.images.length > 0) {
      csvData.push('');
      csvData.push('=== IMAGES ===');
      csvData.push('Description,URL');
      data.images.forEach(image => {
        csvData.push(`"${this.escapeCSV(image.alt)}","${this.escapeCSV(image.src)}"`);
      });
    }
    
    return csvData.join('\n');
  }

  private static escapeCSV(text: string): string {
    if (!text) return '';
    // Escape quotes by doubling them and wrap in quotes if contains comma, quote, or newline
    const escaped = text.replace(/"/g, '""');
    if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') || escaped.includes('\r')) {
      return `"${escaped}"`;
    }
    return escaped;
  }

  private static extractVehicleInfo(data: ScrapedData): { make: string; model: string; year: string; trim: string } {
    const title = data.title.toLowerCase();
    const headlines = data.headlines.map(h => h.text.toLowerCase()).join(' ');
    const paragraphs = data.paragraphs.join(' ').toLowerCase();
    
    const allText = `${title} ${headlines} ${paragraphs}`;
    
    // Extract year
    const yearMatch = allText.match(/(20\d{2})/);
    const year = yearMatch ? yearMatch[1] : '';
    
    // Extract make and model
    const makes = ['chevrolet', 'ford', 'toyota', 'honda', 'bmw', 'mercedes', 'audi', 'volkswagen', 'nissan', 'hyundai', 'kia'];
    const models = ['colorado', 'silverado', 'camaro', 'corvette', 'f-150', 'mustang', 'camry', 'accord', 'civic', '3-series', 'c-class'];
    
    let make = '';
    let model = '';
    
    for (const carMake of makes) {
      if (allText.includes(carMake)) {
        make = carMake;
        break;
      }
    }
    
    for (const carModel of models) {
      if (allText.includes(carModel)) {
        model = carModel;
        break;
      }
    }
    
    // Extract trim level
    const trimMatch = allText.match(/(lt|ls|lx|sport|premium|luxury|limited|touring|ex|dx|lx)/i);
    const trim = trimMatch ? trimMatch[1] : '';
    
    return { make, model, year, trim };
  }

  private static extractSpecifications(data: ScrapedData): Array<{ name: string; value: string }> {
    const specs: Array<{ name: string; value: string }> = [];
    const allText = [...data.headlines, ...data.paragraphs].join(' ').toLowerCase();
    
    // Engine specifications
    const engineMatch = allText.match(/(\d+\.?\d*)\s*(l|liter|cyl|cylinder)/i);
    if (engineMatch) {
      specs.push({ name: 'Engine', value: `${engineMatch[1]}${engineMatch[2]}` });
    }
    
    // Horsepower
    const hpMatch = allText.match(/(\d+)\s*hp/i);
    if (hpMatch) {
      specs.push({ name: 'Horsepower', value: `${hpMatch[1]} HP` });
    }
    
    // Transmission
    const transMatch = allText.match(/(automatic|manual|cvt|6-speed|8-speed|10-speed)/i);
    if (transMatch) {
      specs.push({ name: 'Transmission', value: transMatch[1] });
    }
    
    // Fuel economy
    const mpgMatch = allText.match(/(\d+)\s*mpg/i);
    if (mpgMatch) {
      specs.push({ name: 'Fuel Economy', value: `${mpgMatch[1]} MPG` });
    }
    
    // Drivetrain
    const driveMatch = allText.match(/(awd|4wd|fwd|rwd)/i);
    if (driveMatch) {
      specs.push({ name: 'Drivetrain', value: driveMatch[1].toUpperCase() });
    }
    
    return specs;
  }
} 