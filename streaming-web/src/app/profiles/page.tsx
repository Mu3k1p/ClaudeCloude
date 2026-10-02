import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfilesView } from "./ProfilesView";

export const metadata: Metadata = { title: "Who's watching" };

export default function ProfilesPage() {
  return (
    <Suspense>
      <ProfilesView />
    </Suspense>
  );
}
