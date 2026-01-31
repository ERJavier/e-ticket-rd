import { google } from "googleapis";
import jwt from "jsonwebtoken";
import { NextResponse, type NextRequest } from "next/server";

import { createApplicationUUID } from "@/lib/utils/application-utils";

import type { ApplicationData } from "@/lib/schemas/forms";

// Google Wallet API configuration
const GOOGLE_WALLET_ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID || "";
const GOOGLE_WALLET_CLASS_ID = process.env.GOOGLE_WALLET_CLASS_ID || "eticket";

type GoogleAuthClient = InstanceType<typeof google.auth.GoogleAuth>;

// Initialize Google Auth
const getGoogleAuth = (): GoogleAuthClient | null => {
  try {
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      return null;
    }

    const credentials = JSON.parse(serviceAccountKey);
    return new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/wallet_object.issuer"],
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error initializing Google Auth:", error);
    return null;
  }
};

// Create or update a Generic Class
const createGenericClass = async (auth: GoogleAuthClient) => {
  const walletclient = google.walletobjects({
    version: "v1",
    auth,
  });

  const classId = `${GOOGLE_WALLET_ISSUER_ID}.${GOOGLE_WALLET_CLASS_ID}`;

  const genericClass = {
    id: classId,
    issuerName: "Gobierno de la República Dominicana",
    reviewStatus: "UNDER_REVIEW",
  };

  try {
    // Try to get existing class
    await walletclient.genericclass.get({
      resourceId: classId,
    });
  } catch {
    // Class doesn't exist, create it
    try {
      await walletclient.genericclass.insert({
        requestBody: genericClass,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error creating generic class:", error);
    }
  }

  return classId;
};

// Create a Generic Object for the pass
const createGenericObject = (
  applicationCode: string,
  applicationUUID: string,
  submittedData: ApplicationData
) => {
  const primaryTraveler = submittedData.travelers[0];
  if (!primaryTraveler) {
    throw new Error("No traveler data found");
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

  const classId = `${GOOGLE_WALLET_ISSUER_ID}.${GOOGLE_WALLET_CLASS_ID}`;
  const objectId = `${GOOGLE_WALLET_ISSUER_ID}.${applicationCode}`;

  return {
    id: objectId,
    classId: classId,
    genericType: "GENERIC_TYPE_UNSPECIFIED",
    hexBackgroundColor: "#16385d",
    logo: {
      sourceUri: {
        uri: "https://eticket.migracion.gob.do/logo.png",
      },
    },
    cardTitle: {
      defaultValue: {
        language: "es",
        value: "E-Ticket República Dominicana",
      },
    },
    subheader: {
      defaultValue: {
        language: "es",
        value: `Código: ${applicationCode}`,
      },
    },
    header: {
      defaultValue: {
        language: "es",
        value: fullName,
      },
    },
    barcode: {
      type: "QR_CODE",
      value: applicationUUID,
      alternateText: applicationCode,
    },
    textModulesData: [
      {
        id: "flight",
        header: "Vuelo",
        body: `${flightInfo.flightNumber} (${flightInfo.airline})`,
      },
      {
        id: "direction",
        header: flightInfo.travelDirection === "ENTRY" ? "Entrada" : "Salida",
        body:
          flightInfo.travelDirection === "ENTRY"
            ? "República Dominicana"
            : "Desde RD",
      },
      {
        id: "passport",
        header: "Pasaporte",
        body: passport.number,
      },
      {
        id: "nationality",
        header: "Nacionalidad",
        body: nationality,
      },
      {
        id: "customs",
        header: "Aduana",
        body: hasCustomsItems ? "Declaración Requerida" : "Sin Novedad",
      },
      {
        id: "flight_details",
        header: "Detalles del Vuelo",
        body: `${flightInfo.airline} ${flightInfo.flightNumber}\n${flightInfo.departurePort} → ${flightInfo.arrivalPort}\nFecha: ${flightInfo.travelDate}`,
      },
      {
        id: "customs_declaration",
        header: "Declaración Aduanal",
        body: `Más de $10,000 USD: ${customsDeclaration.carriesOverTenThousand ? "Sí" : "No"}\nAnimales/Alimentos: ${customsDeclaration.carriesAnimalsOrFood ? "Sí" : "No"}\nMercancías con Impuestos: ${customsDeclaration.carriesTaxableGoods ? "Sí" : "No"}`,
      },
      {
        id: "instructions",
        header: "Instrucciones",
        body: "Presente este pase junto con su pasaporte en los puntos de control migratorio.",
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

    // Check if Google Wallet is configured
    if (!GOOGLE_WALLET_ISSUER_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      return NextResponse.json(
        {
          error: "Google Wallet not configured",
          message:
            "Please set up Google Wallet API credentials to enable Google Wallet passes",
        },
        { status: 503 }
      );
    }

    const auth = getGoogleAuth();
    if (!auth) {
      return NextResponse.json(
        {
          error: "Google authentication failed",
          message: "Failed to initialize Google authentication",
        },
        { status: 503 }
      );
    }

    const applicationUUID = createApplicationUUID(applicationCode);

    // Create or get the Generic Class
    const classId = await createGenericClass(auth);
    if (!classId) {
      return NextResponse.json(
        {
          error: "Failed to create Generic Class",
          message: "Could not create or retrieve the Generic Class",
        },
        { status: 500 }
      );
    }

    // Create the Generic Object
    const genericObject = createGenericObject(
      applicationCode,
      applicationUUID,
      submittedData
    );

    // Create JWT for the "Add to Google Wallet" link
    const credentials = JSON.parse(
      process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "{}"
    );
    const claims = {
      iss: credentials.client_email,
      aud: "google",
      origins: [],
      typ: "savetowallet",
      payload: {
        genericObjects: [genericObject],
      },
    };

    const token = jwt.sign(claims, credentials.private_key, {
      algorithm: "RS256",
    });

    const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

    return NextResponse.json({
      success: true,
      saveUrl,
      objectId: genericObject.id,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error generating Google Wallet pass:", error);
    return NextResponse.json(
      {
        error: "Failed to generate Google Wallet pass",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to generate Google Wallet pass." },
    { status: 405 }
  );
}
