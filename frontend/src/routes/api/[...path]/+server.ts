import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

const BACKEND_URL = env.BACKEND_URL ?? 'http://localhost:8000';

export const GET: RequestHandler = async ({ params, request, url }) => {
	return proxyRequest('GET', params.path, request, url);
};

export const POST: RequestHandler = async ({ params, request, url }) => {
	return proxyRequest('POST', params.path, request, url);
};

export const PUT: RequestHandler = async ({ params, request, url }) => {
	return proxyRequest('PUT', params.path, request, url);
};

export const DELETE: RequestHandler = async ({ params, request, url }) => {
	return proxyRequest('DELETE', params.path, request, url);
};

async function proxyRequest(
	method: string,
	path: string,
	request: Request,
	url: URL
): Promise<Response> {
	const backendUrl = `${BACKEND_URL}/api/${path}${url.search}`;

	const headers = new Headers();
	const contentType = request.headers.get('content-type');
	if (contentType) headers.set('content-type', contentType);

	const authorization = request.headers.get('authorization');
	if (authorization) headers.set('authorization', authorization);

	const body = method !== 'GET' ? await request.text() : undefined;

	const response = await fetch(backendUrl, {
		method,
		headers,
		body
	});

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: {
			'content-type': response.headers.get('content-type') ?? 'application/json'
		}
	});
}
