import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function LegacySpaDetailPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/campgrounds/${slug}`);
}
