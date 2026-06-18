export default class CookView {
    constructor() {
        this.overlayContainer = document.getElementById('overlay-container');
        this.recipe = null;
        this.servings = null;
        this.timers = {}; // step index -> timer interval ID
        this.timeRemaining = {}; // step index -> seconds remaining
    }

    render(recipe, servings) {
        this.recipe = recipe;
        this.servings = servings;
        this.show();
        this.requestWakeLock();
    }

    async requestWakeLock() {
        const wakeLockEnabled = localStorage.getItem('thirty_settings_wakeLock') !== 'false';
        if (!wakeLockEnabled) return;

        try {
            if ('wakeLock' in navigator) {
                this.wakeLock = await navigator.wakeLock.request('screen');
            }
        } catch (err) {
            console.log(`Wake lock failed: ${err.name}, ${err.message}`);
        }
    }

    releaseWakeLock() {
        if (this.wakeLock) {
            this.wakeLock.release()
                .then(() => { this.wakeLock = null; });
        }
    }

    show() {
        // Group steps by track
        const tracks = {};
        this.recipe.steps.forEach((step, idx) => {
            const trackName = step.track || 'Main';
            if (!tracks[trackName]) tracks[trackName] = [];
            tracks[trackName].push({ ...step, originalIndex: idx });
        });

        const trackKeys = Object.keys(tracks);

        const wrapper = document.createElement('div');
        wrapper.style.position = 'absolute';
        wrapper.style.top = '0';
        wrapper.style.left = '0';
        wrapper.style.right = '0';
        wrapper.style.bottom = '0';
        wrapper.style.backgroundColor = '#000000'; // Pure black for distraction free
        wrapper.style.color = '#ffffff';
        wrapper.style.overflowY = 'auto';
        wrapper.style.zIndex = '300'; // Above detail view

        // Header
        let html = `
            <div style="position: sticky; top: 0; background: #000; padding: 16px; border-bottom: 1px solid #333; z-index: 10; display:flex; align-items:center; gap: 16px;">
                <button id="cook-close" style="background:none; border:none; color:white; width: 40px; height: 40px; border-radius: 50%; background: #333; display:flex; align-items:center; justify-content:center;">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </button>
                <h2 style="font-size: 1.2rem; flex:1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${this.recipe.title}</h2>
            </div>
            <div style="padding: 16px; display:flex; gap: 16px; min-height: calc(100vh - 80px);">
        `;

        // Parallel columns for tracks
        trackKeys.forEach(trackName => {
            html += `<div style="flex: 1; display: flex; flex-direction: column; gap: 16px;">`;
            html += `<h3 style="font-size: 1.1rem; border-bottom: 2px solid var(--primary-color); padding-bottom: 4px; display: inline-block;">Track: ${trackName}</h3>`;
            
            tracks[trackName].forEach(step => {
                const hasTimer = step.timer_minutes > 0;
                let timerHtml = '';
                if (hasTimer) {
                    this.timeRemaining[step.originalIndex] = step.timer_minutes * 60;
                    timerHtml = `
                        <div class="timer-btn" data-index="${step.originalIndex}" style="margin-top: 12px; background: rgba(249, 115, 22, 0.15); border: 1px solid var(--accent-color); color: var(--accent-color); padding: 8px 16px; border-radius: 20px; text-align: center; font-weight: bold; font-size: 1.2rem; cursor: pointer;">
                            ${this.formatTime(this.timeRemaining[step.originalIndex])}
                        </div>
                    `;
                }

                html += `
                    <div class="cook-step" data-index="${step.originalIndex}" style="background: #111; padding: 16px; border-radius: 12px; border: 1px solid #333; transition: opacity 0.3s;">
                        <h4 style="color: #ccc; font-size: 0.9rem; margin-bottom: 8px;">Step ${step.order} - ${step.vessel}</h4>
                        <p style="font-size: 1.2rem; line-height: 1.4;">${step.instruction}</p>
                        ${timerHtml}
                    </div>
                `;
            });
            
            html += `</div>`;
        });

        html += `</div>`;
        wrapper.innerHTML = html;
        this.overlayContainer.appendChild(wrapper);

        this.attachListeners(wrapper);
    }

    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    attachListeners(wrapper) {
        document.getElementById('cook-close').addEventListener('click', () => {
            // clear timers
            Object.values(this.timers).forEach(t => clearInterval(t));
            this.releaseWakeLock();
            wrapper.remove();
        });

        // Step completion
        wrapper.querySelectorAll('.cook-step').forEach(stepEl => {
            stepEl.addEventListener('click', (e) => {
                // Ignore clicks on the timer button
                if (e.target.closest('.timer-btn')) return;

                const isDone = stepEl.dataset.done === 'true';
                stepEl.dataset.done = isDone ? 'false' : 'true';
                stepEl.style.opacity = isDone ? '1' : '0.5';
                stepEl.style.textDecoration = isDone ? 'none' : 'line-through';
                
                this.checkAllDone(wrapper);
            });
        });

        // Timers
        wrapper.querySelectorAll('.timer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = btn.dataset.index;
                if (this.timers[idx]) {
                    // Pause
                    clearInterval(this.timers[idx]);
                    delete this.timers[idx];
                    btn.style.background = 'rgba(249, 115, 22, 0.15)';
                } else {
                    // Start
                    btn.style.background = 'rgba(249, 115, 22, 0.4)';
                    this.timers[idx] = setInterval(() => {
                        this.timeRemaining[idx]--;
                        if (this.timeRemaining[idx] <= 0) {
                            clearInterval(this.timers[idx]);
                            delete this.timers[idx];
                            btn.textContent = "0:00 - DONE!";
                            btn.style.background = '#4CAF50';
                            btn.style.color = '#fff';
                            btn.style.borderColor = '#4CAF50';
                            // Optional: play sound or vibrate
                            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
                        } else {
                            btn.textContent = this.formatTime(this.timeRemaining[idx]);
                        }
                    }, 1000);
                }
            });
        });
    }

    checkAllDone(wrapper) {
        const steps = wrapper.querySelectorAll('.cook-step');
        let allDone = true;
        steps.forEach(s => {
            if (s.dataset.done !== 'true') allDone = false;
        });

        if (allDone) {
            // Show all done banner if it doesn't exist
            if (!document.getElementById('all-done-banner')) {
                const banner = document.createElement('div');
                banner.id = 'all-done-banner';
                banner.style.position = 'fixed';
                banner.style.bottom = '20px';
                banner.style.left = '20px';
                banner.style.right = '20px';
                banner.style.background = '#4CAF50';
                banner.style.color = 'white';
                banner.style.padding = '16px';
                banner.style.borderRadius = '12px';
                banner.style.textAlign = 'center';
                banner.style.fontWeight = 'bold';
                banner.style.fontSize = '1.2rem';
                banner.style.zIndex = '310';
                banner.textContent = 'All steps complete! Enjoy your meal!';
                wrapper.appendChild(banner);
            }
        } else {
            const banner = document.getElementById('all-done-banner');
            if (banner) banner.remove();
        }
    }
}
