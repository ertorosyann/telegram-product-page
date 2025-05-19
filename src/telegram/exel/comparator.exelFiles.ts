import { scrapeAll } from '../scraper';
import { InputExelFile, ParsedRow, ResultRow } from './exel.types';

type PriceInfo = { price: number; shopName: string };

export async function compareItems(
  inputItems: InputExelFile[],
  skladItems: ParsedRow[],
): Promise<{ messages: string[]; notFound: string[]; rows: ResultRow[] }> {
  const messages: string[] = [];
  const notFound: string[] = [];
  const resultRows: ResultRow[] = [];

  for (const inputItem of inputItems) {
    const partNumber = inputItem['кат.номер'];
    const inputQty = inputItem['кол-во'] ?? 0;
    if (!partNumber) continue;

    /* --------------------------------- склад -------------------------------- */
    const skladMatch = skladItems.find((s) => s['кат.номер'] === partNumber);
    const priceSklad = skladMatch?.['цена, RUB'] ?? 0;

    /* ------------------------- переменные магазинов ------------------------- */
    // let seltexPrice: PriceInfo = { price: 0, shopName: 'seltex' };
    // let parts74Price: PriceInfo = { price: 0, shopName: 'parts74' };
    // let imachineryPrice: PriceInfo = { price: 0, shopName: 'imachinery' };
    // let pcagroupPrice: PriceInfo = { price: 0, shopName: 'pcagroup' };
    // let impartPrice: PriceInfo = { price: 0, shopName: 'impart' };
    // let camspartsPrice: PriceInfo = { price: 0, shopName: 'camsparts' };
    // let voltagPrice: PriceInfo = { price: 0, shopName: 'voltag' };
    // let vipBlumaqPrice: PriceInfo = { price: 0, shopName: 'vip.blumaq' };
    // let dvPtPrice: PriceInfo = { price: 0, shopName: 'dv-pt' };
    // let shtrenPrice: PriceInfo = { price: 0, shopName: 'shtern' };
    // let recamgrPrice: PriceInfo = { price: 0, shopName: 'recamgr' };
    // let truckdrivePrice: PriceInfo = { price: 0, shopName: 'truckdrive' };
    // let istkiDeutzPrice: PriceInfo = { price: 0, shopName: 'istk-deutz' };
    // let ixoraPrice: PriceInfo = { price: 0, shopName: 'b2b.ixora-auto' };
    let intertrekPrice: PriceInfo = { price: 0, shopName: 'zipteh' };

    /* ------------------------------- скрапинг ------------------------------- */
    const resultFromScrap = await scrapeAll(String(partNumber).trim());
    console.log(resultFromScrap);

    const allPrices: PriceInfo[] = [{ price: priceSklad, shopName: 'sklad' }];

    resultFromScrap.forEach((r) => {
      if (r.status !== 'fulfilled' || !r.value) return;

      const { shop, price: rawPrice } = r.value;

      const cleaned = String(rawPrice)
        .replace(/[\s\u00A0]/g, '') // убираем обычные и не‑разрывные пробелы
        .replace(/,/g, '.'); // заменяем запятую на точку, если надо
      console.log('cleaned = ', cleaned);

      const price = Number.isFinite(Number(cleaned)) ? Number(cleaned) : 0;

      const entry: PriceInfo = { price, shopName: shop };

      switch (shop) {
        // case 'seltex':
        //   seltexPrice = entry;
        //   allPrices.push(entry);
        //   break;
        // case 'imachinery':
        //   imachineryPrice = entry;
        //   allPrices.push(entry);
        //   break;
        // case 'pcagroup':
        //   pcagroupPrice = entry;
        //   allPrices.push(entry);
        //   break;
        // case 'camsparts':
        //   camspartsPrice = entry;
        //   allPrices.push(entry);
        //   break;
        // case 'parts74':
        //   parts74Price = entry;
        //   allPrices.push(entry);
        //   break;
        // case 'impart':
        //   impartPrice = entry;
        //   allPrices.push(entry);
        //   break;
        // case 'voltag':
        //   voltagPrice = entry;
        //   allPrices.push(entry);
        //   break;
        // case 'vip.blumaq':
        //   vipBlumaqPrice = entry;
        //   allPrices.push(entry);
        //   break;
        // case 'dv-pt':
        //   dvPtPrice = entry;
        //   allPrices.push(entry);
        //   break;
        // case 'shtern':
        //   shtrenPrice = entry;
        //   allPrices.push(entry);
        //   break;
        // case 'recamgr':
        //   recamgrPrice = entry;
        //   allPrices.push(entry);
        //   break;
        // case 'truckdrive':
        //   truckdrivePrice = entry;
        //   allPrices.push(entry);
        //   break;
        // case 'istk-deutz':
        //   istkiDeutzPrice = entry;
        //   allPrices.push(entry);
        //   break;
        // case 'b2b.ixora-auto':
        //   ixoraPrice = entry;
        //   allPrices.push(entry);
        //   break;
        case 'zipteh':
          intertrekPrice = entry;
          allPrices.push(entry);
          break;
        default:
          break; // новые магазины добавляй сюда
      }
    });

    /* ------------------------- выбор лучшей цены --------------------------- */
    let bestPrice: PriceInfo = { price: 0, shopName: '' };
    let totalPrice = 0;

    if (allPrices.length > 0) {
      const firstNonZero = allPrices.find((p) => p.price > 0);
      bestPrice = firstNonZero ?? allPrices[0];
      totalPrice = bestPrice.price * inputQty;
    }
    console.log('Best Price = ', bestPrice.price, bestPrice.shopName);

    /* --------------------------- формируем вывод --------------------------- */
    if (bestPrice.price === 0) {
      messages.push(`❌ ${partNumber}: не найдено ни одной цены`);
      notFound.push(partNumber);
    } else {
      messages.push(
        `✅ ${partNumber}: лучшая цена ${bestPrice.price}₽ в ${bestPrice.shopName}`,
      );
    }

    resultRows.push({
      name: partNumber,
      kalichestvo: inputQty,
      luchshayaCena: bestPrice.price,
      summa: totalPrice,
      luchshiyPostavshik: bestPrice.shopName,
      sklad: priceSklad,
      seltex: 0,
      // seltex: seltexPrice.price,
      imachinery: 0,
      // imachinery: imachineryPrice.price,
      impart: 0,
      // impart: impartPrice.price,
      '74parts': 0,
      // '74parts': parts74Price.price,
      // zipteh: 0,
      zipteh: intertrekPrice.price,
      'b2b.ixora-auto': 0,
      // 'b2b.ixora-auto': ixoraPrice.price,
      'vip.blumaq': 0,
      // 'vip.blumaq': vipBlumaqPrice.price,
      'solid-t': 0,
      pcagroup: 0,
      // pcagroup: pcagroupPrice.price,
      'spb.camsparts': 0,
      // 'spb.camsparts': camspartsPrice.price,
      voltag: 0,
      // voltag: voltagPrice.price,
      'dv-pt': 0,
      // 'dv-pt': dvPtPrice.price,
      recamgr: 0,
      // recamgr: recamgrPrice.price,
      intertrek: 0,
      kta50: 0,
      truckdrive: 0,
      // truckdrive: truckdrivePrice.price,
      truckmir: 0,
      'istk-deutz': 0,
      // 'istk-deutz': istkiDeutzPrice.price,
      mirdiesel: 0,
      shtern: 0,
      // shtern: shtrenPrice.price,
    });
    // messages.push(
    //   `✅ Найдено: ${bestPrice.shopName} — ${bestPrice.price} × ${inputQty} = ${totalPrice}`,
    // );
  }

  return { messages, notFound, rows: resultRows };
}
