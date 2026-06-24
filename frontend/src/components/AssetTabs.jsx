import { useState } from 'react';
import ImageGrid from './ImageGrid';
import VideoGrid from './VideoGrid';
import SvgGrid from './SvgGrid';
import FontList from './FontList';
import CssList from './CssList';
import JsList from './JsList';
import ColorPalette from './ColorPalette';
import MetaCard from './MetaCard';
import TechStackCard from './TechStackCard';
import ScreenshotCard from './ScreenshotCard';

const TABS = [
  { id: 'images', label: 'Images', icon: '🖼️', countKey: 'images' },
  { id: 'videos', label: 'Videos', icon: '🎬', countKey: 'videos' },
  { id: 'svgs', label: 'SVGs', icon: '🎨', countKey: 'svgs' },
  { id: 'fonts', label: 'Fonts', icon: '🔤', countKey: 'fonts' },
  { id: 'css', label: 'CSS', icon: '🎨', countKey: 'cssFiles' },
  { id: 'js', label: 'JavaScript', icon: '⚡', countKey: 'jsFiles' },
  { id: 'colors', label: 'Colors', icon: '🎨', countKey: 'colors' },
  { id: 'meta', label: 'Meta Tags', icon: '📋', countKey: null },
  { id: 'techstack', label: 'Tech Stack', icon: '🔍', countKey: 'techStack' },
  { id: 'screenshots', label: 'Screenshots', icon: '📸', countKey: null },
];

export default function AssetTabs({ data }) {
  const [active, setActive] = useState('images');

  function getCount(tab) {
    if (!tab.countKey) return null;
    const val = data[tab.countKey];
    if (!val) return 0;
    return Array.isArray(val) ? val.length : 0;
  }

  function renderContent() {
    switch (active) {
      case 'images': return <ImageGrid images={data.images} />;
      case 'videos': return <VideoGrid videos={data.videos} />;
      case 'svgs': return <SvgGrid svgs={data.svgs} />;
      case 'fonts': return <FontList fonts={data.fonts} fontFamilies={data.fontFamilies} />;
      case 'css': return <CssList cssFiles={data.cssFiles} inlineCss={data.inlineCss} />;
      case 'js': return <JsList jsFiles={data.jsFiles} />;
      case 'colors': return <ColorPalette colors={data.colors} />;
      case 'meta': return <MetaCard meta={data.meta} />;
      case 'techstack': return <TechStackCard techStack={data.techStack} />;
      case 'screenshots': return <ScreenshotCard screenshots={data.screenshots} />;
      default: return null;
    }
  }

  return (
    <div className="fade-in">
      {/* Scrollable tab strip — horizontal scroll on mobile, wraps on desktop */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-6 pb-0.5">
        <div className="flex gap-1 bg-(--surface) border border-(--border) rounded-xl p-1 w-max sm:w-auto sm:flex-wrap">
          {TABS.map((tab) => {
            const count = getCount(tab);
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  active === tab.id
                    ? 'tab-active'
                    : 'text-(--text-muted) hover:text-(--text) hover:bg-(--surface2)'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {count !== null && count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${active === tab.id ? 'bg-white/20' : 'bg-(--surface2)'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div>{renderContent()}</div>
    </div>
  );
}
