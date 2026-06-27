/**
 * Copyright (c) 2026 Clove Twilight
 * Licensed under the ESAL-2.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename, join } from 'node:path';

import { Router, type Request, type Response } from 'express';

import { STATIC_DIR, DATA_DIR } from '../core/config.js';
import { getMembers, getFronters } from '../services/pluralkit.js';
import { escapeHtml, normalizeHex } from '../utils/html.js';

export const staticRouter = Router();

const INDEX_HTML_PATH = join(STATIC_DIR, 'index.html');
const DEFAULT_AVATAR = 'https://raw.githubusercontent.com/doughmination/Doughmination/main/icon.png';

// ============================================================================
// SEO & CRAWLER FILES
// ============================================================================

const ROBOTS_TXT = `# Doughmination System® - Robots.txt
User-agent: *
Allow: /
Crawl-delay: 1

# Allow specific bots
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Slurp
Allow: /

# Block bad bots
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: MJ12bot
Disallow: /

# Block common exploit attempts
Disallow: /vendor/
Disallow: /.env
Disallow: /HNAP1/
Disallow: /onvif/
Disallow: /PSIA/
Disallow: /index.php
Disallow: /eval-stdin.php
Disallow: /api/
Disallow: /admin/
Disallow: /ws

# Sitemap
Sitemap: https://doughmination.co.uk/sitemap.xml
`;

/** Serve enhanced robots.txt */
staticRouter.get('/robots.txt', (_req: Request, res: Response) => {
  res.type('text/plain').send(ROBOTS_TXT);
});

/** Generate dynamic sitemap with all member pages */
staticRouter.get('/sitemap.xml', async (_req: Request, res: Response) => {
  const today = new Date().toISOString().slice(0, 10);

  try {
    const members = await getMembers();

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Homepage -->
  <url>
    <loc>https://doughmination.co.uk/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Admin/Login Pages -->
  <url>
    <loc>https://doughmination.co.uk/admin/login</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
`;

    // Add member pages
    for (const member of members) {
      const memberName = String(member.name ?? '').replace(/ /g, '%20');
      const avatarUrl = member.avatar_url ?? '';
      const displayName = member.display_name ?? member.name;

      sitemap += `  <!-- Member: ${displayName} -->
  <url>
    <loc>https://doughmination.co.uk/${memberName}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>`;

      if (avatarUrl) {
        sitemap += `
    <image:image>
      <image:loc>${avatarUrl}</image:loc>
      <image:title>${displayName}</image:title>
    </image:image>`;
      }

      sitemap += `
  </url>
`;
    }

    sitemap += '</urlset>';
    res.type('application/xml').send(sitemap);
  } catch (err) {
    console.error(`Error generating sitemap: ${String(err)}`);
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://doughmination.co.uk/</loc>
    <lastmod>${today}</lastmod>
  </url>
</urlset>`);
  }
});

/** Serve favicon */
staticRouter.get('/favicon.ico', (_req: Request, res: Response) => {
  const faviconPath = join(STATIC_DIR, 'favicon.ico');
  if (existsSync(faviconPath)) {
    res.sendFile(faviconPath);
    return;
  }
  res.status(404).json({ detail: 'Favicon not found' });
});

// ============================================================================
// AVATAR SERVING
// ============================================================================

/** Serve avatar images with proper content type */
staticRouter.get('/avatars/:filename', (req: Request, res: Response) => {
  // Sanitize filename (strips any directory traversal, like Path(filename).name)
  const safeFilename = basename(req.params.filename);
  const filePath = join(DATA_DIR, safeFilename);

  if (!existsSync(filePath)) {
    res.status(404).json({ detail: 'Avatar not found' });
    return;
  }

  // Determine media type
  const lower = safeFilename.toLowerCase();
  let mediaType = 'application/octet-stream';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
    mediaType = 'image/jpeg';
  } else if (lower.endsWith('.png')) {
    mediaType = 'image/png';
  } else if (lower.endsWith('.gif')) {
    mediaType = 'image/gif';
  }

  res.set({
    'Cache-Control': 'public, max-age=3600',
    'Access-Control-Allow-Origin': '*',
  });
  res.type(mediaType);
  res.sendFile(filePath);
});

// ============================================================================
// DYNAMIC EMBEDS FOR MEMBER PAGES
// ============================================================================

/** Replace the <head>...</head> block in index.html with generated meta tags. */
function injectMetaHead(html: string, metaHead: string): string {
  return html.replace(/<head>[\s\S]*?<\/head>/, metaHead);
}

/** Serve fronting page with dynamic meta tags */
staticRouter.get('/fronting', async (_req: Request, res: Response) => {
  try {
    const frontersData = await getFronters();
    const members: Array<Record<string, any>> = frontersData.members ?? [];

    if (members.length === 0) {
      res.sendFile(INDEX_HTML_PATH);
      return;
    }

    // Build fronter names
    const fronterNames = members.map((member) =>
      escapeHtml(member.display_name || member.name || 'Unknown'),
    );

    // Primary fronter
    const primary = members[0];
    const primaryName = escapeHtml(primary.display_name || primary.name || 'Unknown');
    const primaryPronouns = escapeHtml(primary.pronouns || 'they/them');
    const primaryColor = normalizeHex(primary.color);
    const primaryAvatar = primary.avatar_url || DEFAULT_AVATAR;
    // Note: the Python original also computed an equivalent "primary
    // description" value here and never used it in the final meta_head
    // output — dropped rather than ported, since there's no reason to
    // carry forward dead code.

    // Create title and description
    let title: string;
    let description: string;
    if (fronterNames.length === 1) {
      title = `${primaryName} is Fronting`;
      description = `${primaryName} (${primaryPronouns}) is currently fronting in the Doughmination System®`;
    } else {
      const frontersList = `${fronterNames.slice(0, -1).join(', ')} and ${fronterNames[fronterNames.length - 1]}`;
      title = `${frontersList} are Fronting`;
      description = `${frontersList} are currently co-fronting in the Doughmination System®`;
    }

    const keywords = `plural system, fronting, current fronters, Doughmination System, ${fronterNames.join(', ')}`;

    // Structured data
    const membersStructured = members.map((member) => {
      const memberName = escapeHtml(member.display_name || member.name || 'Unknown');
      const memberAvatar = member.avatar_url || DEFAULT_AVATAR;
      const memberUrlName = String(member.name ?? '').replace(/ /g, '%20');

      return {
        '@type': 'Person',
        name: memberName,
        image: memberAvatar,
        url: `https://doughmination.co.uk/${memberUrlName}`,
        identifier: member.id ?? '',
      };
    });

    const structuredData = `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Current Fronters",
      "description": "${description}",
      "itemListElement": ${JSON.stringify(membersStructured)}
    }
    </script>`;

    // Read and modify index.html
    const htmlContent = await readFile(INDEX_HTML_PATH, 'utf-8');

    const metaHead = `
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
    <title>${title} | Doughmination System®</title>
    <meta name="description" content="${description}" />
    <meta name="keywords" content="${keywords}" />
    <meta name="theme-color" content="${primaryColor}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${primaryAvatar}" />
    <meta property="og:url" content="https://doughmination.co.uk/fronting" />
    ${structuredData}
</head>
`;

    res.type('html').send(injectMetaHead(htmlContent, metaHead));
  } catch (err) {
    console.error(`Error serving fronting page: ${String(err)}`);
    res.sendFile(INDEX_HTML_PATH);
  }
});

const SKIP_ROUTES = ['api', 'admin', 'assets', 'avatars', 'favicon.ico', 'robots.txt', 'sitemap.xml', 'ws', 'fonts'];

/** Serve member page with dynamic meta tags */
staticRouter.get('/:member_name', async (req: Request, res: Response) => {
  const memberName = req.params.member_name;

  // Skip non-member routes
  if (SKIP_ROUTES.some((route) => memberName.startsWith(route))) {
    res.status(404).end();
    return;
  }

  try {
    const members = await getMembers();
    const member = members.find((m) => String(m.name ?? '').toLowerCase() === memberName.toLowerCase());

    if (!member) {
      res.sendFile(INDEX_HTML_PATH);
      return;
    }

    // Extract member data
    const color = normalizeHex(member.color);
    const pronouns = escapeHtml(member.pronouns || 'they/them');
    const displayName = escapeHtml(member.display_name || member.name);
    const description = escapeHtml(member.description || 'Member of the Doughmination System®');
    const avatarUrl = member.avatar_url || DEFAULT_AVATAR;
    const memberId = member.id ?? '';

    // Build keywords
    const tags: string[] = member.tags ?? [];
    const tagsText = tags.length > 0 ? tags.join(', ') : '';
    let keywords = `plural system, ${displayName}, system member, Doughmination System, ${pronouns}`;
    if (tagsText) {
      keywords += `, ${tagsText}`;
    }

    // Structured data
    const structuredData = `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "${displayName}",
      "description": "${description}",
      "image": "${avatarUrl}",
      "url": "https://doughmination.co.uk/${memberName}",
      "identifier": "${memberId}"
    }
    </script>`;

    // Read and modify index.html
    const htmlContent = await readFile(INDEX_HTML_PATH, 'utf-8');

    const metaHead = `
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
    <title>${displayName} (${pronouns}) | Doughmination System®</title>
    <meta name="description" content="${description} - Member of the Doughmination System®. Pronouns: ${pronouns}" />
    <meta name="keywords" content="${keywords}" />
    <meta name="theme-color" content="${color}" />
    <meta property="og:title" content="${displayName} - ${pronouns}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${avatarUrl}" />
    <meta property="og:url" content="https://doughmination.co.uk/${memberName}" />
    ${structuredData}
</head>
`;

    res.type('html').send(injectMetaHead(htmlContent, metaHead));
  } catch (err) {
    console.error(`Error serving member page: ${String(err)}`);
    res.sendFile(INDEX_HTML_PATH);
  }
});

// ============================================================================
// ROOT / FRONTEND
// ============================================================================

/** Serve the main frontend application */
staticRouter.get('/', (_req: Request, res: Response) => {
  res.sendFile(INDEX_HTML_PATH);
});