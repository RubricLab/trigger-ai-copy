import puppeteer from "@cloudflare/puppeteer";
import { load } from "cheerio";

export interface Env {
	BROWSER: Fetcher;
	BUCKET: R2Bucket;
}

const BUCKET_URL = "https://pub-04cd4de7299e4dbf942ccff55ae279d1.r2.dev";

/**
 * Cloudflare Worker to collect headings from a client-rendered website
 */
const worker = {
	async fetch(request: Request, env: Env): Promise<Response> {
		if (request.method !== "POST") {
			return new Response("Please use the POST method", { status: 405 });
		}

		const body = (await request.json()) as any;

		if (!body?.url) {
			return new Response("Please include a URL to visit");
		}

		const url = new URL(body.url).toString();

		const filename = `${url.replaceAll("/", "")}.png`;

		// Return cached screenshot if available
		const img = await env.BUCKET.get(filename);

		if (img) {
			return new Response(`${BUCKET_URL}/${filename}`, {
				headers: {
					"content-type": "text/plain",
				},
			});
		}

		try {
			const browser = await puppeteer.launch(env.BROWSER);

			const page = await browser.newPage();
			await page.goto(url);

			// Select all headings in page
			const data = await page.content();
			const querySelector = load(data);
			const headingElements = querySelector("h1, h2, h3");

			const headings: { tag: string; text: string }[] = [];
			headingElements.each((_, element) => {
				headings.push({
					tag: element.tagName,
					text: querySelector(element).text(),
				});
			});

			const screenshotBuffer = await page.screenshot();

			await browser.close();

			await env.BUCKET.put(filename, screenshotBuffer);

			return new Response(`${BUCKET_URL}/${filename}`, {
				headers: {
					"content-type": "text/plain",
				},
			});
		} catch (error) {
			console.error("Failed to read page", error);
			return new Response("Failed to read page", { status: 500 });
		}
	},
};

export default worker;
