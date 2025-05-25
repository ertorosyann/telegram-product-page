import axios from 'axios';

export async function downloadFromYandexDisk(): Promise<Buffer> {
  const fileUrl = 'https://disk.yandex.ru/i/FE5LjEWujhR0Xg';
  const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
  return Buffer.from(response.data);
}
