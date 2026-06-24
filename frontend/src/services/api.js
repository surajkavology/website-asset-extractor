import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function analyzeUrl(url) {
  const res = await axios.post(`${API_BASE}/analyze`, { url }, { timeout: 120000 });
  return res.data;
}

export async function downloadZip(analysisData) {
  const res = await axios.post(`${API_BASE}/download`, analysisData, {
    responseType: 'blob',
    timeout: 120000,
  });
  const blob = new Blob([res.data], { type: 'application/zip' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'website-assets.zip';
  link.click();
  URL.revokeObjectURL(link.href);
}

export function getFontProxyUrl(fontUrl) {
  return `${API_BASE}/fonts/proxy?url=${encodeURIComponent(fontUrl)}`;
}

export async function downloadFontZip(fonts) {
  const res = await axios.post(
    `${API_BASE}/fonts/zip`,
    { fonts },
    { responseType: 'blob', timeout: 120000 }
  );
  const blob = new Blob([res.data], { type: 'application/zip' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'fonts.zip';
  link.click();
  URL.revokeObjectURL(link.href);
}
