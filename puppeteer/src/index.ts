import puppeteer from "@cloudflare/puppeteer";

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
		const { url: pageUrl, newHeadings } = body;

		if (!pageUrl) {
			return new Response("Please include a URL to visit");
		}

		const url = new URL(pageUrl).toString();

		const filename = url.replaceAll("/", "");

		// Return cached screenshot if available
		const img = await env.BUCKET.get(`${filename}.png`);
		if (img && !newHeadings) {
			return new Response(`${BUCKET_URL}/${filename}.png`, {
				headers: {
					"content-type": "text/plain",
				},
			});
		}

		try {
			const browser = await puppeteer.launch(env.BROWSER);

			const page = await browser.newPage();
			await page.goto(url);

			if (newHeadings) {
				for (const element of newHeadings) {
					const heading = await page.$$("h1, h2, h3");

					if (element.id < heading.length) {
						await page.evaluate(
							(el, value) => (el.textContent = value),
							heading[element.id],
							element.text
						);
					}
				}
			}

			const screenshotBuffer = await page.screenshot({
				fromSurface: false,
			});

			await env.BUCKET.put(
				`${filename}${newHeadings ? "-remixed" : ""}.png`,
				screenshotBuffer
			);

			await browser.close();

			return new Response(
				`${BUCKET_URL}/${filename}${newHeadings ? "-remixed" : ""}.png`,
				{
					headers: {
						"content-type": "text/plain",
					},
				}
			);
		} catch (error) {
			console.error("Failed to read page", error);
			return new Response("Failed to read page", { status: 500 });
		}
	},
};

export default worker;
