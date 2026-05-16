<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <xsl:output method="html" indent="yes" encoding="UTF-8"
              doctype-system="about:legacy-compat"/>

  <xsl:template match="/">
    <html lang="en">
    <head>
      <meta charset="utf-8"/>
      <title>Sitemap · Lotus Sharm</title>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <style>
        :root {
          --bg: #0a2828;
          --bg-2: #0d3a3a;
          --panel: rgba(255,255,255,0.04);
          --panel-hover: rgba(201,168,106,0.08);
          --border: rgba(201,168,106,0.15);
          --border-strong: rgba(201,168,106,0.35);
          --text: #f7f1e3;
          --muted: rgba(247,241,227,0.6);
          --muted-2: rgba(247,241,227,0.4);
          --accent: #c9a86a;
          --accent-2: #d9bf86;
          --accent-deep: #a88a52;
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Cairo", system-ui, sans-serif;
          background:
            radial-gradient(ellipse at top right, rgba(201,168,106,0.15), transparent 55%),
            radial-gradient(ellipse at bottom left, rgba(19,73,73,0.55), transparent 60%),
            linear-gradient(135deg, var(--bg) 0%, var(--bg-2) 50%, var(--bg) 100%);
          background-attachment: fixed;
          color: var(--text);
          min-height: 100vh;
          line-height: 1.55;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 32px 20px; }
        header {
          margin-bottom: 28px;
          padding-bottom: 22px;
          border-bottom: 1px solid var(--border);
          position: relative;
        }
        header::after {
          content: "";
          position: absolute;
          left: 0; right: 0; bottom: -1px; height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent) 50%, transparent);
        }
        .brand {
          display: inline-flex; align-items: center; gap: 12px;
          margin-bottom: 14px;
          padding: 8px 14px;
          background: rgba(201,168,106,0.10);
          border: 1px solid var(--border-strong);
          border-radius: 999px;
          font-size: 11px;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: var(--accent);
          font-weight: 800;
        }
        .brand-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 14px var(--accent);
        }
        h1 {
          font-size: clamp(28px, 5vw, 44px);
          font-weight: 800;
          margin: 0 0 8px;
          letter-spacing: -0.01em;
          line-height: 1.05;
        }
        h1 .gradient {
          background: linear-gradient(135deg, var(--accent-2) 0%, var(--accent) 50%, var(--accent-deep) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .subtitle {
          color: var(--muted);
          font-size: 14px;
          max-width: 720px;
        }
        .stats {
          display: flex; flex-wrap: wrap; gap: 12px;
          margin: 20px 0 0;
        }
        .stat {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 12px 18px;
          min-width: 140px;
        }
        .stat-label {
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--muted-2);
          font-weight: 700;
          margin-bottom: 4px;
        }
        .stat-value {
          font-size: 24px;
          font-weight: 800;
          color: var(--accent);
          font-variant-numeric: tabular-nums;
          line-height: 1;
        }
        .table-wrap {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 12px 40px -10px rgba(0,0,0,0.5);
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        thead th {
          background: rgba(13,58,58,0.6);
          color: var(--accent);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          padding: 14px 16px;
          text-align: left;
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
        }
        tbody td {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(201,168,106,0.08);
          color: var(--text);
          vertical-align: middle;
        }
        tbody tr:last-child td { border-bottom: none; }
        tbody tr { transition: background 0.15s ease; }
        tbody tr:hover { background: var(--panel-hover); }
        .idx {
          width: 50px;
          color: var(--muted-2);
          font-variant-numeric: tabular-nums;
          font-weight: 700;
          font-size: 11px;
        }
        .url {
          word-break: break-all;
        }
        .url a {
          color: var(--text);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.15s;
        }
        .url a:hover { color: var(--accent); text-decoration: underline; }
        .lang-pill {
          display: inline-block;
          padding: 2px 8px;
          margin: 1px 2px;
          font-size: 10px;
          font-weight: 700;
          background: rgba(201,168,106,0.12);
          border: 1px solid rgba(201,168,106,0.25);
          border-radius: 4px;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .date {
          color: var(--muted);
          font-size: 12px;
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
        }
        .freq, .priority {
          font-size: 12px;
          color: var(--muted);
        }
        .priority-bar {
          display: inline-flex; align-items: center; gap: 8px;
        }
        .priority-bar-fill {
          width: 60px; height: 5px; border-radius: 999px;
          background: rgba(201,168,106,0.12);
          overflow: hidden;
        }
        .priority-bar-fill > span {
          display: block; height: 100%;
          background: linear-gradient(90deg, var(--accent-deep), var(--accent));
          border-radius: 999px;
        }
        footer {
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid var(--border);
          color: var(--muted-2);
          font-size: 12px;
          text-align: center;
        }
        footer a { color: var(--accent); text-decoration: none; }
        footer a:hover { text-decoration: underline; }
        @media (max-width: 720px) {
          .container { padding: 20px 12px; }
          .stat { min-width: auto; flex: 1 1 calc(50% - 6px); }
          thead th:nth-child(3), tbody td:nth-child(3),
          thead th:nth-child(4), tbody td:nth-child(4),
          thead th:nth-child(5), tbody td:nth-child(5) { display: none; }
          .url a { font-size: 12px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header>
          <div class="brand">
            <span class="brand-dot"></span>
            <span>✦ Lotus Sharm · Sitemap</span>
          </div>
          <h1>
            XML <span class="gradient">Sitemap</span>
          </h1>
          <p class="subtitle">
            This is a machine-readable index of all pages on <strong>lotussharm.com</strong>.
            Submitted to Google Search Console and Bing Webmaster Tools for indexing.
            <br/>
            هذه نسخة الفهرس الكامل لكل صفحات موقع لوتس شرم للسياحة.
          </p>
          <div class="stats">
            <div class="stat">
              <div class="stat-label">Total URLs</div>
              <div class="stat-value"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></div>
            </div>
            <div class="stat">
              <div class="stat-label">Languages</div>
              <div class="stat-value">4</div>
            </div>
            <div class="stat">
              <div class="stat-label">Last Build</div>
              <div class="stat-value" style="font-size:14px; letter-spacing:-0.01em;">
                <xsl:value-of select="substring(sitemap:urlset/sitemap:url[1]/sitemap:lastmod, 1, 10)"/>
              </div>
            </div>
          </div>
        </header>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th class="idx">#</th>
                <th>URL</th>
                <th>Last modified</th>
                <th>Frequency</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td class="idx">
                    <xsl:value-of select="position()"/>
                  </td>
                  <td class="url">
                    <a target="_blank" rel="noopener">
                      <xsl:attribute name="href">
                        <xsl:value-of select="sitemap:loc"/>
                      </xsl:attribute>
                      <xsl:value-of select="sitemap:loc"/>
                    </a>
                    <div style="margin-top:6px;">
                      <xsl:for-each select="xhtml:link[@rel='alternate']">
                        <span class="lang-pill">
                          <xsl:value-of select="@hreflang"/>
                        </span>
                      </xsl:for-each>
                    </div>
                  </td>
                  <td class="date">
                    <xsl:value-of select="substring(sitemap:lastmod, 1, 10)"/>
                  </td>
                  <td class="freq">
                    <xsl:value-of select="sitemap:changefreq"/>
                  </td>
                  <td class="priority">
                    <span class="priority-bar">
                      <span class="priority-bar-fill">
                        <span>
                          <xsl:attribute name="style">
                            width: <xsl:value-of select="number(sitemap:priority) * 100"/>%;
                          </xsl:attribute>
                        </span>
                      </span>
                      <strong><xsl:value-of select="sitemap:priority"/></strong>
                    </span>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>

        <footer>
          © 2026 Lotus Sharm Tourism · سجل تجاري 269494 ·
          <a href="https://lotussharm.com">lotussharm.com</a> ·
          <a href="https://lotussharm.com/robots.txt">robots.txt</a>
        </footer>
      </div>
    </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
