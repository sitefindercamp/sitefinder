import type { Route } from "next";

type NavItem = {
  href: Route;
  label: string;
};

export const siteConfig = {
  name: "SiteFinder.Camp",
  description:
    "A searchable RV park and campground database for finding better places to stay across the US.",
  url: "https://project-36ehq.vercel.app",
  mainNav: [
    { href: "/", label: "Home" },
    { href: "/campgrounds", label: "Search" },
    { href: "/blog", label: "Blog" },
    { href: "/guides", label: "Guides" },
  ] satisfies NavItem[],
};
