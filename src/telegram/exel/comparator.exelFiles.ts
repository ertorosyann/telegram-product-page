import { InputExelFile, ParsedRow, ResultRow } from './exel.types';

export function compareItems(
  inputItems: InputExelFile[],
  skladItems: ParsedRow[],
): { messages: string[]; notFound: string[]; rows: ResultRow[] } {
  const messages: string[] = [];
  const notFound: string[] = [];
  const resultRows: ResultRow[] = [];

  for (const inputItem of inputItems) {
    const partNumber = inputItem['кат.номер'];
    const inputQty: number = inputItem['кол-во'] ?? 0;

    const skladMatch = skladItems.find(
      (skladItem) => skladItem['кат.номер'] === partNumber,
    );

    if (skladMatch) {
      const price: number = skladMatch['цена, RUB'];
      const total = Number(price) * Number(inputQty);

      messages.push(
        `✅ Найдено: ${partNumber} — ${price} × ${inputQty} = ${total}`,
      );

      resultRows.push({
        name: partNumber,
        kalichestvo: inputQty,
        luchshayaCena: price,
        summa: total,
        luchshiyPostavshik: 'склад',
        sklad: price,
        seltex: '',
        imachinery: '',
        impart: '',
        zipteh: '',
        '74parts': '',
        'b2b.ixora-auto': '',
        'vip.blumaq': '',
        'solid-t': '',
        pcagroup: '',
        'spb.camsparts': '',
        voltag: '',
        'dv-pt': '',
        recamgr: '',
        intertrek: '',
        kta50: '',
        truckdrive: '',
        truckmir: '',
        'istk-deutz': '',
        mirdiesel: '',
        штерн: '',
      });
    }
  }

  return { messages, notFound, rows: resultRows };
}
