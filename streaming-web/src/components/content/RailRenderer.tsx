import type { CardVariant, Content, Rail } from "@/lib/types";
import { ContentRow } from "./ContentRow";
import { ContentCard } from "./ContentCard";
import { CollectionCard } from "./CollectionCard";
import { EditorialFeature } from "./EditorialFeature";
import { RAIL_WIDTH, variantFor } from "./cardVariants";

/** Pick a rail variant from its items if the backend didn't specify one. */
function dominantVariant(items: Content[]): CardVariant {
  const counts = new Map<CardVariant, number>();
  for (const i of items) counts.set(variantFor(i.kind), (counts.get(variantFor(i.kind)) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "poster";
}

export function ContentRail({
  title,
  subtitle,
  href,
  items,
  variant,
  ranked,
  showProgress,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  items: Content[];
  variant?: CardVariant;
  ranked?: boolean;
  showProgress?: boolean;
}) {
  const v = variant ?? dominantVariant(items);
  return (
    <ContentRow
      title={title}
      subtitle={subtitle}
      href={href}
      items={items}
      getKey={(c) => c.id}
      itemClassName={RAIL_WIDTH[v]}
      renderItem={(c, i) => <ContentCard item={c} variant={v} rank={ranked ? i + 1 : undefined} showProgress={showProgress} />}
    />
  );
}

/** Renders a backend-defined rail with the right treatment for its type. */
export function RailRenderer({ rail }: { rail: Rail }) {
  switch (rail.type) {
    case "editorial": {
      const c = rail.collections?.[0];
      if (!c) return <ContentRail title={rail.title} items={rail.items} variant={rail.variant} />;
      return <EditorialFeature collection={c} items={rail.items} />;
    }
    case "collections":
      if (!rail.collections?.length) return null;
      return (
        <ContentRow
          title={rail.title}
          subtitle={rail.subtitle}
          href={rail.href}
          items={rail.collections}
          getKey={(c) => c.id}
          itemClassName="w-[78vw] sm:w-[46vw] md:w-[36vw] lg:w-[28vw] 2xl:w-[23vw]"
          renderItem={(c) => <CollectionCard collection={c} />}
        />
      );
    case "ranked":
      return <ContentRail title={rail.title} subtitle={rail.subtitle} href={rail.href} items={rail.items} variant={rail.variant ?? "poster"} ranked />;
    case "continue":
      return <ContentRail title={rail.title} items={rail.items} variant="landscape" showProgress />;
    default:
      return <ContentRail title={rail.title} subtitle={rail.subtitle} href={rail.href} items={rail.items} variant={rail.variant} />;
  }
}
