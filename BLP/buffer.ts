//import { MD5, enc, lib } from 'crypto-js' ;
import crc32 from './crc32';

type BufferEncoding = 'ascii' | 'utf8' | 'utf-8' | 'utf16le' | 'usc2' | 'usc-2' | 'base64' | 'latin1' | 'binary' | 'hex';

/**
 * @param canvas - Canvas element to create the buffer from.
 * @param mimeType - MIME type of the canvas data.
 * @returns The created buffer.
 */
export async function canvasToBuffer(canvas: HTMLCanvasElement | OffscreenCanvas, mimeType: string): Promise<ArrayBuffer> {
	let blob: Blob;
	if (canvas instanceof OffscreenCanvas)
		blob = await canvas.convertToBlob({ type: mimeType });
	else
		blob = await new Promise(res => canvas.toBlob(res as BlobCallback, mimeType));

	return blob.arrayBuffer();
}

export default class BufferWrapper {
	buffer: ArrayBuffer;
	offset = 0;
	dataURL: string | undefined;

	/**
	 * Create a new BufferWrapper.
	 * @param buffer - Buffer to read from.
	 */
	constructor(buffer: ArrayBuffer) {
		this.buffer = buffer;
	}

	toBlob(): Blob {
		return new Blob([this.buffer]);
	}

	/** @returns The internal Node.js Buffer. */
	toBuffer(): ArrayBuffer {
		return this.buffer;
	}

	/**
	 * Calculate a hash of this buffer
	 * @param algorithm - Hashing algorithm (default 'md5').
	 * @param encoding - Output encoding (default 'hex')
	 * @returns The calculated hash.
	 */
	toHash(): string {
		//const uint8Array = new Uint8Array(this.buffer);
		//const wordArray = lib.WordArray.create(uint8Array);
        //return MD5(wordArray).toString(enc.Hex);
		return "foo";
	}

	/** @returns The calculated CRC32 hash. */
	toCRC32(): number {
		return crc32(this.buffer);
	}

	/** @returns The length of the buffer. */
	get length(): number {
		return this.buffer.byteLength;
	}

	/** @returns The remaining bytes until the end of the buffer. */
	get remainingBytes(): number {
		return this.length - this.offset;
	}

	/**
	 * Set the absolute position of this buffer.
	 *
	 * @remarks
	 * Negative values will set the position from the end of the buffer.
	 *
	 * @param ofs - New position to set.
	 * @throws {@link Error} If the given position is out of bounds of the buffer.
	 */
	seek(ofs: number): void {
		const pos = ofs < 0 ? this.length + ofs : ofs;
		if (pos < 0 || pos > this.length)
			throw new Error('seek() offset out of bounds ' + ofs + ' -> ' + pos + ' ! ' + this.length)

		this.offset = pos;
	}

	/**
	 * Shift the position of the buffer relative to its current position.
	 *
	 * @remarks
	 * Positive numbers seek forward, negative seek backwards.
	 *
	 * @param ofs - Offset to move the position by.
	 * @throws {@link Error} If the new position is out of bounds of the buffer.
	 */
	move(ofs: number): void {
		const pos = this.offset + ofs;
		if (pos < 0 || pos > this.length)
			throw new Error('move() offset out of bounds ' + ofs + ' -> ' + pos + ' ! ' + this.length);

		this.offset = pos;
	}

	/** @returns Signed 8-bit integer at the current position. */
	readInt8(): number {
		let view = new DataView(this.buffer);
		return view.getInt8(this.offset++);
	}

	/** @returns Unsigned 8-bit integer at the current position. */
	readUInt8(): number {
		let view = new DataView(this.buffer);
		return view.getUint8(this.offset++);
	}

	/** @returns Signed 16-bit integer (little-endian) at the current position. */
	readInt16(): number {
		let view = new DataView(this.buffer);
		const val = view.getInt16(this.offset);
		this.offset += 2;
		return val;
	}

	/** @returns Unsigned 16-bit integer (little-endian) at the current position. */
	readUInt16(): number {
		let view = new DataView(this.buffer);
		const val = view.getUint16(this.offset);
		this.offset += 2;
		return val;
	}

	/** @returns Signed 24-bit integer (little-endian) at the current position. */
	readInt24(): number {
		let view = new DataView(this.buffer);
		const val = (view.getInt16(this.offset) << 8) | view.getInt8(3);
		this.offset += 3;
		return val;
	}

	/** @returns Unsigned 24-bit integer (little-endian) at the current position. */
	readUInt24(): number {
		let view = new DataView(this.buffer);
		const val = (view.getUint16(this.offset) << 8) | view.getUint8(3);
		this.offset += 3;
		return val;
	}

	/** @returns Signed 32-bit integer (little-endian) at the current position. */
	readInt32(): number {
		let view = new DataView(this.buffer);
		const val = view.getInt32(this.offset);
		this.offset += 4;
		return val;
	}

	/** @returns Unsigned 32-bit integer (little-endian) at the current position. */
	readUInt32(): number {
		let view = new DataView(this.buffer);
		const val = view.getUint32(this.offset);
		this.offset += 4;
		return val;
	}

	/** @returns Signed 40-bit integer (little-endian) at the current position. */
	readInt40(): number {
		let view = new DataView(this.buffer);
		const val = view.getInt32(this.offset) << 8 >> 8;
		this.offset += 5;
		return val;
	}

	/** @returns Unsigned 40-bit integer (little-endian) at the current position. */
	readUInt40(): number {
		let view = new DataView(this.buffer);
		const val = view.getUint32(this.offset) << 8 >> 8;
		this.offset += 5;
		return val;
	}

	/** @returns Signed 64-bit integer (little-endian) at the current position. */
	readInt64(): bigint {
		let view = new DataView(this.buffer);
		const val = view.getBigInt64(this.offset);
		this.offset += 8;
		return val;
	}

	/** @returns Unsigned 64-bit integer (little-endian) at the current position. */
	readUInt64(): bigint {
		let view = new DataView(this.buffer);
		const val = view.getBigUint64(this.offset);
		this.offset += 8;
		return val;
	}

	/** @returns Float (little-endian) at the current position. */
	readFloat(): number {
		let view = new DataView(this.buffer);
		const val = view.getFloat32(this.offset);
		this.offset += 4;
		return val;
	}

	/** @returns Double (little-endian) at the current position. */
	readDouble(): number {
		let view = new DataView(this.buffer);
		const val = view.getFloat64(this.offset);
		this.offset += 8;
		return val;
	}

	/** @returns Array of signed 8-bit integers at the current position. */
	readInt8Array(length: number): Array<number> {
		const arr = new Array(length);
		let view = new DataView(this.buffer);
		for (let i = 0; i < length; i++) 
			arr[i] = view.getInt8(this.offset + i);

		this.offset += length;
		return arr;
	}

	/** @returns Array of unsigned 8-bit integers at the current position. */
	readUInt8Array(length: number): Array<number> {
		const arr = new Array(length);
		let view = new DataView(this.buffer);
		for (let i = 0; i < length; i++)
			arr[i] = view.getUint8(this.offset + i);

		this.offset += length;
		return arr;
	}

	/** @returns Array of signed 16-bit integers (little-endian) at the current position. */
	readInt16Array(length: number): Array<number> {
		const arr = new Array(length);
		let view = new DataView(this.buffer);
		for (let i = 0; i < length; i++)
			arr[i] = view.getInt16(this.offset + i * 2);

		this.offset += length * 2;
		return arr;
	}

	/** @returns Array of unsigned 16-bit integers (little-endian) at the current position. */
	readUInt16Array(length: number): Array<number> {
		const arr = new Array(length);
		let view = new DataView(this.buffer);
		for (let i = 0; i < length; i++)
			arr[i] = view.getUint16(this.offset + i * 2);

		this.offset += length * 2;
		return arr;
	}

	/** @returns Array of signed 24-bit integers (little-endian) at the current position. */
	readInt24Array(length: number): Array<number> {
		const arr = new Array(length);
		let view = new DataView(this.buffer);
		for (let i = 0; i < length; i++)
			arr[i] = (view.getInt16(this.offset) << 8) | view.getInt8(3);

		this.offset += length * 3;
		return arr;
	}

	/** @returns Array of unsigned 24-bit integers (little-endian) at the current position. */
	readUInt24Array(length: number): Array<number> {
		const arr = new Array(length);
		let view = new DataView(this.buffer);
		for (let i = 0; i < length; i++)
			arr[i] = (view.getUint16(this.offset) << 8) | view.getUint8(3);

		this.offset += length * 3;
		return arr;
	}

	/** @returns Array of signed 32-bit integers (little-endian) at the current position. */
	readInt32Array(length: number): Array<number> {
		const arr = new Array(length);
		let view = new DataView(this.buffer);
		for (let i = 0; i < length; i++)
			arr[i] = view.getInt32(this.offset + i * 4);

		this.offset += length * 4;
		return arr;
	}

	/** @returns Array of unsigned 32-bit integers (little-endian) at the current position. */
	readUInt32Array(length: number): Array<number> {
		const arr = new Array(length);
		let view = new DataView(this.buffer);
		for (let i = 0; i < length; i++)
			arr[i] = view.getUint32(this.offset + i * 4);

		this.offset += length * 4;
		return arr;
	}

	/** @returns Array of signed 64-bit integers (little-endian) at the current position. */
	readInt64Array(length: number): Array<bigint> {
		const arr = new Array(length);
		let view = new DataView(this.buffer);
		for (let i = 0; i < length; i++)
			arr[i] = view.getBigInt64(this.offset + i * 8);

		this.offset += length * 8;
		return arr;
	}

	/** @returns Array of unsigned 64-bit integers (little-endian) at the current position. */
	readUInt64Array(length: number): Array<bigint> {
		const arr = new Array(length);
		let view = new DataView(this.buffer);
		for (let i = 0; i < length; i++)
			arr[i] = view.getBigUint64(this.offset + i * 8);

		this.offset += length * 8;
		return arr;
	}

	/** @returns Array of 32-bit floats (little-endian) at the current position. */
	readFloatArray(length: number): Array<number> {
		const arr = new Array(length);
		let view = new DataView(this.buffer);
		for (let i = 0; i < length; i++)
			arr[i] = view.getFloat32(this.offset + i * 4);

		this.offset += length * 4;
		return arr;
	}

	/** @returns Array of 64-bit floats (little-endian) at the current position. */
	readFloat64Array(length: number): Array<number> {
		const arr = new Array(length);
		let view = new DataView(this.buffer);
		for (let i = 0; i < length; i++)
			arr[i] = view.getFloat64(this.offset + i * 8);

		this.offset += length * 8;
		return arr;
	}

	/**
	 * Read a string of variable byte length.
	 * @param length - How many bytes to read. If not specified, reads until the end of the buffer.
	 * @param encoding - The encoding to use (default: utf8)
	 * @returns String at the current position.
	 */
	readString(length: number = this.remainingBytes, encoding?: BufferEncoding): string {
		// Don't read empty strings.
		if (length === 0)
			return '';

		if (this.remainingBytes < length)
			throw new Error('BufferWrapper.readString(' + length + ') out-of-bounds [> '+ this.remainingBytes + ']');

		const decoder = new TextDecoder();
		const val = decoder.decode(this.buffer.slice(this.offset));
		this.offset += length;
		return val;
	}

	/**
	 * Read a buffer from this buffer.
	 * @param length How many bytes to read into the buffer.
	 * @returns Buffer at the current position.
	 */
	readBuffer(length: number = this.remainingBytes): ArrayBuffer {
		if (this.remainingBytes < length)
			throw new Error('BufferWrapper.readBuffer(' + length + ') out-of-bounds [> ' + this.remainingBytes + ']');

		let slice = new ArrayBuffer(length);
		slice = this.buffer.slice(0, this.offset);
		this.offset += length;

		return slice;
	}

	/**
	 * Read a buffer wrapped in a BufferWrapper.
	 * @param length How many bytes to read into the buffer.
	 * @returns BufferWrapper at the current position.
	 */
	readBufferWrapper(length: number = this.remainingBytes): BufferWrapper {
		return new BufferWrapper(this.readBuffer(length));
	}

	/**
	 * Read a null-terminated string from the buffer.
	 * @param encoding - The encoding to use (default: utf8)
	 * @returns The read string.
	 */
	readNullTerminatedString(encoding?: BufferEncoding): string {
		const startPos = this.offset;
		let length = 0;

		while (this.remainingBytes > 0) {
			if (this.readUInt8() === 0x0)
				break;

			length++;
		}

		this.seek(startPos);

		const str = this.readString(length, encoding);
		this.move(1); // Skip the null-terminator.
		return str;
	}

	/**
	 * Read a string block from the buffer.
	 * @param chunkSize - The size of the string block in bytes.
	 * @returns A map of offsets to strings.
	 */
	readStringBlock(chunkSize: number): Map<number, string> {
		const chunk = this.readBuffer(chunkSize);
		const entries = new Map<number, string>();
		const view = new DataView(chunk);

		let readOfs = 0;
		for (let i = 0; i < chunkSize; i++) {
			if (view.getInt32(i) === 0x0) {
				// Skip padding bytes.
				if (readOfs === i) {
					readOfs += 1;
					continue;
				}

				entries.set(readOfs, chunk.toString().replace(/\0/g, ''));
				readOfs = i + 1;
			}
		}

		return entries;
	}

	/** Write a 8-bit integer to the buffer. */
	writeInt8(value: number): void {
		let view = new DataView(this.buffer);
		view.setInt8(this.offset, value);
		this.offset += 1;
	}

	/** Write a 8-bit unsigned integer to the buffer. */
	writeUInt8(value: number): void {
		let view = new DataView(this.buffer);
		view.setUint8(this.offset, value);
		this.offset += 1;
	}

	/** Write a 16-bit (little-endian) signed integer to the buffer. */
	writeInt16(value: number): void {
		let view = new DataView(this.buffer);
		view.setInt16(this.offset, value);
		this.offset += 2;
	}

	/** Write a 16-bit (little-endian) unsigned integer to the buffer. */
	writeUInt16(value: number): void {
		let view = new DataView(this.buffer);
		view.setUint16(this.offset, value);
		this.offset += 2;
	}

	/** Write a 32-bit (little-endian) signed integer to the buffer. */
	writeInt32(value: number): void {
		let view = new DataView(this.buffer);
		view.setInt32(this.offset, value);
		this.offset += 4;
	}

	/** Write a 32-bit (little-endian) unsigned integer to the buffer. */
	writeUInt32(value: number): void {
		let view = new DataView(this.buffer);
		view.setUint32(this.offset, value);
		this.offset += 4;
	}

	/** Write a 64-bit (little-endian) signed integer to the buffer. */
	writeInt64(value: bigint): void {
		let view = new DataView(this.buffer);
		view.setBigInt64(this.offset, value);
		this.offset += 8;
	}

	/** Write a 64-bit (little-endian) unsigned integer to the buffer. */
	writeUInt64(value: bigint): void {
		let view = new DataView(this.buffer);
		view.setBigUint64(this.offset, value);
		this.offset += 8;
	}

	/** Write a float (little-endian) to the buffer. */
	writeFloat(value: number): void {
		let view = new DataView(this.buffer);
		view.setFloat32(value, this.offset);
		this.offset += 4;
	}

	/** Write a double (little-endian) to the buffer. */
	writeDouble(value: number): void {
		let view = new DataView(this.buffer);
		view.setFloat64(value, this.offset);
		this.offset += 8;
	}

	/**
	 * Write the contents of a buffer to this buffer.
	 * @param source - The buffer to write.
	 * @param copyOfs - The offset to start copying from. Defaults to 0.
	 * @param copyLength - The number of bytes to copy. Defaults to the entire buffer.
	 */
	writeBuffer(source: ArrayBuffer, copyOfs = 0, copyLength = 0): void {
		if (copyLength === 0)
			copyLength = source.byteLength;

		if (this.remainingBytes < copyLength)
			throw new Error('BufferWrapper.writeBuffer(' + copyLength + ') out-of-bounds [> ' + this.remainingBytes + ']');

		new Uint8Array(source).set(new Uint8Array(this.buffer), this.offset);
		this.offset += copyLength;
	}

	/**
	 * Check if the buffer starts with the given string.
	 * @param input - The string to check for.
	 * @param encoding - The encoding to use (default: utf8)
	 * @returns True if the buffer starts with the given string.
	 */
	startsWith(input: string, encoding?: BufferEncoding): boolean {
		this.seek(0);
		return this.readString(input.length, encoding) === input;
	}

	/**
	 * Get the index of the given byte from start.
	 * @param byte - The byte to find.
	 * @param start - Defaults to the current reader offset.
	 * @returns Index of the byte, or -1 if not found.
	 */
	indexOf(byte: number, start: number = this.offset): number {
		const resetPos = this.offset;
		this.seek(start);

		while (this.remainingBytes > 0) {
			const mark = this.offset;
			if (this.readUInt8() === byte) {
				this.seek(resetPos);
				return mark;
			}
		}

		this.seek(resetPos);
		return -1;
	}

	/**
	 * Assign a data URL for this buffer.
	 * @returns {string}
	 */
	getDataURL(): string {
		if (this.dataURL === undefined)
			this.dataURL = URL.createObjectURL(this.toBlob());

		return this.dataURL;
	}

	/**
	 * Revoke the data URL assigned to this buffer.
	 */
	revokeDataURL(): void {
		if (this.dataURL !== undefined) {
			URL.revokeObjectURL(this.dataURL);
			this.dataURL = undefined;
		}
	}
}