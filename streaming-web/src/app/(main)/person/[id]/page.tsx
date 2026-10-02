import { PersonView } from "./PersonView";

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PersonView id={decodeURIComponent(id)} />;
}
