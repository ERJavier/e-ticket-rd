import { readFileSync } from "fs";
import { join } from "path";

import { NextResponse, type NextRequest } from "next/server";
import { PKPass } from "passkit-generator";

import { createApplicationUUID } from "@/lib/utils/application-utils";

import type { ApplicationData } from "@/lib/schemas/forms";

type AppleWalletCertificates = {
  wwdr: Buffer;
  signerCert: Buffer;
  signerKey: Buffer;
};

// Get certificate files
const getCertificates = (): AppleWalletCertificates | null => {
  try {
    const certPath = process.env.APPLE_WWDR_CERT_PATH || "./certs/wwdr.pem";
    const signerCertPath =
      process.env.APPLE_SIGNER_CERT_PATH || "./certs/signerCert.pem";
    const signerKeyPath =
      process.env.APPLE_SIGNER_KEY_PATH || "./certs/signerKey.pem";

    return {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      wwdr: readFileSync(certPath),
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      signerCert: readFileSync(signerCertPath),
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      signerKey: readFileSync(signerKeyPath),
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error loading certificates:", error);
    return null;
  }
};

const addOptionalImageFiles = (passFiles: Record<string, Buffer>) => {
  const optionalFiles = [
    { name: "icon.png", path: join(process.cwd(), "public", "icon.png") },
    { name: "icon@2x.png", path: join(process.cwd(), "public", "icon@2x.png") },
    { name: "logo.png", path: join(process.cwd(), "public", "logo.png") },
    { name: "logo@2x.png", path: join(process.cwd(), "public", "logo@2x.png") },
  ];

  for (const file of optionalFiles) {
    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      passFiles[file.name] = readFileSync(file.path);
    } catch {
      // Optional asset not found; continue without it
    }
  }
};

const buildPassJson = ({
  submittedData,
  applicationCode,
  applicationUUID,
}: {
  submittedData: ApplicationData;
  applicationCode: string;
  applicationUUID: string;
}) => {
  const primaryTraveler = submittedData.travelers[0];
  if (!primaryTraveler) {
    return null;
  }

  const { personalInfo } = primaryTraveler;
  const { passport } = personalInfo;
  const { flightInfo } = submittedData;
  const { customsDeclaration } = submittedData;

  const fullName = `${personalInfo.firstName} ${personalInfo.lastName}`;
  const nationality = passport.isDifferentNationality
    ? passport.nationality
    : personalInfo.birthCountry;

  const hasCustomsItems =
    customsDeclaration.carriesOverTenThousand ||
    customsDeclaration.carriesAnimalsOrFood ||
    customsDeclaration.carriesTaxableGoods;

  const directionLabel =
    flightInfo.travelDirection === "ENTRY" ? "Entrada" : "Salida";
  const directionValue =
    flightInfo.travelDirection === "ENTRY"
      ? "República Dominicana"
      : "Desde RD";

  return {
    formatVersion: 1,
    passTypeIdentifier:
      process.env.APPLE_PASS_TYPE_ID || "pass.com.example.eticket",
    teamIdentifier: process.env.APPLE_TEAM_ID || "XXXXXXXXXX",
    organizationName: "Gobierno de la República Dominicana",
    description: "E-Ticket República Dominicana",
    serialNumber: applicationCode,
    logoText: "E-Ticket RD",
    foregroundColor: "rgb(255, 255, 255)",
    backgroundColor: "rgb(22, 56, 93)",
    labelColor: "rgb(255, 255, 255)",
    generic: {
      primaryFields: [
        {
          key: "traveler",
          label: "Viajero",
          value: fullName,
        },
      ],
      secondaryFields: [
        {
          key: "flight",
          label: "Vuelo",
          value: `${flightInfo.flightNumber} (${flightInfo.airline})`,
        },
        {
          key: "direction",
          label: directionLabel,
          value: directionValue,
        },
      ],
      auxiliaryFields: [
        {
          key: "passport",
          label: "Pasaporte",
          value: passport.number,
        },
        {
          key: "nationality",
          label: "Nacionalidad",
          value: nationality,
        },
        {
          key: "customs",
          label: "Aduana",
          value: hasCustomsItems ? "Declaración Requerida" : "Sin Novedad",
        },
      ],
      backFields: [
        {
          key: "applicationCode",
          label: "Código de Aplicación",
          value: applicationCode,
        },
        {
          key: "flightDetails",
          label: "Detalles del Vuelo",
          value: `${flightInfo.airline} ${flightInfo.flightNumber}\n${flightInfo.departurePort} → ${flightInfo.arrivalPort}\nFecha: ${flightInfo.travelDate}`,
        },
        {
          key: "customsDeclaration",
          label: "Declaración Aduanal",
          value: `Más de $10,000 USD: ${customsDeclaration.carriesOverTenThousand ? "Sí" : "No"}\nAnimales/Alimentos: ${customsDeclaration.carriesAnimalsOrFood ? "Sí" : "No"}\nMercancías con Impuestos: ${customsDeclaration.carriesTaxableGoods ? "Sí" : "No"}`,
        },
        {
          key: "qrInfo",
          label: "Código QR",
          value:
            "CÓDIGO QR DE USO EXCLUSIVO PARA VALIDACIÓN ADUANAL. Presente este código en el punto de control migratorio.",
        },
        {
          key: "instructions",
          label: "Instrucciones",
          value:
            "Mantenga este pase digital o el código QR accessible durante su viaje. Se requiere presentarlo junto con su pasaporte en los puntos de control.",
        },
      ],
    },
    barcodes: [
      {
        format: "PKBarcodeFormatQR",
        message: applicationUUID,
        messageEncoding: "iso-8859-1",
        altText: applicationCode,
      },
    ],
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { submittedData, applicationCode } = body as {
      submittedData: ApplicationData;
      applicationCode: string;
    };

    if (!submittedData || !applicationCode) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      );
    }

    const certificates = getCertificates();
    if (!certificates) {
      return NextResponse.json(
        {
          error: "Apple Wallet certificates not configured",
          message:
            "Please set up Apple Developer certificates to enable Apple Wallet passes",
        },
        { status: 503 }
      );
    }

    const applicationUUID = createApplicationUUID(applicationCode);
    const passJson = buildPassJson({
      submittedData,
      applicationCode,
      applicationUUID,
    });

    if (!passJson) {
      return NextResponse.json(
        { error: "No traveler data found" },
        { status: 400 }
      );
    }

    const passFiles: Record<string, Buffer> = {
      "pass.json": Buffer.from(JSON.stringify(passJson)),
    };
    addOptionalImageFiles(passFiles);

    const pass = new PKPass(
      passFiles,
      {
        wwdr: certificates.wwdr,
        signerCert: certificates.signerCert,
        signerKey: certificates.signerKey,
        signerKeyPassphrase: process.env.APPLE_SIGNER_KEY_PASSPHRASE || "",
      },
      {}
    );

    const passBuffer = pass.getAsBuffer();
    const passBytes = new Uint8Array(passBuffer);

    return new NextResponse(passBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": `attachment; filename="eticket-${applicationCode}.pkpass"`,
        "Content-Length": passBytes.byteLength.toString(),
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error generating Apple Wallet pass:", error);
    return NextResponse.json(
      {
        error: "Failed to generate Apple Wallet pass",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to generate Apple Wallet pass." },
    { status: 405 }
  );
}
