export function normalizeInput(input: string): string {
  const map: Record<string, string> = {
    А: 'A',
    В: 'B',
    Е: 'E',
    К: 'K',
    М: 'M',
    Н: 'H',
    О: 'O',
    Р: 'P',
    С: 'C',
    Т: 'T',
    У: 'Y',
    Х: 'X',
    а: 'A',
    в: 'B',
    е: 'E',
    к: 'K',
    м: 'M',
    н: 'H',
    о: 'O',
    р: 'P',
    с: 'C',
    т: 'T',
    у: 'Y',
    х: 'X',
  };

  return input
    .split('')
    .map((char) => map[char] || char)
    .join('')
    .toUpperCase()
    .trim();
}
