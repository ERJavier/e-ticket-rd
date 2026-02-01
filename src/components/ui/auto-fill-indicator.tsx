"use client";

import { Sparkles, X } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
}: AutoFillIndicatorProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const label = sourceLabel ? `from ${sourceLabel}` : "";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {isAutoFilled ? (
        <>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Badge
                variant="secondary"
                className="flex cursor-help items-center gap-1 bg-blue-100 px-2 py-0.5 text-[11px] text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
              >
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                <span>Auto</span>
              </Badge>
            </PopoverTrigger>
            <PopoverContent side="top" className="w-64 p-3">
              <div className="space-y-2">
                <p className="text-sm">
                  This value was automatically filled{" "}
                  {sourceLabel ? (
                    <>
                      from <strong>{sourceLabel}</strong>.
                    </>
                  ) : (
                    "for you."
                  )}
                </p>
                <p className="text-muted-foreground text-xs">
                  Use the × button to override it manually.
                </p>
              </div>
            </PopoverContent>
          </Popover>

          {onClear && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
              onClick={onClear}
              aria-label={`Clear auto-fill ${label}`.trim()}
              title="Clear and enter manually"
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
            title={label ? `Re-apply ${label}` : "Re-apply auto-fill"}
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        )
      )}
    </div>
  );
}
