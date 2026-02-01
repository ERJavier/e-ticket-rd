import { TriangleAlert } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="border-b border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-start gap-3">
          <TriangleAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Demonstration Environment
            </p>
            <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
              This is a <strong>non-production demonstration</strong> of a
              reference implementation for the Dominican Republic E-Ticket
              modernization project. No real traveler data is collected. No
              government systems are connected. All data shown is simulated or
              placeholder. This demo is for evaluation purposes only. This
              application is <strong>not</strong> an official government
              service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
