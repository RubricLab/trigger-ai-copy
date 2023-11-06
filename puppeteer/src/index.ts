import puppeteer from "@cloudflare/puppeteer";

export interface Env {
	FETCHER: Fetcher;
	BROWSER: DurableObjectNamespace;
	BUCKET: R2Bucket;
	BUCKET_URL: string;
}

/**
 * Cloudflare Worker to screenshot a page and optionally update its headings
 */
const worker = {
	async fetch(request: Request, env: Env): Promise<Response> {
		try {
			// Forward request to the durable browser
			let browserId = env.BROWSER.idFromName("browser");
			let durableBrowser = env.BROWSER.get(browserId);

			const res = await durableBrowser.fetch(request);

			if (res.status === 500) return res;

			const fileName: string = await res.text();
			const fileUrl = `${env.BUCKET_URL}/${fileName}`;

			return new Response(JSON.stringify({ fileUrl }));
		} catch (error) {
			console.error("Failed to reach browser", error);
			return new Response("Failed to reach browser", { status: 500 });
		}
	},
};

export default worker;

/**
 * Durable Object to keep a browser session alive.
 * Defined in same file because Cloudflare seems to throw an error otherwise:
 * github.com/cloudflare/workers-sdk/issues/3738
 */
const secondsToLive = 60;
const tenSeconds = 10 * 1000;
export class DurableBrowser {
	state: any;
	env: Env;
	secondsAlive: number;
	storage: any;
	browser: any;

	constructor(state: any, env: Env) {
		this.state = state;
		this.env = env;
		this.secondsAlive = 0;
		this.storage = this.state.storage;
	}

	async fetch(request: Request) {
		// Reuse open browser session if available
		if (!this.browser) {
			console.log("Browser: not found - starting new instance");
			try {
				this.browser = await puppeteer.launch(this.env.FETCHER);
			} catch (e) {
				console.log(`Browser: could not start instance. Error: ${e}`);
				return new Response("Failed to start browser", { status: 500 });
			}
		}

		// Reset keptAlive after each call to the browser
		this.secondsAlive = 0;

		const body: any = await request.json();

		const { url: pageUrl, newHeadings, voice, fullPage = false } = body;

		if (!pageUrl) {
			return new Response("Please include a URL to visit");
		}

		const url = new URL(pageUrl).toString();
		const siteName = url.replace(/https:\/\//g, "").replace(/\.|\//g, "");
		const fileName = `${siteName}${voice ? "-" + voice : ""}.jpeg`;

		const cachedFile = await this.env.BUCKET.get(fileName);
		console.log(`Browser: cached file: ${cachedFile}`);
		if (cachedFile && !newHeadings) {
			return new Response(fileName);
		}

		try {
			const page = await this.browser.newPage();

			await page.setViewport({ width: 1536, height: 864 });
			await page.goto(url, { waitUntil: "networkidle0" });
			await page.setViewport({
				width: 1280,
				height: 960,
			});

			// Loop over and replace headings if applicable
			if (newHeadings) {
				const headings = await page.$$("h1, h2, h3");

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

			// Take a screenshot
			const screenshotBuffer = await page.screenshot({
				fullPage: fullPage,
				captureBeyondViewport: fullPage,
				type: "jpeg",
			});

			await this.env.BUCKET.put(fileName, screenshotBuffer);

			// Reset keptAlive after performing tasks to the DO.
			this.secondsAlive = 0;
			let currentAlarm = await this.storage.getAlarm();
			if (currentAlarm == null) {
				console.log(`Browser: setting alarm`);
				await this.storage.setAlarm(Date.now() + tenSeconds);
			}

			return new Response(fileName);
		} catch (error) {
			console.error("Failed to read page", error);
			return new Response("Failed to read page", { status: 500 });
		}
	}

	// Callback to extend browser life
	async alarm() {
		this.secondsAlive += 10;

		if (this.secondsAlive < secondsToLive) {
			console.log(`Browser: up for ${this.secondsAlive}s. Extending lifespan.`);
			await this.storage.setAlarm(Date.now() + tenSeconds);
		} else {
			console.log(`Browser: past ${secondsToLive}s life. Shutting down.`);
			await this.browser.close();
		}
	}
}
