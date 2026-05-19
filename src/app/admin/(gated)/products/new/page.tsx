import ProductForm from "../product-form";
import { getAllCategories } from "@/lib/queries/categories";

export default async function NewProductPage() {
  const categories = await getAllCategories();
  return (
    <div>
      <h2 className="font-display text-2xl">New product</h2>
      <div className="mt-8">
        <ProductForm mode="create" categories={categories} />
      </div>
    </div>
  );
}
