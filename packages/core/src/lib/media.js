/* ============================================================
   Media helpers — pick a picture from the device, downscale it
   and hand back a data URL that survives a localStorage round
   trip. Everything is local-first: no uploads, no server.
   ============================================================ */

export const IMAGE_TYPES = 'image/png,image/jpeg,image/jpg,image/webp,image/gif,image/avif';

/** Largest edge we keep for each kind of picture. Keeps the persisted state small. */
export const MAX_EDGE = { avatar: 480, banner: 1280, cover: 1280 };

/** Rough byte budget we aim for per stored picture. */
const TARGET_BYTES = 260_000;

export const isImageFile = (f) => !!f && /^image\//.test(f.type || '');

export const looksLikeImageUrl = (u) =>
	typeof u === 'string' && /^(https?:\/\/|data:image\/|blob:)/i.test(u.trim());

/** Human friendly size string for the "about to store" hint. */
export const byteSize = (s) => {
	if (!s) return '0 KB';
	const b = s.length;
	if (b < 1024) return `${b} B`;
	if (b < 1024 * 1024) return `${Math.round(b / 1024)} KB`;
	return `${(b / 1024 / 1024).toFixed(1)} MB`;
};

/**
 * Read a File, downscale it on a canvas and resolve a JPEG data URL.
 * Falls back to the raw data URL when the canvas is unavailable.
 */
export function fileToImage(file, { max = 1280, quality = 0.78 } = {}) {
	return new Promise((resolve, reject) => {
		if (!file) return reject(new Error('no-file'));
		if (!isImageFile(file)) return reject(new Error('not-image'));

		const reader = new FileReader();
		reader.onerror = () => reject(new Error('read-failed'));
		reader.onload = () => {
			const src = String(reader.result);
			shrink(src, { max, quality }).then(resolve).catch(() => resolve(src));
		};
		reader.readAsDataURL(file);
	});
}

/** Decode + downscale an image source (data URL or same-origin URL) to a JPEG data URL. */
export function shrink(src, { max = 1280, quality = 0.78 } = {}) {
	return new Promise((resolve, reject) => {
		if (typeof document === 'undefined') return reject(new Error('no-dom'));
		const img = new Image();
		img.decoding = 'async';
		img.onerror = () => reject(new Error('decode-failed'));
		img.onload = () => {
			try {
				const longest = Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height);
				let scale = Math.min(1, max / (longest || max));
				let q = quality;
				let out = draw(img, scale, q);
				// if still heavy, step the quality down rather than the dimensions
				let guard = 0;
				while (out.length > TARGET_BYTES && guard < 4) {
					q = Math.max(0.42, q - 0.14);
					out = draw(img, scale, q);
					guard++;
				}
				resolve(out);
			} catch (e) {
				reject(e);
			}
		};
		img.src = src;
	});

	function draw(img, scale, q) {
		const w = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
		const h = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));
		const c = document.createElement('canvas');
		c.width = w;
		c.height = h;
		const ctx = c.getContext('2d');
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0, 0, w, h);
		ctx.imageSmoothingQuality = 'high';
		ctx.drawImage(img, 0, 0, w, h);
		return c.toDataURL('image/jpeg', q);
	}
}

/** Confirm a remote URL actually resolves to a picture before we store it. */
export function checkUrl(url, timeout = 6000) {
	return new Promise((resolve) => {
		if (typeof document === 'undefined') return resolve(false);
		let done = false;
		const finish = (v) => {
			if (done) return;
			done = true;
			resolve(v);
		};
		const img = new Image();
		img.onload = () => finish(true);
		img.onerror = () => finish(false);
		setTimeout(() => finish(false), timeout);
		img.src = url;
	});
}

/** Turn a pasted/entered string into something safe to put in an <img src>. */
export function normaliseUrl(raw) {
	const s = String(raw ?? '').trim();
	if (!s) return '';
	if (/^data:image\//i.test(s)) return s;
	if (/^\/\//.test(s)) return `https:${s}`;
	if (!/^https?:\/\//i.test(s)) return `https://${s.replace(/^\/+/, '')}`;
	return s;
}

/** Pretty label for the link field — drops the protocol and trailing slash. */
export const prettyUrl = (u) =>
	String(u ?? '')
		.replace(/^https?:\/\//i, '')
		.replace(/^www\./i, '')
		.replace(/\/$/, '');
