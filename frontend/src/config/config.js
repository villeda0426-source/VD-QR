// Single source of truth — update URLs/copy here only
export const BRAND = {
  name:    'Villedas Delight',
  website: 'https://villedasdelight.com',
  tagline: 'Follow us & get a FREE drink!',
};

export const SOCIAL_PLATFORMS = {
  facebook: {
    key:      'facebook',
    name:     'Facebook',
    handle:   '@fmeyita',
    url:      'https://www.facebook.com/fmeyita',
    color:    '#1877F2',
    gradient: 'linear-gradient(135deg, #1877F2 0%, #42a5f5 100%)',
    cta:      'Like & Follow on Facebook',
  },
  instagram: {
    key:      'instagram',
    name:     'Instagram',
    handle:   '@villedasdelight',
    url:      'https://www.instagram.com/villedasdelight/',
    color:    '#E4405F',
    gradient: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
    cta:      'Follow on Instagram',
  },
  tiktok: {
    key:      'tiktok',
    name:     'TikTok',
    handle:   '@villedasdelight',
    url:      'https://www.tiktok.com/@villedasdelight',
    color:    '#010101',
    gradient: 'linear-gradient(135deg, #010101 0%, #69C9D0 100%)',
    cta:      'Follow on TikTok',
  },
};

export const PLATFORMS_ORDER = ['facebook', 'instagram', 'tiktok'];

export const COUPON_REWARD =
  '1 FREE Raspado or Villedas Delight Fruit Concentrate Drink of your choice';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
