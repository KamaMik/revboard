"use client";
import { ComponentProps } from "react";
import { Content } from "@builder.io/sdk-react";
import { builderConfig } from "@/lib/builder";

type RenderBuilderContentProps = ComponentProps<typeof Content>;

export function RenderBuilderContent(props: RenderBuilderContentProps) {
  // Call the imported Content component from the SDK
  return <Content {...props} apiKey={builderConfig.apiKey} />;
}
