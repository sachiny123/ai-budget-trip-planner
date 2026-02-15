
const WIKI_API_URL = "https://en.wikipedia.org/w/api.php";

export const imageService = {
    /**
     * Fetches the main image URL for a given query (place/temple name) from Wikipedia.
     * @param {string} query - The name of the place or temple.
     * @returns {Promise<string|null>} - The image URL or null if not found.
     */
    fetchImage: async (query) => {
        if (!query) return null;
        try {
            const params = new URLSearchParams({
                action: "query",
                prop: "pageimages",
                format: "json",
                piprop: "original",
                titles: query,
                origin: "*"
            });

            const response = await fetch(`${WIKI_API_URL}?${params.toString()}`);
            const data = await response.json();

            if (data.query && data.query.pages) {
                const pages = data.query.pages;
                const pageId = Object.keys(pages)[0];
                if (pageId === "-1") return null; // Not found

                const page = pages[pageId];
                if (page.original && page.original.source) {
                    return page.original.source;
                }
            }
            return null;
        } catch (error) {
            console.error("Error fetching image from Wikipedia:", error);
            return null;
        }
    },

    /**
     * Fetches a list of images for a query.
     * Note: Wikipedia's pageimages prop mostly returns the main image.
     * For galleries, we might need 'images' prop but that returns file titles, needing multiple calls.
     * Sticking to main image for now as it's the most reliable "accurate" image.
     */
    fetchImagePlaceholder: (query) => {
        // Fallback to a better placeholder service if Wiki fails
        // Pollinations is good for generative, but maybe we stick to loremflickr as last resort
        return `https://loremflickr.com/800/600/${encodeURIComponent(query)},landmark/all`;
    }
};
