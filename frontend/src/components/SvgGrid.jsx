export default function SvgGrid({ svgs }) {
  if (!svgs?.length) {
    return (
      <div className="text-center py-16 text-(--text-muted)">
        <div className="text-5xl mb-3">🎨</div>
        <p>No SVGs found on this page</p>
      </div>
    );
  }

  const external = svgs.filter((s) => s.url);
  const inline = svgs.filter((s) => s.inline);

  return (
    <div className="space-y-6">
      <p className="text-(--text-muted) text-sm">{svgs.length} SVG{svgs.length !== 1 ? 's' : ''} found</p>

      {external.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-(--text-muted) mb-3 uppercase tracking-wider">External SVGs</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {external.map((svg, i) => (
              <div key={i} className="card card-hover p-3 flex flex-col items-center gap-2">
                <img
                  src={svg.url}
                  alt=""
                  className="w-12 h-12 object-contain"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <p className="text-xs text-(--text-muted) truncate w-full text-center">
                  {svg.url?.split('/').pop()}
                </p>
                <a
                  href={svg.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-(--accent2) hover:underline"
                >
                  Open ↗
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {inline.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-(--text-muted) mb-3 uppercase tracking-wider">Inline SVGs</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {inline.map((svg, i) => (
              <div key={i} className="card p-4">
                <div
                  className="flex items-center justify-center h-20 [&_svg]:max-w-full [&_svg]:max-h-full [&_svg]:w-auto [&_svg]:h-auto text-(--text)"
                  dangerouslySetInnerHTML={{ __html: svg.content }}
                />
                <p className="text-xs text-(--text-muted) mt-2 text-center">Inline SVG #{i + 1}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
