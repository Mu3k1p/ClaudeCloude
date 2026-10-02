import Link from "next/link";
import { Artwork } from "@/components/ui/Artwork";
import type { Person } from "@/lib/types";

export function PersonCard({ person }: { person: Person }) {
  return (
    <Link href={`/person/${encodeURIComponent(person.id)}`} className="group/person block w-full text-center">
      <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-full ring-1 ring-inset ring-line">
        <Artwork src={person.image} alt="" title={person.name.split(" ").map((n) => n[0]).join("")} sizes="160px" imgClassName="grayscale-[35%] transition-[filter,transform] duration-700 group-hover/person:grayscale-0 group-hover/person:scale-105" />
      </div>
      <p className="mt-3 truncate text-[13.5px] font-medium text-ink-soft group-hover/person:text-ink">{person.name}</p>
      <p className="truncate text-[12px] text-ink-faint">{person.character ?? person.role}</p>
    </Link>
  );
}
