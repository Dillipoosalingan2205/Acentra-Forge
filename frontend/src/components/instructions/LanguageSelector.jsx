/**
 * LanguageSelector — frontend language switcher for mock translations.
 * Supports English, Tamil, and Hindi. Styled for dark mode.
 */
export function LanguageSelector({ language, onLanguageChange }) {
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ta', label: 'Tamil (தமிழ்)' },
    { code: 'hi', label: 'Hindi (हिन्दी)' },
  ]

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="font-medium text-zinc-400">Language:</span>
      <select
        value={language}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="rounded-full border border-white/10 bg-[#28282a] px-3 py-1 text-xs font-medium text-zinc-200 shadow-xs focus:border-white/40 focus:outline-none cursor-pointer"
        aria-label="Select translation language"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-black text-white">
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  )
}