import { ContentDetails } from "@/components/content/ContentDetails";

export default async function TitlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ContentDetails id={decodeURIComponent(id)} />;
}
