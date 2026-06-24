import { useState } from 'react';

export default function ScreenshotCard({ screenshots }) {
  const [view, setView] = useState('desktop');

  if (!screenshots?.desktopBase64 && !screenshots?.mobileBase64) {
    return (
      <div className="text-center py-16 text-(--text-muted)">
        <div className="text-5xl mb-3">📸</div>
        <p>No screenshots available</p>
      </div>
    );
  }

  const current = view === 'desktop' ? screenshots.desktopBase64 : screenshots.mobileBase64;
  const src = current ? `data:image/png;base64,${current}` : null;

  function download() {
    if (!src) return;
    const a = document.createElement('a');
    a.href = src;
    a.download = `${view}-screenshot.png`;
    a.click();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-1 bg-(--surface2) p-1 rounded-lg w-fit">
          {screenshots.desktopBase64 && (
            <button
              onClick={() => setView('desktop')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'desktop' ? 'tab-active' : 'text-(--text-muted) hover:text-(--text)'}`}
            >
              🖥️ Desktop
            </button>
          )}
          {screenshots.mobileBase64 && (
            <button
              onClick={() => setView('mobile')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === 'mobile' ? 'tab-active' : 'text-(--text-muted) hover:text-(--text)'}`}
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
            <img
              src={src}
              alt={`${view} screenshot`}
              className="w-full"
            />
          </div>
          <p className="text-xs text-center text-(--text-muted) mt-2">
            {view === 'desktop' ? '1280×800' : '390×844'} viewport
          </p>
        </div>
      )}
    </div>
  );
}
