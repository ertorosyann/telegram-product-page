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
    let seltexPrice: PriceInfo = { price: 0, shopName: 'seltex' };
    let imachineryPrice: PriceInfo = { price: 0, shopName: 'imachinery' };
    let pcagroupPrice: PriceInfo = { price: 0, shopName: 'pcagroup' };
    let camspartsPrice: PriceInfo = { price: 0, shopName: 'camsparts' };
    let parts74Price: PriceInfo = { price: 0, shopName: 'parts74' };

    /* ------------------------------- скрапинг ------------------------------- */
    const resultFromScrap = await scrapeAll(String(partNumber).trim());

    const allPrices: PriceInfo[] = [{ price: priceSklad, shopName: 'sklad' }];

    resultFromScrap.forEach((r) => {
      if (r.status !== 'fulfilled' || !r.value) return;

      // console.log(r.value);

      const { shop, price: rawPrice } = r.value;
      const price = Number.isFinite(Number(rawPrice)) ? Number(rawPrice) : 0;
      const entry: PriceInfo = { price, shopName: shop };

      switch (shop) {
        case 'seltex':
          seltexPrice = entry;
          allPrices.push(entry);
          break;
        case 'imachinery':
          imachineryPrice = entry;
          allPrices.push(entry);
          break;
        case 'pcagroup':
          pcagroupPrice = entry;
          allPrices.push(entry);
          break;
        case 'camsparts':
          camspartsPrice = entry;
          allPrices.push(entry);
          break;
        case 'parts74':
          parts74Price = entry;
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
      seltex: seltexPrice.price,
      imachinery: imachineryPrice.price,
      impart: 0,
      '74parts': parts74Price.price,
      zipteh: 0,
      'b2b.ixora-auto': 0,
      'vip.blumaq': 0,
      'solid-t': 0,
      pcagroup: pcagroupPrice.price,
      'spb.camsparts': camspartsPrice.price,
      voltag: 0,
      'dv-pt': 0,
      recamgr: 0,
      intertrek: 0,
      kta50: 0,
      truckdrive: 0,
      truckmir: 0,
      'istk-deutz': 0,
      mirdiesel: 0,
      штерн: 0,
    });
    messages.push(
      `✅ Найдено: ${bestPrice.shopName} — ${bestPrice.price} × ${inputQty} = ${totalPrice}`,
    );
  }

  return { messages, notFound, rows: resultRows };
}
