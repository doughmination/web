<?xml version="1.0" encoding="UTF-8"?> 
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"> 
    <xsl:output method="html" encoding="UTF-8"/> 
    <xsl:template match="/"> 
        <html> 
            <head> 
                <title>c.stupid.cat Sitemap</title> 
                <style>
                    @font-face {
                        font-family: 'Comic Code';
                        src: url('/css/fonts/ComicCode.woff2');
                    }
                    :root {
                        --base: #1e1e2e;
                        --mantle: #181825;
                        --crust: #11111b;
                        --surface: #313244;
                        --text: #cdd6f4;
                        --subtext: #a6adc8;
                        --pink: #f5c2e7;
                        --blue: #89b4fa;
                    }
                    * {
                        box-sizing: border-box;
                    }
                    body {
                        min-height: 100vh;
                        margin: 0;
                        padding: 2rem 1rem;
                        font-family: "Comic Code", monospace;
                        background:
                        linear-gradient(
                        135deg,
                        var(--base),
                        var(--mantle) 60%,
                        var(--crust)
                        );
                        color: var(--text);
                    }
                    .container {
                        max-width: 850px;
                        margin:auto;
                    }
                    h1 {
                        color:var(--pink);
                        font-size:2rem;
                    }
                    .subtitle {
                        color:var(--subtext);
                    }
                    .card {
                        background:rgba(49,50,68,.85);
                        border-radius:16px;
                        padding:1rem;
                        margin:1rem 0;
                        border:1px solid rgba(245,194,231,.15);
                        transition:.2s ease;
                    }
                    .card:hover {
                        transform:translateY(-3px);
                        border-color:var(--pink);
                    }
                    a {
                        color:var(--blue);
                        text-decoration:none;
                        word-break:break-all;
                    }
                    a:hover {
                        color:var(--pink);
                    }
                    .date {
                        margin-top:.5rem;
                        color:var(--subtext);
                        font-size:.85rem;
                    }
                </style> 
            </head> 
            <body> 
                <div class="container"> 
                    <h1>🌙 c.stupid.cat Sitemap</h1> 
                    <p class="subtitle">A map of everything on the site.</p> 
                    <xsl:for-each select="s:urlset/s:url"> 
                        <div class="card"> 
                            <a href="{s:loc}"> 
                                <xsl:value-of select="s:loc"/> 
                            </a> 
                            <div class="date">Last updated:
                                <xsl:value-of select="s:lastmod"/> 
                            </div> 
                        </div> 
                    </xsl:for-each> 
                </div> 
            </body> 
        </html> 
    </xsl:template> 
</xsl:stylesheet>