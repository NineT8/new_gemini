import axios from 'axios';
import * as cheerio from 'cheerio';
import UserAgent from 'user-agents';

export class SearchTools {
    /**
     * Smart search - tries available APIs in order of preference:
     * 1. Serper.dev (2500 free credits) - SERPER_API_KEY
     * 2. Tavily (1000/month free) - TAVILY_API_KEY  
     * 3. Brave (2000/month free) - BRAVE_SEARCH_API_KEY
     * 4. DuckDuckGo scraping (fallback)
     */
    static async webSearch(query, maxResults = 5) {
        // Try Serper.dev first (most reliable, uses Google)
        if (process.env.SERPER_API_KEY) {
            const result = await this.serperSearch(query, maxResults);
            if (result && !result.includes('failed')) return result;
        }

        // Try Tavily (AI-optimized search)
        if (process.env.TAVILY_API_KEY) {
            const result = await this.tavilySearch(query, maxResults);
            if (result && !result.includes('failed')) return result;
        }

        // Try Brave Search
        if (process.env.BRAVE_SEARCH_API_KEY) {
            const result = await this.braveSearch(query, maxResults);
            if (result && !result.includes('failed')) return result;
        }

        // Fallback to DuckDuckGo scraping
        return this.duckDuckGoSearch(query, maxResults);
    }

    /**
     * Serper.dev - Google Search API (2500 free credits)
     * Sign up: https://serper.dev/
     */
    static async serperSearch(query, maxResults) {
        try {
            console.log(`🔵 [Serper] Searching for: ${query}`);

            const response = await axios.post('https://google.serper.dev/search',
                { q: query, num: maxResults },
                {
                    headers: {
                        'X-API-KEY': process.env.SERPER_API_KEY,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            const results = response.data.organic || [];

            if (results.length === 0) {
                console.log('No Serper results found.');
                return null;
            }

            console.log(`✅ [Serper] Found ${results.length} results`);
            return results.map(r =>
                `Title: ${r.title}\nURL: ${r.link}\nSnippet: ${r.snippet || ''}\n`
            ).join("\n---\n");

        } catch (error) {
            console.error('Serper Error:', error.message);
            return `Serper search failed: ${error.message}`;
        }
    }

    /**
     * Tavily - AI-optimized search (1000 free/month)
     * Sign up: https://tavily.com/
     */
    static async tavilySearch(query, maxResults) {
        try {
            console.log(`🟣 [Tavily] Searching for: ${query}`);

            const response = await axios.post('https://api.tavily.com/search',
                {
                    api_key: process.env.TAVILY_API_KEY,
                    query: query,
                    max_results: maxResults,
                    search_depth: 'basic'
                },
                { timeout: 10000 }
            );

            const results = response.data.results || [];

            if (results.length === 0) {
                console.log('No Tavily results found.');
                return null;
            }

            console.log(`✅ [Tavily] Found ${results.length} results`);
            return results.map(r =>
                `Title: ${r.title}\nURL: ${r.url}\nSnippet: ${r.content?.substring(0, 300) || ''}\n`
            ).join("\n---\n");

        } catch (error) {
            console.error('Tavily Error:', error.message);
            return `Tavily search failed: ${error.message}`;
        }
    }

    /**
     * Brave Search API (2000 free/month)
     * Sign up: https://brave.com/search/api/
     */
    static async braveSearch(query, maxResults) {
        try {
            console.log(`🟠 [Brave] Searching for: ${query}`);

            const response = await axios.get('https://api.search.brave.com/res/v1/web/search', {
                headers: {
                    'Accept': 'application/json',
                    'Accept-Encoding': 'gzip',
                    'X-Subscription-Token': process.env.BRAVE_SEARCH_API_KEY
                },
                params: {
                    q: query,
                    count: maxResults,
                    text_decorations: false,
                    search_lang: 'en'
                },
                timeout: 10000
            });

            const results = response.data.web?.results || [];

            if (results.length === 0) {
                console.log('No Brave results found.');
                return null;
            }

            console.log(`✅ [Brave] Found ${results.length} results`);
            return results.map(r =>
                `Title: ${r.title}\nURL: ${r.url}\nSnippet: ${r.description || ''}\n`
            ).join("\n---\n");

        } catch (error) {
            console.error('Brave Error:', error.message);
            return `Brave search failed: ${error.message}`;
        }
    }

    /**
     * DuckDuckGo HTML scraping - Free fallback (may be blocked on some servers)
     */
    static async duckDuckGoSearch(query, maxResults = 5) {
        const maxRetries = 2;
        const baseDelay = 2000;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const userAgent = new UserAgent({ deviceCategory: 'desktop' }).toString();
                const encodedQuery = encodeURIComponent(query);
                const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;

                console.log(`🦆 [DuckDuckGo] Searching for: ${query}`);

                const response = await axios.get(url, {
                    headers: {
                        'User-Agent': userAgent,
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.5',
                        'Referer': 'https://duckduckgo.com/',
                        'DNT': '1',
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1'
                    },
                    timeout: 12000,
                    maxRedirects: 5
                });

                const $ = cheerio.load(response.data);
                const results = [];

                $('.result').each((i, element) => {
                    if (results.length >= maxResults) return false;

                    const titleElement = $(element).find('.result__title a');
                    const snippetElement = $(element).find('.result__snippet');
                    const urlElement = $(element).find('.result__url');

                    const title = titleElement.text().trim();
                    let link = titleElement.attr('href');
                    const snippet = snippetElement.text().trim();
                    const displayUrl = urlElement.text().trim();

                    if (link && link.includes('uddg=')) {
                        const match = link.match(/uddg=([^&]+)/);
                        if (match) {
                            link = decodeURIComponent(match[1]);
                        }
                    }

                    if (title && link) {
                        results.push({
                            title,
                            link: link.startsWith('http') ? link : `https://${displayUrl}`,
                            snippet: snippet.substring(0, 300)
                        });
                    }
                });

                if (results.length === 0) {
                    $('a.result__a').each((i, element) => {
                        if (results.length >= maxResults) return false;
                        const title = $(element).text().trim();
                        let link = $(element).attr('href');

                        if (link && link.includes('uddg=')) {
                            const match = link.match(/uddg=([^&]+)/);
                            if (match) {
                                link = decodeURIComponent(match[1]);
                            }
                        }

                        if (title && link && link.startsWith('http')) {
                            results.push({ title, link, snippet: '' });
                        }
                    });
                }

                if (results.length === 0) {
                    if (attempt < maxRetries - 1) {
                        const waitTime = baseDelay * Math.pow(2, attempt);
                        console.log(`Retrying in ${waitTime}ms...`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                        continue;
                    }
                    return "No search results found. The AI will use its knowledge base instead.";
                }

                console.log(`✅ [DuckDuckGo] Found ${results.length} results`);
                return results.map(r =>
                    `Title: ${r.title}\nURL: ${r.link}\nSnippet: ${r.snippet}\n`
                ).join("\n---\n");

            } catch (error) {
                console.error(`DuckDuckGo Error (Attempt ${attempt + 1}/${maxRetries}):`, error.message);

                if (attempt < maxRetries - 1) {
                    const waitTime = baseDelay * Math.pow(2, attempt);
                    console.log(`Retrying in ${waitTime}ms...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                } else {
                    return "Search temporarily unavailable. The AI will use its knowledge base to provide information.";
                }
            }
        }
        return "Search unavailable. The AI will use its knowledge base.";
    }

    static async scrapeUrl(url) {
        try {
            const userAgent = new UserAgent({ deviceCategory: 'desktop' }).toString();
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': userAgent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5'
                },
                timeout: 15000
            });

            const $ = cheerio.load(response.data);
            $('script, style, nav, footer, header, aside, .ad, .advertisement').remove();

            let text = $('article, main, .content, #content, .post, .article, .entry-content').text();

            if (!text || text.length < 100) {
                text = $('body').text();
            }

            text = text.replace(/\s+/g, ' ').trim();
            return text.substring(0, 20000);
        } catch (error) {
            console.error(`Scrape Error for ${url}:`, error.message);
            return `Failed to scrape URL: ${error.message}`;
        }
    }
}
