import { ContentGrid } from "@/components/content/ContentGrid";
import { CollectionCard } from "@/components/content/CollectionCard";
import { PersonCard } from "@/components/content/PersonCard";
import type { SearchResults as Results } from "@/lib/types";

function Group({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section aria-label={title} className="animate-fade-up">
      <div className="mb-5 flex items-baseline gap-3 border-b border-line pb-3">
        <h2 className="text-[15px] font-medium tracking-tight text-ink">{title}</h2>
        <span className="font-mono text-[11px] text-ink-faint tabular">{String(count).padStart(2, "0")}</span>
      </div>
      {children}
    </section>
  );
}

export function SearchResults({ results }: { results: Results }) {
  const { movies, series, people, collections, other } = results;
  return (
    <div className="space-y-14">
      {movies.length > 0 && (
        <Group title="Films" count={movies.length}>
          <ContentGrid items={movies} variant="poster" />
        </Group>
      )}
      {series.length > 0 && (
        <Group title="Series" count={series.length}>
          <ContentGrid items={series} variant="poster" />
        </Group>
      )}
      {other.length > 0 && (
        <Group title="Documentaries, shorts & more" count={other.length}>
          <ContentGrid items={other} variant="landscape" />
        </Group>
      )}
      {people.length > 0 && (
        <Group title="People" count={people.length}>
          <ul className="grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {people.map((p) => (
              <li key={p.id}>
                <PersonCard person={p} />
              </li>
            ))}
          </ul>
        </Group>
      )}
      {collections.length > 0 && (
        <Group title="Collections" count={collections.length}>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((c) => (
              <li key={c.id}>
                <CollectionCard collection={c} />
              </li>
            ))}
          </ul>
        </Group>
      )}
    </div>
  );
}

