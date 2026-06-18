import { Data } from '../data.js';
import { UI } from '../ui.js';
import DetailView from './detail.js';

export default class BrowseView {
    constructor(container) {
        this.container = container;
        this.recipes = [];
        this.filteredRecipes = [];
        this.searchQuery = '';
        this.activeFilters = {};
        
        // Ensure DetailView is ready
        this.detailView = new DetailView();
    }

    async render() {
        this.recipes = await Data.getAllRecipes();
        this.filteredRecipes = [...this.recipes];

        this.container.innerHTML = `
            <div style="display: flex; gap: 8px; margin-bottom: 16px;">
                <input type="text" id="search-input" placeholder="Search recipes, ingredients..." 
                       style="flex: 1; padding: 12px 16px; border-radius: 24px; border: 1px solid var(--border-color); background: var(--surface-color); color: var(--text-primary); outline: none;">
                <button id="surprise-btn" class="btn-primary" style="padding: 12px;">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M16 13H8"></path><path d="M16 17H8"></path><path d="M10 9H8"></path></svg>
                </button>
            </div>
            
            <div id="filter-panel" style="margin-bottom: 16px; display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px;">
                <select id="filter-protein" style="padding: 8px 12px; border-radius: 16px; background: var(--surface-color); color: var(--text-primary); border: 1px solid var(--border-color); font-family: inherit; font-size: 0.875rem; outline: none;">
                    <option value="">Any Protein</option>
                </select>
                <select id="filter-cuisine" style="padding: 8px 12px; border-radius: 16px; background: var(--surface-color); color: var(--text-primary); border: 1px solid var(--border-color); font-family: inherit; font-size: 0.875rem; outline: none;">
                    <option value="">Any Cuisine</option>
                </select>
                <select id="filter-difficulty" style="padding: 8px 12px; border-radius: 16px; background: var(--surface-color); color: var(--text-primary); border: 1px solid var(--border-color); font-family: inherit; font-size: 0.875rem; outline: none;">
                    <option value="">Any Difficulty</option>
                </select>
                <select id="filter-heat_level" style="padding: 8px 12px; border-radius: 16px; background: var(--surface-color); color: var(--text-primary); border: 1px solid var(--border-color); font-family: inherit; font-size: 0.875rem; outline: none;">
                    <option value="">Any Heat</option>
                </select>
            </div>

            <div id="browse-grid" class="recipe-grid"></div>
        `;

        this.attachListeners();
        this.updateDropdowns(); // Populate dropdowns based on initial state
        this.updateGrid();
    }

    getAvailableOptions(tagKey, excludingFilter) {
        // Find recipes matching all active filters EXCEPT the one being evaluated
        const matchingRecipes = this.recipes.filter(r => {
            for (const [key, val] of Object.entries(this.activeFilters)) {
                if (key === excludingFilter) continue; // skip self
                if (val && String(r.tags[key]) !== String(val)) return false;
            }

            // Check search query
            if (this.searchQuery) {
                const query = this.searchQuery;
                const inTitle = r.title.toLowerCase().includes(query);
                const inTags = Object.values(r.tags).flat().some(t => String(t).toLowerCase().includes(query));
                const inIngredients = r.ingredients.some(i => i.name.toLowerCase().includes(query));
                if (!inTitle && !inTags && !inIngredients) return false;
            }

            return true;
        });

        const unique = new Set();
        matchingRecipes.forEach(r => {
            if (r.tags[tagKey]) unique.add(r.tags[tagKey]);
        });
        
        return Array.from(unique).sort();
    }

    updateDropdowns() {
        const filters = ['protein', 'cuisine', 'difficulty', 'heat_level'];
        const anyLabels = {
            protein: 'Any Protein',
            cuisine: 'Any Cuisine',
            difficulty: 'Any Difficulty',
            heat_level: 'Any Heat'
        };

        const heatLabels = {
            '0': '0/10 (No Heat)',
            '1': '1/10 (Very Mild)',
            '2': '2/10 (Mild)',
            '3': '3/10 (Medium-Low)',
            '4': '4/10 (Medium)',
            '5': '5/10 (Medium-Hot)',
            '6': '6/10 (Hot)',
            '7': '7/10 (Hotter)',
            '8': '8/10 (Very Hot)',
            '9': '9/10 (Extremely Hot)',
            '10': '10/10 (Insane Heat)'
        };

        filters.forEach(filterKey => {
            const select = document.getElementById(`filter-${filterKey}`);
            if (!select) return;

            const currentVal = this.activeFilters[filterKey] || '';
            const availableOptions = this.getAvailableOptions(filterKey, filterKey);
            
            // Build HTML with 'Any' option first
            let html = `<option value="">${anyLabels[filterKey]}</option>`;
            availableOptions.forEach(opt => {
                const selected = (String(opt) === String(currentVal)) ? 'selected' : '';
                const label = filterKey === 'heat_level' ? (heatLabels[opt] || `${opt}/10`) : opt;
                html += `<option value="${opt}" ${selected}>${label}</option>`;
            });

            select.innerHTML = html;

            // Reset state if current selection is no longer valid in the new options
            if (currentVal && !availableOptions.map(String).includes(String(currentVal))) {
                select.value = '';
                delete this.activeFilters[filterKey];
            }
        });
    }

    attachListeners() {
        const searchInput = document.getElementById('search-input');
        const filters = ['protein', 'cuisine', 'difficulty', 'heat_level'].map(f => document.getElementById(`filter-${f}`));
        const surpriseBtn = document.getElementById('surprise-btn');

        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.applyFilters();
        });

        filters.forEach(select => {
            select.addEventListener('change', (e) => {
                const key = e.target.id.replace('filter-', '');
                if (e.target.value === '') {
                    delete this.activeFilters[key];
                } else {
                    this.activeFilters[key] = e.target.value;
                }
                this.applyFilters();
            });
        });

        surpriseBtn.addEventListener('click', () => {
            this.triggerSurpriseMe();
        });
    }

    applyFilters() {
        // Re-filter the grid
        this.filteredRecipes = this.recipes.filter(r => {
            for (const [key, val] of Object.entries(this.activeFilters)) {
                if (val && String(r.tags[key]) !== String(val)) return false;
            }

            if (this.searchQuery) {
                const query = this.searchQuery;
                const inTitle = r.title.toLowerCase().includes(query);
                const inTags = Object.values(r.tags).flat().some(t => String(t).toLowerCase().includes(query));
                const inIngredients = r.ingredients.some(i => i.name.toLowerCase().includes(query));
                
                if (!inTitle && !inTags && !inIngredients) return false;
            }

            return true;
        });

        // Cascading update of available dropdown options
        this.updateDropdowns();
        // Update the visual grid
        this.updateGrid();
    }

    updateGrid() {
        const grid = document.getElementById('browse-grid');
        grid.innerHTML = '';
        
        if (this.filteredRecipes.length === 0) {
            grid.innerHTML = `<div style="grid-column: span 2; text-align: center; padding: 32px; color: var(--text-secondary);">No recipes found.</div>`;
            return;
        }

        this.filteredRecipes.forEach(recipe => {
            const card = UI.createRecipeCard(recipe, (r) => this.showDetail(r));
            grid.appendChild(card);
        });
    }

    triggerSurpriseMe() {
        if (this.recipes.length === 0) return;

        const now = new Date();
        const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;

        // Weight calculations
        const weightedPool = [];
        this.recipes.forEach(r => {
            let weight = 10;
            const lastDateStr = r.variety_metadata?.last_suggested_date;
            
            if (lastDateStr) {
                const lastDate = new Date(lastDateStr);
                const diffMs = now - lastDate;
                if (diffMs < fourteenDaysMs) {
                    weight = 1; // drastically down-weight if suggested/cooked in last 14 days
                }
            }
            
            for (let i = 0; i < weight; i++) {
                weightedPool.push(r);
            }
        });

        const randomIndex = Math.floor(Math.random() * weightedPool.length);
        const selectedRecipe = weightedPool[randomIndex];
        
        this.showDetail(selectedRecipe);
    }

    showDetail(recipe) {
        this.detailView.render(recipe, this.filteredRecipes);
    }
}
