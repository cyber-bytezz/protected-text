"use client"
import { Client } from "@/app/[...slug]/client"
import * as React from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { decrypt, sha256 } from "@/app/utils/vault"

interface DecryptProps {
  params: string;
  encryptedData: string; 
}

export function DecryptSite({ params, encryptedData }: DecryptProps) {
  const [password, setPassword] = React.useState("");
  const [decryptedData, setDecryptedData] = React.useState<string | null>(null);
  const [initHash, setInitHash] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const handleCancel = () => {
     window.location.href = "/"
  };
  const handleSubmit = async () => {
    setError(null);
    setDecryptedData(null); 
    setInitHash(null)
    if (!encryptedData || !password) {
      setError("Encrypted data or password is missing.");
      return;
    }

    try {
      const decrypted = decrypt(encryptedData, password);
      setDecryptedData(decrypted); 
      setInitHash(sha256(decrypted))
    } catch (error) {
      console.error("Decryption error:", error);
      setError("Failed to decrypt data. Please check your password.");

    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      {decryptedData ? (
        <Client params={params} decryptedData={decryptedData} hash={password}/>
      ) : (
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>This site is taken.</CardTitle>
            <CardDescription>
              If this is not your site, you can try a different one{" "}
              <Link href="/" className="text-blue-500 hover:underline">
                here
              </Link>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}
              </div>
          <div className="flex gap-2 mt-4">
            <Button type="submit" >Decrypt</Button>
              <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
          </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
