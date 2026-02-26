import * as React from "react";
import { cn } from "@/lib/utils";

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm focus-visible:border-forma-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forma-300",
        className,
      )}
      {...props}
    />
  );
}
