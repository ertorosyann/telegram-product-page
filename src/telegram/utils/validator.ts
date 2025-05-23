export function normalizeInput(input: string): string {
  const map: Record<string, string> = {
    а: 'A',
    А: 'A',
    в: 'B',
    В: 'B',
    е: 'E',
    Е: 'E',
    к: 'K',
    К: 'K',
    м: 'M',
    М: 'M',
    н: 'H',
    Н: 'H',
    о: 'O',
    О: 'O',
    р: 'P',
    Р: 'P',
    с: 'C',
    С: 'C',
    т: 'T',
    Т: 'T',
    у: 'Y',
    У: 'Y',
    х: 'X',
    Х: 'X',
  };

  return input
    .split('')
    .map((char) => map[char] || char) // заменяем похожие русские
    .filter((char) => /[A-Z0-9/-]/i.test(char))
    .join('')
    .toUpperCase()
    .trim();
}
