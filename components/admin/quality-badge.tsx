import { cn } from "@/lib/utils";
import { qualityLabel, type SpaQualityScore } from "@/lib/quality-score";

const LEVEL_STYLES = {
  strong: "bg-green-100 text-green-800 border-green-200",
  "needs-work": "bg-yellow-100 text-yellow-800 border-yellow-200",
  incomplete: "bg-red-100 text-red-800 border-red-200",
} as const;

type Props = {
  quality: SpaQualityScore;
  className?: string;
};

/**
 * Compact badge showing the numeric quality score and its level label.
 * Consistent with the site's calm/clean aesthetic.
 */
export function QualityBadge({ quality, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        LEVEL_STYLES[quality.level],
        className
      )}
    >
      <span className="tabular-nums">{quality.score}</span>
      <span aria-hidden>·</span>
      <span>{qualityLabel(quality.level)}</span>
    </span>
  );
}
