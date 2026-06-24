const CATEGORY_LABELS = {
  framework: 'Frameworks',
  cms: 'CMS',
  plugin: 'Plugins',
  platform: 'Platforms',
  styling: 'Styling',
  animation: 'Animation',
  library: 'Libraries',
  analytics: 'Analytics',
  infrastructure: 'Infrastructure',
  language: 'Languages',
  'build-tool': 'Build Tools',
  icons: 'Icons',
  payment: 'Payments',
  support: 'Support',
  monitoring: 'Monitoring',
};

const CATEGORY_COLORS = {
  framework: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  cms: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  plugin: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  platform: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  styling: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  animation: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  library: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  analytics: 'bg-red-500/20 text-red-300 border-red-500/30',
  infrastructure: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  language: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  'build-tool': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  icons: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  payment: 'bg-green-500/20 text-green-300 border-green-500/30',
  support: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
  monitoring: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

export default function TechStackCard({ techStack }) {
  if (!techStack?.length) {
    return (
      <div className="text-center py-16 text-(--text-muted)">
        <div className="text-5xl mb-3">🔍</div>
        <p>No technology stack detected</p>
      </div>
    );
  }

  const grouped = techStack.reduce((acc, tech) => {
    const cat = tech.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tech);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <p className="text-(--text-muted) text-sm">{techStack.length} technolog{techStack.length !== 1 ? 'ies' : 'y'} detected</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {techStack.map((tech, i) => (
          <span
            key={i}
            className={`badge border ${CATEGORY_COLORS[tech.category] || 'bg-(--surface2) text-(--text) border-(--border)'}`}
          >
            <span>{tech.icon}</span>
            <span>{tech.name}</span>
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(grouped).map(([cat, techs]) => (
          <div key={cat} className="card p-4">
            <h3 className="text-xs font-semibold text-(--text-muted) uppercase tracking-wider mb-3">
              {CATEGORY_LABELS[cat] || cat}
            </h3>
            <div className="flex flex-wrap gap-2">
              {techs.map((tech, i) => (
                <span
                  key={i}
                  className={`badge border ${CATEGORY_COLORS[cat] || 'bg-(--surface2) text-(--text) border-(--border)'}`}
                >
                  <span>{tech.icon}</span>
                  <span>{tech.name}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
