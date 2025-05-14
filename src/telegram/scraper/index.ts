// import { scrapeIxora } from './sites/b2b.ixora-auto';
// import { scrape74Parts } from './sites/74parts';
// import { scrapeIMachinery } from './sites/imachinery';
// import { scrapeImpartWithPuppeteer } from './sites/impart';
// import { scrapeSeltex } from './sites/seltex';
// import { scrapePcaGroup } from './sites/pcagroup';
// import { scrapeCamsParts } from './sites/spb.camsparts';
// import { scrapeDvPt } from './sites/dv-pt';
// import { scrapeVoltag } from './sites/voltag';

import { scrapeRecamgr } from './sites/recamgr';

const scrapers = [
  // { name: 'Seltex', fn: scrapeSeltex },
  // { name: 'Imachinery', fn: scrapeIMachinery },
  // { name: '74Parts', fn: scrape74Parts },
  // { name: 'Impart', fn: scrapeImpartWithPuppeteer },
  // { name: 'b2b.ixora-auto', fn: scrapeIxora },
  // { name: 'Pcagroup', fn: scrapePcaGroup },
  // { name: 'Spb.camsparts', fn: scrapeCamsParts },
  // { name: 'Voltag', fn: scrapeVoltag },
  // { name: 'DB-Pt', fn: scrapeDvPt },
  { name: 'Recamgr', fn: scrapeRecamgr },

  // Добавляй другие сайты здесь
];
// b2b.ixora-auto.ru

export async function scrapeAll(
  nameItem: string,
  count: string,
  brand: string,
): Promise<string> {
  const results = await Promise.all(
    scrapers.map((s) => s.fn(nameItem, count, brand)),
  );
  return results.join('\n\n');
}
