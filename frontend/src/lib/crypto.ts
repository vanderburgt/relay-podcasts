import bs58 from 'bs58';

export async function deriveKey(keyString: string): Promise<CryptoKey> {
	const keyBytes = bs58.decode(keyString);
	return await crypto.subtle.importKey(
		'raw',
		keyBytes.buffer as ArrayBuffer,
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt', 'decrypt']
	);
}

export async function encrypt(data: object, key: CryptoKey): Promise<string> {
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const encoded = new TextEncoder().encode(JSON.stringify(data));
	const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

	const combined = new Uint8Array(iv.length + ciphertext.byteLength);
	combined.set(iv, 0);
	combined.set(new Uint8Array(ciphertext), iv.length);

	return btoa(String.fromCharCode(...combined));
}

export async function decrypt(encrypted: string, key: CryptoKey): Promise<object> {
	const combined = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));
	const iv = combined.slice(0, 12);
	const ciphertext = combined.slice(12);
	const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);

	return JSON.parse(new TextDecoder().decode(decrypted));
}
