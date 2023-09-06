/**
 * Attempt to pull subdomain, hostname, and pathname (no params) from a URL-like string.
 * @returns a valid URL, otherwise null
 */
export const validateUrl = (url: string): string | null => {
  let adjustedUrl = url;

  if (!/^http(s)?:\/\//i.test(url)) {
    adjustedUrl = "https://" + url;
  }

  try {
    const urlObj = new URL(adjustedUrl);

    const domainRegex = /^([\da-z\.-]+)\.([a-z\.]{2,})$/;

    if (!domainRegex.test(urlObj?.hostname)) {
      return null;
    }

    let output = urlObj.hostname + urlObj.pathname;
    output = "https://" + output.replace(/\/$/, "");

    return output;
  } catch {
    return null;
  }
};
