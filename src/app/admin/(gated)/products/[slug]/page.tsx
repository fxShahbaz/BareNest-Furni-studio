import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/queries/products";
import { getAllCategories } from "@/lib/queries/categories";
import ProductForm from "../product-form";
import { deleteProduct } from "../../actions";

type Params = Promise<{ slug: string }>;

export default async function EditProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [product, categories] = await Promise.all([
    getProductBySlug(slug),
    getAllCategories(),
  ]);
  if (!product) notFound();

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl">{product.name}</h2>
        <form action={deleteProduct}>
          <input type="hidden" name="slug" value={product.slug} />
          <button
            type="submit"
            className="rounded-full border border-rust/40 px-3 py-1.5 text-xs text-rust hover:bg-rust/10"
          >
            Delete
          </button>
        </form>
      </div>
      <div className="mt-8">
        <ProductForm mode="edit" initial={product} categories={categories} />
      </div>
    </div>
  );
}
