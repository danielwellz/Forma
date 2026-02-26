import { RequestStatus } from "@prisma/client";
import { requestStatusLabelsFa, statusFlow } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function RequestStatusTimeline({ status }: { status: RequestStatus }) {
  const currentIndex = statusFlow.indexOf(status);

  return (
    <ol className="grid gap-3 md:grid-cols-4">
      {statusFlow.map((step, index) => {
        const isDone = index <= currentIndex;
        const isActive = step === status;

        return (
          <li
            key={step}
            className={cn(
              "rounded-xl border px-3 py-2 text-xs transition",
              isDone ? "border-forma-200 bg-forma-50 text-forma-900" : "border-stone-200 bg-white text-stone-500",
              isActive ? "ring-1 ring-forma-400" : "",
            )}
          >
            <p className="font-semibold">{requestStatusLabelsFa[step]}</p>
            <p className="mt-1 text-[11px]">مرحله {index + 1}</p>
          </li>
        );
      })}
    </ol>
  );
}
