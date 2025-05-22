import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeZiptehOnline(productCode: string): Promise<string> {
  const start = performance.now();

  const searchUrl = ''; // https://zipteh.online/site/login;
  try {
    const searchResponse = await axios.get<string>(searchUrl);
    const $ = cheerio.load(searchResponse.data);

    const firstProductAnchor = $(
      'tr[itemprop="itemListElement"] a[itemprop="item"]',
    ).first();
    if (!firstProductAnchor.length) {
      return `❌ Product "${productCode}" not found.`;
    }

    const relativeLink = firstProductAnchor.attr('href');
    if (!relativeLink) {
      return `❌ Product link not found for "${productCode}".`;
    }

    const productUrl = `http://intertrek.info${relativeLink}`;

    const productResponse = await axios.get<string>(productUrl);
    const $$ = cheerio.load(productResponse.data);

    const productName = $$('.dl-horizontal dd').eq(1).text().trim(); // описание
    const priceText = $$('td[style*="white-space:nowrap"] p')
      .first()
      .text()
      .trim();

    if (!productName || !priceText) {
      return `⚠️ Info not found for product "${productCode}".`;
    }

    return `🔍 Product: ${productCode}\n📦 Name: ${productName}\n💰 Price: ${priceText}`;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred.';
    return `❗ Error: ${message}`;
  }
}
