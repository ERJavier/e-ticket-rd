import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ApplicationData } from "@/lib/schemas/forms";
import type { AppFormApi } from "@/lib/types/form-api";
import { useStore } from "@/components/ui/tanstack-form";

interface UseSmartNationalityOptions {
  form: AppFormApi;
  travelerIndex: number;
  groupNature: string | undefined;
}

interface UseSmartNationalityResult {
  /** The nationality of the lead traveler (if available) */
  leadNationality: string | null;
  /** Whether the current nationality was auto-filled from lead */
  isAutoFilled: boolean;
  /** Whether this traveler can inherit nationality (is companion with lead data available) */
  canInherit: boolean;
  /** The suggested nationality value */
  suggestedNationality: string | null;
  /** Apply the inherited nationality to the current traveler */
  applyInheritance: () => void;
  /** Clear the auto-filled status (marks as manually overridden) */
  clearInheritance: () => void;
  /** Check if user has manually overridden the auto-filled value */
  hasManualOverride: boolean;
}

/**
 * Hook for managing nationality inheritance in group travel scenarios.
 *
 * Features:
 * - Automatically detects lead traveler nationality
 * - Auto-fills companion nationalities when appropriate
 * - Tracks manual overrides (if user changes auto-filled value)
 * - Respects user manual changes when lead traveler updates
 *
 * @example
 * const {
 *   isAutoFilled,
 *   canInherit,
 *   clearInheritance,
 * } = useSmartNationality({ form, travelerIndex: 1, groupNature: "Family" });
 */
export function useSmartNationality({
  form,
  travelerIndex,
  groupNature,
}: UseSmartNationalityOptions): UseSmartNationalityResult {
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [hasManualOverride, setHasManualOverride] = useState(false);
  const previousLeadNationalityRef = useRef<string | null>(null);
  const lastAutoFilledValueRef = useRef<string | null>(null);

  const normalizedGroupNature = useMemo(
    () => (typeof groupNature === "string" ? groupNature.trim() : ""),
    [groupNature]
  );

  // Get lead traveler nationality
  const leadNationality = useStore(form.store, (state: unknown) => {
    const values = (state as { values: ApplicationData }).values;
    const leadTraveler = values.travelers?.[0];
    const nationality = leadTraveler?.personalInfo?.passport?.nationality;
    return typeof nationality === "string" && nationality.trim()
      ? nationality
      : null;
  });

  // Get current traveler nationality
  const currentNationality = useStore(form.store, (state: unknown) => {
    const values = (state as { values: ApplicationData }).values;
    const safeIndex =
      Number.isInteger(travelerIndex) && travelerIndex >= 0 ? travelerIndex : 0;
    // eslint-disable-next-line security/detect-object-injection
    const currentTraveler = values.travelers?.[safeIndex];
    const nationality = currentTraveler?.personalInfo?.passport?.nationality;
    return typeof nationality === "string" && nationality.trim()
      ? nationality
      : null;
  });

  // Determine if this traveler can inherit
  const canInherit =
    travelerIndex > 0 && // Must be a companion (not lead)
    (normalizedGroupNature === "Family" || normalizedGroupNature === "Partner") && // Only for supported group types
    (normalizedGroupNature === "Family" || normalizedGroupNature === "Partner") && // Only for supported group types
    !!leadNationality; // Lead must have nationality set

  // Check if lead nationality changed
  const hasLeadNationalityChanged =
    previousLeadNationalityRef.current !== null &&
    previousLeadNationalityRef.current !== leadNationality;

  // Apply inheritance
  const applyInheritance = useCallback(() => {
    if (!canInherit || !leadNationality) return;

    const fieldName = `travelers[${travelerIndex}].personalInfo.passport.nationality`;
    form.setFieldValue(fieldName, leadNationality);
    setIsAutoFilled(true);
    setHasManualOverride(false);
    lastAutoFilledValueRef.current = leadNationality;
  }, [canInherit, leadNationality, form, travelerIndex]);

  // Clear inheritance (user wants to enter manually)
  const clearInheritance = useCallback(() => {
    setIsAutoFilled(false);
    setHasManualOverride(true);
    // We don't clear the value, just the auto-fill status
    // This allows user to keep the value if they want, or change it
  }, []);

  // Auto-apply on initial mount or when lead nationality becomes available
  useEffect(() => {
    // Only auto-apply if:
    // 1. Can inherit
    // 2. Lead has nationality
    // 3. Current is empty
    // 4. Haven't manually overridden
    if (
      canInherit &&
      leadNationality &&
      !currentNationality &&
      !hasManualOverride &&
      !isAutoFilled
    ) {
      applyInheritance();
    }
  }, [
    canInherit,
    leadNationality,
    currentNationality,
    hasManualOverride,
    isAutoFilled,
    applyInheritance,
  ]);

  // Handle lead nationality changes (respect manual overrides)
  useEffect(() => {
    if (
      hasLeadNationalityChanged &&
      canInherit &&
      leadNationality &&
      !hasManualOverride
    ) {
      // Check if current value matches what we last auto-filled
      // If user changed it manually to something else, don't overwrite
      const wasManuallyChanged =
        currentNationality !== null &&
        currentNationality !== lastAutoFilledValueRef.current;

      if (!wasManuallyChanged) {
        applyInheritance();
      } else {
        // User changed it - mark as manual override to prevent future auto-updates
        setHasManualOverride(true);
        setIsAutoFilled(false);
      }
    }

    // Update ref for next comparison
    previousLeadNationalityRef.current = leadNationality;
  }, [
    leadNationality,
    hasLeadNationalityChanged,
    canInherit,
    hasManualOverride,
    currentNationality,
    applyInheritance,
  ]);

  // Detect manual changes (user modifies auto-filled value)
  useEffect(() => {
    if (
      isAutoFilled &&
      currentNationality !== null &&
      currentNationality !== lastAutoFilledValueRef.current
    ) {
      // User changed the value - mark as manual override
      setHasManualOverride(true);
      setIsAutoFilled(false);
    }
  }, [currentNationality, isAutoFilled]);

  return {
    leadNationality,
    isAutoFilled,
    canInherit,
    suggestedNationality: canInherit ? leadNationality : null,
    applyInheritance,
    clearInheritance,
    hasManualOverride,
  };
}
