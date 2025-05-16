import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeZiptehOnline(
  productCode: string,
  count: string,
  brand: string,
): Promise<string> {
  const searchUrl = `http://intertrek.info/search?search=${productCode}`;
  // console.log(searchUrl);
  try {
    // console.log('stea');

    // Fetch the search results page
    const searchResponse = await axios.get<string>(searchUrl);
    const $ = cheerio.load(searchResponse.data);

    // Find the first product link
    const firstProductAnchor = $(
      'tr[itemprop="itemListElement"] a[itemprop="item"]',
    ).first();
    if (!firstProductAnchor.length) {
      return `❌ Product "${productCode}" not found.`;
    }
    // console.log('stea');

    const relativeLink = firstProductAnchor.attr('href');
    if (!relativeLink) {
      return `❌ Product link not found for "${productCode}".`;
    }

    const productUrl = `http://intertrek.info${relativeLink}`;

    // Fetch the product detail page
    const productResponse = await axios.get<string>(productUrl);
    const $$ = cheerio.load(productResponse.data);

    // Extract product name and price
    const productName = $$('.dl-horizontal dd').eq(1).text().trim(); // описание
    const priceText = $$('td[style*="white-space:nowrap"] p')
      .first()
      .text()
      .trim();

    if (!productName || !priceText) {
      return `⚠️ Info not found for product "${productCode}".`;
    }
    // console.log(
    //   `🔍 Product: ${productCode}\n📦 Name: ${productName}\n💰 Price: ${priceText}`,
    // );

    return `🔍 Product: ${productCode}\n📦 Name: ${productName}\n💰 Price: ${priceText}`;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred.';
    return `❗ Error: ${message}`;
  }
}
