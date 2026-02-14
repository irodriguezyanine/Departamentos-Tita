import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { ObjectId } from "mongodb"
import { getDb } from "./db"

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username?.trim()
        const password = credentials?.password
        if (!username || !password) return null

        const db = await getDb()
        const user = await db.collection("users").findOne({ username })

        if (!user) return null
        const valid = await bcrypt.compare(password, user.password)
        if (!valid) return null

        const displayName = (user as { displayName?: string }).displayName
        return {
          id: user._id.toString(),
          name: displayName && displayName.trim() ? displayName.trim() : user.username,
          email: user.username.includes("@") ? user.username : user.username + "@departamentos-tita.local",
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name ?? undefined
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as { id?: string }).id = token.id as string
        try {
          const db = await getDb()
          const userId = String(token.id)
          const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })
          const displayName = (user as { displayName?: string } | null)?.displayName
          if (displayName?.trim()) session.user.name = displayName.trim()
          else if (token.name) session.user.name = token.name as string
        } catch {
          if (token.name) session.user.name = token.name as string
        }
      }
      return session
    },
  },
}
