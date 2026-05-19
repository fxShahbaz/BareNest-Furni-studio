"use client";

import { useEffect } from "react";
import { markRecent } from "@/lib/cache/idb";

// Stamps the current product as "recently viewed" in IndexedDB on mount.
// Fail-soft: if IDB is unavailable (private browsing in some browsers,
// etc.), markRecent is a no-op. Adds ~1ms of work; renders nothing.
export default function TrackRecentProduct(props: {
  slug: string;
  name: string;
  price: number;
  image: string;
  material: string;
}) {
  useEffect(() => {
    markRecent(props);
  }, [props.slug, props.name, props.price, props.image, props.material]);
  return null;
}
