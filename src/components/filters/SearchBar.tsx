import { CloseIcon, SearchIcon } from '../ui/icons';

export function SearchBar({ value, onChange, placeholder = 'Search pieces' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="relative flex min-w-0 flex-1 items-center">
      <SearchIcon size={18} className="pointer-events-none absolute left-3 text-muted" />
      <input
        type="search"
        enterKeyHint="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-full border border-line bg-card pr-9 pl-9 text-[15px] outline-none placeholder:text-muted/80 focus:border-ink [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button type="button" onClick={() => onChange('')} className="tap absolute right-2 rounded-full p-1 text-muted" aria-label="Clear search">
          <CloseIcon size={18} />
        </button>
      )}
    </label>
  );
}
