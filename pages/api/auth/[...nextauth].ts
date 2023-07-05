import { NextApiHandler } from "next";
import NextAuth, { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import GitHubProvider from "next-auth/providers/github";
// import EmailProvider from "next-auth/providers/email";
import prisma from "../../../lib/prisma";
import Credentials from "next-auth/providers/credentials";

const authHandler: NextApiHandler = (req, res) => NextAuth(req, res, options);
export default authHandler;

const options: NextAuthOptions = {
  providers: [
    Credentials({    
      name: 'Credentials',       
      credentials: {      
        email: { 
          label: "Email", 
          type: "email",
          placeholder: "email@gmail.com" 
        },      
        password: {  
          label: "Password", 
          type: "password" 
        }    
      },    
      async authorize(credentials, req) {          
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        // check pass too 
        return user || null;
      }  
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
    maxAge: 1 * 60 * 60, // 1 hour
  },
  adapter: PrismaAdapter(prisma),
  secret: process.env.SECRET,
};
