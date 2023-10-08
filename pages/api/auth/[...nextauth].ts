import { NextApiHandler } from 'next';
import NextAuth, { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
// import GitHubProvider from "next-auth/providers/github";
// import EmailProvider from "next-auth/providers/email";
import { compare } from 'bcryptjs';
import prisma from '../../../lib/prisma';
import Credentials from 'next-auth/providers/credentials';

const options: NextAuthOptions = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'email@gmail.com',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },
      async authorize(credentials, req) {
        const { email } = credentials;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        const checkPassword = await compare(
          credentials.password,
          user.password
        );

        return (checkPassword && user) || null;
      },
    }),
    // GitHubProvider({
    //   clientId: process.env.GITHUB_ID,
    //   clientSecret: process.env.GITHUB_SECRET,
    // }),
    // EmailProvider({
    //   server: {
    //     host: process.env.SMTP_HOST,
    //     port: Number(process.env.SMTP_PORT),
    //     auth: {
    //       user: process.env.SMTP_USER,
    //       pass: process.env.SMTP_PASSWORD,
    //     },
    //   },
    //   from: process.env.SMTP_FROM,
    // }),
  ],
  session: {
    maxAge: 24 * 60 * 60, //24 hours
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      console.log('jwt');
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token from a provider.
      console.log('session callback');
      session.accessToken = token.accessToken;
      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
  secret: process.env.SECRET,
  debug: true,
};

const authHandler: NextApiHandler = (req, res) => NextAuth(req, res, options);
export default authHandler;
