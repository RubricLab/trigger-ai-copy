import { NextApiRequest, NextApiResponse } from "next";

import chromium from "chrome-aws-lambda";
import { load } from "cheerio";

export const GET = async (req: NextApiRequest, res: NextApiResponse) => {
  const browser = await chromium.puppeteer.launch({
    args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: true,
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();

  await page.goto("https://trigger.dev", { waitUntil: "networkidle2" });

  // important part
  const content = await page.content();
  const queryFunction = load(content);
  const headingElements = queryFunction("h1, h2, h3");

  let headings: any[] = [];
  headingElements.each((_, element: any) => {
    headings.push({
      tag: element.tagName,
      text: queryFunction(element).text(),
    });
  });

  await browser.close();

  res.status(200).send({ headings });

  res.json({ message: "hello" });
};
