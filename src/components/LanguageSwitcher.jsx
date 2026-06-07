import { LANGUAGES } from '../i18n';

export default function LanguageSwitcher({ language, onChange }) {
  return (
    <div className="flex gap-1 rounded-full bg-white/80 p-1 shadow-sm ring-1 ring-slate-200/60">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => onChange(code)}
          className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-all duration-200 ${
            language === code
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }`}
          aria-pressed={language === code}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
