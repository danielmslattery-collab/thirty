import { Data } from './data.js';
import BrowseView from './views/browse.js';
import GroceryView from './views/grocery.js';
import ListsView from './views/lists.js';
import SettingsView from './views/settings.js';

class App {
    constructor() {
        this.currentTab = 'browse';
        this.views = {};
        this.headerTitle = document.getElementById('header-title');
        this.appContent = document.getElementById('app-content');
        this.navItems = document.querySelectorAll('.nav-item');
        this.settingsView = new SettingsView();
    }

    async init() {
        // Initialize Data
        await Data.init();

        // Initialize Views
        this.views = {
            browse: new BrowseView(this.appContent),
            grocery: new GroceryView(this.appContent),
            ondeck: new ListsView(this.appContent, 'ondeck'),
            favorites: new ListsView(this.appContent, 'favorites')
        };

        // Setup Navigation
        this.navItems.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.navigate(tab);
            });
        });

        // Setup Settings Button
        document.getElementById('btn-settings').addEventListener('click', () => {
            this.settingsView.show();
        });

        // Setup Logo Home click handler
        document.getElementById('logo-home-link').addEventListener('click', () => {
            this.navigate('browse');
        });

        // Load Initial Tab
        this.navigate('browse');
    }

    navigate(tab) {
        // Update nav UI
        this.navItems.forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`.nav-item[data-tab="${tab}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        // Update header
        const titles = {
            browse: 'Thirty Minute Meals',
            grocery: 'Grocery List',
            ondeck: 'On-Deck',
            favorites: 'Favorites'
        };
        this.headerTitle.textContent = titles[tab];

        // Render view
        this.currentTab = tab;
        if (this.views[tab]) {
            this.views[tab].render();
        }
    }
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
    window.app.init();
});
