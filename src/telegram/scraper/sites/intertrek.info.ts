import axios from 'axios';
import * as cheerio from 'cheerio';
import { BRANDS, SOURCE_WEBPAGE_KEYS } from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function intertrek(
  productCodes: string[],
): Promise<ScrapedProduct[]> {
  const results: ScrapedProduct[] = [];

  for (const productCode of productCodes) {
    const result: ScrapedProduct = {
      shop: SOURCE_WEBPAGE_KEYS.intertrek,
      found: false,
      name: productCode,
    };

    try {
      const searchUrl = `http://intertrek.info/search?search=${encodeURIComponent(productCode)}`;

      const { data: searchHtml } = await axios.get<string>(searchUrl);
      const $ = cheerio.load(searchHtml);

      const firstProductAnchor = $(
        'tr[itemprop="itemListElement"] a[itemprop="item"]',
      ).first();

      if (!firstProductAnchor.length) {
        results.push(result);
        continue;
      }

      const relativeLink = firstProductAnchor.attr('href');
      if (!relativeLink) {
        results.push(result);
        continue;
      }

      const productUrl = `http://intertrek.info${relativeLink}`;
      const { data: productHtml } = await axios.get<string>(productUrl);
      const $$ = cheerio.load(productHtml);

      const productName = $$('.dl-horizontal dd').eq(1).text().trim();
      const brandModel = $$('.dl-horizontal dd').eq(5).text().trim();
      const brandDvigitel = $$('.dl-horizontal dd').eq(4).text().trim();

      const rawPrice = $$('td[style*="white-space:nowrap"] p')
        .first()
        .text()
        .trim();

      const matchedBrand = BRANDS.find(
        (b) =>
          brandModel.toLowerCase().includes(b.toLowerCase()) ||
          brandDvigitel.toLowerCase().includes(b.toLowerCase()),
      );

      if (!productName || !rawPrice || !matchedBrand) {
        results.push(result);
        continue;
      }

      const priceNumber = parseFloat(
        rawPrice.replace(/\s|руб\.?/gi, '').replace(',', '.'),
      );

      results.push({
        shop: SOURCE_WEBPAGE_KEYS.intertrek,
        found: true,
        name: productName,
        price: priceNumber,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred.';
      console.error(`❗ [Intertrek] Error for "${productCode}": ${message}`);
      results.push(result);
    }
  }

  return results;
}
