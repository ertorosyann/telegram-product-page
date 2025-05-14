import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeSeltex(nameItem: string): Promise<string> {
  const url = 'https://www.seltex.ru/catalog/';
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  };

  try {
    const response = await axios.get(url, { headers });

    const $ = cheerio.load(response.data as string);
    let found = false;
    let resultMessage = '';

    $('tr').each((_, row) => {
      const tds = $(row).find('td');

      if (tds.length < 6) return;
      const nameText = tds.eq(1).text().trim();
      if (nameText.includes(nameItem)) {
        const price = tds.eq(2).text().trim();
        const moscow = tds.eq(3).text().trim();
        const spb = tds.eq(4).text().trim();
        const transit = tds.eq(5).text().trim();

        resultMessage = `
          ✅ Найдено на seltex.ru
          *Catalog Number:* ${nameItem}
          *Name:* ${nameText}
          *Price:* ${price}
          *Москва:* ${moscow}
          *СПБ:* ${spb}
          *В пути:* ${transit}
        `.trim();

        found = true;
        return false; // Break out of .each()
      }
    });

    return found
      ? resultMessage
      : `❌ [Seltex] Product with Catalog Number "${nameItem}" not found.`;
  } catch (err: unknown) {
    const message =
      err instanceof AxiosError && err.message
        ? err.message
        : 'Unknown error on Seltex';
    return `❌ [Seltex] Error: ${message}`;
  }
}
