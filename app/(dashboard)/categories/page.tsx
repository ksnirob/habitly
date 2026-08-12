import { CategoryForm } from "@/components/forms/category-form";
import { ColorSwatch } from "@/components/forms/visual-pickers";
import { IconBadge } from "@/components/habits/icon-badge";
import { Card, CardContent } from "@/components/ui/card";
import { DatabaseSetup } from "@/components/dashboard/database-setup";
import { getCategories } from "@/lib/queries/habits";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories().catch(() => null);
  if (!categories) return <DatabaseSetup />;
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-muted-foreground">Organize</p>
        <h1 className="text-3xl font-semibold">Categories</h1>
      </header>
      <CategoryForm />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardContent className="flex min-h-20 items-center gap-3 p-4">
              <IconBadge name={category.icon} />
              <div className="min-w-0">
                <div className="truncate font-medium">{category.name}</div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ColorSwatch value={category.color} />
                  {category.color ?? "slate"}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
