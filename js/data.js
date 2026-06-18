/**
 * Data Management & LocalStorage Schema
 * 
 * LocalStorage Schema:
 * - 'onDeck': JSON array of recipe IDs [ "id1", "id2" ]
 * - 'favorites': JSON array of recipe IDs [ "id1", "id2" ]
 * - 'customPantry': JSON array of ingredient names (lowercase) [ "salt", "pepper", "olive oil" ]
 * - 'userMetadata': JSON object mapping recipe ID to metadata overrides:
 *   {
 *      "recipe-id-1": { "times_cooked": 5, "user_rating": 4, "last_suggested_date": "2023-10-01" },
 *      ...
 *   }
 */

const STORAGE_KEYS = {
    ON_DECK: 'recipe_onDeck',
    FAVORITES: 'recipe_favorites',
    PANTRY: 'recipe_customPantry',
    METADATA: 'recipe_userMetadata'
};

// In-memory cache of recipes after fetching and merging metadata
let cachedRecipes = null;

// --- LocalStorage Helpers ---

function loadFromStorage(key, defaultValue) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
}

function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// --- Data API ---

export const Data = {
    /**
     * Initializes data by fetching recipes.json and merging user metadata
     */
    async init() {
        if (cachedRecipes) return cachedRecipes;

        try {
            const response = await fetch('./recipes_with_heat.json');
            const data = await response.json();
            
            const userMetadata = loadFromStorage(STORAGE_KEYS.METADATA, {});

            // Merge local storage metadata into recipe variety_metadata
            cachedRecipes = data.map(recipe => {
                const storedMeta = userMetadata[recipe.id];
                if (storedMeta) {
                    recipe.variety_metadata = {
                        ...recipe.variety_metadata,
                        ...storedMeta
                    };
                }
                return recipe;
            });

            return cachedRecipes;
        } catch (error) {
            console.error("Failed to load recipes:", error);
            return [];
        }
    },

    getAllRecipes() {
        return cachedRecipes || [];
    },

    getRecipeById(id) {
        return this.getAllRecipes().find(r => r.id === id);
    },

    // --- On-Deck ---
    getOnDeck() {
        return loadFromStorage(STORAGE_KEYS.ON_DECK, []);
    },
    addToOnDeck(recipeId) {
        const queue = this.getOnDeck();
        if (!queue.includes(recipeId)) {
            queue.push(recipeId);
            saveToStorage(STORAGE_KEYS.ON_DECK, queue);
        }
    },
    removeFromOnDeck(recipeId) {
        const queue = this.getOnDeck().filter(id => id !== recipeId);
        saveToStorage(STORAGE_KEYS.ON_DECK, queue);
    },
    reorderOnDeck(newQueue) {
        saveToStorage(STORAGE_KEYS.ON_DECK, newQueue);
    },

    // --- Favorites ---
    getFavorites() {
        return loadFromStorage(STORAGE_KEYS.FAVORITES, []);
    },
    toggleFavorite(recipeId) {
        const favs = this.getFavorites();
        const index = favs.indexOf(recipeId);
        if (index > -1) {
            favs.splice(index, 1);
        } else {
            favs.push(recipeId);
        }
        saveToStorage(STORAGE_KEYS.FAVORITES, favs);
        return favs.includes(recipeId);
    },
    isFavorite(recipeId) {
        return this.getFavorites().includes(recipeId);
    },

    // --- Custom Pantry ---
    getCustomPantry() {
        return loadFromStorage(STORAGE_KEYS.PANTRY, []);
    },
    addPantryItem(itemName) {
        const pantry = this.getCustomPantry();
        const normalized = itemName.trim().toLowerCase();
        if (normalized && !pantry.includes(normalized)) {
            pantry.push(normalized);
            saveToStorage(STORAGE_KEYS.PANTRY, pantry);
        }
    },
    removePantryItem(itemName) {
        const normalized = itemName.trim().toLowerCase();
        const pantry = this.getCustomPantry().filter(item => item !== normalized);
        saveToStorage(STORAGE_KEYS.PANTRY, pantry);
    },

    // --- User Metadata (Cooked, Rating) ---
    markAsCooked(recipeId) {
        const userMetadata = loadFromStorage(STORAGE_KEYS.METADATA, {});
        if (!userMetadata[recipeId]) {
            // Need to initialize with base json data first if not present
            const recipe = this.getRecipeById(recipeId);
            userMetadata[recipeId] = { ...(recipe.variety_metadata || {}) };
        }
        
        userMetadata[recipeId].times_cooked = (userMetadata[recipeId].times_cooked || 0) + 1;
        
        // Stamp today's date to last_suggested_date to track when it was last cooked/suggested
        const today = new Date().toISOString().split('T')[0];
        userMetadata[recipeId].last_suggested_date = today;

        saveToStorage(STORAGE_KEYS.METADATA, userMetadata);
        
        // Update runtime cache
        const recipe = this.getRecipeById(recipeId);
        if (recipe) {
            recipe.variety_metadata = { ...recipe.variety_metadata, ...userMetadata[recipeId] };
        }
    },

    setRating(recipeId, rating) {
        const userMetadata = loadFromStorage(STORAGE_KEYS.METADATA, {});
        if (!userMetadata[recipeId]) {
            const recipe = this.getRecipeById(recipeId);
            userMetadata[recipeId] = { ...(recipe.variety_metadata || {}) };
        }
        
        userMetadata[recipeId].user_rating = rating;
        saveToStorage(STORAGE_KEYS.METADATA, userMetadata);

        // Update runtime cache
        const recipe = this.getRecipeById(recipeId);
        if (recipe) {
            recipe.variety_metadata = { ...recipe.variety_metadata, ...userMetadata[recipeId] };
        }
    }
};
