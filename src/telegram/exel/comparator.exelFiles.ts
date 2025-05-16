import { scrapeAll } from '../scraper';
import {
  DataFromScrapes,
  InputExelFile,
  ParsedRow,
  ResultRow,
} from './exel.types';

export async function compareItems(
  inputItems: InputExelFile[],
  skladItems: ParsedRow[],
): Promise<{ messages: string[]; notFound: string[]; rows: ResultRow[] }> {
  const messages: string[] = [];
  const notFound: string[] = [];
  const resultRows: ResultRow[] = [];

  for (const inputItem of inputItems) {
    const partNumber = inputItem['кат.номер'];
    const inputQty: number = inputItem['кол-во'] ?? 0;

    const skladMatch = skladItems.find(
      (skladItem) => skladItem['кат.номер'] === partNumber,
    );
    const priceSklad: number = skladMatch?.['цена, RUB'] ?? 0;

    // const code = String(inputItem['кат.номер']).trim();
    // if (!code) continue;
    // const resultFromScrap = await scrapeAll(code);
    // resultFromScrap.map((resFromScrap: DataFromScrapes) => {
    //   console.log(resFromScrap);
    //   const price = Number(resFromScrap.price);
    //   const total = Number(Number(price) * Number(inputQty));
    // });

    resultRows.push({
      name: partNumber,
      kalichestvo: inputQty,
      luchshayaCena: 0,
      summa: 0,
      luchshiyPostavshik: 'склад',
      sklad: 0,
      seltex: '',
      imachinery: '',
      impart: '',
      '74parts': '',
      // zipteh: '',
      // 'b2b.ixora-auto': '',
      // 'vip.blumaq': '',
      // 'solid-t': '',
      // pcagroup: '',
      // 'spb.camsparts': '',
      // voltag: '',
      // 'dv-pt': '',
      // recamgr: '',
      // intertrek: '',
      // kta50: '',
      // truckdrive: '',
      // truckmir: '',
      // 'istk-deutz': '',
      // mirdiesel: '',
      // штерн: '',
    });
    messages.push(`✅ Найдено: ${partNumber} — ${0} × ${inputQty} = ${0}`);
  }

  return { messages, notFound, rows: resultRows };
}

// async function getDataFromScrapes(inputItems: InputExelFile[]) {
//   let res = [];
//   for (const inputItem of inputItems) {
//     const code = String(inputItem['кат.номер']).trim();
//     if (!code) continue;

//     const results = await scrapeAll(code);
//     res.push(results);
//   }
//   return res;
// }
