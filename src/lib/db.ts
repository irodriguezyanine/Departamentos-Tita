import { MongoClient } from "mongodb"

let clientPromise: Promise<MongoClient> | null = null

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error("Por favor agrega MONGODB_URI a tu archivo .env.local")
  }

  if (process.env.NODE_ENV === "development" && global._mongoClientPromise) {
    return global._mongoClientPromise
  }

  const promise = new MongoClient(uri).connect()
  if (process.env.NODE_ENV === "development") {
    global._mongoClientPromise = promise
  }
  return promise
}

export async function getDb() {
  if (!clientPromise) {
    clientPromise = getClientPromise()
  }
  const client = await clientPromise
  return client.db("departamentos_tita")
}
