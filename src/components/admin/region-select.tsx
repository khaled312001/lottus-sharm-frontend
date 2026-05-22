'use client';

import { useState } from 'react';

// City/destination presets (localized). Admin can also add a brand-new city via
// the "add" option — that value is stored as-typed and shown as-is everywhere.
export const REGION_PRESETS = [
  { v: 'SHARM', l: 'شرم الشيخ' },
  { v: 'HURGHADA', l: 'الغردقة' },
  { v: 'DAHAB', l: 'دهب' },
  { v: 'CAIRO', l: 'القاهرة' },
  { v: 'MARSA_ALAM', l: 'مرسى علم' },
  { v: 'TABA', l: 'طابا' },
  { v: 'LUXOR', l: 'الأقصر' },
  { v: 'ASWAN', l: 'أسوان' },
  { v: 'ALEXANDRIA', l: 'الإسكندرية' },
];

const CLS = 'h-11 w-full rounded-lg border border-input px-3 bg-white';

/** Dropdown of cities (shows Arabic names) with an "add a new city" option. */
export function RegionSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const isPreset = REGION_PRESETS.some((p) => p.v === value);
  const [adding, setAdding] = useState(!isPreset && !!value);

  if (adding) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          autoFocus
          value={isPreset ? '' : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="اكتب اسم المدينة الجديدة"
          className={CLS}
        />
        <button
          type="button"
          onClick={() => { setAdding(false); onChange('SHARM'); }}
          className="shrink-0 px-2 text-xs text-muted-foreground hover:text-primary"
        >
          رجوع
        </button>
      </div>
    );
  }

  return (
    <select
      className={CLS}
      value={value}
      onChange={(e) => {
        if (e.target.value === '__add__') { setAdding(true); onChange(''); }
        else onChange(e.target.value);
      }}
    >
      {REGION_PRESETS.map((p) => <option key={p.v} value={p.v}>{p.l}</option>)}
      <option value="__add__">➕ أضف مدينة جديدة…</option>
    </select>
  );
}
