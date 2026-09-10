import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/constants/app";

export function HomePage() {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{APP_NAME}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Frontend foundation is ready. Authentication, reports, reviews, and
          dashboard features will be implemented in upcoming milestones.
        </p>
      </div>
      <Button type="button" variant="outline">
        Application shell
      </Button>
    </section>
  );
}
