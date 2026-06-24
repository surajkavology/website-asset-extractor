function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {});
}

export default function JsList({ jsFiles }) {
  if (!jsFiles?.length) {
    return (
      <div className="text-center py-16 text-(--text-muted)">
        <div className="text-5xl mb-3">⚡</div>
        <p>No JavaScript files found</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-(--text-muted) text-sm mb-4">{jsFiles.length} script{jsFiles.length !== 1 ? 's' : ''} found</p>
      <div className="space-y-2">
        {jsFiles.map((js, i) => (
          <div key={i} className="card p-3 flex items-center gap-3 group">
            <span className="text-lg">⚡</span>
            <p className="text-sm flex-1 truncate text-(--accent2)" title={js.url}>{js.url}</p>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => copyToClipboard(js.url)}
                className="text-xs text-(--text-muted) hover:text-(--text)"
              >
                Copy URL
              </button>
              <a
                href={js.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-(--accent2) hover:underline"
              >
                Open ↗
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
