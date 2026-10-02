import { Compass, House, Layers, Library, Search, User } from "lucide-react";

export const PRIMARY_NAV = [
  { href: "/", label: "Home", icon: House },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/library", label: "Library", icon: Library },
  { href: "/collections", label: "Collections", icon: Layers },
] as const;

export const MOBILE_NAV = [
  { href: "/", label: "Home", icon: House },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/search", label: "Search", icon: Search },
  { href: "/library", label: "Library", icon: Library },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));
