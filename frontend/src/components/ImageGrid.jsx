import { useState } from 'react';

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {});
}

export default function ImageGrid({ images }) {
  const [search, setSearch] = useState('');
  const [lightbox, setLightbox] = useState(null);

  if (!images?.length) {
    return (
      <div className="text-center py-16 text-(--text-muted)">
        <div className="text-5xl mb-3">🖼️</div>
        <p>No images found on this page</p>
      </div>
    );
  }

  const filtered = search
    ? images.filter((img) => img.url?.toLowerCase().includes(search.toLowerCase()) || img.alt?.toLowerCase().includes(search.toLowerCase()))
    : images;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <span className="text-(--text-muted) text-sm">{images.length} images found</span>
        <input
          className="input-field px-3 py-2 text-sm w-full sm:w-64"
          placeholder="Search images..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((img, i) => (
          <div
            key={i}
            className="card card-hover group cursor-pointer overflow-hidden"
            onClick={() => setLightbox(img)}
          >
            <div className="relative aspect-square overflow-hidden bg-(--surface2)">
              <img
                src={img.url}
                alt={img.alt || ''}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = '<div class="w-full h-full flex items-center justify-center text-3xl">🖼️</div>';
                }}
              />
            </div>
            <div className="p-2">
              <p className="text-xs text-(--text-muted) truncate" title={img.url}>
                {img.alt || img.url?.split('/').pop() || 'image'}
              </p>
              <button
                className="mt-1 text-xs text-(--accent2) opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => { e.stopPropagation(); copyToClipboard(img.url); }}
              >
                Copy URL
              </button>
            </div>
          </div>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="max-w-4xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute -top-10 right-0 text-white text-2xl hover:text-(--accent2)"
              onClick={() => setLightbox(null)}
            >
              ✕
            </button>
            <img
              src={lightbox.url}
              alt={lightbox.alt || ''}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <div className="mt-2 flex items-center gap-2">
              <p className="text-white/70 text-sm flex-1 truncate">{lightbox.url}</p>
              <button
                className="text-sm text-(--accent2) hover:underline"
                onClick={() => copyToClipboard(lightbox.url)}
              >
                Copy URL
              </button>
              <a
                href={lightbox.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-(--accent2) hover:underline"
                download
              >
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
