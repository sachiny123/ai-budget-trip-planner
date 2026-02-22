
const WIKI_API_URL = "https://en.wikipedia.org/w/api.php";
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

export const imageService = {
    /**
     * Fetches the main image URL for a given query (place/temple name) from Unsplash.
     * @param {string} query - The name of the place or temple.
     * @returns {Promise<string|null>} - The image URL or null if not found.
     */
    fetchUnsplashImage: async (query) => {
        if (!query || !UNSPLASH_ACCESS_KEY) return null;
        try {
            const response = await fetch(
                `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=1`
            );
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                return data.results[0].urls.regular;
            }
            return null;
        } catch (error) {
            console.error("Error fetching image from Unsplash:", error);
            return null;
        }
    },

    /**
     * Fetches the main image URL for a given query (place/temple name) from Wikipedia.
     * @param {string} query - The name of the place or temple.
     * @returns {Promise<string|null>} - The image URL or null if not found.
     */
    fetchWikiImage: async (query) => {
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
     * Main method to fetch an accurate image for a place or temple.
     * Tries Unsplash first, then Wikipedia, then fallback.
     */
    fetchImage: async (query) => {
        // Try Unsplash first for high quality
        let image = await imageService.fetchUnsplashImage(query);
        if (image) return image;

        // Fallback to Wikipedia
        image = await imageService.fetchWikiImage(query);
        if (image) return image;

        // Final fallback
        return imageService.fetchImagePlaceholder(query);
    },

    /**
     * Fetches a list of images for a query.
     */
    fetchImagePlaceholder: (query) => {
        return `https://loremflickr.com/800/600/${encodeURIComponent(query)},landmark/all`;
    }
};
