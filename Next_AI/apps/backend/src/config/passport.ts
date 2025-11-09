import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GithubStrategy } from "passport-github2";
import { prisma } from "db/client";
import bcrypt from "bcrypt";

interface UserProfile {
    id: string;
    email: string;
    providerId: string | null;
    name: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    avatar: string | null;
    provider: string | null;
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Try by providerId first
        let user = await prisma.user.findUnique({ where: { providerId: profile.id } });

        // If not found by providerId, try by email
        const email = profile.emails?.[0]?.value ?? null;
        if (!user && email) {
          user = await prisma.user.findUnique({ where: { email } });
        }

        if (!user) {
          // Create a random hashed password because schema requires password
          const randomPassword = Math.random().toString(36).slice(2);
          const hashedPassword = await bcrypt.hash(randomPassword, 10);

          const newUser = await prisma.user.create({
            data: {
              name: profile.displayName ?? "",
              email: email ?? "",
              avatar: profile.photos?.[0]?.value ?? "",
              provider: "google",
              providerId: profile.id,
              password: hashedPassword,
            },
          });
          user = newUser;
        } else {
          // If user exists but doesn't have provider/providerId set, update it
          if (!user.providerId) {
            await prisma.user.update({ where: { id: user.id }, data: { provider: "google", providerId: profile.id } });
          }
        }

        done(null, user);
      } catch (error) {
        done(error, undefined);
      }
    }
  )
);

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      callbackURL: process.env.GITHUB_CALLBACK_URL || "",
    },
    async (
      accessToken: any,
      refreshToken: any,
      profile: {
        id: any;
        displayName: any;
        emails: { value: any }[];
        photos: { value: any }[];
      },
      done: (error: unknown, user?: UserProfile | null) => void
    ) => {
      try {
        let user = await prisma.user.findUnique({ where: { providerId: profile.id } });
        const email = profile.emails?.[0]?.value ?? null;

        if (!user && email) {
          user = await prisma.user.findUnique({ where: { email } });
        }

        if (!user) {
          const randomPassword = Math.random().toString(36).slice(2);
          const hashedPassword = await bcrypt.hash(randomPassword, 10);

          const newUser = await prisma.user.create({
            data: {
              name: profile.displayName ?? "",
              email: email ?? "",
              avatar: profile.photos?.[0]?.value ?? "",
              provider: "github",
              providerId: profile.id,
              password: hashedPassword,
            },
          });
          done(null, newUser);
        } else {
          if (!user.providerId) {
            await prisma.user.update({ where: { id: user.id }, data: { provider: "github", providerId: profile.id } });
          }
          done(null, user);
        }
      } catch (error) {
        done(error, undefined);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, (user as any).id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: id as string },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
