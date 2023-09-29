import puppeteer from "@cloudflare/puppeteer";

export interface Env {
	BROWSER: Fetcher;
	BUCKET: R2Bucket;
	BUCKET_URL: string;
}

/**
 * Cloudflare Worker to collect headings from a client-rendered website
 */
const worker = {
	async fetch(request: Request, env: Env): Promise<Response> {
		if (request.method !== "POST") {
			return new Response("Please use the POST method", { status: 405 });
		}

		const body = (await request.json()) as any;
		const { url: pageUrl, newHeadings, fullPage = false } = body;

		if (!pageUrl) {
			return new Response("Please include a URL to visit");
		}

		const url = new URL(pageUrl).toString();
		const filename = url.replace(/https:\/\//g, "").replace(/\.|\//g, "-");

		try {
			const browser = await puppeteer.launch(env.BROWSER);

			const page = await browser.newPage();
			await page.goto(url, { waitUntil: "networkidle0" });
			await page.setViewport({
				width: 1280,
				height: 960,
				deviceScaleFactor: 1,
			});

			if (newHeadings) {
				const headings = await page.$$("h1, h2, h3");
				for (const element of newHeadings) {
					if (element.id < headings.length) {
						await page.evaluate(
							(el, value) => (el.textContent = value),
							headings[element.id],
							element.text
						);
					}
				}
			}

			const screenshotBuffer = await page.screenshot({
				fullPage: fullPage,
				captureBeyondViewport: fullPage,
			});

			await env.BUCKET.put(
				`${filename}${newHeadings ? "-remixed" : ""}.png`,
				screenshotBuffer
			);

			await browser.close();

			return new Response(
				`${env.BUCKET_URL}/${filename}${newHeadings ? "-remixed" : ""}.png`,
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
