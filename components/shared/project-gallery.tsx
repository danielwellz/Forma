"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GalleryMedia = {
  type: "IMAGE" | "VIDEO";
  url: string;
  altFa: string;
};

function GalleryItem({ item, priority = false }: { item: GalleryMedia; priority?: boolean }) {
  if (item.type === "VIDEO") {
    return (
      <video
        src={item.url}
        controls
        preload="metadata"
        className="h-full w-full object-cover"
        playsInline
      />
    );
  }

  return (
    <Image
      src={item.url}
      alt={item.altFa}
      fill
      priority={priority}
      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
      className="object-cover"
    />
  );
}

export function ProjectGallery({ media }: { media: GalleryMedia[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const direction = useMemo(() => {
    if (typeof document === "undefined") {
      return "rtl";
    }

    return document.documentElement.dir === "rtl" ? "rtl" : "ltr";
  }, []);

  useEffect(() => {
    if (openIndex === null) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenIndex(null);
        return;
      }

      if (event.key === "ArrowRight") {
        setOpenIndex((prev) => {
          if (prev === null) {
            return prev;
          }
          const delta = direction === "rtl" ? -1 : 1;
          return (prev + media.length + delta) % media.length;
        });
      }

      if (event.key === "ArrowLeft") {
        setOpenIndex((prev) => {
          if (prev === null) {
            return prev;
          }
          const delta = direction === "rtl" ? 1 : -1;
          return (prev + media.length + delta) % media.length;
        });
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [direction, media.length, openIndex]);

  const activeItem = openIndex !== null ? media[openIndex] : null;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {media.map((item, index) => (
          <button
            key={`${item.url}-${index}`}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-stone-200 bg-stone-200 text-start transition hover:shadow-md"
          >
            <GalleryItem item={item} priority={index < 2} />
            {item.type === "VIDEO" ? (
              <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white">ویدئو</span>
            ) : null}
          </button>
        ))}
      </div>

      {activeItem ? (
        <div className="fixed inset-0 z-[80] bg-black/80 p-4" role="dialog" aria-modal="true">
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col">
            <div className="mb-3 flex items-center justify-between text-white">
              <p className="text-sm">{activeItem.altFa}</p>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={() => setOpenIndex(null)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="relative flex-1 overflow-hidden rounded-2xl bg-black/30">
              {activeItem.type === "VIDEO" ? (
                <video src={activeItem.url} controls autoPlay className="h-full w-full object-contain" playsInline />
              ) : (
                <Image
                  src={activeItem.url}
                  alt={activeItem.altFa}
                  fill
                  priority
                  sizes="100vw"
                  className="object-contain"
                />
              )}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <Button
                variant="outline"
                className="border-white/40 bg-black/30 text-white hover:bg-white/10"
                onClick={() =>
                  setOpenIndex((prev) => {
                    if (prev === null) {
                      return prev;
                    }
                    return (prev + media.length - 1) % media.length;
                  })
                }
              >
                <ChevronRight className={cn("h-4 w-4", direction === "rtl" ? "rtl-flip" : "")} />
                قبلی
              </Button>
              <p className="text-xs text-white">
                {(openIndex ?? 0) + 1} / {media.length}
              </p>
              <Button
                variant="outline"
                className="border-white/40 bg-black/30 text-white hover:bg-white/10"
                onClick={() =>
                  setOpenIndex((prev) => {
                    if (prev === null) {
                      return prev;
                    }
                    return (prev + 1) % media.length;
                  })
                }
              >
                بعدی
                <ChevronLeft className={cn("h-4 w-4", direction === "rtl" ? "rtl-flip" : "")} />
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
