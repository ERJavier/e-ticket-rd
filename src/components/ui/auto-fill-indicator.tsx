"use client";

import * as React from "react";
import { Sparkles, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AutoFillIndicatorProps
  extends React.ComponentPropsWithoutRef<"div"> {
  /** Whether the field is currently auto-filled */
  isAutoFilled: boolean;
  /** Label describing the auto-fill source (e.g., "lead traveler") */
  sourceLabel?: string;
  /** Clears auto-fill status (does not need to clear the value) */
  onClear?: () => void;
  /** Re-applies the auto-fill value */
  onReapply?: () => void;
}

export function AutoFillIndicator({
  isAutoFilled,
  sourceLabel,
  onClear,
  onReapply,
  className,
  ...props
}: AutoFillIndicatorProps) {
  const label = sourceLabel ? `from ${sourceLabel}` : "";

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      aria-live="polite"
      {...props}
    >
      {isAutoFilled ? (
        <>
          <Badge
            variant="secondary"
            className="pointer-events-none gap-1 px-2 py-0.5 text-[11px]"
          >
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            <span>Auto</span>
          </Badge>
          {onClear && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onClear}
              aria-label={`Clear auto-fill ${label}`.trim()}
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          )}
        </>
      ) : (
        onReapply && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onReapply}
            aria-label={`Apply auto-fill ${label}`.trim()}
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        )
      )}
    </div>
  );
}

