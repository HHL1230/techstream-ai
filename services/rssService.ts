import { Article } from '../types';

const getHtmlContent = (node: Element | null): string => {
    if (!node) return '';
    // Look for a CDATA section
    for (let i = 0; i < node.childNodes.length; i++) {
        if (node.childNodes[i].nodeType === 4) { // CDATA_SECTION_NODE
            return node.childNodes[i].textContent || '';
        }
    }
    // Fallback for nodes without CDATA
    return (node as any).innerHTML || node.textContent || '';
};

/**
 * Independent parser specifically for Mashable RSS feeds to extract the main image URL.
 * Mashable's hero image is typically the first <img> tag within the <content:encoded> CDATA block,
 * often containing "hero-image" in its URL. This function uses robust DOM parsing and multiple fallbacks.
 */
const extractMashableImageUrl = (item: Element, fullHtmlContent: string): string | undefined => {
    // 1. Prioritize parsing <content:encoded> for the hero image using DOM methods.
    if (fullHtmlContent) {
        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = fullHtmlContent;
            
            // Strategy A: Look for an image with "hero-image" in the src, as this is a common and reliable pattern for Mashable's main article image.
            const heroImage = tempDiv.querySelector<HTMLImageElement>('img[src*="hero-image"]');
            if (heroImage && heroImage.src) {
                return heroImage.src;
            }

            // Strategy B: If no "hero-image" is found, fall back to the very first <img> tag in the content, which is usually the intended one.
            const firstImg = tempDiv.querySelector('img');
            if (firstImg) {
                // Check for standard 'src' or lazy-loading 'data-src' attributes.
                const imageUrl = firstImg.getAttribute('src') || firstImg.getAttribute('data-src');
                if(imageUrl) return imageUrl;
                
                // As a further fallback, check srcset if src is missing and parse the first URL from it.
                const srcset = firstImg.getAttribute('srcset');
                if (srcset) {
                    // srcset is a comma-separated list of "url descriptor" pairs, e.g., "image-1x.jpg 1x, image-2x.jpg 2x"
                    return srcset.split(',')[0].trim().split(' ')[0];
                }
            }
        } catch (e) {
            console.warn('DOM parsing for Mashable image failed, falling back to regex.', e);
            // Fallback to regex if DOM parsing fails. This regex handles both single and double quotes.
            const match = fullHtmlContent.match(/<img[^>]+src=["']([^"']+)["']/);
            if (match && match[1]) {
                return match[1];
            }
        }
    }
    
    // 2. Final fallback to <media:content> which can sometimes contain the image URL.
    const mediaContent = item.querySelector('media\\:content');
    const mediaUrl = mediaContent?.getAttribute('url');
    if (mediaUrl) {
        return mediaUrl;
    }

    return undefined;
};


const parseRSS = (xmlString: string, sourceName: string, sourceLink: string): Article[] => {
  const parser = new DOMParser();
  // Try parsing as XML, then as HTML if XML fails (some feeds are messy)
  let xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  
  if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
    xmlDoc = parser.parseFromString(xmlString, 'text/html');
  }

  const items = Array.from(xmlDoc.querySelectorAll('item, entry'));

  if (items.length === 0) {
    console.warn(`No items found in feed ${sourceName}. XML structure might be different.`);
    return [];
  }

  return items.map(item => {
    const title = item.querySelector('title')?.textContent?.trim() ?? '無標題';
    
    // Improved link extraction for Atom and RSS
    let link = '';
    const linkElem = item.querySelector('link');
    if (linkElem) {
        link = linkElem.getAttribute('href') || linkElem.textContent || '';
    }
    
    // Fallback for link if still empty
    if (!link || !link.startsWith('http')) {
        const atomLink = item.querySelector('link[rel="alternate"]');
        if (atomLink) link = atomLink.getAttribute('href') || '';
    }

    const pubDate = item.querySelector('pubDate, published, updated')?.textContent ?? new Date().toISOString();
    
    const descriptionNode = item.querySelector('description, summary, content');
    const contentEncodedNode = item.querySelector('content\\:encoded, content');
    
    const fullHtmlContent = getHtmlContent(contentEncodedNode || descriptionNode);
    let description: string = '';
    let imageUrl: string | undefined;

    // Use the dedicated parser for Mashable. For all other feeds, use the generic strategy.
    if (sourceName === 'Mashable') {
        imageUrl = extractMashableImageUrl(item, fullHtmlContent);
    } else {
        // Generic image extraction strategy for other feeds
        const fromMediaContent = (): string | undefined | null => {
            const mediaContent = item.querySelector('media\\:content');
            return mediaContent?.getAttribute('url');
        };

        const fromEnclosure = (): string | undefined | null => {
            const enclosure = item.querySelector('enclosure[type^="image"]');
            return enclosure?.getAttribute('url');
        };

        const fromHtmlContent = (): string | undefined | null => {
            if (!fullHtmlContent) return undefined;

            let match = fullHtmlContent.match(/<img[^>]+data-src="([^"]+)"/);
            if (match && match[1]) return match[1];

            match = fullHtmlContent.match(/<img[^>]+src="([^"]+)"/);
            if (match && match[1]) return match[1];
            
            try {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = fullHtmlContent;
                const img = tempDiv.querySelector('img');
                if (img) {
                    return img.getAttribute('data-src') || img.getAttribute('src');
                }
            } catch (e) {
                console.warn('DOM parsing for image in RSS feed failed.', e);
            }
            return undefined;
        };

        let imageUrlCandidates: (() => string | undefined | null)[];

        // Engadget also benefits from prioritizing HTML content
        if (sourceName === 'Engadget') {
            imageUrlCandidates = [
                fromHtmlContent,
                fromMediaContent,
                fromEnclosure
            ];
        } else {
            // Default order for most feeds
            imageUrlCandidates = [
                fromMediaContent,
                fromEnclosure,
                fromHtmlContent
            ];
        }

        // Iterate through candidates and take the first valid URL
        for (const getCandidate of imageUrlCandidates) {
            const potentialUrl = getCandidate();
            if (potentialUrl && (potentialUrl.startsWith('http://') || potentialUrl.startsWith('https://'))) {
                imageUrl = potentialUrl;
                break; 
            }
        }
    }

    // Clean up description for display: extract text, then truncate
    const tempDivForDesc = document.createElement('div');
    tempDivForDesc.innerHTML = getHtmlContent(descriptionNode);
    const firstParagraph = tempDivForDesc.querySelector('p');
    if (firstParagraph) {
        description = firstParagraph.textContent || firstParagraph.innerText;
    } else {
        description = (tempDivForDesc.textContent || tempDivForDesc.innerText).trim();
    }
    
    // Truncate long descriptions
    if (description.length > 250) {
        description = description.substring(0, 250).trim() + '...';
    }

    return { id: '', title, link, pubDate, description, sourceName, sourceLink, imageUrl };
  });
};

const PROXIES = [
  '/api/rss?url=',
  'https://api.allorigins.win/raw?url=',
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://corsproxy.io/?',
];

export const fetchAndParseFeeds = async (feeds: { name: string; url: string }[]): Promise<{ articles: Article[], rawFeeds: Record<string, string> }> => {
  const allArticles: Article[] = [];
  const rawFeeds: Record<string, string> = {};

  const feedPromises = feeds.map(async feed => {
    let lastError: any = null;
    
    for (const proxy of PROXIES) {
      try {
        const response = await fetch(`${proxy}${encodeURIComponent(feed.url)}`);
        if (!response.ok) {
          throw new Error(`Status ${response.status}: ${response.statusText}`);
        }
        const xmlString = await response.text();
        if (!xmlString || xmlString.length < 100) {
           throw new Error("Empty or too short response");
        }
        rawFeeds[feed.name] = xmlString;
        const articles = parseRSS(xmlString, feed.name, new URL(feed.url).hostname);
        return articles;
      } catch (error) {
        lastError = error;
        console.warn(`Proxy ${proxy} failed for ${feed.name}:`, error);
        continue; // Try next proxy
      }
    }
    
    console.error(`All proxies failed for feed ${feed.name}. Last error:`, lastError);
    return [];
  });

  const results = await Promise.all(feedPromises);
  results.forEach(articles => allArticles.push(...articles));

  // Sort all articles by date, newest first
  allArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return { articles: allArticles, rawFeeds };
};