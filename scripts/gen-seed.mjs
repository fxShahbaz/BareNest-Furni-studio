import { PRODUCTS } from '../src/lib/products.ts';

function lit(s) {
  if (s === null || s === undefined) return 'NULL';
  return "'" + String(s).replaceAll("'", "''") + "'";
}
function arr(a) {
  if (!a || a.length === 0) return "'{}'";
  return "ARRAY[" + a.map((x) => "'" + String(x).replaceAll("'", "''") + "'").join(",") + "]";
}

const lines = [];
lines.push('-- Idempotent bootstrap. Only inserts slugs that:');
lines.push('--   1. do not already exist in public.products (ON CONFLICT DO NOTHING)');
lines.push('--   2. are not tombstoned in public.deleted_product_slugs');
lines.push('-- Never overwrites admin edits. Never resurrects deleted products.');
lines.push('-- Generated from src/lib/products.ts on ' + new Date().toISOString().slice(0, 10));
lines.push('');
lines.push('with seed (slug, name, tagline, description, category, material, price, dimensions, features, images) as (');
lines.push('  values');
const rows = PRODUCTS.map((p) =>
  `    (${lit(p.slug)}, ${lit(p.name)}, ${lit(p.tagline)}, ${lit(p.description)}, ${lit(p.category)}, ${lit(p.material)}, ${p.price}, ${lit(p.dimensions)}, ${arr(p.features)}, ${arr(p.images)})`
);
lines.push(rows.join(',\n'));
lines.push(')');
lines.push('insert into public.products');
lines.push('  (slug, name, tagline, description, category, material, price, dimensions, features, images)');
lines.push('select s.slug, s.name, s.tagline, s.description, s.category, s.material, s.price, s.dimensions, s.features, s.images');
lines.push('from seed s');
lines.push('where not exists (');
lines.push('  select 1 from public.deleted_product_slugs t where t.slug = s.slug');
lines.push(')');
lines.push('on conflict (slug) do nothing;');

console.log(lines.join('\n'));
