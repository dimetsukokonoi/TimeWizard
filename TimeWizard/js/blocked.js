/**
 * Blocked Page Logic
 * Handles timed access requests and emergency bypass
 */

// Get the blocked site from URL params
const urlParams = new URLSearchParams(window.location.search);
const blockedSite = urlParams.get('site') || 'this site';
const originalUrl = `https://${blockedSite}`;

// Motivational quotes for blocked page
const quotes = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
    { text: "It's not that I'm so smart, it's just that I stay with problems longer.", author: "Albert Einstein" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
    { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
    { text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" }
];

// DOM Elements
const siteNameEl = document.getElementById('siteName');
const quoteEl = document.getElementById('motivationalQuote');
const quoteAuthorEl = document.querySelector('.quote-author');
const goBackBtn = document.getElementById('goBackBtn');
const timedAccessBtn = document.getElementById('timedAccessBtn');
const timedAccessPanel = document.getElementById('timedAccessPanel');
const emergencyBtn = document.getElementById('emergencyBtn');
const emergencyModal = document.getElementById('emergencyModal');
const cancelEmergencyBtn = document.getElementById('cancelEmergency');
const confirmEmergencyBtn = document.getElementById('confirmEmergency');
const timerStatus = document.getElementById('timerStatus');
const timerRemaining = document.getElementById('timerRemaining');
const customMinutesInput = document.getElementById('customMinutes');
const customDurationBtn = document.getElementById('customDurationBtn');

// Initialize
function init() {
    // Set site name
    siteNameEl.textContent = blockedSite;

    // Set random quote
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteEl.textContent = `"${quote.text}"`;
    quoteAuthorEl.textContent = `— ${quote.author}`;

    // Check if there's an active bypass
    checkBypassStatus();

    // Bind events
    bindEvents();
}

function bindEvents() {
    // Go back to new tab
    goBackBtn.addEventListener('click', () => {
        window.location.href = chrome.runtime.getURL('newtab.html');
    });

    // Toggle timed access panel
    timedAccessBtn.addEventListener('click', () => {
        timedAccessPanel.classList.toggle('hidden');
    });

    // Duration buttons
    document.querySelectorAll('.duration-btn:not(.custom)').forEach(btn => {
        btn.addEventListener('click', () => {
            const minutes = parseInt(btn.dataset.minutes);
            requestTimedAccess(minutes);
        });
    });

    // Custom duration
    customDurationBtn.addEventListener('click', () => {
        const minutes = parseInt(customMinutesInput.value);
        if (minutes >= 1 && minutes <= 120) {
            requestTimedAccess(minutes);
        }
    });

    customMinutesInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            customDurationBtn.click();
        }
    });

    // Emergency access
    emergencyBtn.addEventListener('click', () => {
        emergencyModal.classList.remove('hidden');
    });

    cancelEmergencyBtn.addEventListener('click', () => {
        emergencyModal.classList.add('hidden');
    });

    confirmEmergencyBtn.addEventListener('click', () => {
        requestEmergencyAccess();
    });

    // Close modal on outside click
    emergencyModal.addEventListener('click', (e) => {
        if (e.target === emergencyModal) {
            emergencyModal.classList.add('hidden');
        }
    });
}

async function checkBypassStatus() {
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'getBypassStatus',
            site: blockedSite
        });

        if (response.active) {
            // Bypass is active, redirect to site
            showTimerAndRedirect(response.endTime);
        }
    } catch (e) {
        console.log('Could not check bypass status:', e);
    }
}

async function requestTimedAccess(minutes) {
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'requestBypass',
            site: blockedSite,
            duration: minutes,
            originalUrl: originalUrl
        });

        if (response.success) {
            showTimerAndRedirect(response.endTime);
        } else {
            alert('Could not grant access: ' + (response.error || 'Unknown error'));
        }
    } catch (e) {
        console.error('Error requesting bypass:', e);
        alert('Could not grant access. Please try again.');
    }
}

async function requestEmergencyAccess() {
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'emergencyAccess',
            site: blockedSite,
            originalUrl: originalUrl
        });

        if (response.success) {
            emergencyModal.classList.add('hidden');
            timerStatus.classList.remove('hidden');
            timerRemaining.textContent = '∞';
            document.querySelector('.timer-message').textContent = 'Emergency access granted. Redirecting...';

            setTimeout(() => {
                window.location.href = originalUrl;
            }, 1500);
        } else {
            alert('Could not grant access: ' + (response.error || 'Unknown error'));
        }
    } catch (e) {
        console.error('Error requesting emergency access:', e);
        alert('Could not grant access. Please try again.');
    }
}

function showTimerAndRedirect(endTime) {
    timedAccessPanel.classList.add('hidden');
    timerStatus.classList.remove('hidden');

    if (endTime) {
        // Update timer display
        const updateTimer = () => {
            const remaining = endTime - Date.now();
            if (remaining <= 0) {
                timerRemaining.textContent = '00:00';
                return;
            }

            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            timerRemaining.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };

        updateTimer();
        setInterval(updateTimer, 1000);
    } else {
        timerRemaining.textContent = '∞';
    }

    // Redirect after short delay
    setTimeout(() => {
        window.location.href = originalUrl;
    }, 1500);
}

// Start
init();
