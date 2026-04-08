const rawApiUrl = process.env.REACT_APP_API_URL?.trim();

export const API_URL = rawApiUrl || '/api';
