"use server"
import { redis } from "@/lib/redis";

export const refresh = async(mergedSlug: string) => {
    return await redis.hget(mergedSlug, "encryptedNotes");   
}