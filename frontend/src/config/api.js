const rawApiUrl = process.env.REACT_APP_API_URL?.trim();
const isBrowser = typeof window !== 'undefined';
const isLocalHost =
  isBrowser &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);
const isLocalApiUrl =
  typeof rawApiUrl === 'string' &&
  /localhost|127\.0\.0\.1/i.test(rawApiUrl);

export const API_URL =
  rawApiUrl && (!isLocalApiUrl || isLocalHost) ? rawApiUrl : '/api';
