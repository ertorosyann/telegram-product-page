import axios from 'axios';
import * as cheerio from 'cheerio';
import {
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
  BRANDS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';
export async function scrapeMirDiesel(
  names: string[],
): Promise<ScrapedProduct[]> {
  const results: ScrapedProduct[] = [];

  for (const name of names) {
    const start = performance.now();

    const result: ScrapedProduct = {
      found: false,
      shop: SOURCE_WEBPAGE_KEYS.mirdiesel,
      name, // Դրանցից օգտակար է հետագայում անունը տեսնել
    };

    try {
      const searchUrl = `${SOURCE_URLS.mirdiesel}catalog/?q=${encodeURIComponent(name)}`;

      const searchResponse = await axios.get(searchUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      const $search = cheerio.load(searchResponse.data);

      // Առաջին ապրանքի հղումը որոնման արդյունքներից
      const productLink = $search('.list_item')
        .first()
        .find('a.thumb')
        .attr('href');

      if (!productLink) {
        results.push(result);
        continue;
      }

      const productUrl = `${SOURCE_URLS.mirdiesel.replace(/\/$/, '')}${productLink}`;

      const productResponse = await axios.get(productUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      const $ = cheerio.load(productResponse.data);

      const priceBlockText = $('span[class*="price"]').first().text().trim();
      const priceMatch = priceBlockText.match(/(\d[\d\s]*)\s*₽/);
      const parsedPriceText = priceMatch
        ? priceMatch[1].replace(/\s/g, '')
        : null;

      let foundBrands = false;
      $('ul[id^="bx_"][id*="_prop_490_list"] li').each((_, el) => {
        const brandText = $(el).find('span.cnt').text().trim();

        if (BRANDS.includes(brandText)) {
          foundBrands = true;
        }
      });

      const title = $('#pagetitle').text().trim();

      if (foundBrands) {
        results.push({
          name: title,
          price: parsedPriceText,
          found: true,
          shop: SOURCE_WEBPAGE_KEYS.mirdiesel,
        });
      } else {
        results.push(result);
      }

      console.log(`Search time for "${name}":`, performance.now() - start);
    } catch (error) {
      console.error(
        `${SOURCE_WEBPAGE_KEYS.mirdiesel} Error for "${name}":`,
        error,
      );
      results.push(result);
    }
  }

  return results;
}
