import crypto from "crypto";

export function sha256(content: string): string {
    const hash = crypto.createHash("sha256");
    hash.update(content);
    return hash.digest("hex");
}

function deriveKey(password: string): Buffer {
    if (!password) {
        throw new Error("Password cannot be empty.");
    }
    return crypto.pbkdf2Sync(password, "salt", 100000, 32, "sha256");
}

export function encrypt(text: string, password: string): string {
    if (!text) {
        text = " "
    }
    const key = deriveKey(password);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

    const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(encryptedText: string, password: string): string {
    if (!encryptedText) {
        throw new Error("Encrypted text cannot be empty.");
    }
    const parts = encryptedText.split(":");
    if (parts.length !== 2) {
        throw new Error("Invalid encrypted text format.");
    }

    const [ivHex, encrypted] = parts;

    if (!ivHex || !encrypted) {
        throw new Error("Invalid encrypted text format. Both IV and encrypted data must be provided.");
    }

    const iv = Buffer.from(ivHex, "hex");
    const encryptedBuffer = Buffer.from(encrypted, "hex");

    const key = deriveKey(password);
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

    const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
    return decrypted.toString("utf8");
}
