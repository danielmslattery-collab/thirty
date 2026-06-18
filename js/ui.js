import { Data } from './data.js';

export const UI = {
    /**
     * Creates a recipe card DOM element
     */
    createRecipeCard(recipe, onClick) {
        const card = document.createElement('div');
        card.className = 'glass-card recipe-card';
        card.style.cursor = 'pointer';
        card.style.position = 'relative';
        card.style.overflow = 'hidden';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.gap = '8px';
        card.style.background = '#FFFFFF';
        card.style.borderRadius = '16px';
        card.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
        card.style.border = '1px solid rgba(0,0,0,0.04)';

        // Difficulty badge mapping
        const diffColors = {
            easy: '#10B981',
            medium: '#F59E0B',
            hard: '#EF4444'
        };
        const badgeColor = diffColors[recipe.tags.difficulty] || '#64748b';

        let lastCookedStr = '';
        if (recipe.variety_metadata?.last_suggested_date && recipe.variety_metadata?.times_cooked > 0) {
            const lastDate = new Date(recipe.variety_metadata.last_suggested_date);
            const diffTime = Math.abs(new Date() - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            lastCookedStr = `<div style="margin-top: auto; padding-top: 8px; font-size: 0.75rem; color: #64748b;">Last cooked: ${diffDays} days ago</div>`;
        }

        const heatLevel = recipe.tags.heat_level || 0;
        const heatStr = heatLevel > 0 ? `<span>🌶️ ${heatLevel}/10</span>` : '';

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="background: rgba(249, 115, 22, 0.1); color: #F97316; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    ${recipe.tags.prep_time_minutes}m
                </span>
                <span style="color: ${badgeColor}; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; display: inline-flex; align-items: center; gap: 4px;">
                    <span style="width: 6px; height: 6px; border-radius: 50%; background: ${badgeColor}; display: inline-block;"></span>
                    ${recipe.tags.difficulty}
                </span>
            </div>
            <h3 style="font-size: 1.15rem; margin: 4px 0; line-height: 1.3; color: #0F172A; font-weight: 700;">${recipe.title}</h3>
            <div class="text-xs" style="display: flex; gap: 8px; flex-wrap: wrap; color: #475569;">
                <span>🥩 ${recipe.tags.protein}</span>
                <span>🌍 ${recipe.tags.cuisine}</span>
                <span>🔥 ${recipe.nutrition_per_serving.calories} kcal</span>
                ${heatStr}
            </div>
            ${lastCookedStr}
        `;

        card.addEventListener('click', () => {
            if (onClick) onClick(recipe);
        });

        return card;
    },

    /**
     * Clear and append children safely
     */
    render(container, elements) {
        container.innerHTML = '';
        if (Array.isArray(elements)) {
            elements.forEach(el => container.appendChild(el));
        } else if (elements instanceof HTMLElement) {
            container.appendChild(elements);
        } else {
            container.innerHTML = elements;
        }
    },

    /**
     * Show a temporary toast notification
     */
    showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.position = 'fixed';
        toast.style.bottom = '90px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = '#333';
        toast.style.color = '#fff';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '24px';
        toast.style.zIndex = '1000';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        toast.style.fontWeight = '500';
        toast.style.whiteSpace = 'nowrap';
        
        document.body.appendChild(toast);
        
        // Trigger reflow for transition
        toast.offsetHeight; 
        toast.style.opacity = '1';
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.addEventListener('transitionend', () => {
                toast.remove();
            });
        }, 2000);
    }
};

// Add card specific styles to styles.css programmatically or via link
const style = document.createElement('style');
style.textContent = `
.recipe-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 4px 0;
}
.recipe-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.recipe-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.08) !important;
}
`;
document.head.appendChild(style);
