const SIZE_RANGES = {
  men: {
    EU: ['39', '40', '41', '42', '43', '44', '45', '46', '47', '48'],
    US: ['6', '7', '8', '9', '10', '11', '12', '13', '14', '15'],
    UK: ['6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13']
  },

  women: {
    EU: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44'],
    US: ['5', '6', '7', '8', '9', '10', '11', '12'],
    UK: ['2.5', '3', '3.5', '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9']
  },

  kids: {
    EU: ['28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38'],
    US: ['11', '11.5', '12', '12.5', '13', '13.5', '1', '2', '3', '4', '5'],
    UK: ['10', '10.5', '11', '11.5', '12', '12.5', '13', '1', '2', '3', '4']
  }
};

export const getSizesForCategory = (category, sizeType = 'EU') => {
  return SIZE_RANGES[category]?.[sizeType] || [];
};

export const isValidSize = (category, size, sizeType = 'EU') => {
  const validSizes = getSizesForCategory(category, sizeType);
  return validSizes.includes(size.toString());
};

export default {
  SIZE_RANGES,
  getSizesForCategory,
  isValidSize
};
