"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ADMIN_HEADER_ACTIONS_ID } from "./page-header";

export default function AdminHeaderActions({
  children,
}: {
  children: React.ReactNode;
}) {
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setTarget(document.getElementById(ADMIN_HEADER_ACTIONS_ID));
  }, []);

  if (!target) return null;
  return createPortal(children, target);
}
