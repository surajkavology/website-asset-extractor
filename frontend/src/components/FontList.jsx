import { useState, useEffect, useRef } from 'react';
import { getFontProxyUrl, downloadFontZip, API_BASE } from '../services/api';

const FORMAT_BADGE = {
  woff2: { label: 'WOFF2', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  woff: { label: 'WOFF', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  ttf: { label: 'TTF', color: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
  otf: { label: 'OTF', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  eot: { label: 'EOT', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
};

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {});
}

function FontPreview({ font }) {
  const fontIdRef = useRef(`fp_${Math.random().toString(36).slice(2)}`);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const fontId = fontIdRef.current;

  useEffect(() => {
    if (!font.url) return;

    const proxyUrl = getFontProxyUrl(font.url);
    const styleId = `style_${fontId}`;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @font-face {
        font-family: "${fontId}";
        src: url("${proxyUrl}");
        font-weight: ${font.weight || 'normal'};
        font-style: ${font.style || 'normal'};
        font-display: swap;
      }
    `;
    document.head.appendChild(style);

    document.fonts.load(`${font.weight || 'normal'} 16px "${fontId}"`).then(() => {
      setLoaded(true);
    }).catch(() => {
      setFailed(true);
    });

    return () => {
      document.getElementById(styleId)?.remove();
    };
  }, [font.url, fontId]);

  if (!font.url) {
    return (
      <p className="text-sm text-(--text-muted) italic">
        The quick brown fox jumps over the lazy dog
      </p>
    );
  }

  return (
    <p
      className="text-sm transition-opacity duration-300"
      style={{
        fontFamily: loaded ? `"${fontId}", sans-serif` : 'sans-serif',
        fontWeight: font.weight || 'normal',
        fontStyle: font.style || 'normal',
        opacity: loaded ? 1 : 0.5,
        color: 'var(--text)',
      }}
      title={loaded ? `Rendered in ${font.family}` : 'Loading preview...'}
    >
      {failed
        ? 'Preview unavailable'
        : 'The quick brown fox jumps over the lazy dog'}
    </p>
  );
}

function FontCard({ font }) {
  const [copied, setCopied] = useState(false);
  const [downloadState, setDownloadState] = useState('idle'); // idle | loading | error

  const formatInfo = FORMAT_BADGE[font.format] || {
    label: font.format ? font.format.toUpperCase() : '?',
    color: 'bg-(--surface2) text-(--text-muted) border-(--border)',
  };

  function handleCopyUrl() {
    copyToClipboard(font.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleDownload() {
    if (downloadState === 'loading') return;
    setDownloadState('loading');
    try {
      const proxyUrl = getFontProxyUrl(font.url);
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const filename = font.url.split('?')[0].split('/').pop() || `${font.family}.${font.format}`;
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
      setDownloadState('idle');
    } catch {
      setDownloadState('error');
      setTimeout(() => setDownloadState('idle'), 3000);
    }
  }

  return (
    <div className="card p-5 flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base text-(--text) truncate">{font.family}</p>
          {font.url && (
            <p className="text-xs text-(--text-muted) truncate mt-0.5" title={font.url}>
              {font.url.replace(/^https?:\/\//, '').slice(0, 60)}
              {font.url.length > 70 ? '…' : ''}
            </p>
          )}
        </div>
        <span className={`badge border text-xs shrink-0 ${formatInfo.color}`}>
          {formatInfo.label}
        </span>
      </div>

      {/* Meta tags */}
      <div className="flex gap-2 flex-wrap">
        <span className="badge border border-(--border) text-xs">
          Weight {font.weight || '400'}
        </span>
        <span className="badge border border-(--border) text-xs capitalize">
          {font.style || 'normal'}
        </span>
      </div>

      {/* Live preview */}
      <div className="bg-(--surface2) rounded-lg px-4 py-3 min-h-11 flex items-center">
        <FontPreview font={font} />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        {font.url ? (
          <>
            <button
              onClick={handleDownload}
              disabled={downloadState === 'loading'}
              className="btn-primary flex-1 py-2 text-sm flex items-center justify-center gap-1.5"
            >
              {downloadState === 'loading' ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full spinner inline-block" />
                  Downloading…
                </>
              ) : downloadState === 'error' ? (
                'Download unavailable'
              ) : (
                <>⬇ Download Font</>
              )}
            </button>
            <button
              onClick={handleCopyUrl}
              className="px-3 py-2 text-sm rounded-lg border border-(--border) text-(--text-muted) hover:text-(--text) hover:border-(--accent) transition-colors"
              title="Copy font URL"
            >
              {copied ? '✓' : '🔗'}
            </button>
          </>
        ) : (
          <p className="text-xs text-(--text-muted) italic">No downloadable file URL</p>
        )}
      </div>
    </div>
  );
}

export default function FontList({ fonts, fontFamilies }) {
  const [downloading, setDownloading] = useState(false);
  const [zipError, setZipError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterFormat, setFilterFormat] = useState('all');

  // Only keep valid font-face objects that have a real download URL.
  // This guards against old string-array responses or objects with missing data.
  const fontFaces = Array.isArray(fonts)
    ? fonts.filter((f) => f && typeof f === 'object' && typeof f.url === 'string' && f.url)
    : [];
  const downloadable = fontFaces;
  // Font family names without file URLs (from CSS font-family: declarations)
  const familiesOnly = (fontFamilies || []).filter(
    (name) => !fontFaces.some((f) => f.family === name)
  );

  const formats = [...new Set(fontFaces.map((f) => f.format).filter(Boolean))];

  const filtered = fontFaces.filter((f) => {
    const matchesSearch =
      !search ||
      f.family.toLowerCase().includes(search.toLowerCase()) ||
      f.url?.toLowerCase().includes(search.toLowerCase());
    const matchesFormat = filterFormat === 'all' || f.format === filterFormat;
    return matchesSearch && matchesFormat;
  });

  async function handleDownloadAll() {
    if (!downloadable.length || downloading) return;
    setDownloading(true);
    setZipError(null);
    try {
      await downloadFontZip(downloadable);
    } catch {
      setZipError('Failed to generate ZIP. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  if (!fontFaces.length && !familiesOnly.length) {
    return (
      <div className="text-center py-16 text-(--text-muted)">
        <div className="text-5xl mb-3">🔤</div>
        <p>No custom fonts detected on this page</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary + controls */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="text-(--text-muted) text-sm">
            {fontFaces.length} font file{fontFaces.length !== 1 ? 's' : ''} found
            {downloadable.length > 0 && ` · ${downloadable.length} downloadable`}
          </span>

          <input
            className="input-field px-3 py-1.5 text-sm w-full sm:w-48"
            placeholder="Search fonts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {formats.length > 1 && (
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setFilterFormat('all')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${filterFormat === 'all' ? 'tab-active' : 'bg-(--surface2) text-(--text-muted) hover:text-(--text)'}`}
            >
              All
            </button>
            {formats.map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFilterFormat(fmt)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${filterFormat === fmt ? 'tab-active' : 'bg-(--surface2) text-(--text-muted) hover:text-(--text)'}`}
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {downloadable.length > 0 && (
          <div className="flex flex-col gap-1">
            <button
              onClick={handleDownloadAll}
              disabled={downloading}
              className="btn-primary w-full sm:w-auto px-5 py-2.5 text-sm flex items-center justify-center gap-2"
            >
              {downloading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spinner inline-block" />
                  Building ZIP…
                </>
              ) : (
                <>📦 Download All Fonts ({downloadable.length})</>
              )}
            </button>
            {zipError && <p className="text-xs text-red-400">{zipError}</p>}
          </div>
        )}
      </div>

      {/* Font face cards */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((font, i) => (
            <FontCard key={`${font.url || font.family}_${i}`} font={font} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-(--text-muted)">
          <p>No fonts match your filter</p>
        </div>
      )}

      {/* Font families without downloadable files */}
      {familiesOnly.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider mb-3">
            Font Families (no file URL detected)
          </h3>
          <div className="flex flex-wrap gap-2">
            {familiesOnly.map((name, i) => (
              <span
                key={i}
                className="badge border border-(--border) text-sm cursor-pointer hover:border-(--accent) transition-colors"
                onClick={() => copyToClipboard(`font-family: "${name}", sans-serif;`)}
                title="Click to copy CSS"
              >
                <span className="text-(--accent2) font-medium" style={{ fontFamily: `"${name}", sans-serif` }}>
                  Aa
                </span>
                {name}
              </span>
            ))}
          </div>
          <p className="text-xs text-(--text-muted) mt-2">Click any to copy CSS declaration</p>
        </div>
      )}
    </div>
  );
}
