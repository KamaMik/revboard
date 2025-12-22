import { builder } from "@builder.io/sdk";

// Initialize Builder with your API Key
builder.init(process.env.BUILDER_PUBLIC_API_KEY!);

export const builderConfig = {
  apiKey: process.env.BUILDER_PUBLIC_API_KEY!,
};
