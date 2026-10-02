import { WatchView } from "./WatchView";

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <WatchView id={decodeURIComponent(id)} />;
}
