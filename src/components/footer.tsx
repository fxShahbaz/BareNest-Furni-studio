import Link from "next/link";
import Image from "next/image";
import NewsletterForm from "./newsletter-form";

function Instagram({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

function Youtube({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M21.6 7.2c-.2-1.1-1-2-2.1-2.2C17.4 4.6 12 4.6 12 4.6s-5.4 0-7.5.4c-1.1.2-1.9 1.1-2.1 2.2C2 9.3 2 12 2 12s0 2.7.4 4.8c.2 1.1 1 2 2.1 2.2 2.1.4 7.5.4 7.5.4s5.4 0 7.5-.4c1.1-.2 1.9-1.1 2.1-2.2.4-2.1.4-4.8.4-4.8s0-2.7-.4-4.8zM10 15.5v-7l6 3.5-6 3.5z" />
    </svg>
  );
}
import { SHOWROOM } from "@/lib/utils";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-bark text-bone">
      <div className="pointer-events-none absolute -bottom-32 left-1/2 -translate-x-1/2 select-none text-center">
        <h2 className="font-display text-[24vw] leading-none tracking-tight text-bone/[0.06]">
          BareNest
        </h2>
      </div>

      <div className="relative mx-auto max-w-[1400px] px-6 pb-16 pt-24 md:px-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="mb-8 inline-block overflow-hidden rounded-2xl bg-bone ring-1 ring-bone/20 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)]">
              <Image
                src="/logo.png"
                alt="BareNest"
                width={132}
                height={112}
                className="block h-20 w-auto md:h-24"
              />
            </div>
            <p className="eyebrow text-bone/60">Be the first inside</p>
            <h3 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
              Doors open <span className="serif-italic">18 June 2026</span>
            </h3>
            <p className="mt-4 max-w-md text-sm text-bone/70">
              An invitation to the inauguration of {SHOWROOM.studio}. Solid
              wood, honest MDF, and a refusal to stock particle board.
            </p>
            <NewsletterForm />
          </div>

          <div className="md:col-span-2">
            <p className="eyebrow text-bone/60">Shop</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/shop?cat=beds">Beds</Link>
              </li>
              <li>
                <Link href="/shop?cat=wardrobes">Wardrobes</Link>
              </li>
              <li>
                <Link href="/shop?cat=sofas">Sofas</Link>
              </li>
              <li>
                <Link href="/shop?cat=dining">Dining</Link>
              </li>
              <li>
                <Link href="/shop?cat=office">Office</Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="eyebrow text-bone/60">Studio</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/story">Our story</Link>
              </li>
              <li>
                <Link href="/showroom">Showroom</Link>
              </li>
              <li>
                <Link href="/materials">Materials</Link>
              </li>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="eyebrow text-bone/60">Visit</p>
            <p className="mt-4 text-sm leading-relaxed text-bone/80">
              {SHOWROOM.studio}
              <br />
              {SHOWROOM.address.lines.map((line, i) => (
                <span key={line}>
                  {line}
                  {i < SHOWROOM.address.lines.length - 1 && <br />}
                </span>
              ))}
              <br />
              <a
                href={`tel:+${SHOWROOM.whatsappE164}`}
                className="underline-offset-4 hover:underline"
              >
                +91 9031 4287 28
              </a>
              <br />
              <a
                href={`mailto:${SHOWROOM.email}`}
                className="underline-offset-4 hover:underline"
              >
                {SHOWROOM.email}
              </a>
            </p>
            <div className="mt-6 flex gap-3">
              <a
                href={SHOWROOM.socials.instagram}
                aria-label="Instagram"
                className="grid h-9 w-9 place-items-center rounded-full border border-bone/20 hover:bg-bone/10"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={SHOWROOM.socials.youtube}
                aria-label="YouTube"
                className="grid h-9 w-9 place-items-center rounded-full border border-bone/20 hover:bg-bone/10"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col items-start justify-between gap-4 border-t border-bone/10 pt-6 text-xs text-bone/50 md:flex-row md:items-center">
          <span>
            © {new Date().getFullYear()} {SHOWROOM.brand} — Founded by{" "}
            {SHOWROOM.founder}
          </span>
          <span>Honest furniture. No particle board, ever.</span>
        </div>
      </div>
    </footer>
  );
}
