import axios from 'axios';
import * as cheerio from 'cheerio';
import UserAgent from 'user-agents';

export class SearchTools {
    static async webSearch(query, maxResults = 5) {
        const maxRetries = 3;
        const baseDelay = 3000;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                // Generate a random desktop User-Agent
                const userAgent = new UserAgent({ deviceCategory: 'desktop' }).toString();

                // Use DuckDuckGo HTML endpoint (more reliable than Google for scraping)
                const encodedQuery = encodeURIComponent(query);
                const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;

                console.log(`Searching for: ${query}`);

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
                    timeout: 20000,
                    maxRedirects: 5
                });

                const $ = cheerio.load(response.data);
                const results = [];

                // DuckDuckGo HTML search result selectors
                $('.result').each((i, element) => {
                    if (results.length >= maxResults) return false;

                    const titleElement = $(element).find('.result__title a');
                    const snippetElement = $(element).find('.result__snippet');
                    const urlElement = $(element).find('.result__url');

                    const title = titleElement.text().trim();
                    let link = titleElement.attr('href');
                    const snippet = snippetElement.text().trim();
                    const displayUrl = urlElement.text().trim();

                    // DuckDuckGo uses redirect URLs, extract the actual URL
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

                // Alternative selector
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
                    console.log('No search results found.');
                    if (attempt < maxRetries - 1) {
                        const waitTime = baseDelay * Math.pow(2, attempt);
                        console.log(`Retrying search in ${waitTime}ms...`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                        continue;
                    }
                    return "No search results found. Try refining your query or using scrape_url with specific URLs.";
                }

                console.log(`Found ${results.length} search results`);
                return results.map(r =>
                    `Title: ${r.title}\nURL: ${r.link}\nSnippet: ${r.snippet}\n`
                ).join("\n---\n");

            } catch (error) {
                console.error(`Search Error (Attempt ${attempt + 1}/${maxRetries}):`, error.message);

                if (attempt < maxRetries - 1) {
                    const waitTime = baseDelay * Math.pow(2, attempt);
                    console.log(`Retrying search in ${waitTime}ms...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                } else {
                    return `Search failed after ${maxRetries} attempts: ${error.message}`;
                }
            }
        }
        return "Search failed unexpectedly.";
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

            // Remove script and style elements
            $('script, style, nav, footer, header, aside, .ad, .advertisement').remove();

            // Get text content from main content areas
            let text = $('article, main, .content, #content, .post, .article, .entry-content').text();

            // Fallback to body if no main content found
            if (!text || text.length < 100) {
                text = $('body').text();
            }

            // Clean up whitespace
            text = text.replace(/\s+/g, ' ').trim();

            return text.substring(0, 20000); // Limit to 20k chars
        } catch (error) {
            console.error(`Scrape Error for ${url}:`, error.message);
            return `Failed to scrape URL: ${error.message}`;
        }
    }
}
