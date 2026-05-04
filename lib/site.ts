import type { Route } from "next";

type NavItem = {
  href: Route;
  label: string;
};

export const siteConfig = {
  name: "SiteFinder.Camp",
  description:
    "A searchable RV park and campground database for finding better places to stay across the US.",
  url: "https://sitefinder.camp",
  mainNav: [
    { href: "/", label: "Home" },
    { href: "/spas", label: "Search" },
    { href: "/blog", label: "Blog" },
    { href: "/guides", label: "Guides" },
  ] satisfies NavItem[],
};
