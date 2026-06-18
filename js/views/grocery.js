import { Data } from '../data.js';
import { UI } from '../ui.js';

export default class GroceryView {
    constructor(container) {
        this.container = container;
        this.showPantry = false;
        this.mode = 'combined'; // 'combined' or 'by-recipe'
    }

    async render() {
        const onDeckIds = Data.getOnDeck();
        if (onDeckIds.length === 0) {
            this.container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; display: flex; flex-direction: column; align-items: center; gap: 16px;">
                    <img src="./Thirty Logo.jpeg" alt="Thirty Logo" style="width: 80px; height: auto; opacity: 0.15; object-fit: contain; margin-bottom: 8px;">
                    <div>
                        <p style="font-weight: 600; font-size: 1.1rem; color: var(--text-primary); margin: 0;">Your grocery list is empty</p>
                        <p class="text-sm" style="margin-top: 6px; color: var(--text-secondary); margin-bottom: 0;">Add recipes to your On-Deck queue to generate a list.</p>
                    </div>
                </div>
            `;
            return;
        }

        const recipes = onDeckIds.map(id => Data.getRecipeById(id)).filter(Boolean);
        const customPantry = Data.getCustomPantry();

        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <h2 style="font-size:1.2rem;">From ${recipes.length} On-Deck Recipe(s)</h2>
                ${this.mode === 'combined' ? `
                <div style="display:flex; gap: 8px;">
                    <button id="btn-share" class="btn-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg></button>
                    <button id="btn-copy" class="btn-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
                </div>` : ''}
            </div>

            <!-- Mode Toggle Pill -->
            <div style="display:flex; background: rgba(15, 118, 110, 0.08); border-radius: 20px; padding: 4px; margin-bottom: 16px;">
                <button id="mode-combined" style="flex:1; padding: 8px; border-radius: 16px; border:none; background: ${this.mode === 'combined' ? 'var(--primary-color)' : 'transparent'}; color: ${this.mode === 'combined' ? 'white' : 'var(--text-secondary)'}; font-weight: bold; cursor: pointer; transition: background 0.2s; font-family: inherit;">Combined</button>
                <button id="mode-by-recipe" style="flex:1; padding: 8px; border-radius: 16px; border:none; background: ${this.mode === 'by-recipe' ? 'var(--primary-color)' : 'transparent'}; color: ${this.mode === 'by-recipe' ? 'white' : 'var(--text-secondary)'}; font-weight: bold; cursor: pointer; transition: background 0.2s; font-family: inherit;">By Recipe</button>
            </div>
        `;

        if (this.mode === 'combined') {
            const { list, pantryHidden } = this.generateList(recipes, customPantry);
            this.listDataForExport = list;

            html += this.renderPantryToggle(pantryHidden);

            const grouped = {};
            list.forEach(item => {
                if (!grouped[item.category]) grouped[item.category] = [];
                grouped[item.category].push(item);
            });

            const categories = Object.keys(grouped).sort();

            categories.forEach(cat => {
                html += `<h3 style="margin-top: 16px; margin-bottom: 8px; color: var(--primary-color); text-transform: capitalize;">${cat}</h3>`;
                html += `<div class="glass-card" style="margin-bottom:16px;"><ul style="list-style:none; display:flex; flex-direction:column; gap:8px;">`;
                
                grouped[cat].forEach(item => {
                    html += `
                        <li style="display:flex; justify-content:space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; align-items:center;">
                            <div style="display:flex; align-items:center; gap: 8px;">
                                <button class="btn-pantry-add" data-name="${item.name}" style="background:none; border:1px solid var(--border-color); color:var(--text-secondary); width: 22px; height: 22px; border-radius: 50%; display:flex; align-items:center; justify-content:center; cursor:pointer; padding: 0; outline: none;" title="I have this (Add to Pantry)">
                                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </button>
                                <span>${item.name}</span>
                            </div>
                            <span class="font-bold">${item.amount} ${item.unit}</span>
                        </li>
                    `;
                });
                html += `</ul></div>`;
            });
        } else {
            // By Recipe Mode
            let totalPantryHiddenCount = 0;
            const recipeData = [];

            recipes.forEach(recipe => {
                const ingredients = [];
                recipe.ingredients.forEach(ing => {
                    const nameLower = ing.name.toLowerCase();
                    const isCustomPantry = customPantry.includes(nameLower);
                    const isPantry = isCustomPantry;

                    if (isPantry && !this.showPantry) {
                        totalPantryHiddenCount++;
                        return;
                    }
                    ingredients.push(ing);
                });
                recipeData.push({ recipe, ingredients });
            });

            html += this.renderPantryToggle(totalPantryHiddenCount);

            recipeData.forEach((data, index) => {
                const r = data.recipe;
                const ings = data.ingredients;
                
                // Build simple copy text
                const copyText = ings.map(i => `${i.name}: ${parseFloat(i.amount.toFixed(2))} ${i.unit}`).join('\n');
                // Store text for event listener
                const copyTextBase64 = btoa(unescape(encodeURIComponent(copyText)));

                html += `
                    <div class="glass-card" style="margin-bottom: 16px;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                            <div>
                                <h3 style="font-size:1.1rem; margin-bottom:4px;">${r.title}</h3>
                                <div class="text-xs text-muted">${r.tags.prep_time_minutes}m • ${r.tags.cuisine}</div>
                            </div>
                            <button class="btn-icon btn-copy-recipe" data-text="${copyTextBase64}" style="width:32px;height:32px; flex-shrink:0;">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            </button>
                        </div>
                        <ul style="list-style:none; display:flex; flex-direction:column; gap:8px;">
                             ${ings.map(i => `
                                <li style="display:flex; justify-content:space-between; font-size:0.95rem; align-items:center;">
                                    <div style="display:flex; align-items:center; gap: 8px;">
                                        <button class="btn-pantry-add" data-name="${i.name}" style="background:none; border:1px solid var(--border-color); color:var(--text-secondary); width: 20px; height: 20px; border-radius: 50%; display:flex; align-items:center; justify-content:center; cursor:pointer; padding: 0; outline: none;" title="I have this (Add to Pantry)">
                                            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        </button>
                                        <span>${i.name}</span>
                                    </div>
                                    <span class="font-bold">${parseFloat(i.amount.toFixed(2))} ${i.unit}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `;
            });
        }

        this.container.innerHTML = html;
        this.attachListeners();
    }

    renderPantryToggle(pantryHiddenCount) {
        return `
            <div style="margin-bottom: 24px; padding: 12px; border-radius: 12px; background: rgba(15, 118, 110, 0.05); display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <span class="font-bold">${pantryHiddenCount}</span> pantry items excluded
                </div>
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                    <input type="checkbox" id="toggle-pantry" ${this.showPantry ? 'checked' : ''} style="width:18px;height:18px;">
                    Show Pantry
                </label>
            </div>
        `;
    }

    generateList(recipes, customPantry) {
        const map = new Map(); // key -> { name, category, amount, unit, isPantry }
        let pantryHiddenCount = 0;

        recipes.forEach(recipe => {
            recipe.ingredients.forEach(ing => {
                const nameLower = ing.name.toLowerCase();
                const isCustomPantry = customPantry.includes(nameLower);
                const isPantry = isCustomPantry;

                if (isPantry && !this.showPantry) {
                    pantryHiddenCount++;
                    return; // Skip if it's a pantry item and we are hiding them
                }

                const key = `${nameLower}|${ing.unit}`;
                
                if (map.has(key)) {
                    const existing = map.get(key);
                    existing.amount += ing.amount;
                } else {
                    map.set(key, {
                        name: ing.name,
                        category: ing.category,
                        amount: ing.amount,
                        unit: ing.unit,
                        isPantry: isPantry
                    });
                }
            });
        });

        const list = Array.from(map.values()).map(item => {
            item.amount = parseFloat(item.amount.toFixed(2));
            return item;
        });

        return { list, pantryHidden: pantryHiddenCount };
    }

    getExportText() {
        let text = "Grocery List\n\n";
        
        const grouped = {};
        this.listDataForExport.forEach(item => {
            if (!grouped[item.category]) grouped[item.category] = [];
            grouped[item.category].push(item);
        });

        Object.keys(grouped).sort().forEach(cat => {
            text += `[${cat.toUpperCase()}]\n`;
            grouped[cat].forEach(item => {
                text += `- ${item.name}: ${item.amount} ${item.unit}\n`;
            });
            text += `\n`;
        });

        return text;
    }

    attachListeners() {
        // Pantry Toggle
        const togglePantry = document.getElementById('toggle-pantry');
        if (togglePantry) {
            togglePantry.addEventListener('change', (e) => {
                this.showPantry = e.target.checked;
                this.render();
            });
        }

        // Mode Toggles
        const btnCombined = document.getElementById('mode-combined');
        if (btnCombined) {
            btnCombined.addEventListener('click', () => {
                if (this.mode !== 'combined') {
                    this.mode = 'combined';
                    this.render();
                }
            });
        }

        const btnByRecipe = document.getElementById('mode-by-recipe');
        if (btnByRecipe) {
            btnByRecipe.addEventListener('click', () => {
                if (this.mode !== 'by-recipe') {
                    this.mode = 'by-recipe';
                    this.render();
                }
            });
        }

        // Combined Mode Global Actions
        if (this.mode === 'combined') {
            document.getElementById('btn-copy').addEventListener('click', () => {
                const text = this.getExportText();
                navigator.clipboard.writeText(text).then(() => {
                    alert("Copied to clipboard!");
                });
            });

            document.getElementById('btn-share').addEventListener('click', () => {
                const text = this.getExportText();
                if (navigator.share) {
                    navigator.share({
                        title: 'My Grocery List',
                        text: text
                    }).catch(console.error);
                } else {
                    alert("Web Share API not supported on this browser. Try copying instead.");
                }
            });
        }

        // By Recipe Mode Card Actions
        if (this.mode === 'by-recipe') {
            document.querySelectorAll('.btn-copy-recipe').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const encodedText = e.currentTarget.dataset.text;
                    const plainText = decodeURIComponent(escape(atob(encodedText)));
                    navigator.clipboard.writeText(plainText).then(() => {
                        // Quick visual feedback
                        const originalSvg = e.currentTarget.innerHTML;
                        e.currentTarget.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#4CAF50" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                        setTimeout(() => {
                            e.currentTarget.innerHTML = originalSvg;
                        }, 2000);
                    });
                });
            });
        }

        // Attach inline pantry add listeners (both modes)
        document.querySelectorAll('.btn-pantry-add').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const name = btn.dataset.name;
                Data.addPantryItem(name);
                UI.showToast(`Added ${name} to Pantry`);
                this.render(); // Re-render the grocery list to filter out the added item
            });
        });
    }
}
