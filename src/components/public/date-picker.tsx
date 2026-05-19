'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (v: string) => void;
  min?: string;
  max?: string;
  locale: string;
  className?: string;
}

const MONTHS = {
  ar: ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'],
  en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  ru: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
  it: ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'],
  de: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
};

const WEEKDAYS = {
  ar: ['أحد','إثن','ثلا','أرب','خمي','جمع','سبت'],
  en: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
  ru: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'],
  it: ['Dom','Lun','Mar','Mer','Gio','Ven','Sab'],
  de: ['So','Mo','Di','Mi','Do','Fr','Sa'],
};

function parseISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function DatePicker({ value, onChange, min, max, locale, className }: DatePickerProps) {
  const lang = (['ar', 'en', 'ru', 'it'].includes(locale) ? locale : 'en') as keyof typeof MONTHS;
  const isAr = lang === 'ar';
  const today = useMemo(() => new Date(), []);
  const selected = value ? parseISO(value) : null;
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Date>(selected || today);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click + Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const minDate = min ? parseISO(min) : null;
  const maxDate = max ? parseISO(max) : null;
  const isDisabled = (d: Date) => {
    if (minDate && d < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return true;
    if (maxDate && d > maxDate) return true;
    return false;
  };

  const monthStart = new Date(view.getFullYear(), view.getMonth(), 1);
  const startDow = monthStart.getDay(); // 0 = Sunday
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();

  // Build 6 weeks × 7 days grid
  const cells: { date: Date; current: boolean }[] = [];
  // Previous month tail
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(view.getFullYear(), view.getMonth(), -i);
    cells.push({ date: d, current: false });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(view.getFullYear(), view.getMonth(), d), current: true });
  }
  // Next month head
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const last = cells[cells.length - 1].date;
    cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), current: false });
  }

  const monthLabel = `${MONTHS[lang][view.getMonth()]} ${view.getFullYear()}`;
  const formatDisplay = (d: Date) => {
    try {
      return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : lang === 'ru' ? 'ru-RU' : lang === 'it' ? 'it-IT' : lang === 'de' ? 'de-DE' : 'en-GB', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
      });
    } catch {
      return toISO(d);
    }
  };

  const placeholder = isAr ? 'اختر التاريخ' : lang === 'ru' ? 'Выберите дату' : lang === 'it' ? 'Seleziona data' : 'Pick a date';
  const todayLabel = isAr ? 'اليوم' : lang === 'ru' ? 'Сегодня' : lang === 'it' ? 'Oggi' : 'Today';
  const clearLabel = isAr ? 'مسح' : lang === 'ru' ? 'Очистить' : lang === 'it' ? 'Cancella' : 'Clear';

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'group w-full h-12 px-4 rounded-lg border-2 bg-white text-start',
          'flex items-center justify-between gap-3',
          'border-accent/25 hover:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent',
          'transition-all',
          open && 'border-accent ring-2 ring-accent/30',
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2.5 min-w-0">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-accent/15 text-accent-700 shrink-0">
            <CalendarIcon className="h-4 w-4" />
          </span>
          <span className={cn('font-semibold text-sm truncate', selected ? 'text-primary' : 'text-muted-foreground')}>
            {selected ? formatDisplay(selected) : placeholder}
          </span>
        </span>
        {selected && (
          <span
            role="button"
            aria-label={clearLabel}
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
            className="inline-flex items-center justify-center w-6 h-6 rounded-full hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Calendar"
          className="absolute z-50 mt-2 left-0 right-0 sm:start-0 sm:end-auto sm:w-[320px] bg-white rounded-2xl border border-accent/25 shadow-2xl shadow-primary-900/15 p-4 origin-top"
          style={{ animation: 'card-float-in 0.2s ease-out' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent/10 text-primary transition-colors"
              aria-label="Previous month"
            >
              {isAr ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
            <div className="font-serif font-bold text-base text-primary">{monthLabel}</div>
            <button
              type="button"
              onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent/10 text-primary transition-colors"
              aria-label="Next month"
            >
              {isAr ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>

          {/* Weekday header */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS[lang].map((wd, i) => (
              <div key={i} className="text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-1">
                {wd}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map(({ date, current }, i) => {
              const disabled = isDisabled(date);
              const isSelected = selected && sameDay(date, selected);
              const isToday = sameDay(date, today);
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => { onChange(toISO(date)); setOpen(false); }}
                  className={cn(
                    'aspect-square inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all relative',
                    !current && 'text-muted-foreground/40',
                    current && !disabled && !isSelected && 'text-primary hover:bg-accent/15',
                    disabled && 'text-muted-foreground/25 cursor-not-allowed line-through',
                    isToday && !isSelected && 'ring-1 ring-accent/40',
                    isSelected && 'bg-accent text-primary shadow-md shadow-accent/40 hover:bg-accent-400',
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-accent/15">
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
            >
              {clearLabel}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!isDisabled(today)) {
                  onChange(toISO(today));
                  setView(today);
                  setOpen(false);
                }
              }}
              className="text-xs font-bold text-accent-700 hover:text-accent transition-colors"
            >
              {todayLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
