import { useState } from 'react';

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {});
}

export default function ColorPalette({ colors }) {
  const [copied, setCopied] = useState(null);

  if (!colors?.length) {
    return (
      <div className="text-center py-16 text-(--text-muted)">
        <div className="text-5xl mb-3">🎨</div>
        <p>No colors extracted from this page</p>
      </div>
    );
  }

  function handleCopy(hex, label) {
    copyToClipboard(hex);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div>
      <p className="text-(--text-muted) text-sm mb-4">{colors.length} color{colors.length !== 1 ? 's' : ''} extracted</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
        {colors.map((hex, i) => (
          <div key={i} className="group">
            <div
              className="w-full aspect-square rounded-xl cursor-pointer border-2 border-transparent group-hover:border-white/30 transition-all shadow-lg"
              style={{ backgroundColor: hex }}
              onClick={() => handleCopy(hex, hex)}
              title={`Click to copy ${hex}`}
            />
            <div className="mt-2 text-center">
              <p className="text-xs font-mono font-semibold text-(--text) uppercase">{hex}</p>
              <p className="text-xs text-(--text-muted)">{hexToRgb(hex)}</p>
              <button
                onClick={() => handleCopy(hex, hex)}
                className="text-xs text-(--accent2) hover:underline mt-1"
              >
                {copied === hex ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
