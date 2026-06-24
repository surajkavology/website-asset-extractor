function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {});
}

export default function CssList({ cssFiles, inlineCss }) {
  const hasFiles = cssFiles?.length > 0;
  const hasInline = inlineCss?.length > 0;

  if (!hasFiles && !hasInline) {
    return (
      <div className="text-center py-16 text-(--text-muted)">
        <div className="text-5xl mb-3">🎨</div>
        <p>No CSS files found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hasFiles && (
        <>
          <p className="text-(--text-muted) text-sm">{cssFiles.length} stylesheet{cssFiles.length !== 1 ? 's' : ''} found</p>
          <div className="space-y-2">
            {cssFiles.map((css, i) => (
              <div key={i} className="card p-3 flex items-center gap-3 group">
                <span className="text-lg">🎨</span>
                <p className="text-sm flex-1 truncate text-(--accent2)" title={css.url}>{css.url}</p>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => copyToClipboard(css.url)}
                    className="text-xs text-(--text-muted) hover:text-(--text)"
                  >
                    Copy URL
                  </button>
                  <a
                    href={css.url}
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
        </>
      )}

      {hasInline && (
        <div>
          <p className="text-(--text-muted) text-sm mb-2">{inlineCss.length} inline style block{inlineCss.length !== 1 ? 's' : ''}</p>
          {inlineCss.map((css, i) => (
            <div key={i} className="card p-3 mb-2">
              <p className="text-xs text-(--text-muted) mb-2">Inline #{i + 1}</p>
              <pre className="text-xs text-(--text) overflow-auto max-h-32 whitespace-pre-wrap">{css.content}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
