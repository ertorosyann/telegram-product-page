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

export type ResultRow = {
  name: string;
  kalichestvo: number;
  luchshayaCena: number;
  summa: number;
  luchshiyPostavshik: string;
  sklad: number;
  seltex: number;
  imachinery: number;
  impart: number;
  '74parts': number;
  zipteh: number;
  'b2b.ixora-auto': number;
  'vip.blumaq': number;
  'solid-t': number;
  pcagroup: number;
  'spb.camsparts': number;
  voltag: number;
  'dv-pt': number;
  recamgr: number;
  intertrek: number;
  kta50: number;
  truckdrive: number;
  truckmir: number;
  'istk-deutz': number;
  mirdiesel: number;
  shtern: number;
};
