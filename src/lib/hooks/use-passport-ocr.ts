"use client";

import { useState, useCallback } from "react";
import { createWorker, PSM } from "tesseract.js";

export interface PassportOCRResult {
  passportNumber: string;
  nationality: string;
  birthDate: string; // YYYY-MM-DD format
  expiryDate: string; // YYYY-MM-DD format
  sex: "MALE" | "FEMALE" | "";
  givenNames: string;
  surname: string;
  isValid: boolean;
  confidence: number;
}

interface UsePassportOCRReturn {
  result: PassportOCRResult | null;
  isProcessing: boolean;
  error: string | null;
  progress: number;
  scanPassport: (imageFile: File) => Promise<void>;
  reset: () => void;
}

/**
 * Parse MRZ (Machine Readable Zone) from passport OCR text
 * MRZ format for passports (TD3 - 2 lines of 44 characters):
 * Line 1: P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<
 * Line 2: L898902C36UTO7408122F1204159ZE184226B<<<<<10
 */
function parseMRZ(mrzText: string): PassportOCRResult | null {
  // Clean up the text - remove extra spaces and normalize line breaks
  const cleanText = mrzText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();

  // Split into lines and filter out empty lines
  const lines = cleanText.split("\n").filter((line) => line.length > 0);

  // Look for MRZ lines - they should start with P< or similar passport markers
  // and be of reasonable length (30+ characters)
  const mrzLines = lines.filter(
    (line) =>
      line.length >= 30 && (line.startsWith("P<") || /^[A-Z0-9<]+$/.test(line))
  );

  if (mrzLines.length < 2) {
    return null;
  }

  // Get the last two lines that look like MRZ (usually at the bottom of passport)
  const line1 = mrzLines[mrzLines.length - 2];
  const line2 = mrzLines[mrzLines.length - 1];

  // Validate MRZ format
  if (line1.length < 30 || line2.length < 30) {
    return null;
  }

  try {
    // Parse Line 1: P<CountrySurname<<GivenNames<<<<<<<<<<<<<
    // Extract country code (positions 2-4)
    const nationality = line1.substring(2, 5).replace(/</g, "");

    // Parse surname and given names
    const namePart = line1.substring(5);
    const nameParts = namePart.split("<<");
    const surname = nameParts[0]?.replace(/</g, " ").trim() || "";
    const givenNames = nameParts[1]?.replace(/</g, " ").trim() || "";

    // Parse Line 2: PassportNumberCheckCountryBirthDateCheckSexExpiryDateCheck...
    // Extract passport number (first 9 characters, remove fillers)
    const passportNumber = line2.substring(0, 9).replace(/</g, "");

    // Skip check digit at position 9

    // Extract birth date (positions 13-19 in YYMMDD format)
    const birthDateRaw = line2.substring(13, 19);
    const birthDate = parseDate(birthDateRaw);

    // Skip check digit at position 19

    // Extract sex (position 20)
    const sexChar = line2.substring(20, 21);
    let sex: "MALE" | "FEMALE" | "" = "";
    if (sexChar === "F") {
      sex = "FEMALE";
    } else if (sexChar === "M") {
      sex = "MALE";
    }

    // Extract expiry date (positions 21-27 in YYMMDD format)
    const expiryDateRaw = line2.substring(21, 27);
    const expiryDate = parseDate(expiryDateRaw);

    // Validate that we got meaningful data
    const isValid =
      passportNumber.length >= 6 &&
      nationality.length === 3 &&
      birthDate.length === 10 &&
      expiryDate.length === 10;

    return {
      passportNumber,
      nationality,
      birthDate,
      expiryDate,
      sex,
      givenNames,
      surname,
      isValid,
      confidence: 0.85, // Default confidence for MRZ parsing
    };
  } catch {
    return null;
  }
}

/**
 * Parse YYMMDD date format to YYYY-MM-DD
 */
function parseDate(dateRaw: string): string {
  if (dateRaw.length !== 6) return "";

  const year = parseInt(dateRaw.substring(0, 2), 10);
  const month = parseInt(dateRaw.substring(2, 4), 10);
  const day = parseInt(dateRaw.substring(4, 6), 10);

  // Determine full year (assume 1900s for years > 50, 2000s for years <= 50)
  const fullYear = year > 50 ? 1900 + year : 2000 + year;

  // Validate date components
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return "";
  }

  return `${fullYear}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Hook for passport OCR scanning using Tesseract.js
 * Extracts MRZ (Machine Readable Zone) data from passport images
 */
export function usePassportOCR(): UsePassportOCRReturn {
  const [result, setResult] = useState<PassportOCRResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const scanPassport = useCallback(async (imageFile: File) => {
    setIsProcessing(true);
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      // Create worker with English language pack
      const worker = await createWorker("eng");

      // Configure for text recognition with emphasis on single uniform block of text
      await worker.setParameters({
        tessedit_pageseg_mode: PSM.AUTO, // Automatic page segmentation
        tessedit_char_whitelist:
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789< ",
      });

      // Recognize text from image
      const ret = await worker.recognize(imageFile);
      const text: string = ret.data.text;
      const confidence: number = ret.data.confidence;

      // Terminate worker
      await worker.terminate();

      // Parse MRZ from recognized text
      const parsedResult = parseMRZ(text);

      if (parsedResult && parsedResult.isValid) {
        setResult({
          ...parsedResult,
          confidence: confidence / 100,
        });
      } else {
        setError(
          "Could not read passport data. Please ensure the image is clear and shows the Machine Readable Zone (MRZ) at the bottom of the passport page."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while scanning the passport"
      );
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setProgress(0);
    setIsProcessing(false);
  }, []);

  return {
    result,
    isProcessing,
    error,
    progress,
    scanPassport,
    reset,
  };
}
