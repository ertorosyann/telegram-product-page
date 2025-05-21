import { ScrapedProduct } from 'src/types/context.interface';

import { scrapeSeltex } from './sites/seltex'; // done 100% ++++++++++++++++++
import { scrapeIMachinery } from './sites/imachinery'; // done 100% ++++++++++++++++++
import { scrape74Parts } from './sites/74parts'; // done 100% ++++++++++++++++++
import { scrapeImpart } from './sites/impart'; // done 100% ++++++++++++++++++
import { scrapePcaGroup } from './sites/pcagroup'; // done 100% ++++++++++++++++++
import { scrapeCamsParts } from './sites/camsparts'; // done 100% ++++++++++++++++++
import { scrapeRecamgr } from './sites/recamgr'; // done 100% ++++++++++++++++++
import { scrapeIstkDeutz } from './sites/istk-deutz'; // done 100% ++++++++++++++++++
import { intertrek } from './sites/intertrek.info'; // done 100% ++++++++++++++++++
import { scrapeIxora } from './sites/ixora'; // done 100% ++++++++++++++++++  hamapatasxanox brand chka
import { udtTechnika } from './sites/udt-technika';
// import { scrapeDvPt } from './sites/dv-pt'; //
// import { scrapeVoltag } from './sites/voltag'; //
// import { scrapeMirDiesel } from './sites/mirdiesel'; // done 100% ++++++++++++++++++
// import { scrapeTruckdrive } from './sites/truckdrive'; //piti nayvi errora qcum u chisht artikul dnenq toshni chi

// import { scrapeShtren } from './sites/shtren'; // done 100% ++++++++++++++++++   miqich dandaxacnuma
// import { scrapeTruckmir } from './sites/truckmir'; // dandax
// import { scrapeVipBlumaq } from './sites/vipBlumaq'; //need a  registrations
// import { scrapeZiptehOnline } from './sites/ziptehOnline'; // need a registrations

const scrapers = [
  { name: 'Seltex', fn: scrapeSeltex },
  { name: 'Imachinery', fn: scrapeIMachinery },
  { name: '74Parts', fn: scrape74Parts },
  { name: 'Impart', fn: scrapeImpart },
  { name: 'Pcagroup', fn: scrapePcaGroup },
  { name: 'Spb.camsparts', fn: scrapeCamsParts },
  { name: 'Recamgr', fn: scrapeRecamgr },
  { name: 'istk-deutz', fn: scrapeIstkDeutz },
  { name: 'Intertrek.info', fn: intertrek },
  { name: 'b2b.ixora-auto', fn: scrapeIxora },
  { udtTechnika: 'udtTechnika', fn: udtTechnika },
  // { name: 'Dv-Pt', fn: scrapeDvPt },
  // { name: 'Voltag', fn: scrapeVoltag },
  // { name: 'Mirdiesel', fn: scrapeMirDiesel },
  // { name: 'Truckdrive', fn: scrapeTruckdrive }, //

  // { name: 'Shtren', fn: scrapeShtren }, dandaxa
  // { name: 'Truckmir', fn: scrapeTruckmir },// dont work
  // { name: 'Vip.blumaq', fn: scrapeVipBlumaq },
  // { name: 'Zipteh.online', fn: scrapeZiptehOnline },
];

export async function scrapeAll(nameItem: string): Promise<ScrapedProduct[]> {
  const results = await Promise.all(scrapers.map((s) => s.fn(nameItem)));
  return results;
}
