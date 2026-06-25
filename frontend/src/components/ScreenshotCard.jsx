import { useState } from 'react';
import { fetchScreenshots } from '../services/api';

export default function ScreenshotCard({ screenshots: initialScreenshots, url }) {
  const [screenshots, setScreenshots] = useState(
    // treat empty object {} (from analyze response) as no screenshots
    initialScreenshots?.desktopBase64 || initialScreenshots?.mobileBase64
      ? initialScreenshots
      : null
  );
  const [view, setView]       = useState('desktop');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [disabled, setDisabled] = useState(false);

  async function handleTakeScreenshots() {
    if (!url || loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchScreenshots(url);
      setScreenshots(result);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Screenshot failed';
      const hint = err.response?.data?.hint || null;
      setError(msg);
      // 503 means screenshots are disabled on this deployment
      if (err.response?.status === 503) setDisabled(true);
      console.error('Screenshot error:', hint || msg);
    } finally {
      setLoading(false);
    }
  }

  function download() {
    const current = view === 'desktop' ? screenshots?.desktopBase64 : screenshots?.mobileBase64;
    if (!current) return;
    const src = `data:image/png;base64,${current}`;
    const a = document.createElement('a');
    a.href = src;
    a.download = `${view}-screenshot.png`;
    a.click();
  }

  // ── No screenshots yet — show the trigger UI ─────────────────────────────
  if (!screenshots) {
    return (
      <div className="text-center py-16 text-(--text-muted)">
        <div className="text-5xl mb-4">📸</div>

        {disabled ? (
          <>
            <p className="font-medium text-(--text) mb-1">Screenshots unavailable</p>
            <p className="text-sm max-w-sm mx-auto">
              This deployment does not have screenshot support enabled.
              Deploy on Railway or Render Starter+ and set{' '}
              <code className="bg-(--surface2) px-1 rounded">ENABLE_SCREENSHOTS=true</code>.
            </p>
          </>
        ) : error ? (
          <>
            <p className="text-red-400 font-medium mb-1">Screenshot failed</p>
            <p className="text-sm text-red-400/70 max-w-sm mx-auto mb-4">{error}</p>
            <button onClick={handleTakeScreenshots} className="btn-primary px-5 py-2.5 text-sm">
              Try again
            </button>
          </>
        ) : (
          <>
            <p className="mb-2 text-sm">Screenshots are captured on demand</p>
            <button
              onClick={handleTakeScreenshots}
              disabled={loading}
              className="btn-primary px-6 py-3 text-sm flex items-center gap-2 mx-auto"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spinner inline-block" />
                  Capturing screenshots…
                </>
              ) : (
                '📸 Take Screenshots'
              )}
            </button>
            {loading && (
              <p className="text-xs text-(--text-muted) mt-3">
                Launching browser — this takes 10–30 seconds
              </p>
            )}
          </>
        )}
      </div>
    );
  }

  // ── Screenshots ready ─────────────────────────────────────────────────────
  const currentBase64 = view === 'desktop' ? screenshots.desktopBase64 : screenshots.mobileBase64;
  const src = currentBase64 ? `data:image/png;base64,${currentBase64}` : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-1 bg-(--surface2) p-1 rounded-lg w-fit">
          {screenshots.desktopBase64 && (
            <button
              onClick={() => setView('desktop')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'desktop' ? 'tab-active' : 'text-(--text-muted) hover:text-(--text)'
              }`}
            >
              🖥️ Desktop
            </button>
          )}
          {screenshots.mobileBase64 && (
            <button
              onClick={() => setView('mobile')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'mobile' ? 'tab-active' : 'text-(--text-muted) hover:text-(--text)'
              }`}
            >
              📱 Mobile
            </button>
          )}
        </div>
        {src && (
          <button onClick={download} className="btn-primary w-full sm:w-auto px-4 py-2 text-sm">
            Download PNG
          </button>
        )}
      </div>

      {src && (
        <div className={`fade-in ${view === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
          <div className={`card overflow-hidden ${view === 'mobile' ? 'rounded-3xl' : ''}`}>
            <img src={src} alt={`${view} screenshot`} className="w-full" />
          </div>
          <p className="text-xs text-center text-(--text-muted) mt-2">
            {view === 'desktop' ? '1280×800' : '390×844'} viewport
          </p>
        </div>
      )}
    </div>
  );
}
