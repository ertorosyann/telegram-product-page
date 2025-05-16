import { scrapeIxora } from './sites/b2b.ixora-auto';
import { scrape74Parts } from './sites/74parts';
import { scrapeIMachinery } from './sites/imachinery';
import { scrapeImpartWithPuppeteer } from './sites/impart';
import { scrapeSeltex } from './sites/seltex';
import { scrapePcaGroup } from './sites/pcagroup';
import { scrapeCamsParts } from './sites/spb.camsparts';
import { scrapeDvPt } from './sites/dv-pt';
import { scrapeVoltag } from './sites/voltag';
import { scrapeShtren } from './sites/shtren';
import { scrapeRecamgr } from './sites/recamgr';
// import { scrapeMirDiesel } from './sites/mirdiesel';
// import { scrapeTruckdrive } from './sites/truckdrive';
// import { scrapeIntertrekInfo } from './sites/intertrek.info';
// import { scrapeZiptehOnline } from './sites/ziptehOnline';
// import { scrapeVipBlumaq } from './sites/vipBlumaq';
// import { scrapeTruckmir } from './sites/truckmir';
// import { scrapeIstkDeutz } from './sites/istk-deutz';

const scrapers = [
  { name: 'Seltex', fn: scrapeSeltex },
  { name: 'Imachinery', fn: scrapeIMachinery },
  { name: 'Impart', fn: scrapeImpartWithPuppeteer },
  // { name: 'Zipteh.online', fn: scrapeZiptehOnline },   // not realization
  { name: '74Parts', fn: scrape74Parts },
  { name: 'b2b.ixora-auto', fn: scrapeIxora },
  // { name: 'Vip.blumaq', fn: scrapeVipBlumaq },         // not realization
  // https://solid-t.ru/catalog/                          // is a empty web page
  { name: 'Pcagroup', fn: scrapePcaGroup },
  { name: 'Spb.camsparts', fn: scrapeCamsParts },
  { name: 'Voltag', fn: scrapeVoltag },
  { name: 'Dv-Pt', fn: scrapeDvPt },
  { name: 'Recamgr', fn: scrapeRecamgr }, // dont work true
  // https://kta50.ru/catalog/                            // this page dont work
  // { name: 'Intertrek.info', fn: scrapeIntertrekInfo }, //  not realization
  // { name: 'Truckdrive', fn: scrapeTruckdrive },            // not realization
  // { name: 'Truckmir', fn: scrapeTruckmir },            // realization but  DONT WORk
  // { name: 'istk-deutz', fn: scrapeIstkDeutz }, // not realization
  // { name: 'Mirdiesel', fn: scrapeMirDiesel },          // not realization ,its big problem
  { name: 'Shtren', fn: scrapeShtren },

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
