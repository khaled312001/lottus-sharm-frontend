'use client';

import { useState } from 'react';

/**
 * Dropdown of existing media sections (categories) with an "add a new section"
 * option — mirrors RegionSelect. Pick a known category from the list, or choose
 * «➕ قسم جديد…» to type a brand-new one. Commits via onChange only on a
 * concrete choice (select an option / save a new name), never per-keystroke.
 */
export function CategorySelect({
  value,
  onChange,
  options,
  placeholder = 'اختر القسم',
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}) {
  const isKnown = options.includes(value);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  if (adding) {
    const commit = () => { const v = draft.trim(); if (v) { onChange(v); setAdding(false); } };
    return (
      <div className="flex items-center gap-1.5">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') commit(); }}
          placeholder="اكتب اسم القسم الجديد"
          className={className}
        />
        <button type="button" onClick={commit} className="shrink-0 h-9 px-3 rounded-md bg-accent text-primary text-xs font-bold hover:bg-accent-400">
          حفظ
        </button>
        <button type="button" onClick={() => { setAdding(false); setDraft(''); }} className="shrink-0 px-2 text-xs text-muted-foreground hover:text-primary">
          رجوع
        </button>
      </div>
    );
  }

  return (
    <select
      className={className}
      value={isKnown ? value : ''}
      onChange={(e) => {
        if (e.target.value === '__add__') { setDraft(''); setAdding(true); }
        else onChange(e.target.value);
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
      <option value="__add__">➕ قسم جديد…</option>
    </select>
  );
}
