import puppeteer from "@cloudflare/puppeteer";
import { load } from "cheerio";
export interface Env {
	BROWSER: Fetcher;
}

/**
 * Cloudflare Worker to collect headings from a client-rendered website
 */
export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const { searchParams } = new URL(request.url);
		let url = searchParams.get("url");

		if (!url) {
			return new Response("Please add an ?url=https://example.com/ parameter");
		}

		// Normalize URL
		url = new URL(url).toString();

		try {
			const browser = await puppeteer.launch(env.BROWSER);

			const page = await browser.newPage();
			await page.goto(url);

			// Select all headings in page
			const data = await page.content();
			const querySelector = load(data);
			const headingElements = querySelector("h1, h2, h3");

			console.log("Headings collected");

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
					"content-type": "application/json",
				},
			});
		} catch (error) {
			console.error("Failed to read page", error);
			return new Response("Failed to read page", { status: 500 });
		}
	},
};
