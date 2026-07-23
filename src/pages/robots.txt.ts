import type { APIRoute } from "astro";

const robotsTxt = `
User-agent: *
Disallow: /
Allow: /$
Allow: /posts/

Allow: /archive/
Allow: /anime/
Allow: /diary/
Allow: /albums/
Allow: /devices/
Allow: /about/
Allow: /friends/
Allow: /updates/
Allow: /license/
Allow: /projects/
Allow: /skills/
Allow: /ai-tools/
Allow: /timeline/

Sitemap: ${new URL("sitemap-index.xml", import.meta.env.SITE).href}
`.trim();

export const GET: APIRoute = () => {
	return new Response(robotsTxt, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
		},
	});
};
