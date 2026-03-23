/**
 * AES-256-GCM symmetric encryption for sensitive fields (e.g. WhatsApp API keys).
 * The secret key is derived from ENCRYPTION_SECRET env var using PBKDF2.
 *
 * Format of encrypted output: `<iv_hex>:<authTag_hex>:<ciphertext_hex>`
 */

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96-bit IV recommended for GCM

function getSecret(): string {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ENCRYPTION_SECRET env var must be set and at least 32 characters long");
  }
  return secret;
}

async function deriveKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const rawKey = enc.encode(secret);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    rawKey.buffer.slice(rawKey.byteOffset, rawKey.byteOffset + rawKey.byteLength) as ArrayBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  const saltRaw = enc.encode("angelina-ai-salt");
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltRaw.buffer.slice(saltRaw.byteOffset, saltRaw.byteOffset + saltRaw.byteLength) as ArrayBuffer,
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToArrayBuffer(hex: string): ArrayBuffer {
  const buf = new ArrayBuffer(hex.length / 2);
  const view = new Uint8Array(buf);
  for (let i = 0; i < hex.length; i += 2) {
    view[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return buf;
}

/**
 * Encrypts a plaintext string.
 * Returns a string in the format: `<iv_hex>:<authTag_hex>:<ciphertext_hex>`
 */
export async function encrypt(plaintext: string): Promise<string> {
  const key = await deriveKey(getSecret());
  const ivBuf = new ArrayBuffer(IV_LENGTH);
  crypto.getRandomValues(new Uint8Array(ivBuf));

  const enc = new TextEncoder();
  const raw = enc.encode(plaintext);
  const plaintextBuf = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength) as ArrayBuffer;

  // GCM output = ciphertext + 16-byte auth tag appended
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv: ivBuf },
    key,
    plaintextBuf
  );

  // Split ciphertext and auth tag (last 16 bytes)
  const encBytes = new Uint8Array(encrypted);
  const ciphertext = encrypted.slice(0, encBytes.length - 16);
  const authTag = encrypted.slice(encBytes.length - 16);

  return `${bufToHex(ivBuf)}:${bufToHex(authTag)}:${bufToHex(ciphertext)}`;
}

/**
 * Decrypts a string produced by `encrypt()`.
 */
export async function decrypt(encryptedStr: string): Promise<string> {
  const parts = encryptedStr.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted format");

  const [ivHex, authTagHex, ciphertextHex] = parts;
  const key = await deriveKey(getSecret());

  const iv = hexToArrayBuffer(ivHex);
  const authTag = new Uint8Array(hexToArrayBuffer(authTagHex));
  const ciphertext = new Uint8Array(hexToArrayBuffer(ciphertextHex));

  // Reassemble ciphertext + authTag for SubtleCrypto
  const combined = new ArrayBuffer(ciphertext.length + authTag.length);
  const combinedView = new Uint8Array(combined);
  combinedView.set(ciphertext);
  combinedView.set(authTag, ciphertext.length);

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    combined
  );

  return new TextDecoder().decode(decrypted);
}
