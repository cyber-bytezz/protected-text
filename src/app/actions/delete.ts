"use server"
import { redis } from "@/lib/redis";


export async function deleteNotes(params: string, initHash: string) {
  const hashFromDb = await redis.hget(params, "currentHash");
  if (hashFromDb === null || initHash === hashFromDb) {
    await redis.del(params);
    return {
      message: "Notes deleted",
    };
  }

  else {
    throw Error("unauthorized")
  }
}
