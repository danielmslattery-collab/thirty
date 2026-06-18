import { Data } from '../data.js';
import { UI } from '../ui.js';

export default class SettingsView {
    constructor() {
        this.overlayContainer = document.getElementById('overlay-container');
    }

    show() {
        this.overlayContainer.innerHTML = '';

        const wrapper = document.createElement('div');
        wrapper.style.position = 'absolute';
        wrapper.style.top = '0';
        wrapper.style.left = '0';
        wrapper.style.right = '0';
        wrapper.style.bottom = '0';
        wrapper.style.backgroundColor = 'rgba(15, 23, 42, 0.4)'; // Dim overlay
        wrapper.style.backdropFilter = 'blur(4px)';
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.justifyContent = 'center';
        wrapper.style.zIndex = '400';
        wrapper.id = 'settings-modal-wrapper';

        // Calculate statistics
        const allRecipes = Data.getAllRecipes();
        const favorites = Data.getFavorites();
        const onDeck = Data.getOnDeck();
        const customPantry = Data.getCustomPantry();

        let totalCooked = 0;
        const cuisineCounts = {};
        allRecipes.forEach(r => {
            const count = r.variety_metadata?.times_cooked || 0;
            totalCooked += count;
            if (count > 0 && r.tags.cuisine) {
                cuisineCounts[r.tags.cuisine] = (cuisineCounts[r.tags.cuisine] || 0) + count;
            }
        });

        let favoriteCuisine = 'None';
        let maxCount = 0;
        for (const [cuisine, count] of Object.entries(cuisineCounts)) {
            if (count > maxCount) {
                maxCount = count;
                favoriteCuisine = cuisine;
            }
        }

        // Settings options from local storage
        const wakeLockEnabled = localStorage.getItem('thirty_settings_wakeLock') !== 'false';

        wrapper.innerHTML = `
            <div class="glass-card" style="width: 90%; max-width: 420px; background: #FFFFFF; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); display: flex; flex-direction: column; max-height: 85vh; padding: 20px; overflow-y: auto;">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 16px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <img src="./Thirty Logo.jpeg" alt="Thirty Logo" style="height: 30px; width: auto; object-fit: contain;">
                        <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin: 0;">Settings</h2>
                    </div>
                    <button id="settings-close" class="btn-icon" style="width:32px; height:32px;">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <!-- Stats Dashboard -->
                <div style="background: rgba(15, 118, 110, 0.05); border-radius: 12px; padding: 12px; margin-bottom: 16px;">
                    <h3 style="font-size: 0.95rem; margin-bottom: 10px; color: var(--primary-color); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">Cooking Stats</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                        <div style="display: flex; flex-direction: column;">
                            <span class="text-xs text-muted">Total Cooked</span>
                            <span style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary);">${totalCooked} meals</span>
                        </div>
                        <div style="display: flex; flex-direction: column;">
                            <span class="text-xs text-muted">Favorites</span>
                            <span style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary);">${favorites.length} saved</span>
                        </div>
                        <div style="display: flex; flex-direction: column; grid-column: span 2;">
                            <span class="text-xs text-muted">Top Cuisine Cooked</span>
                            <span style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary); text-transform: capitalize;">${favoriteCuisine}</span>
                        </div>
                    </div>
                </div>

                <!-- Pantry Manager -->
                <div style="margin-bottom: 16px;">
                    <h3 style="font-size: 0.95rem; margin-bottom: 8px; color: var(--primary-color); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">Pantry Stock Manager</h3>
                    <p class="text-xs text-muted" style="margin-bottom: 10px;">Items in your pantry won't show up on your grocery list.</p>
                    
                    <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                        <input type="text" id="pantry-input" placeholder="e.g. Olive Oil, Garlic, Salt" 
                               style="flex: 1; padding: 8px 12px; border-radius: 16px; border: 1px solid var(--border-color); background: #f8fafc; color: var(--text-primary); outline: none; font-family: inherit; font-size: 0.9rem;">
                        <button id="pantry-add-btn" class="btn-primary" style="padding: 8px 16px; border-radius: 16px; font-size: 0.85rem; border: none; height: auto;">Add</button>
                    </div>

                    <!-- Tags list -->
                    <div id="pantry-tags-list" style="display: flex; flex-wrap: wrap; gap: 6px; max-height: 120px; overflow-y: auto; padding: 4px 0;">
                        <!-- Custom Pantry Tags injected here -->
                    </div>
                </div>

                <!-- App Preferences -->
                <div style="margin-bottom: 20px; border-top: 1px solid var(--border-color); padding-top: 12px;">
                    <h3 style="font-size: 0.95rem; margin-bottom: 10px; color: var(--primary-color); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700;">Preferences</h3>
                    <label style="display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-size: 0.95rem; color: var(--text-primary);">
                        <span>Keep Screen On (Wake Lock)</span>
                        <input type="checkbox" id="pref-wakelock" ${wakeLockEnabled ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
                    </label>
                </div>

                <!-- How it Works Guide -->
                <div style="margin-bottom: 20px; border-top: 1px solid var(--border-color); padding-top: 12px;">
                    <button id="btn-toggle-guide" style="width: 100%; display: flex; justify-content: space-between; align-items: center; background: none; border: none; font-size: 0.95rem; font-weight: 700; color: var(--primary-color); cursor: pointer; padding: 4px 0; font-family: inherit; outline: none;">
                        <span>How it Works (Quick Start Guide)</span>
                        <svg id="guide-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="transform: rotate(0deg); transition: transform 0.2s;"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                    
                    <div id="guide-content" style="display: none; margin-top: 10px; font-size: 0.825rem; color: var(--text-secondary); line-height: 1.5; flex-direction: column; gap: 10px; max-height: 220px; overflow-y: auto; padding: 8px; border-radius: 12px; background: rgba(15, 118, 110, 0.04); border: 1px solid rgba(15, 118, 110, 0.1);">
                        <p style="margin: 0;"><strong>📱 Install as App:</strong> Open this site in Safari (iOS) or Chrome (Android). Tap <strong>Share/Menu</strong> and select <strong>"Add to Home Screen"</strong> to run fullscreen and offline as a PWA app.</p>
                        <p style="margin: 0;"><strong>🔒 Private Local Data:</strong> All favorites, cooking history, and custom pantry items are stored 100% locally inside your device browser cache. No accounts needed, and your logs are private to you.</p>
                        <p style="margin: 0;"><strong>🛒 Smart Grocery Lists:</strong> Add meals to your <strong>On-Deck</strong> queue. The Grocery tab auto-combines ingredients. Tap checkmark <code>✓</code> next to any item to mark it in stock and remove it from your shopping list.</p>
                        <p style="margin: 0;"><strong>💾 Secure Backups:</strong> Use <strong>"Export Backup"</strong> to download a settings file. You can import this file to restore your stats if you clear your browser cache or switch devices.</p>
                    </div>
                </div>

                <!-- Backup & Actions -->
                <div style="border-top: 1px solid var(--border-color); padding-top: 16px; display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; gap: 8px;">
                        <button id="btn-export-data" class="btn-icon" style="flex: 1; border-radius: 12px; height: 40px; font-size: 0.85rem; display: flex; gap: 6px; font-family: inherit;">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Export Backup
                        </button>
                        <button id="btn-import-data" class="btn-icon" style="flex: 1; border-radius: 12px; height: 40px; font-size: 0.85rem; display: flex; gap: 6px; font-family: inherit;">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                            Import Backup
                        </button>
                        <input type="file" id="file-import-input" accept=".json" style="display: none;">
                    </div>
                    
                    <button id="btn-reset-data" class="btn-primary" style="background: #ef4444; box-shadow: none; border-radius: 12px; height: 40px; font-size: 0.9rem; font-weight: bold; margin-top: 8px;">
                        Reset All Application Data
                    </button>
                </div>
            </div>
        `;

        this.overlayContainer.appendChild(wrapper);
        this.renderPantryTags();
        this.attachListeners(wrapper);
    }

    renderPantryTags() {
        const listContainer = document.getElementById('pantry-tags-list');
        if (!listContainer) return;

        const pantry = Data.getCustomPantry();
        if (pantry.length === 0) {
            listContainer.innerHTML = `<span style="font-size: 0.8rem; color: var(--text-secondary); italic;">No custom pantry items added yet.</span>`;
            return;
        }

        listContainer.innerHTML = pantry.map(item => `
            <span style="display: inline-flex; align-items: center; gap: 4px; background: rgba(15, 118, 110, 0.08); color: var(--primary-color); padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; text-transform: capitalize;">
                ${item}
                <button class="remove-tag-btn" data-name="${item}" style="background: none; border: none; color: var(--primary-color); cursor: pointer; font-size: 0.9rem; padding: 0; line-height: 1; display:flex; align-items:center;">&times;</button>
            </span>
        `).join('');

        // Attach delete tag listeners
        listContainer.querySelectorAll('.remove-tag-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const name = btn.dataset.name;
                Data.removePantryItem(name);
                this.renderPantryTags();
                // trigger global refresh of current active view
                this.triggerViewUpdate();
            });
        });
    }

    attachListeners(wrapper) {
        // Close modal
        const closeBtn = document.getElementById('settings-close');
        const wrapperEl = document.getElementById('settings-modal-wrapper');

        const closeModal = () => {
            wrapper.remove();
        };

        closeBtn.addEventListener('click', closeModal);
        wrapperEl.addEventListener('click', (e) => {
            if (e.target === wrapperEl) closeModal();
        });

        // Add custom pantry item
        const pantryInput = document.getElementById('pantry-input');
        const pantryAddBtn = document.getElementById('pantry-add-btn');

        const addPantryItem = () => {
            const val = pantryInput.value.trim();
            if (val) {
                Data.addPantryItem(val);
                pantryInput.value = '';
                this.renderPantryTags();
                this.triggerViewUpdate();
            }
        };

        pantryAddBtn.addEventListener('click', addPantryItem);
        pantryInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') addPantryItem();
        });

        // Toggle How it Works Guide
        const toggleGuideBtn = document.getElementById('btn-toggle-guide');
        const guideContent = document.getElementById('guide-content');
        const guideArrow = document.getElementById('guide-arrow');

        toggleGuideBtn.addEventListener('click', () => {
            const isHidden = guideContent.style.display === 'none';
            guideContent.style.display = isHidden ? 'flex' : 'none';
            guideArrow.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
        });

        // Preferences Wake Lock
        const prefWakeLock = document.getElementById('pref-wakelock');
        prefWakeLock.addEventListener('change', (e) => {
            localStorage.setItem('thirty_settings_wakeLock', e.target.checked ? 'true' : 'false');
            UI.showToast(`Screen wake lock ${e.target.checked ? 'enabled' : 'disabled'}`);
        });

        // Export Backup
        document.getElementById('btn-export-data').addEventListener('click', () => {
            const dataToExport = {
                onDeck: Data.getOnDeck(),
                favorites: Data.getFavorites(),
                customPantry: Data.getCustomPantry(),
                metadata: localStorage.getItem('recipe_userMetadata') ? JSON.parse(localStorage.getItem('recipe_userMetadata')) : {}
            };

            const jsonStr = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = 'thirty_backup.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            UI.showToast("Backup downloaded!");
        });

        // Import Backup
        const fileInput = document.getElementById('file-import-input');
        document.getElementById('btn-import-data').addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const imported = JSON.parse(event.target.result);
                    
                    if (imported.onDeck) localStorage.setItem('recipe_onDeck', JSON.stringify(imported.onDeck));
                    if (imported.favorites) localStorage.setItem('recipe_favorites', JSON.stringify(imported.favorites));
                    if (imported.customPantry) localStorage.setItem('recipe_customPantry', JSON.stringify(imported.customPantry));
                    if (imported.metadata) localStorage.setItem('recipe_userMetadata', JSON.stringify(imported.metadata));

                    UI.showToast("Data restored successfully!");
                    setTimeout(() => {
                        window.location.reload(); // Reload to refresh all cache/views
                    }, 1000);
                } catch (err) {
                    alert("Failed to parse backup file. Please make sure it is a valid thirty_backup.json file.");
                }
            };
            reader.readAsText(file);
        });

        // Reset Data
        document.getElementById('btn-reset-data').addEventListener('click', () => {
            const confirmReset = confirm("Are you sure you want to clear all your application data? This will delete all your favorites, grocery lists, custom pantry, and cooked history. This cannot be undone.");
            if (confirmReset) {
                localStorage.clear();
                UI.showToast("Application data reset.");
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        });
    }

    triggerViewUpdate() {
        // Helper to trigger a re-render of whatever view is currently active in the app
        if (window.app && window.app.currentTab && window.app.views[window.app.currentTab]) {
            window.app.views[window.app.currentTab].render();
        }
    }
}
