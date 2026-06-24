export default function VideoGrid({ videos }) {
  if (!videos?.length) {
    return (
      <div className="text-center py-16 text-(--text-muted)">
        <div className="text-5xl mb-3">🎬</div>
        <p>No videos found on this page</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-(--text-muted) text-sm mb-4">{videos.length} video{videos.length !== 1 ? 's' : ''} found</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videos.map((vid, i) => (
          <div key={i} className="card overflow-hidden">
            <video
              src={vid.url}
              controls
              className="w-full max-h-64 bg-black"
              preload="metadata"
            />
            <div className="p-3 flex items-center gap-2">
              <p className="text-xs text-(--text-muted) flex-1 truncate">{vid.url}</p>
              <a
                href={vid.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-(--accent2) hover:underline whitespace-nowrap"
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
