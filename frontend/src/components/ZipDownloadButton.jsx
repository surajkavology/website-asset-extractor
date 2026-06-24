import { useState } from 'react';
import { downloadZip } from '../services/api';

export default function ZipDownloadButton({ analysisData }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);
    try {
      await downloadZip(analysisData);
    } catch (err) {
      setError('Failed to generate ZIP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleDownload}
        disabled={loading}
        className="btn-primary w-full px-6 py-3 text-sm flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spinner inline-block" />
            Building ZIP...
          </>
        ) : (
          <>
            <span>📦</span>
            Download All Assets
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
