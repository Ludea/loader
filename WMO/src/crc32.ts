const table = Array(256);

for (let i = 0; i < 256; i++) {
	let current = i;
	for (let j = 0; j < 8; j++) {
		if (current & 1)
			current = 0xEDB88320 ^ (current >>> 1);
		else
			current = current >>> 1;
	}

	table[i] = current;
}

/**
 * Calculate the CRC32 value of a given buffer.#
 * @param buf - The buffer to calculate the CRC32 value of.
 * @returns The CRC32 value of the buffer.
 */
export default function crc32(buf: ArrayBuffer): number {
	let res = -1;
	const view = new DataView(buf);
	for (let i = 0; i < buf.byteLength; i++)
		res = table[(res ^ view.getInt32(i)) & 0xFF] ^ (res >>> 8);

	return res ^ -1;
}