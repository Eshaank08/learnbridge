import { Resource, ResourceType } from "@/lib/types";

// Per-variant configuration: icon glyph and Tailwind accent classes.
const VARIANT_CONFIG: Record<
  ResourceType,
  { icon: string; borderClass: string; iconClass: string; pillClass: string }
> = {
  video: {
    icon: "▶",
    borderClass: "border-red-700 hover:border-red-500",
    iconClass: "text-red-400",
    pillClass: "bg-red-900/60 text-red-300",
  },
  book: {
    icon: "📖",
    borderClass: "border-sky-700 hover:border-sky-500",
    iconClass: "text-sky-400",
    pillClass: "bg-sky-900/60 text-sky-300",
  },
  article: {
    icon: "📄",
    borderClass: "border-violet-700 hover:border-violet-500",
    iconClass: "text-violet-400",
    pillClass: "bg-violet-900/60 text-violet-300",
  },
};

export function ResourceCard({ resource }: { resource: Resource }) {
  const { icon, borderClass, iconClass, pillClass } =
    VARIANT_CONFIG[resource.type];

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        "flex items-start gap-3 rounded-lg border bg-slate-800/60 p-3",
        "transition-colors duration-150 hover:bg-slate-700/60",
        borderClass,
      ].join(" ")}
    >
      {/* Type icon */}
      <span
        className={["mt-0.5 flex-shrink-0 text-lg leading-none", iconClass].join(
          " "
        )}
        aria-hidden="true"
      >
        {icon}
      </span>

      {/* Main text block */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-slate-100">
          {resource.title}
        </p>

        {/* Source byline — conditional */}
        {resource.source && (
          <p className="mt-0.5 text-xs text-slate-400">{resource.source}</p>
        )}
      </div>

      {/* Duration pill — conditional */}
      {resource.duration && (
        <span
          className={[
            "flex-shrink-0 self-center rounded px-1.5 py-0.5 text-xs font-medium",
            pillClass,
          ].join(" ")}
        >
          {resource.duration}
        </span>
      )}
    </a>
  );
}
