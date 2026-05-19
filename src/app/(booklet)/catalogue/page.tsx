import { getAllProducts } from "@/lib/queries/products";
import Booklet from "@/components/booklet";

export const metadata = {
  title: "The Catalogue — BareNest",
  description:
    "Volume 01 — the printed catalogue, page by page. Solid wood and honest MDF, made in Patna.",
};

export default async function CataloguePage() {
  const products = await getAllProducts();
  return <Booklet products={products} />;
}
