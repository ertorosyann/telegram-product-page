import * as cheerio from 'cheerio';
import axios, { AxiosError } from 'axios';

export async function scrapeProductPriceAndAvailability(
  name: string,
  count: string,
  brand: string,
): Promise<string> {
  const url = 'https://www.seltex.ru/catalog/';
  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  };

  try {
    const response = await axios.get(url, {
      params: { name, count, brand },
      headers,
    });

    const data = response.data as string;
    const $ = cheerio.load(data);
    let found = false;
    let resultMessage = '';

    $('tr').each((_, row) => {
      const tds = $(row).find('td');
      if (tds.length < 6) return;

      const nameText = tds.eq(1).text().trim();

      if (nameText.includes(name)) {
        const price = tds.eq(2).text().trim();
        const moscow = tds.eq(3).text().trim();
        const spb = tds.eq(4).text().trim();
        const transit = tds.eq(5).text().trim();

        resultMessage = `
        🛒 *Product Found!*
        *Name:* ${name}
        *Price:* ${price}
        *Москва:* ${moscow}
        *СПБ:* ${spb}
        *В пути:* ${transit}
                `.trim();

        found = true;
        return false; // break out of .each()
      }
    });

    return found
      ? resultMessage
      : `❌ Product "${name}" not found in the table.`;
  } catch (err: unknown) {
    const message =
      err instanceof AxiosError && err.message
        ? err.message
        : 'Unknown error occurred while requesting data.';
    return `❌ Error while requesting data: ${message}`;
  }
}
