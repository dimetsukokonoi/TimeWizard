/**
 * Focus Tab - Service Worker
 * Handles site blocking, timed bypass, and notifications
 */

// Site to rule ID mapping
const SITE_RULES = {
    'facebook.com': 1,
    'fb.com': 2,
    'instagram.com': 3,
    'youtube.com': 4,
    'twitter.com': 5,
    'x.com': 6,
    'tiktok.com': 7,
    'reddit.com': 8,
    'snapchat.com': 9,
    'linkedin.com': 10,
    'discord.com': 11,
    'twitch.tv': 12
};

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
    console.log('Focus Tab extension installed');

    // Initialize storage with default settings
    chrome.storage.local.set({
        blockedSites: Object.keys(SITE_RULES),
        activeBypasses: {},
        blockingEnabled: true
    });
});

// Listen for messages from blocked page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'requestBypass') {
        handleBypassRequest(message.site, message.duration, message.originalUrl)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep channel open for async response
    }

    if (message.action === 'emergencyAccess') {
        handleEmergencyAccess(message.site, message.originalUrl)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }

    if (message.action === 'getBypassStatus') {
        getBypassStatus(message.site)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ active: false }));
        return true;
    }

    if (message.action === 'cancelBypass') {
        cancelBypass(message.site)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ success: false }));
        return true;
    }
});

// Handle bypass request
async function handleBypassRequest(site, duration, originalUrl) {
    const ruleId = SITE_RULES[site];
    if (!ruleId) {
        return { success: false, error: 'Unknown site' };
    }

    // Disable the blocking rule temporarily
    await chrome.declarativeNetRequest.updateEnabledRulesets({
        disableRuleIds: [ruleId]
    }).catch(() => {
        // Rule might be in static ruleset, use dynamic rules to override
    });

    // Add a dynamic rule to allow the site
    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [ruleId + 1000],
        addRules: [{
            id: ruleId + 1000,
            priority: 2,
            action: { type: 'allow' },
            condition: {
                urlFilter: `||${site}`,
                resourceTypes: ['main_frame']
            }
        }]
    });

    const endTime = Date.now() + (duration * 60 * 1000);
    const warningTime = duration > 3 ? endTime - (3 * 60 * 1000) : endTime - (60 * 1000);

    // Store bypass info
    const { activeBypasses = {} } = await chrome.storage.local.get('activeBypasses');
    activeBypasses[site] = {
        endTime,
        duration,
        originalUrl,
        startTime: Date.now()
    };
    await chrome.storage.local.set({ activeBypasses });

    // Set up alarms
    chrome.alarms.create(`warning_${site}`, { when: warningTime });
    chrome.alarms.create(`expire_${site}`, { when: endTime });

    return { success: true, endTime, redirectUrl: originalUrl };
}

// Handle emergency access (no timer)
async function handleEmergencyAccess(site, originalUrl) {
    const ruleId = SITE_RULES[site];
    if (!ruleId) {
        return { success: false, error: 'Unknown site' };
    }

    // Add a dynamic rule to allow the site indefinitely
    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [ruleId + 1000],
        addRules: [{
            id: ruleId + 1000,
            priority: 2,
            action: { type: 'allow' },
            condition: {
                urlFilter: `||${site}`,
                resourceTypes: ['main_frame']
            }
        }]
    });

    // Store as emergency bypass
    const { activeBypasses = {} } = await chrome.storage.local.get('activeBypasses');
    activeBypasses[site] = {
        endTime: null,
        duration: null,
        originalUrl,
        startTime: Date.now(),
        emergency: true
    };
    await chrome.storage.local.set({ activeBypasses });

    return { success: true, redirectUrl: originalUrl };
}

// Get bypass status for a site
async function getBypassStatus(site) {
    const { activeBypasses = {} } = await chrome.storage.local.get('activeBypasses');
    const bypass = activeBypasses[site];

    if (!bypass) {
        return { active: false };
    }

    if (bypass.emergency) {
        return { active: true, emergency: true };
    }

    if (bypass.endTime && Date.now() < bypass.endTime) {
        return {
            active: true,
            remainingTime: bypass.endTime - Date.now(),
            endTime: bypass.endTime
        };
    }

    return { active: false };
}

// Cancel bypass and re-enable blocking
async function cancelBypass(site) {
    const ruleId = SITE_RULES[site];
    if (!ruleId) return { success: false };

    // Remove the allow rule
    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [ruleId + 1000]
    });

    // Clear alarms
    await chrome.alarms.clear(`warning_${site}`);
    await chrome.alarms.clear(`expire_${site}`);

    // Remove from active bypasses
    const { activeBypasses = {} } = await chrome.storage.local.get('activeBypasses');
    delete activeBypasses[site];
    await chrome.storage.local.set({ activeBypasses });

    return { success: true };
}

// Handle alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name.startsWith('warning_')) {
        const site = alarm.name.replace('warning_', '');

        // Send notification
        chrome.notifications.create(`warning_${site}`, {
            type: 'basic',
            iconUrl: 'assets/icons/icon128.png',
            title: '⏰ Time Almost Up!',
            message: `Your access to ${site} expires in 3 minutes. Time to wrap up!`,
            priority: 2
        });
    }

    if (alarm.name.startsWith('expire_')) {
        const site = alarm.name.replace('expire_', '');

        // Re-enable blocking
        await cancelBypass(site);

        // Send notification
        chrome.notifications.create(`expired_${site}`, {
            type: 'basic',
            iconUrl: 'assets/icons/icon128.png',
            title: '🚫 Access Expired',
            message: `Your timed access to ${site} has ended. Back to focus mode!`,
            priority: 2
        });
    }
});

// Clean up emergency bypasses on browser restart
chrome.runtime.onStartup.addListener(async () => {
    const { activeBypasses = {} } = await chrome.storage.local.get('activeBypasses');

    for (const [site, bypass] of Object.entries(activeBypasses)) {
        if (bypass.emergency) {
            await cancelBypass(site);
        } else if (bypass.endTime && Date.now() >= bypass.endTime) {
            await cancelBypass(site);
        }
    }
});
