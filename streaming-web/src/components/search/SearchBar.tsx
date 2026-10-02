"use client";

import { forwardRef } from "react";
import { LoaderCircle, Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  loading?: boolean;
  placeholder?: string;
}

/** Large editorial search field. */
export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar(
  { value, onChange, onSubmit, loading, placeholder = "Titles, people, places, moods" },
  ref,
) {
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className="group relative border-b border-line-strong transition-colors duration-500 focus-within:border-accent/70"
    >
      <label htmlFor="search-input" className="sr-only">
        Search
      </label>
      <Search aria-hidden className="pointer-events-none absolute left-0 top-1/2 size-6 -translate-y-1/2 text-ink-faint transition-colors group-focus-within:text-accent md:size-8" strokeWidth={1.25} />
      <input
        ref={ref}
        id="search-input"
        type="search"
        inputMode="search"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-16 w-full bg-transparent pl-10 pr-12 text-[clamp(1.4rem,3.6vw,2.75rem)] font-medium tracking-[-0.03em] text-ink placeholder:text-ink-faint/70 focus:outline-none md:h-24 md:pl-14 [&::-webkit-search-cancel-button]:hidden"
      />
      <div className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-1">
        {loading && <LoaderCircle aria-label="Searching" className="size-5 animate-spin text-ink-faint" strokeWidth={1.5} />}
        {value && !loading && (
          <button type="button" onClick={() => onChange("")} aria-label="Clear search" className="rounded-full p-2 text-ink-muted hover:bg-ink/[0.06] hover:text-ink">
            <X className="size-5" strokeWidth={1.5} />
          </button>
        )}
      </div>
    </form>
  );
});
