import { TRCK_PALETTE } from '@constants/palette';

export const getColorClassForLabel = (label: string | null | undefined) => {
  if (!label || typeof label !== 'string' || label.length === 0) {
    return TRCK_PALETTE[0];
  }
  let hash = 0;
  for (let i = 0; i < label.length; i++) hash = (hash * 31 + label.charCodeAt(i)) | 0;
  return TRCK_PALETTE[Math.abs(hash) % TRCK_PALETTE.length];
};
