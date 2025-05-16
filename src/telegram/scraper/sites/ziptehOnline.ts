import axios from 'axios';
import * as cheerio from 'cheerio';
import { BRANDS } from 'src/constants/brends';

export async function scrapeZiptehOnline(
  productCode: string,
): Promise<{ name?: string; price?: string }> {
  const searchUrl = `http://intertrek.info/search?search=${productCode}`;
  // console.log(searchUrl);

  try {
    const searchResponse = await axios.get<string>(searchUrl);
    const $ = cheerio.load(searchResponse.data);

    const firstProductAnchor = $(
      'tr[itemprop="itemListElement"] a[itemprop="item"]',
    ).first();
    if (!firstProductAnchor.length) {
      return {};
    }

    const relativeLink = firstProductAnchor.attr('href');
    if (!relativeLink) {
      return {};
    }

    const productUrl = `http://intertrek.info${relativeLink}`;

    const productResponse = await axios.get<string>(productUrl);
    const $$ = cheerio.load(productResponse.data);

    const productName = $$('.dl-horizontal dd').eq(1).text().trim(); // описание
    const priceText = $$('td[style*="white-space:nowrap"] p')
      .first()
      .text()
      .trim();

    const lowerName = productName.toLowerCase();

    const matchedBrand = BRANDS.find((brand) =>
      lowerName.includes(brand.toLowerCase()),
    );

    if (productName && priceText && matchedBrand) {
      return {
        name: productName,
        price: priceText,
      };
    }

    return {};
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred.';
    console.error(`❗ [ZiptehOnline] Error: ${message}`);
    return {};
  }
}
