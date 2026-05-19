import { getFeaturedProducts } from "@/lib/queries/products";
import FeaturedClient from "./featured-client";

export default async function Featured() {
  const products = await getFeaturedProducts(4);
  return <FeaturedClient products={products} />;
}
