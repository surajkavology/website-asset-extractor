import { useState } from 'react';
import UrlInput from '../components/UrlInput';
import LoadingSkeleton from '../components/LoadingSkeleton';
import AssetTabs from '../components/AssetTabs';
import ZipDownloadButton from '../components/ZipDownloadButton';
import { analyzeUrl } from '../services/api';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [analyzedUrl, setAnalyzedUrl] = useState('');

  async function handleAnalyze(url) {
    setIsLoading(true);
    setError(null);
    setData(null);
    setAnalyzedUrl(url);
    try {
      const result = await analyzeUrl(url);
      setData(result);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to analyze URL');
    } finally {
      setIsLoading(false);
    }
  }

  const totalAssets = data
    ? (data.images?.length || 0) +
      (data.videos?.length || 0) +
      (data.svgs?.length || 0) +
      (data.cssFiles?.length || 0) +
      (data.jsFiles?.length || 0) +
      (data.fonts?.length || 0) +
      (data.colors?.length || 0)
    : 0;

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-(--surface2) border border-(--border) rounded-full px-4 py-1.5 text-xs text-(--text-muted) mb-5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
             No signup required
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="gradient-text">Website Asset</span>
            <br />
            <span className="text-(--text)">Extractor AI</span>
          </h1>
          <p className="text-(--text-muted) text-lg max-w-xl mx-auto">
            Paste any website URL and extract images, videos, fonts, colors,
            tech stack, screenshots and more — instantly.
          </p>
        </div>

        {/* Input */}
        <div className="mb-8">
          <UrlInput onSubmit={handleAnalyze} isLoading={isLoading} />
        </div>

        {/* Error state */}
        {error && (
          <div className="max-w-3xl mx-auto mb-6 fade-in">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm flex items-start gap-3">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="font-semibold">Analysis failed</p>
                <p className="text-red-400/80 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="mt-6">
            <div className="text-center text-(--text-muted) mb-4 fade-in">
              <div className="inline-flex items-center gap-3 bg-(--surface) border border-(--border) rounded-xl px-5 py-3">
                <span className="w-5 h-5 border-2 border-(--accent)/30 border-t-(--accent) rounded-full spinner inline-block" />
                <span>Analyzing {analyzedUrl} ...</span>
              </div>
            </div>
            <LoadingSkeleton />
          </div>
        )}

        {/* Results */}
        {data && !isLoading && (
          <div className="mt-6 fade-in">
            {/* Results header */}
            <div className="flex flex-col gap-3 mb-6 p-4 card">

              {/* Site identity row */}
              <div className="flex items-center gap-3 min-w-0">
                {data.meta?.favicon && (
                  <img
                    src={data.meta.favicon}
                    alt=""
                    className="w-6 h-6 rounded shrink-0"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-(--text) line-clamp-1">
                    {data.meta?.title || data.url}
                  </p>
                  <a
                    href={data.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-(--text-muted) hover:text-(--accent2) truncate block"
                  >
                    {data.url} ↗
                  </a>
                </div>
              </div>

              {/* Stats + download — stacked on mobile, side-by-side on sm+ */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-x-4 gap-y-2">
                  <Stat label="Images" value={data.images?.length} />
                  <Stat label="Videos" value={data.videos?.length} />
                  <Stat label="CSS" value={data.cssFiles?.length} />
                  <Stat label="JS" value={data.jsFiles?.length} />
                  <Stat label="Colors" value={data.colors?.length} />
                  <Stat label="Fonts" value={data.fonts?.length} />
                </div>
                <div className="sm:shrink-0">
                  <ZipDownloadButton analysisData={data} />
                </div>
              </div>
            </div>

            <AssetTabs data={data} />
          </div>
        )}

        {/* Landing features (when no data) */}
        {!data && !isLoading && !error && (
          <div className="mt-16 fade-in">
            <p className="text-center text-(--text-muted) text-sm mb-8">What gets extracted</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {FEATURES.map((f, i) => (
                <div key={i} className="card p-4 flex items-center gap-3">
                  <span className="text-2xl">{f.icon}</span>
                  <div>
                    <p className="text-sm font-medium">{f.label}</p>
                    <p className="text-xs text-(--text-muted)">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold text-(--accent2)">{value ?? 0}</p>
      <p className="text-xs text-(--text-muted)">{label}</p>
    </div>
  );
}

const FEATURES = [
  { icon: '🖼️', label: 'Images', desc: 'JPG, PNG, WebP, GIF' },
  { icon: '🎬', label: 'Videos', desc: 'MP4, WebM sources' },
  { icon: '🎨', label: 'SVGs', desc: 'Inline & external' },
  { icon: '🔤', label: 'Fonts', desc: 'Custom font families' },
  { icon: '🎨', label: 'CSS Files', desc: 'All stylesheets' },
  { icon: '⚡', label: 'JavaScript', desc: 'All script files' },
  { icon: '🎨', label: 'Color Palette', desc: 'Dominant colors' },
  { icon: '📋', label: 'Meta Tags', desc: 'SEO & OG data' },
  { icon: '🔍', label: 'Tech Stack', desc: '30+ technologies' },
  { icon: '📸', label: 'Screenshots', desc: 'Desktop & mobile' },
  { icon: '📦', label: 'ZIP Download', desc: 'All assets bundled' },
  { icon: '🚀', label: 'Fast & Free', desc: 'No API keys needed' },
];
