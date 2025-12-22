import { builder } from "@builder.io/sdk";
import { RenderBuilderContent } from "@/components/builder";
import { notFound } from "next/navigation";

// Builder Public API Key set in .env.local
builder.init(process.env.BUILDER_PUBLIC_API_KEY!);

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export default async function Page(props: PageProps) {
  const params = await props.params;
  const urlPath = "/" + (params?.slug?.join("/") || "");

  const content = await builder
    .get("page", {
      userAttributes: {
        urlPath: urlPath,
      },
    })
    .toPromise();

  if (!content) {
      // If no content is found in Builder, let Next.js handle 404
      // or show a specific message if you prefer
      notFound();
  }

  return (
    <>
      <RenderBuilderContent apiKey={process.env.BUILDER_PUBLIC_API_KEY!} content={content} model="page" />
    </>
  );
}
