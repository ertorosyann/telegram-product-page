import { scrapeSeltex } from './sites/seltex'; //+
import { scrape74Parts } from './sites/74parts'; //stea //+
import { scrapeIMachinery } from './sites/imachinery'; //+
// import { scrapeImpart } from './sites/impart'; //+
import { scrapePcaGroup } from './sites/pcagroup'; // +
import { scrapeCamsParts } from './sites/camsparts'; // +
import { ScrapedProduct } from 'src/types/context.interface';
// import { scrapeVoltag } from './sites/voltag';
// import { scrapeVipBlumaq } from './sites/vipBlumaq';
// import { scrapeDvPt } from './sites/dv-pt';
// import { scrapeShtren } from './sites/shtren';
// import { scrapeRecamgr } from './sites/recamgr';
// import { scrapeMirDiesel } from './sites/mirdiesel';
// import { scrapeTruckdrive } from './sites/truckdrive';
// import { scrapeZiptehOnline } from './sites/intertrek.info';
// import { scrapeTruckmir } from './sites/truckmir';
// import { scrapeIstkDeutz } from './sites/istk-deutz';
// import { scrapeZiptehOnline } from './sites/ziptehOnline';
// import { scrapeIxora } from './sites/ixora';

const scrapers = [
  { name: 'Seltex', fn: scrapeSeltex }, //+
  { name: '74Parts', fn: scrape74Parts }, //+
  { name: 'Imachinery', fn: scrapeIMachinery }, //+
  // { name: 'Impart', fn: scrapeImpart }, //+
  { name: 'Pcagroup', fn: scrapePcaGroup }, //+
  { name: 'Spb.camsparts', fn: scrapeCamsParts }, //+
  // { name: 'Voltag', fn: scrapeVoltag },
  // { name: 'Zipteh.online', fn: scrapeZiptehOnline }, // not realization
  // https://solid-t.ru/catalog/                          // is a empty web page
  // { name: 'Dv-Pt', fn: scrapeDvPt },
  // { name: 'Recamgr', fn: scrapeRecamgr }, // dont work true
  // https://kta50.ru/catalog/                            // this page dont work
  // { name: 'Shtren', fn: scrapeShtren },
  // { name: 'Intertrek.info', fn: scrapeZiptehOnline },
  // { name: 'Truckdrive', fn: scrapeTruckdrive }, //
  // { name: 'Truckmir', fn: scrapeTruckmir }, // realization duration problem
  // { name: 'istk-deutz', fn: scrapeIstkDeutz },
  // { name: 'Mirdiesel', fn: scrapeMirDiesel },          // not realization ,its big problem with web page
  // { name: 'b2b.ixora-auto', fn: scrapeIxora },
  // { name: 'Vip.blumaq', fn: scrapeVipBlumaq }, // not realization
  // Добавляй другие сайты здесь
];
// b2b.ixora-auto.ru

export async function scrapeAll(
  nameItem: string,
): Promise<PromiseSettledResult<ScrapedProduct>[]> {
  const results = await Promise.allSettled(scrapers.map((s) => s.fn(nameItem)));
  return results;
  // console.log('--------------------', results, typeof results);
  // return results.map((r) => JSON.stringify(r)).join('\n\n');
}
