import { CollectionView } from "./CollectionView";

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CollectionView slug={decodeURIComponent(slug)} />;
}
