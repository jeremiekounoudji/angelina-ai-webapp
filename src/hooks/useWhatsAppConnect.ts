// import { useMemo } from 'react';

// // 1. Define the props for the hook
// interface UseWhatsAppConnectProps {
//   /** The internal ID of your user */
//   userId: string | null | undefined;
// }

// // 2. Define the return value of the hook
// interface UseWhatsAppConnectReturn {
//   /** The fully constructed auth URL. Null if inputs are missing. */
//   authUrl: string | null;
// }

// export const useWhatsAppConnect = (props: UseWhatsAppConnectProps): UseWhatsAppConnectReturn => {
//   const { userId } = props;

//   // 3. Get values from environment variables
//   // These are typed as string | undefined by Next.js
//   const clientId = process.env.NEXT_PUBLIC_META_APP_ID;
//   const redirectUri = process.env.NEXT_PUBLIC_N8N_REDIRECT_URL;

//   // 4. We build the authorization URL
//   const authUrl = useMemo(() => {
//     // We can't build a URL if any key part is missing
//     if (!clientId || !redirectUri || !userId) {
//       return null;
//     }

//     const scopes = [
//       'whatsapp_business_management',
//       'whatsapp_business_messaging',
//       "business_management"
//     ].join(',');

//     const url = new URL('https://www.facebook.com/dialog/oauth');
//     url.searchParams.set('client_id', clientId);
//     url.searchParams.set('redirect_uri', redirectUri);
//     url.searchParams.set('response_type', 'code');
//     url.searchParams.set('scope', scopes);

//     // Pass the user's ID in the 'state' param
//     url.searchParams.set('state', userId);

//     return url.toString();
//   }, [clientId, redirectUri, userId]); // Re-run only when these change

//   return { authUrl };
// };

import { useCallback, useEffect, useMemo, useState } from "react";

interface UseWhatsAppConnectProps {
  /** The internal ID of your user */
  userId: string | null | undefined;
}

interface UseWhatsAppConnectReturn {
  /** The fully constructed auth URL (for debug or manual use) */
  authUrl: string | null;
}

export const useWhatsAppConnect = (
  props: UseWhatsAppConnectProps
): UseWhatsAppConnectReturn => {
  const { userId } = props;
  const clientId = process.env.NEXT_PUBLIC_META_APP_ID;
  const appSecret = process.env.NEXT_PUBLIC_META_APP_SECRET;
  const n8nWebhookUrl = process.env.NEXT_PUBLIC_N8N_REDIRECT_URL; // used as redirect for wa_onboarding
  const [authUrl, setAuthUrl] = useState<string | null>(null);

  // Step 1: Build OAuth URL
  const oauthUrl = useCallback(() => {
    if (!clientId || !userId || !n8nWebhookUrl) return null;

    const scopes = [
      "whatsapp_business_management",
      "whatsapp_business_messaging",
      "business_management",
    ].join(",");

    const url = new URL("https://www.facebook.com/dialog/oauth");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", n8nWebhookUrl);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", scopes);
    url.searchParams.set("state", userId);
    console.log("*******************step 1**************");

    return url.toString();
  }, [clientId, n8nWebhookUrl, userId]);

  return { authUrl };
};
