export function validatePartInfo(input: string) {
  const [catalogNumber, quantity, brand] = input.split(',');

  if (!catalogNumber || !quantity || !brand) {
    return {
      isValid: false,
      errorMessage:
        '❌ Please provide all three pieces of information: catalog number, quantity, and brand.',
    };
  }

  if (!/^[A-Za-z0-9]+$/.test(catalogNumber)) {
    return {
      isValid: false,
      errorMessage:
        '❌ Invalid catalog number. It should only contain letters and digits.',
    };
  }

  if (isNaN(Number(quantity))) {
    return {
      isValid: false,
      errorMessage: '❌ Invalid quantity. It must be a number.',
    };
  }

  const validBrands = [
    'CAT',
    'Cummins',
    'Deutz',
    'John Deere',
    'Perkins',
    'Volvo',
    'Komatsu',
    'Scania',
  ];
  if (!validBrands.includes(brand.trim())) {
    return {
      isValid: false,
      errorMessage: `❌ Invalid brand. Use one of: ${validBrands.join(', ')}.`,
    };
  }

  return { isValid: true, errorMessage: '' };
}
