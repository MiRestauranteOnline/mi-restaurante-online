<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" 
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">
  
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  
  <xsl:template match="/">
    <html lang="es">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Sitemap - Mi Restaurante Online</title>
        <link rel="icon" href="https://storage.googleapis.com/gpt-engineer-file-uploads/OiOFvHbbnNe6vX3A3rn8oURdWx83/uploads/1759266175780-Mi Restaurante Online Favicon.png" type="image/png"/>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            color: #fafafa;
            padding: 2rem;
            min-height: 100vh;
          }
          
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(70, 167, 158, 0.05);
            border-radius: 16px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(70, 167, 158, 0.15);
            border: 1px solid rgba(70, 167, 158, 0.2);
            backdrop-filter: blur(10px);
          }
          
          h1 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(45deg, #46a79e, #5bc0b5);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-align: center;
            font-weight: 600;
          }
          
          .subtitle {
            text-align: center;
            color: #a3a3a3;
            margin-bottom: 2rem;
            font-size: 1.1rem;
          }
          
          .stats {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
          }
          
          .stat {
            background: rgba(70, 167, 158, 0.1);
            padding: 1rem 2rem;
            border-radius: 8px;
            border: 1px solid rgba(70, 167, 158, 0.3);
          }
          
          .stat-number {
            font-size: 2rem;
            font-weight: bold;
            color: #46a79e;
          }
          
          .stat-label {
            font-size: 0.9rem;
            color: #a3a3a3;
            margin-top: 0.25rem;
          }
          
          .section {
            margin-bottom: 2rem;
          }
          
          .section-title {
            font-size: 1.5rem;
            color: #46a79e;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid rgba(70, 167, 158, 0.3);
          }
          
          .url-list {
            display: grid;
            gap: 0.75rem;
          }
          
          .url-item {
            background: rgba(255, 255, 255, 0.03);
            padding: 1rem;
            border-radius: 8px;
            border-left: 3px solid #46a79e;
            transition: all 0.3s ease;
          }
          
          .url-item:hover {
            background: rgba(70, 167, 158, 0.1);
            transform: translateX(5px);
            box-shadow: 0 4px 12px rgba(70, 167, 158, 0.2);
          }
          
          .url-link {
            color: #5bc0b5;
            text-decoration: none;
            font-weight: 500;
            word-break: break-all;
          }
          
          .url-link:hover {
            color: #6dd5c9;
            text-decoration: underline;
          }
          
          .url-meta {
            display: flex;
            gap: 1.5rem;
            margin-top: 0.5rem;
            font-size: 0.85rem;
            color: #888;
            flex-wrap: wrap;
          }
          
          .meta-item {
            display: flex;
            align-items: center;
            gap: 0.25rem;
          }
          
          .priority-high { color: #46a79e; }
          .priority-medium { color: #d4af37; }
          .priority-low { color: #94a3b8; }
          
          @media (max-width: 768px) {
            body {
              padding: 1rem;
            }
            
            .container {
              padding: 1.5rem;
            }
            
            h1 {
              font-size: 2rem;
            }
            
            .stats {
              gap: 1rem;
            }
            
            .stat {
              padding: 0.75rem 1.5rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🗺️ Sitemap</h1>
          <p class="subtitle">XML Sitemap for Mi Restaurante Online</p>
          
          <div class="stats">
            <div class="stat">
              <div class="stat-number">
                <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/>
              </div>
              <div class="stat-label">Total URLs</div>
            </div>
            <div class="stat">
              <div class="stat-number">
                <xsl:value-of select="count(sitemap:urlset/sitemap:url[sitemap:priority='1.0' or sitemap:priority='0.9' or sitemap:priority='0.8'])"/>
              </div>
              <div class="stat-label">High Priority</div>
            </div>
            <div class="stat">
              <div class="stat-number">
                <xsl:value-of select="count(sitemap:urlset/sitemap:url[contains(sitemap:loc, '/guia/')])"/>
              </div>
              <div class="stat-label">Blog Posts</div>
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">📄 Main Pages</h2>
            <div class="url-list">
              <xsl:for-each select="sitemap:urlset/sitemap:url[not(contains(sitemap:loc, '/guia/'))]">
                <xsl:sort select="sitemap:priority" order="descending"/>
                <div class="url-item">
                  <a class="url-link" href="{sitemap:loc}">
                    <xsl:value-of select="sitemap:loc"/>
                  </a>
                  <div class="url-meta">
                    <span class="meta-item">
                      <xsl:attribute name="class">
                        <xsl:choose>
                          <xsl:when test="sitemap:priority &gt;= 0.8">meta-item priority-high</xsl:when>
                          <xsl:when test="sitemap:priority &gt;= 0.5">meta-item priority-medium</xsl:when>
                          <xsl:otherwise>meta-item priority-low</xsl:otherwise>
                        </xsl:choose>
                      </xsl:attribute>
                      Priority: <xsl:value-of select="sitemap:priority"/>
                    </span>
                    <span class="meta-item">
                      Update: <xsl:value-of select="sitemap:changefreq"/>
                    </span>
                    <span class="meta-item">
                      Modified: <xsl:value-of select="sitemap:lastmod"/>
                    </span>
                  </div>
                </div>
              </xsl:for-each>
            </div>
          </div>
          
          <xsl:if test="count(sitemap:urlset/sitemap:url[contains(sitemap:loc, '/guia/')]) &gt; 0">
            <div class="section">
              <h2 class="section-title">📝 Blog Articles</h2>
              <div class="url-list">
                <xsl:for-each select="sitemap:urlset/sitemap:url[contains(sitemap:loc, '/guia/')]">
                  <xsl:sort select="sitemap:lastmod" order="descending"/>
                  <div class="url-item">
                    <a class="url-link" href="{sitemap:loc}">
                      <xsl:value-of select="sitemap:loc"/>
                    </a>
                    <div class="url-meta">
                      <span class="meta-item priority-medium">
                        Priority: <xsl:value-of select="sitemap:priority"/>
                      </span>
                      <span class="meta-item">
                        Update: <xsl:value-of select="sitemap:changefreq"/>
                      </span>
                      <span class="meta-item">
                        Modified: <xsl:value-of select="sitemap:lastmod"/>
                      </span>
                    </div>
                  </div>
                </xsl:for-each>
              </div>
            </div>
          </xsl:if>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
