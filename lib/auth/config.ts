import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { linkGuestOrdersToUser } from "@/lib/db/orders";
import { sendMail } from "@/lib/email/send-mail";

const MAGIC_LINK_MAX_AGE_MS = 15 * 60 * 1000;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // JWT (not "database") sessions are required here: NextAuth's Credentials
  // provider (used for admin login) has no OAuth/adapter-backed account to
  // hang a database session off of, so database-strategy sessions silently
  // fail to persist after a successful admin authorize() — the buyer email
  // provider works fine under either strategy, but JWT is the only one that
  // works for both providers.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    verifyRequest: "/login/check-email",
    error: "/login",
  },
  providers: [
    // Buyer login: no password, ever — a magic link is emailed to the
    // address the buyer types in, via Resend's HTTP API (not SMTP — Vercel
    // blocks/restricts outbound SMTP, which silently failed sends in
    // production even with valid Gmail SMTP credentials). In local dev
    // without RESEND_API_KEY configured, the link is logged to the
    // terminal instead of actually emailed (see sendVerificationRequest
    // below) so login is testable without a mail provider.
    EmailProvider({
      // Only used by NextAuth to build its internal nodemailer transport,
      // which we never actually invoke — sendVerificationRequest below
      // fully overrides delivery, so this is a required-but-unused stub.
      server: { host: "localhost", port: 25 },
      from: process.env.EMAIL_FROM ?? "Little Ilmies <contact@littleilmies.com>",
      maxAge: MAGIC_LINK_MAX_AGE_MS / 1000, // magic link valid for 15 minutes
      async sendVerificationRequest({ identifier, url }) {
        // Anyone can ask for a link to any address, so cap them per address:
        // stops one inbox being flooded and the shared daily email quota
        // (order emails use it too) being burned. A token row exists per
        // request, expiring 15 minutes after it was made.
        const now = Date.now();
        const [lastMinute, lastQuarterHour] = await Promise.all([
          prisma.verificationToken.count({
            where: { identifier, expires: { gt: new Date(now + MAGIC_LINK_MAX_AGE_MS - 60_000) } },
          }),
          prisma.verificationToken.count({ where: { identifier, expires: { gt: new Date(now) } } }),
        ]);
        // The count may already include this request's own token.
        if (lastMinute > 2 || lastQuarterHour > 5) {
          console.warn(`Magic link not sent to ${identifier}: too many requests`);
          return;
        }

        // Via sendMail so it counts toward the daily email budget; sign-in
        // links are essential and always sent. Without RESEND_API_KEY (local
        // dev) the link is printed to the terminal instead.
        await sendMail({
          to: identifier,
          subject: "Your Little Ilmies sign-in link",
          text: `Sign in to Little Ilmies: ${url}`,
          html: `<p>Tap below to sign in to Little Ilmies:</p><p><a href="${url}">Sign in to Little Ilmies</a></p><p>This link expires in 15 minutes.</p>`,
        });
      },
    }),

    // Admin login: email + password, kept entirely separate from the
    // buyer flow above. Only users with role = ADMIN and a passwordHash
    // set can use this provider.
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || user.role !== "ADMIN" || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  events: {
    // Clicking the magic link proves the buyer owns this email, so any
    // orders they placed as a guest with it now belong to their account.
    async signIn({ user, account }) {
      if (account?.provider !== "email" || !user.email) return;
      await linkGuestOrdersToUser(user.id, user.email).catch((err) => {
        console.error("Failed to link guest orders on sign-in:", err);
      });
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
