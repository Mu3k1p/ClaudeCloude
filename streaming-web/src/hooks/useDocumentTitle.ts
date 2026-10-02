import { useEffect } from "react";
import { config } from "@/lib/config";

/** Client-side title for pages whose data loads in the browser. */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    if (title) document.title = `${title} · ${config.brandName}`;
  }, [title]);
}
