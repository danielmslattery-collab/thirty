import { Data } from '../data.js';
import { UI } from '../ui.js';
import DetailView from './detail.js';

export default class ListsView {
    constructor(container, listType) {
        this.container = container;
        this.listType = listType; // 'ondeck' or 'favorites'
        this.detailView = new DetailView();
    }

    render() {
        const ids = this.listType === 'ondeck' ? Data.getOnDeck() : Data.getFavorites();
        
        let headerHtml = `
            <div style="margin-bottom: 16px;">
                <p class="text-muted">
                    ${this.listType === 'ondeck' 
                        ? 'Your queue of planned meals. The smart grocery list will be generated from these recipes.' 
                        : 'Your favorite recipes, saved for quick access.'}
                </p>
            </div>
        `;

        if (ids.length === 0) {
            const isOndeck = this.listType === 'ondeck';
            const subtext = isOndeck 
                ? 'Add recipes from the Meals tab or quick-fill it to get started.' 
                : 'Tap the star icon on any recipe to save it here.';
            const actionButton = isOndeck
                ? `<button id="btn-randomize-ondeck" class="btn-primary" style="margin-top: 16px; padding: 10px 20px; border-radius: 20px; font-size: 0.9rem; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;">
                     <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                     Add 5 Random Meals
                   </button>`
                : '';
            this.container.innerHTML = headerHtml + `
                <div style="text-align: center; padding: 60px 20px; display: flex; flex-direction: column; align-items: center; gap: 16px;">
                    <img src="./Thirty Logo.jpeg" alt="Thirty Logo" style="width: 80px; height: auto; opacity: 0.15; object-fit: contain; margin-bottom: 8px;">
                    <div>
                        <p style="font-weight: 600; font-size: 1.1rem; color: var(--text-primary); margin: 0;">This list is empty</p>
                        <p class="text-sm" style="margin-top: 6px; color: var(--text-secondary); margin-bottom: 0;">${subtext}</p>
                        ${actionButton}
                    </div>
                </div>
            `;
            if (isOndeck) {
                document.getElementById('btn-randomize-ondeck').addEventListener('click', () => {
                    this.fillWithRandomRecipes(5);
                });
            }
            return;
        }

        const recipes = ids.map(id => Data.getRecipeById(id)).filter(Boolean);

        // Render as a single column list instead of grid for easier reordering and viewing
        let listHtml = `<div id="${this.listType}-list" style="display: flex; flex-direction: column; gap: 12px;"></div>`;
        
        this.container.innerHTML = headerHtml + listHtml;
        const listContainer = document.getElementById(`${this.listType}-list`);

        recipes.forEach((recipe, index) => {
            const card = document.createElement('div');
            card.className = 'glass-card';
            card.style.display = 'flex';
            card.style.gap = '12px';
            card.style.alignItems = 'center';
            card.style.cursor = 'pointer';

            // Add simple up/down arrows for On-Deck ordering
            let orderControls = '';
            if (this.listType === 'ondeck') {
                orderControls = `
                    <div style="display:flex; flex-direction:column; gap: 8px;">
                        <button class="btn-icon move-up" data-index="${index}" style="width:30px;height:30px; ${index === 0 ? 'opacity:0.2; pointer-events:none;' : ''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg></button>
                        <button class="btn-icon move-down" data-index="${index}" style="width:30px;height:30px; ${index === recipes.length-1 ? 'opacity:0.2; pointer-events:none;' : ''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
                    </div>
                `;
            }

            // Remove button
            const removeBtn = `
                <button class="btn-icon btn-remove" data-id="${recipe.id}" style="width:30px;height:30px; margin-left:auto; color:var(--primary-color); border-color:var(--primary-color);"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
            `;

            const timesCooked = recipe.variety_metadata?.times_cooked || 0;
            const heatLevel = recipe.tags.heat_level || 0;
            const heatStr = heatLevel > 0 ? `<span>🌶️ ${heatLevel}/10</span>` : '';

            card.innerHTML = `
                ${orderControls}
                <div style="flex: 1; padding: 6px 0;" class="recipe-info">
                    <h3 style="font-size: 1.1rem; margin-bottom: 6px; font-weight: 600; color: var(--text-primary);">${recipe.title}</h3>
                    <div class="text-xs" style="color: var(--text-secondary); display: flex; flex-direction: column; gap: 4px;">
                        <div>Cooked: ${timesCooked} times</div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
                            <span>🥩 ${recipe.tags.protein}</span>
                            <span>🌍 ${recipe.tags.cuisine}</span>
                            <span>⚡ ${recipe.tags.difficulty}</span>
                            ${heatStr}
                        </div>
                    </div>
                </div>
                ${removeBtn}
            `;

            // Click to open detail
            card.querySelector('.recipe-info').addEventListener('click', () => {
                this.detailView.render(recipe, recipes);
            });

            // Action listeners
            if (this.listType === 'ondeck') {
                const moveUp = card.querySelector('.move-up');
                if (moveUp) moveUp.addEventListener('click', (e) => this.reorder(index, index - 1));
                const moveDown = card.querySelector('.move-down');
                if (moveDown) moveDown.addEventListener('click', (e) => this.reorder(index, index + 1));
            }

            card.querySelector('.btn-remove').addEventListener('click', (e) => {
                if (this.listType === 'ondeck') {
                    Data.removeFromOnDeck(recipe.id);
                } else {
                    Data.toggleFavorite(recipe.id);
                }
                this.render(); // Re-render the list
            });

            listContainer.appendChild(card);
        });
    }

    reorder(fromIndex, toIndex) {
        const queue = Data.getOnDeck();
        if (toIndex < 0 || toIndex >= queue.length) return;
        
        // Swap
        const temp = queue[fromIndex];
        queue[fromIndex] = queue[toIndex];
        queue[toIndex] = temp;
        
        Data.reorderOnDeck(queue);
        this.render();
    }

    fillWithRandomRecipes(count) {
        const allRecipes = Data.getAllRecipes();
        if (allRecipes.length === 0) return;

        // Fisher-Yates Shuffle for true, unbiased uniform randomness
        const shuffled = [...allRecipes];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        const selected = shuffled.slice(0, Math.min(count, allRecipes.length));

        selected.forEach(recipe => {
            Data.addToOnDeck(recipe.id);
        });

        UI.showToast(`Added ${selected.length} random meals to On-Deck!`);
        this.render();
    }
}
