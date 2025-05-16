import * as XLSX from 'xlsx';
import { ResultRow } from './exel.types';

export function appendToResultExcel(path: string, rows: ResultRow[]): void {
  const headers = [
    'кат.номер',
    'кол-во',
    'лучшая цена',
    'сумма',
    'лучший поставщик',
    'склад',
    'seltex',
    'imachinery',
    'impart',
    'zipteh',
    '74parts',
    'b2b.ixora-auto',
    'vip.blumaq',
    'solid-t',
    'pcagroup',
    'spb.camsparts',
    'voltag',
    'dv-pt',
    'recamgr',
    'intertrek',
    'kta50',
    'truckdrive',
    'truckmir',
    'istk-deutz',
    'mirdiesel',
    'штерн',
  ];

  const data = rows.map((row) => [
    row.name,
    row.kalichestvo,
    row.luchshayaCena,
    row.summa,
    row.luchshiyPostavshik,
    row.sklad,
    row.seltex,
    row.imachinery,
    row.impart,
    row['74parts'],
    // row.zipteh,
    // row['b2b.ixora-auto'],
    // row['vip.blumaq'],
    // row['solid-t'],
    // row.pcagroup,
    // row['spb.camsparts'],
    // row.voltag,
    // row['dv-pt'],
    // row.recamgr,
    // row.intertrek,
    // row.kta50,
    // row.truckdrive,
    // row.truckmir,
    // row['istk-deutz'],
    // row.mirdiesel,
    // row.штерн,
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Result');
  XLSX.writeFile(workbook, path);
}
