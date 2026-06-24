function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-2 border-b border-(--border) last:border-0">
      <span className="text-xs text-(--text-muted) w-32 shrink-0 mt-0.5">{label}</span>
      <span className="text-sm text-(--text) break-all">{value}</span>
    </div>
  );
}

export default function MetaCard({ meta }) {
  if (!meta) {
    return (
      <div className="text-center py-16 text-(--text-muted)">
        <div className="text-5xl mb-3">📋</div>
        <p>No metadata found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h3 className="font-semibold text-sm text-(--text-muted) uppercase tracking-wider mb-3">General</h3>
        <Row label="Title" value={meta.title} />
        <Row label="Description" value={meta.description} />
        <Row label="Keywords" value={meta.keywords} />
        <Row label="Author" value={meta.author} />
        <Row label="Language" value={meta.language} />
        <Row label="Canonical URL" value={meta.canonical} />
        <Row label="Favicon" value={meta.favicon} />
        <Row label="Viewport" value={meta.viewport} />
        <Row label="Theme Color" value={meta.themeColor} />
        <Row label="Robots" value={meta.robots} />
      </div>

      {meta.openGraph && Object.values(meta.openGraph).some(Boolean) && (
        <div className="card p-4">
          <h3 className="font-semibold text-sm text-(--text-muted) uppercase tracking-wider mb-3">Open Graph</h3>
          {meta.openGraph.image && (
            <img
              src={meta.openGraph.image}
              alt="OG"
              className="w-full max-h-48 object-cover rounded-lg mb-3"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          <Row label="Title" value={meta.openGraph.title} />
          <Row label="Description" value={meta.openGraph.description} />
          <Row label="Type" value={meta.openGraph.type} />
          <Row label="URL" value={meta.openGraph.url} />
          <Row label="Site Name" value={meta.openGraph.siteName} />
          <Row label="Image" value={meta.openGraph.image} />
        </div>
      )}

      {meta.twitter && Object.values(meta.twitter).some(Boolean) && (
        <div className="card p-4">
          <h3 className="font-semibold text-sm text-(--text-muted) uppercase tracking-wider mb-3">Twitter Card</h3>
          {meta.twitter.image && (
            <img
              src={meta.twitter.image}
              alt="Twitter Card"
              className="w-full max-h-48 object-cover rounded-lg mb-3"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          <Row label="Card" value={meta.twitter.card} />
          <Row label="Title" value={meta.twitter.title} />
          <Row label="Description" value={meta.twitter.description} />
          <Row label="Site" value={meta.twitter.site} />
          <Row label="Image" value={meta.twitter.image} />
        </div>
      )}
    </div>
  );
}
