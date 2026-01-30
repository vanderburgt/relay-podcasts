import type { Subscription } from '$lib/types.js';

export function parseOPML(xmlString: string): string[] {
	const parser = new DOMParser();
	const doc = parser.parseFromString(xmlString, 'text/xml');
	const outlines = doc.querySelectorAll('outline[xmlUrl], outline[url]');

	return Array.from(outlines)
		.map((outline) => outline.getAttribute('xmlUrl') || outline.getAttribute('url') || '')
		.filter(Boolean);
}

export function generateOPML(subscriptions: Subscription[]): string {
	const items = subscriptions
		.map((sub) => `    <outline type="rss" text="${escapeXml(sub.title)}" xmlUrl="${escapeXml(sub.feedUrl)}" />`)
		.join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Relay Subscriptions</title>
    <dateCreated>${new Date().toISOString()}</dateCreated>
  </head>
  <body>
${items}
  </body>
</opml>`;
}

function escapeXml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export function downloadOPML(subscriptions: Subscription[]): void {
	const opml = generateOPML(subscriptions);
	const blob = new Blob([opml], { type: 'application/xml' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'relay-subscriptions.opml';
	a.click();
	URL.revokeObjectURL(url);
}
