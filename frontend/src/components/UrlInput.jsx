import { useState } from 'react';

export default function UrlInput({ onSubmit, isLoading }) {
  const [url, setUrl] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (url.trim()) onSubmit(url.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full max-w-3xl mx-auto">
      <div className="relative flex-1">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) text-lg">🌐</span>
        <input
          type="text"
          className="input-field w-full pl-11 pr-4 py-3.5 sm:py-4 text-base"
          placeholder="Enter website URL (e.g. https://apple.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
          autoFocus
        />
      </div>
      <button
        type="submit"
        className="btn-primary w-full sm:w-auto px-8 py-3.5 sm:py-4 text-base"
        disabled={isLoading || !url.trim()}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spinner inline-block" />
            Analyzing...
          </span>
        ) : (
          'Analyze'
        )}
      </button>
    </form>
  );
}
