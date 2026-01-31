"use client";

import { Smartphone, Wallet, Loader2, AlertCircle } from "lucide-react";
import { useState, useCallback } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import type { ApplicationData } from "@/lib/schemas/forms";

interface WalletButtonsProps {
  submittedData: ApplicationData;
  applicationCode: string;
}

export function WalletButtons({
  submittedData,
  applicationCode,
}: WalletButtonsProps) {
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [appleError, setAppleError] = useState<string | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleSaveUrl, setGoogleSaveUrl] = useState<string | null>(null);
  const [isGoogleDialogOpen, setIsGoogleDialogOpen] = useState(false);

  const handleAppleWallet = useCallback(async () => {
    setIsAppleLoading(true);
    setAppleError(null);

    try {
      const response = await fetch("/api/wallet/apple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submittedData,
          applicationCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 503) {
          throw new Error(
            errorData.message ||
              "Apple Wallet is not configured. Please contact support."
          );
        }
        throw new Error(
          errorData.error || "Failed to generate Apple Wallet pass"
        );
      }

      // Download the .pkpass file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `eticket-${applicationCode}.pkpass`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setAppleError(
        error instanceof Error ? error.message : "Failed to add to Apple Wallet"
      );
    } finally {
      setIsAppleLoading(false);
    }
  }, [submittedData, applicationCode]);

  const handleGoogleWallet = useCallback(async () => {
    setIsGoogleLoading(true);
    setGoogleError(null);
    setGoogleSaveUrl(null);

    try {
      const response = await fetch("/api/wallet/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          submittedData,
          applicationCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 503) {
          throw new Error(
            errorData.message ||
              "Google Wallet is not configured. Please contact support."
          );
        }
        throw new Error(
          errorData.error || "Failed to generate Google Wallet pass"
        );
      }

      const data = await response.json();
      if (data.saveUrl) {
        setGoogleSaveUrl(data.saveUrl);
        setIsGoogleDialogOpen(true);
      } else {
        throw new Error("No save URL received");
      }
    } catch (error) {
      setGoogleError(
        error instanceof Error
          ? error.message
          : "Failed to add to Google Wallet"
      );
    } finally {
      setIsGoogleLoading(false);
    }
  }, [submittedData, applicationCode]);

  const openGoogleWallet = useCallback(() => {
    if (googleSaveUrl) {
      window.open(googleSaveUrl, "_blank");
      setIsGoogleDialogOpen(false);
    }
  }, [googleSaveUrl]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
      {/* Apple Wallet Button */}
      <Button
        size="lg"
        variant="outline"
        className="w-full bg-black text-white hover:bg-gray-800 sm:w-auto"
        onClick={handleAppleWallet}
        disabled={isAppleLoading}
      >
        {isAppleLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Smartphone className="mr-2 h-4 w-4" />
        )}
        Add to Apple Wallet
      </Button>

      {/* Google Wallet Dialog */}
      <Dialog open={isGoogleDialogOpen} onOpenChange={setIsGoogleDialogOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            variant="outline"
            className="w-full bg-white text-gray-900 hover:bg-gray-100 sm:w-auto"
            onClick={handleGoogleWallet}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wallet className="mr-2 h-4 w-4" />
            )}
            Add to Google Wallet
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Add to Google Wallet
            </DialogTitle>
            <DialogDescription>
              Your e-ticket will be saved to Google Wallet for easy access
              during travel.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-600">
                <strong>Application Code:</strong> {applicationCode}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Traveler:</strong>{" "}
                {submittedData.travelers[0]?.personalInfo.firstName}{" "}
                {submittedData.travelers[0]?.personalInfo.lastName}
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={openGoogleWallet} className="flex-1">
                Open Google Wallet
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsGoogleDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Alerts */}
      {appleError && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{appleError}</AlertDescription>
        </Alert>
      )}

      {googleError && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{googleError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
