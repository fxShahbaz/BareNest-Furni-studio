// A tiny helper that renders a JSON-LD <script> tag with stable
// serialization. Accepts an opaque object — JSON.stringify drops any
// `undefined` values for us so optional schema fields are fine.

export default function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        // Escape any embedded "<" so a stray HTML tag in a string field
        // can't end the <script>.
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
