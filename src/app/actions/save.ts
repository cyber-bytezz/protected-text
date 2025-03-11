"use server"
import { redis } from "@/lib/redis";

export async function saveNotes(params: string, encryptedNotes: string, initHash: string, currentHash: string) {
  const hashFromDb = await redis.hget(params, "currentHash");
  if (hashFromDb === null || initHash === hashFromDb) {
    await redis.hset(params, {
      currentHash,
      encryptedNotes
    });
    return {
      message: "Notes encrypted and stored safely!", currentHash
    };
  }

  else {
    throw Error("unauthorized")
  }

}
