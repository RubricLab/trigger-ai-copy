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
		const body: any = await request.json();

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
				height: 800,
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
				type: "jpeg",
			});

			await env.BUCKET.put(
				`${filename}${newHeadings ? "-remixed" : ""}.jpeg`,
				screenshotBuffer
			);

			await browser.close();

			return new Response(
				`${env.BUCKET_URL}/${filename}${newHeadings ? "-remixed" : ""}.jpeg`,
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
