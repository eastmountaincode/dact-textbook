'use client';

interface FontControlsProps {
  fontSize: number;
  defaultFontSize: number;
  fontFamily: 'serif' | 'sans';
  canIncrease: boolean;
  canDecrease: boolean;
  onFontSizeIncrease: () => void;
  onFontSizeDecrease: () => void;
  onFontSizeReset: () => void;
  onFontFamilyChange: (family: 'serif' | 'sans') => void;
}

export default function FontControls({
  fontSize,
  defaultFontSize,
  fontFamily,
  canIncrease,
  canDecrease,
  onFontSizeIncrease,
  onFontSizeDecrease,
  onFontSizeReset,
  onFontFamilyChange,
}: FontControlsProps) {
  return (
    <>
      {/* Font Size */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm" style={{ color: 'var(--muted-text)' }}>Font Size</p>
          <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{fontSize}px</span>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={onFontSizeDecrease}
            disabled={!canDecrease}
            className="w-8 h-8 rounded flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
            style={{
              backgroundColor: canDecrease ? 'var(--sidebar-section-bg)' : 'var(--input-bg)',
              color: canDecrease ? 'var(--foreground)' : 'var(--muted-text)',
            }}
            title="Smaller"
          >
            <span className="text-xs font-serif">A</span>
          </button>
          <button
            onClick={onFontSizeIncrease}
            disabled={!canIncrease}
            className="w-8 h-8 rounded flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
            style={{
              backgroundColor: canIncrease ? 'var(--sidebar-section-bg)' : 'var(--input-bg)',
              color: canIncrease ? 'var(--foreground)' : 'var(--muted-text)',
            }}
            title="Larger"
          >
            <span className="text-base font-serif">A</span>
          </button>
          <button
            onClick={onFontSizeReset}
            disabled={fontSize === defaultFontSize}
            className="px-2 py-1 rounded text-sm cursor-pointer disabled:cursor-not-allowed"
            style={{ color: fontSize !== defaultFontSize ? 'var(--muted-text)' : 'var(--input-border)' }}
            title="Reset to default"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Font Style */}
      <div>
        <p className="text-sm mb-2" style={{ color: 'var(--muted-text)' }}>Font Style</p>
        <div className="flex gap-2">
          <button
            onClick={() => onFontFamilyChange('serif')}
            className="px-3 py-1 rounded text-base font-serif cursor-pointer"
            style={{
              backgroundColor: fontFamily === 'serif' ? 'var(--berkeley-blue)' : 'var(--sidebar-section-bg)',
              color: fontFamily === 'serif' ? 'white' : 'var(--foreground)',
            }}
          >
            Serif
          </button>
          <button
            onClick={() => onFontFamilyChange('sans')}
            className="px-3 py-1 rounded text-base font-sans cursor-pointer"
            style={{
              backgroundColor: fontFamily === 'sans' ? 'var(--berkeley-blue)' : 'var(--sidebar-section-bg)',
              color: fontFamily === 'sans' ? 'white' : 'var(--foreground)',
            }}
          >
            Sans
          </button>
        </div>
      </div>
    </>
  );
}
