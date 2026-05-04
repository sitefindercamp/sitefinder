import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SiteFinder.Camp",
    short_name: "SiteFinder",
    description:
      "Search RV parks and campgrounds across the US.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f8f1",
    theme_color: "#071916",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "any",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
