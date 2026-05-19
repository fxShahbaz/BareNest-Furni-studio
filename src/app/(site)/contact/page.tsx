import type { Metadata } from "next";
import { SHOWROOM } from "@/lib/utils";
import ContactClient from "./contact-client";
import FaqJsonLd from "@/components/seo/faq-json-ld";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "WhatsApp the studio, email us, or book a showroom visit. Bare Nest Furni Studio · Patna. Replies within a couple of hours during studio hours.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact BareNest — Patna Studio",
    description:
      "Reach the studio on WhatsApp, email, or book a showroom visit.",
    url: "/contact",
    type: "website",
  },
};

const FAQ = [
  {
    q: "How fast do you reply?",
    a: "WhatsApp is fastest — typically within a couple of hours during the day (10:00–20:00 IST). Emails get answered the same day, often within an hour.",
  },
  {
    q: "Can I see and feel the materials before ordering?",
    a: "Yes. From 18 June 2026 you can walk into the showroom in Patna. Before that, we'll WhatsApp a short video of the exact piece or send a small finish sample on request.",
  },
  {
    q: "Do you deliver across India?",
    a: "Yes — pan-India delivery via insured carriers for solid wood and MDF pieces. Lead time depends on the item; we'll confirm a date before you pay.",
  },
  {
    q: "What about custom dimensions or finishes?",
    a: "We work on custom dimensions and finishes for most catalogue pieces. Drop us a message with rough sizes, the room context, and your finish preference and we'll come back with a quote.",
  },
  {
    q: "Trade pricing for architects and designers?",
    a: "Yes. Email us with your practice name and we'll send across our trade rate card and our turnaround for project orders.",
  },
];

export default function ContactPage() {
  return (
    <>
      <FaqJsonLd items={FAQ} />
      <ContactClient
        whatsappE164={SHOWROOM.whatsappE164}
        email={SHOWROOM.email}
        studio={SHOWROOM.studio}
        city={SHOWROOM.city}
        founder={SHOWROOM.founder}
        faq={FAQ}
      />
    </>
  );
}
