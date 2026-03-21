export const generateRandomId = (): string => Math.random().toString(36).substring(2, 15);

export const generateRandomHexString = (): string => {
  const hex = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0');
  return `0x${hex}`;
};
