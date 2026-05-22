"use client";

import { useEffect, useState } from "react";
import { CalendarPlus, Share2, Check } from "lucide-react";
import confetti from "canvas-confetti";

// ICS for the inauguration. DTSTART/DTEND in UTC — 18 June 2026, 10:00 AM IST
// is 04:30 UTC; 1:00 PM IST end is 07:30 UTC.
// LOCATION must escape commas with backslashes per RFC 5545.
const ICS_CONTENT = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "PRODID:-//bare nest//Invite//EN",
  "CALSCALE:GREGORIAN",
  "METHOD:PUBLISH",
  "BEGIN:VEVENT",
  "UID:barenest-inauguration-2026-06-18@barenest",
  "DTSTAMP:20260518T000000Z",
  "DTSTART:20260618T043000Z",
  "DTEND:20260618T073000Z",
  "SUMMARY:Bare Nest Furni Studio — Inauguration",
  "DESCRIPTION:Inauguration of Bare Nest Furni Studio. Solid wood and MDF furniture\\, honestly made\\, in Patna. Founded by Gaurav Bahri.",
  "LOCATION:Ground Floor\\, House No 285\\, Lohiya Path\\, Garbhuchak\\, P.S. Rukanpura\\, Patna\\, Bihar 800014",
  "STATUS:CONFIRMED",
  "END:VEVENT",
  "END:VCALENDAR",
].join("\r\n");

const SHARE_TEXT =
  "You're invited — Bare Nest Furni Studio inauguration. 18 June 2026, 10:00 AM, Patna. Come celebrate with us.";

export default function InviteActions() {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const addToCalendar = () => {
    const blob = new Blob([ICS_CONTENT], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bare-nest-inauguration.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    // Tiny celebratory pop on click.
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.7 },
      colors: ["#c2552b", "#dba65a", "#6b8f5d"],
      scalar: 0.8,
    });
  };

  const share = async () => {
    const url = shareUrl || (typeof window !== "undefined" ? window.location.href : "");
    const payload = { title: "You're invited", text: SHARE_TEXT, url };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch {
        // user cancelled, fall through to other paths
      }
    }

    // WhatsApp deep link fallback (works web + mobile)
    const waText = encodeURIComponent(`${SHARE_TEXT}\n${url}`);
    const waUrl = `https://wa.me/?text=${waText}`;
    const opened = window.open(waUrl, "_blank", "noopener,noreferrer");

    // If popup got blocked, copy to clipboard so the user can paste it themselves.
    if (!opened && navigator.clipboard) {
      await navigator.clipboard.writeText(`${SHARE_TEXT} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-3 md:gap-4">
      <button
        type="button"
        onClick={addToCalendar}
        className="group inline-flex items-center gap-3 rounded-full bg-ink px-6 py-3.5 text-sm text-bone shadow-[0_15px_40px_-18px_rgba(20,17,14,0.55)] transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
      >
        <CalendarPlus className="h-4 w-4" />
        Add to calendar
      </button>

      <button
        type="button"
        onClick={share}
        className="group inline-flex items-center gap-3 rounded-full border border-ink/15 bg-bone/85 px-6 py-3.5 text-sm text-ink shadow-[0_15px_40px_-22px_rgba(20,17,14,0.35)] backdrop-blur transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-leaf" />
            Copied to clipboard
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4" />
            Share invite
          </>
        )}
      </button>
    </div>
  );
}
