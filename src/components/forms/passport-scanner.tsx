"use client";

import { Camera, CheckCircle, Loader2, Scan, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileInput } from "@/components/ui/file-input";
import { Progress } from "@/components/ui/progress";
import {
  usePassportOCR,
  type PassportOCRResult,
} from "@/lib/hooks/use-passport-ocr";

import type { AppFormApi } from "@/lib/types/form-api";

interface PassportScannerProps {
  form: AppFormApi;
  fieldPrefix?: string;
  travelerIndex?: number;
  onScanComplete?: (result: PassportOCRResult) => void;
}

/**
 * Passport Scanner Component
 * Allows users to upload a passport image and automatically extract data using OCR
 */
export function PassportScanner({
  form,
  fieldPrefix = "",
  travelerIndex: _travelerIndex,
  onScanComplete,
}: PassportScannerProps) {
  const { result, isProcessing, error, scanPassport, reset } = usePassportOCR();
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [showScanner, setShowScanner] = React.useState(false);

  const fieldName = (name: string) =>
    fieldPrefix ? `${fieldPrefix}.${name}` : name;

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      void scanPassport(file);
    }
  };

  const handleApplyData = () => {
    if (!result || !result.isValid) return;

    // Apply extracted data to form fields
    form.setFieldValue(
      fieldName("personalInfo.passport.number"),
      result.passportNumber
    );
    form.setFieldValue(
      fieldName("personalInfo.passport.confirmNumber"),
      result.passportNumber
    );
    form.setFieldValue(
      fieldName("personalInfo.passport.nationality"),
      result.nationality
    );
    form.setFieldValue(fieldName("personalInfo.birthDate"), result.birthDate);
    form.setFieldValue(
      fieldName("personalInfo.passport.expiryDate"),
      result.expiryDate
    );

    if (result.sex) {
      form.setFieldValue(fieldName("personalInfo.sex"), result.sex);
    }

    if (result.givenNames) {
      // Only auto-fill first name if it's empty
      const currentFirstName = form.getFieldValue(
        fieldName("personalInfo.firstName")
      );
      if (!currentFirstName) {
        form.setFieldValue(
          fieldName("personalInfo.firstName"),
          result.givenNames
        );
      }
    }

    if (result.surname) {
      // Only auto-fill last name if it's empty
      const currentLastName = form.getFieldValue(
        fieldName("personalInfo.lastName")
      );
      if (!currentLastName) {
        form.setFieldValue(fieldName("personalInfo.lastName"), result.surname);
      }
    }

    onScanComplete?.(result);

    // Reset and close scanner
    handleClose();
  };

  const handleClose = () => {
    setShowScanner(false);
    setSelectedFile(null);
    reset();
  };

  const handleRetry = () => {
    setSelectedFile(null);
    reset();
  };

  if (!showScanner) {
    return (
      <Card className="border-primary/50 border-2 border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Scan className="text-primary h-5 w-5" />
            Scan Passport
          </CardTitle>
          <CardDescription>
            Upload a photo of your passport to auto-fill your information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowScanner(true)}
            className="w-full"
          >
            <Camera className="mr-2 h-4 w-4" />
            Scan Passport
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scan className="text-primary h-5 w-5" />
            <CardTitle className="text-base">Scan Passport</CardTitle>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Upload a clear photo of your passport showing the Machine Readable
          Zone (MRZ) at the bottom
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selectedFile && !result && (
          <FileInput
            accept="image/*,.jpg,.jpeg,.png"
            placeholder="Upload passport photo"
            onFileChange={handleFileChange}
            maxSize={10 * 1024 * 1024} // 10MB max
            error={error || undefined}
          />
        )}

        {isProcessing && (
          <div className="space-y-2 py-4">
            <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Scanning passport...</span>
            </div>
            <Progress value={50} className="h-2" />
            <p className="text-muted-foreground text-center text-xs">
              Extracting text from image
            </p>
          </div>
        )}

        {result && result.isValid && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">
                Passport data extracted successfully!
              </span>
            </div>

            <div className="bg-muted/30 space-y-2 rounded-lg border p-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Passport:</span>
                  <p className="font-medium">{result.passportNumber}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Nationality:</span>
                  <p className="font-medium">{result.nationality}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Birth Date:</span>
                  <p className="font-medium">{result.birthDate}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Expiry Date:</span>
                  <p className="font-medium">{result.expiryDate}</p>
                </div>
                {result.sex && (
                  <div>
                    <span className="text-muted-foreground">Sex:</span>
                    <p className="font-medium">{result.sex}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleApplyData}
                className="flex-1"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Apply to Form
              </Button>
              <Button type="button" variant="outline" onClick={handleRetry}>
                Retry
              </Button>
            </div>
          </div>
        )}

        {error && !isProcessing && (
          <div className="space-y-3">
            <div className="border-destructive/50 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm">
              {error}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleRetry}
                className="flex-1"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
