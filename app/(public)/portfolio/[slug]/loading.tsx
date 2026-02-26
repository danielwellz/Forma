import { Container } from "@/components/shared/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectLoading() {
  return (
    <Container className="py-10">
      <Skeleton className="h-10 w-72" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="aspect-[4/3] w-full" />
        ))}
      </div>
    </Container>
  );
}
