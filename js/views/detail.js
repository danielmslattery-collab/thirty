import { Data } from '../data.js';
import CookView from './cook.js';
import { UI } from '../ui.js';

export default class DetailView {
    constructor() {
        this.overlayContainer = document.getElementById('overlay-container');
        this.recipe = null;
        this.currentServings = 0;
        this.cookView = new CookView();
    }

    render(recipe, recipeList = []) {
        this.recipe = recipe;
        this.recipeList = recipeList;
        this.currentServings = recipe.base_servings;
        this.show();
    }

    show() {
        this.overlayContainer.innerHTML = '';
        
        const isFav = Data.isFavorite(this.recipe.id);
        const favColor = isFav ? '#FFD700' : 'currentColor';
        const favFill = isFav ? '#FFD700' : 'none';

        const wrapper = document.createElement('div');
        wrapper.style.position = 'absolute';
        wrapper.style.top = '0';
        wrapper.style.left = '0';
        wrapper.style.right = '0';
        wrapper.style.bottom = '0';
        wrapper.style.backgroundColor = 'var(--bg-color)';
        wrapper.style.overflowY = 'auto';
        wrapper.style.zIndex = '200';
        wrapper.style.paddingBottom = '80px'; // Space for fixed bottom bar

        const heatLevel = this.recipe.tags.heat_level || 0;
        const heatStr = heatLevel > 0 ? `<span>🌶️ ${heatLevel}/10</span>` : '';

        const currentIndex = this.recipeList.findIndex(r => r.id === this.recipe.id);
        const hasPrevious = currentIndex > 0;
        const hasNext = currentIndex > -1 && currentIndex < this.recipeList.length - 1;

        wrapper.innerHTML = `
            <div style="position: sticky; top: 0; background: var(--bg-color); padding: 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); z-index: 10;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <button id="detail-close" class="btn-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    </button>
                    <img src="./Thirty Logo.jpeg" alt="Thirty Logo" style="height: 40px; width: auto; object-fit: contain;">
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                    ${hasPrevious ? `
                        <button id="detail-prev" class="btn-icon" style="width:36px; height:36px;" title="Previous Recipe">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                    ` : ''}
                    ${hasNext ? `
                        <button id="detail-next" class="btn-icon" style="width:36px; height:36px;" title="Next Recipe">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    ` : ''}
                    ${(hasPrevious || hasNext) ? `<span style="width: 1px; height: 20px; background: var(--border-color); margin: 0 4px;"></span>` : ''}
                    <button id="detail-fav" class="btn-icon">
                        <svg viewBox="0 0 24 24" fill="${favFill}" stroke="${favColor}" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    </button>
                    <button id="detail-ondeck" class="btn-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    </button>
                </div>
            </div>

            <div style="padding: 24px 16px;">
                <h2 style="font-size: 1.5rem; margin-bottom: 8px; line-height: 1.2;">${this.recipe.title}</h2>
                <div class="text-muted text-sm" style="margin-bottom: 16px; display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
                    <span>Cooked: ${this.recipe.variety_metadata?.times_cooked || 0} times</span>
                    <span>🥩 ${this.recipe.tags.protein}</span>
                    <span>🌍 ${this.recipe.tags.cuisine}</span>
                    <span>⚡ ${this.recipe.tags.difficulty}</span>
                    ${heatStr}
                </div>
                
                <div style="display: flex; gap: 12px; margin-bottom: 20px;">
                    <button id="tab-ingredients" class="btn-primary" style="flex: 1; padding: 10px 0; border-radius: 24px; font-size: 0.9rem; border: none; cursor: pointer;">
                        Ingredients
                    </button>
                    <button id="tab-instructions" class="btn-icon" style="flex: 1; padding: 10px 0; border-radius: 24px; font-size: 0.9rem; width: auto; height: auto; cursor: pointer; border: 1px solid var(--border-color); color: var(--text-secondary); background: rgba(15, 118, 110, 0.05);">
                        Instructions
                    </button>
                </div>

                <div id="detail-ingredients-section">
                    <div class="glass-card" style="margin-bottom: 24px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                            <h3 style="font-size: 1.1rem;">Ingredients</h3>
                            <div style="display: flex; align-items: center; gap: 12px; background: rgba(15, 118, 110, 0.08); border-radius: 20px; padding: 4px;">
                                <button id="servings-down" style="background: none; border: none; color: var(--text-primary); width: 28px; height: 28px; border-radius: 50%; font-size: 1.2rem; display: flex; align-items:center; justify-content:center; cursor: pointer;">-</button>
                                <span id="servings-display" style="font-weight: bold; width: 20px; text-align: center; color: var(--text-primary);">${this.currentServings}</span>
                                <button id="servings-up" style="background: none; border: none; color: var(--text-primary); width: 28px; height: 28px; border-radius: 50%; font-size: 1.2rem; display: flex; align-items:center; justify-content:center; cursor: pointer;">+</button>
                            </div>
                        </div>
                        <ul id="ingredient-list" style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px;">
                            <!-- Ingredients injected here -->
                        </ul>
                    </div>

                    <div class="glass-card" style="margin-bottom: 24px;">
                        <h3 style="font-size: 1.1rem; margin-bottom: 12px;">Macros (Total)</h3>
                        <div id="macro-bar" style="display: flex; justify-content: space-between; font-size: 0.9rem; font-weight: 600;">
                            <!-- Macros injected here -->
                        </div>
                    </div>
                </div>

                <div id="detail-instructions-section" style="display: none;">
                    <div class="glass-card" style="margin-bottom: 24px;">
                        <h3 style="font-size: 1.1rem; margin-bottom: 16px;">Instructions</h3>
                        <div style="display: flex; flex-direction: column; gap: 16px;">
                            ${this.recipe.steps.map(step => {
                                const vesselBadge = step.vessel ? `<span style="font-size:0.7rem; background:rgba(15, 118, 110, 0.08); padding:2px 8px; border-radius:12px; color:var(--text-secondary); text-transform:capitalize;">🍳 ${step.vessel}</span>` : '';
                                const timerBadge = step.timer_minutes ? `<span style="font-size:0.7rem; background:rgba(249, 115, 22, 0.15); padding:2px 8px; border-radius:12px; color:var(--accent-color);">⏱️ ${step.timer_minutes}m</span>` : '';
                                return `
                                    <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 12px; display: flex; gap: 12px;">
                                        <div style="width: 24px; height: 24px; border-radius: 50%; background: var(--primary-gradient); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: bold; flex-shrink: 0; margin-top: 2px;">
                                            ${step.order}
                                        </div>
                                        <div style="flex: 1;">
                                            <div style="font-weight: 600; font-size: 0.95rem; margin-bottom: 6px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
                                                <span>${step.title}</span>
                                                ${vesselBadge}
                                                ${timerBadge}
                                            </div>
                                            <div style="font-size: 0.875rem; line-height: 1.4; color: var(--text-secondary);">
                                                ${step.instruction}
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 16px; margin-bottom: 24px;">
                    <button id="btn-mark-cooked" class="btn-primary" style="flex: 1; background: var(--surface-color); border: 1px solid var(--success-color); color: var(--success-color);">
                        Mark Cooked
                    </button>
                    <div style="display: flex; align-items: center; gap: 4px;" id="rating-stars">
                        <!-- Stars -->
                        ${[1,2,3,4,5].map(i => `<svg class="star" data-val="${i}" viewBox="0 0 24 24" fill="${(this.recipe.variety_metadata?.user_rating >= i) ? '#FFD700' : 'none'}" stroke="${(this.recipe.variety_metadata?.user_rating >= i) ? '#FFD700' : 'currentColor'}" stroke-width="2" style="width:24px; height:24px; cursor:pointer;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`).join('')}
                    </div>
                </div>
            </div>

            <div class="glass" style="position: fixed; bottom: 0; left: 0; right: 0; padding: 16px; max-width: 500px; margin: 0 auto; z-index: 10;">
                <button id="btn-start-cook" class="btn-primary" style="width: 100%; height: 50px; font-size: 1.1rem;">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    Start Cooking
                </button>
            </div>
        `;

        this.overlayContainer.appendChild(wrapper);
        this.updateIngredientsAndMacros();
        this.attachListeners(wrapper);
    }

    updateIngredientsAndMacros() {
        const ratio = this.currentServings / this.recipe.base_servings;
        
        // Ingredients
        const ul = document.getElementById('ingredient-list');
        ul.innerHTML = this.recipe.ingredients.map(ing => {
            const amt = (ing.amount * ratio).toFixed(1).replace(/\.0$/, '');
            const nameLower = ing.name.toLowerCase();
            const isCustom = Data.getCustomPantry().includes(nameLower);
            const isPantry = isCustom;

            let badgeHtml = '';
            if (isPantry) {
                badgeHtml = `<span class="pantry-badge-toggle" data-name="${ing.name}" style="font-size:0.65rem; background:rgba(15, 118, 110, 0.08); color:var(--primary-color); padding:2px 6px; border-radius:8px; margin-left:8px; font-weight:600; display:inline-block; vertical-align:middle; cursor:pointer;" title="Remove from Pantry">Pantry ✕</span>`;
            } else {
                badgeHtml = `<button class="pantry-add-toggle" data-name="${ing.name}" style="background:none; border:1px solid var(--border-color); color:var(--text-secondary); padding:2px 6px; border-radius:8px; margin-left:8px; font-size:0.6rem; cursor:pointer; font-family:inherit; outline:none;">+ Pantry</button>`;
            }

            return `<li style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:8px; align-items:center;">
                <span style="display:flex; align-items:center;">${ing.name} ${badgeHtml}</span>
                <span class="font-bold">${amt} ${ing.unit}</span>
            </li>`;
        }).join('');

        // Attach pantry toggle listeners
        ul.querySelectorAll('.pantry-add-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const name = btn.dataset.name;
                Data.addPantryItem(name);
                UI.showToast(`Added ${name} to Pantry`);
                this.updateIngredientsAndMacros();
            });
        });

        ul.querySelectorAll('.pantry-badge-toggle').forEach(badge => {
            badge.addEventListener('click', (e) => {
                e.stopPropagation();
                const name = badge.dataset.name;
                Data.removePantryItem(name);
                UI.showToast(`Removed ${name} from Pantry`);
                this.updateIngredientsAndMacros();
            });
        });

        // Macros
        const m = this.recipe.nutrition_per_serving;
        const bar = document.getElementById('macro-bar');
        bar.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; color: var(--text-primary);">
                <span style="color:#F97316; font-weight:700;">${Math.round(m.calories * this.currentServings)}</span>
                <span class="text-xs text-muted font-normal">Kcal</span>
            </div>
            <div style="display:flex; flex-direction:column; align-items:center; color: var(--text-primary);">
                <span style="color:#10B981; font-weight:700;">${Math.round(m.protein_g * this.currentServings)}g</span>
                <span class="text-xs text-muted font-normal">Protein</span>
            </div>
            <div style="display:flex; flex-direction:column; align-items:center; color: var(--text-primary);">
                <span style="color:#F59E0B; font-weight:700;">${Math.round(m.carbs_g * this.currentServings)}g</span>
                <span class="text-xs text-muted font-normal">Carbs</span>
            </div>
            <div style="display:flex; flex-direction:column; align-items:center; color: var(--text-primary);">
                <span style="color:#3B82F6; font-weight:700;">${Math.round(m.fat_g * this.currentServings)}g</span>
                <span class="text-xs text-muted font-normal">Fat</span>
            </div>
        `;
    }

    attachListeners(wrapper) {
        // Previous/Next recipe navigation
        const prevBtn = document.getElementById('detail-prev');
        const nextBtn = document.getElementById('detail-next');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const currentIndex = this.recipeList.findIndex(r => r.id === this.recipe.id);
                if (currentIndex > 0) {
                    this.render(this.recipeList[currentIndex - 1], this.recipeList);
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const currentIndex = this.recipeList.findIndex(r => r.id === this.recipe.id);
                if (currentIndex > -1 && currentIndex < this.recipeList.length - 1) {
                    this.render(this.recipeList[currentIndex + 1], this.recipeList);
                }
            });
        }

        // Tab switching
        const tabIngs = document.getElementById('tab-ingredients');
        const tabInsts = document.getElementById('tab-instructions');
        const sectionIngs = document.getElementById('detail-ingredients-section');
        const sectionInsts = document.getElementById('detail-instructions-section');

        tabIngs.addEventListener('click', () => {
            tabIngs.className = 'btn-primary';
            tabIngs.style.cssText = 'flex: 1; padding: 10px 0; border-radius: 24px; font-size: 0.9rem; border: none; cursor: pointer;';
            tabInsts.className = 'btn-icon';
            tabInsts.style.cssText = 'flex: 1; padding: 10px 0; border-radius: 24px; font-size: 0.9rem; width: auto; height: auto; cursor: pointer; border: 1px solid var(--border-color); color: var(--text-secondary); background: rgba(15, 118, 110, 0.05); box-shadow: none;';
            sectionIngs.style.display = 'block';
            sectionInsts.style.display = 'none';
        });

        tabInsts.addEventListener('click', () => {
            tabInsts.className = 'btn-primary';
            tabInsts.style.cssText = 'flex: 1; padding: 10px 0; border-radius: 24px; font-size: 0.9rem; border: none; cursor: pointer;';
            tabIngs.className = 'btn-icon';
            tabIngs.style.cssText = 'flex: 1; padding: 10px 0; border-radius: 24px; font-size: 0.9rem; width: auto; height: auto; cursor: pointer; border: 1px solid var(--border-color); color: var(--text-secondary); background: rgba(15, 118, 110, 0.05); box-shadow: none;';
            sectionIngs.style.display = 'none';
            sectionInsts.style.display = 'block';
        });

        document.getElementById('detail-close').addEventListener('click', () => {
            this.overlayContainer.innerHTML = '';
        });

        // Servings
        document.getElementById('servings-up').addEventListener('click', () => {
            this.currentServings++;
            document.getElementById('servings-display').textContent = this.currentServings;
            this.updateIngredientsAndMacros();
        });
        document.getElementById('servings-down').addEventListener('click', () => {
            if (this.currentServings > 1) {
                this.currentServings--;
                document.getElementById('servings-display').textContent = this.currentServings;
                this.updateIngredientsAndMacros();
            }
        });

        // Fav & On Deck
        document.getElementById('detail-fav').addEventListener('click', (e) => {
            const isFav = Data.toggleFavorite(this.recipe.id);
            const svg = e.currentTarget.querySelector('svg');
            svg.setAttribute('fill', isFav ? '#FFD700' : 'none');
            svg.setAttribute('stroke', isFav ? '#FFD700' : 'currentColor');
        });

        document.getElementById('detail-ondeck').addEventListener('click', () => {
            Data.addToOnDeck(this.recipe.id);
            UI.showToast("Added to On-Deck");
        });

        // Mark Cooked
        document.getElementById('btn-mark-cooked').addEventListener('click', () => {
            Data.markAsCooked(this.recipe.id);
            UI.showToast("Marked as cooked! 🍽️");
            // Refresh view data implicitly next time, or re-render
        });

        // Ratings
        const stars = wrapper.querySelectorAll('.star');
        stars.forEach(star => {
            star.addEventListener('click', (e) => {
                const val = parseInt(e.currentTarget.dataset.val);
                Data.setRating(this.recipe.id, val);
                // Update UI stars
                stars.forEach(s => {
                    const sVal = parseInt(s.dataset.val);
                    s.setAttribute('fill', sVal <= val ? '#FFD700' : 'none');
                    s.setAttribute('stroke', sVal <= val ? '#FFD700' : 'currentColor');
                });
            });
        });

        // Start Cooking
        document.getElementById('btn-start-cook').addEventListener('click', () => {
            // Enter cook mode
            this.cookView.render(this.recipe, this.currentServings);
        });
    }
}
