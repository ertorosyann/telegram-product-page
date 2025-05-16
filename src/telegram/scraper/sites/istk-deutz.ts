import puppeteer from 'puppeteer';

export async function scrapeIstkDeutz(
  name: string,
  count: string,
  brand: string,
): Promise<string> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('https://istk-deutz.ru/', {
      waitUntil: 'domcontentloaded',
    });

    // Type product name into search input
    await page.type('#title-search-input', name);

    // Press Enter and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.keyboard.press('Enter'),
    ]);

    // Wait for first product link in search results
    await page.waitForSelector('tbody tr .arrivals_product_title a', {
      timeout: 10000,
    });

    // Get href of first product link
    const productHref = await page.$eval(
      'tbody tr .arrivals_product_title a',
      (el) => (el as HTMLAnchorElement).getAttribute('href') || '',
    );

    if (!productHref) {
      throw new Error('Product link not found in search results');
    }

    // Go to product page
    const productUrl = new URL(productHref, 'https://istk-deutz.ru').toString();
    await page.goto(productUrl, { waitUntil: 'domcontentloaded' });

    // Wait for price and title elements to load
    await page.waitForSelector('div.price', { timeout: 10000 });
    await page.waitForSelector('div.title h1', { timeout: 10000 });

    // Extract product title
    const productTitle = await page.$eval(
      'div.title h1',
      (el) => el.textContent?.trim() || 'No title found',
    );

    // Extract price text
    const priceText = await page.$eval(
      'div.price',
      (el) => el.textContent?.trim() || 'No price found',
    );

    await browser.close();

    return `📦 Product: ${productTitle}\n💰 Price: ${priceText}`;
  } catch (error) {
    await browser.close();
    console.error('Scraping error:', error);
    return '❌ Could not retrieve product info from istk-deutz.ru.';
  }
}
