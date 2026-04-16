import crypto from 'crypto';

const JOB_SECRET = process.env.JOB_SECRET;

if (!JOB_SECRET) {
	throw new Error('JOB_SECRET environment variable is not set');
}

export function signJobPayload(payload: object): string {
	return crypto
		.createHmac('sha256', JOB_SECRET!)
		.update(JSON.stringify(payload))
		.digest('hex');
}

export function verifyJobPayload(payload: object, signature: string): boolean {
	const expected = signJobPayload(payload);
	return crypto.timingSafeEqual(
		Buffer.from(expected, 'hex'),
		Buffer.from(signature, 'hex')
	);
}
