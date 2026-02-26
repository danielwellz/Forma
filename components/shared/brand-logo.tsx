import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  withText = false,
  textClassName,
  imageClassName,
  priority = false,
}: {
  className?: string;
  withText?: boolean;
  textClassName?: string;
  imageClassName?: string;
  priority?: boolean;
}) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/32.png"
        alt="گروه طراحی و ساخت فرما"
        width={168}
        height={216}
        priority={priority}
        className={cn("h-11 w-auto object-contain", imageClassName)}
      />
      {withText ? (
        <span className={cn("text-sm font-semibold text-forma-900", textClassName)}>
          گروه طراحی و ساخت فرما
        </span>
      ) : null}
    </div>
  );
}
