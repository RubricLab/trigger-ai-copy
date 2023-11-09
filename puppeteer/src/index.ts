import puppeteer from "@cloudflare/puppeteer";

export interface Env {
	BROWSER: DurableObjectNamespace;
	BUCKET: R2Bucket;
	BUCKET_URL: string;
	BROWSERLESS_KEY: string;
}

/**
 * Cloudflare Worker to screenshot a page and optionally update its headings
 */
const worker = {
	async fetch(request: Request, env: Env): Promise<Response> {
		try {
			const body: any = await request.json();

			const { url: pageUrl, newHeadings, voice, fullPage = false } = body;

			if (!pageUrl) return new Response("Please include a URL to visit");

			const url = new URL(pageUrl).toString();
			const siteName = url.replace(/https:\/\//g, "").replace(/\.|\//g, "");
			const fileName = `${siteName}${voice ? "-" + voice : ""}.jpeg`;
			const fileUrl = `${env.BUCKET_URL}/${fileName}`;

			const cachedFile = await env.BUCKET.get(fileName);
			if (cachedFile && !newHeadings) return new Response(fileUrl);

			const browserWSEndpoint = `wss://chrome.browserless.io?token=${env.BROWSERLESS_KEY}`;
			const browser = await puppeteer.connect({
				browserWSEndpoint,
			});

			const page = await browser.newPage();

			await page.setViewport({ width: 1280, height: 1920 });
			await page.goto(url, {
				waitUntil: "networkidle2",
				timeout: 30 * 1000,
			});

			// Loop over and replace headings if applicable
			if (newHeadings) {
				const headings = await page.$$("h1, h2, h3, p");

				for (const newHeading of newHeadings) {
					if (newHeading.id < headings.length) {
						await page.evaluate(
							(el: any, value: string) => (el.textContent = value),
							headings[newHeading.id],
							newHeading.text
						);
					}
				}
			}

			// Add watermark
			await page.evaluate(() => {
				//@ts-ignore document not defined
				const watermark = document.createElement("div");
				watermark.style.cssText =
					"position: fixed; top: 0.5rem; right: 0.5rem; padding: 0.5rem 1rem 0.5rem 1rem; background: black; border-radius: 5px; z-index: 999;";
				watermark.innerText = "Made with Trigger.dev";

				//@ts-ignore document not defined
				document.body.appendChild(watermark);
			});

			// Take a screenshot
			const screenshotBuffer = await page.screenshot({
				fullPage: fullPage,
				captureBeyondViewport: fullPage,
				type: "jpeg",
			});

			await env.BUCKET.put(fileName, screenshotBuffer);

			await browser.close();

			return new Response(fileUrl);
		} catch (error) {
			console.error("Failed to reach browser", error);
			return new Response("Failed to reach browser", { status: 500 });
		}
	},
};

export default worker;
