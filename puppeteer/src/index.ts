import puppeteer from '@cloudflare/puppeteer';
import { load } from 'cheerio';
export interface Env {
	BROWSER: Fetcher;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const { searchParams } = new URL(request.url);

		let url = searchParams.get('url');

		if (url) {
			url = new URL(url).toString();

			try {
				// TODO: remove console.logs
				console.log('env.BROWSER', env.BROWSER);

				const browser = await puppeteer.launch(env.BROWSER);

				const page = await browser.newPage();
				await page.goto(url);

				const content = await page.content();
				const querySelector = load(content);
				const headingElements = querySelector('h1, h2, h3');

				const headings: { tag: string; text: string }[] = [];
				headingElements.each((_, element) => {
					headings.push({
						tag: element.tagName,
						text: querySelector(element).text(),
					});
				});

				await browser.close();

				return new Response(JSON.stringify(headings), {
					headers: {
						'content-type': 'application/json',
					},
				});
			} catch (error) {
				console.error('Failed to read page', error);
				return new Response('Failed to read page', { status: 500 });
			}
		} else {
			return new Response('Please add an ?url=https://example.com/ parameter');
		}
	},
};
