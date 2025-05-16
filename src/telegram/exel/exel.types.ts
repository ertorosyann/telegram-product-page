export type InputExelFile = {
  'кат.номер': string;
  'кол-во'?: number;
};

export type ParsedRow = {
  'кат.номер': string;
  'название детали': string;
  'кол-во': number;
  'цена, RUB': number;
  'сумма, RUB': number;
};

export type DataFromScrapes = {
  name: string;
  price: string;
};

export type ResultRow = {
  name: string;
  kalichestvo: number;
  luchshayaCena: number;
  summa: number;
  luchshiyPostavshik: string;
  sklad: number | string | undefined;
  seltex: string;
  imachinery: string;
  impart: string;
  '74parts': string;
  // zipteh: string;
  // 'b2b.ixora-auto': string;
  // 'vip.blumaq': string;
  // 'solid-t': string;
  // pcagroup: string;
  // 'spb.camsparts': string;
  // voltag: string;
  // 'dv-pt': string;
  // recamgr: string;
  // intertrek: string;
  // kta50: string;
  // truckdrive: string;
  // truckmir: string;
  // 'istk-deutz': string;
  // mirdiesel: string;
  // штерн: string;
};
