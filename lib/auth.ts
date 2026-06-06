import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

const MS_TENANT = process.env.MICROSOFT_TENANT_ID || "common";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/gmail.send",
          ].join(" "),
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
    MicrosoftEntraID({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      issuer: `https://login.microsoftonline.com/${MS_TENANT}/v2.0`,
      authorization: {
        params: {
          // offline_access → refresh token; Mail.Read per leggere header, Mail.Send per mailto unsubscribe
          scope: "openid email profile offline_access User.Read Mail.Read Mail.Send",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Al primo login salva access_token, refresh_token e quale provider è stato usato
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        token.provider = account.provider; // "google" | "microsoft-entra-id"
      }
      return token;
    },
    async session({ session, token }) {
      // Esponi access token e provider alla session lato server
      session.accessToken = token.accessToken as string;
      session.provider = token.provider as string;
      return session;
    },
  },
});
