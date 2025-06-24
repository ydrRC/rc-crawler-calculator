/**
 * RC Crawler Calculator - Version Management
 * Centralized version information and display functions
 */

// Application version configuration
const APP_VERSION = {
    major: 2,
    minor: 1,
    patch: 1,
    build: 'June 2025',
    releaseDate: '2025-06-24',
    
    // Computed properties
    get full() {
        return `${this.major}.${this.minor}.${this.patch}`;
    },
    
    get display() {
        return `v${this.full} (${this.build})`;
    },
    
    get semantic() {
        return {
            major: this.major,
            minor: this.minor,
            patch: this.patch
        };
    }
};

// Version history for tracking changes
const VERSION_HISTORY = [
    {
        version: '2.1.0',
        date: '2025-06-24',
        changes: [
            'Added modular JavaScript architecture',
            'Improved import/export functionality',
            'Enhanced error handling and user feedback',
            'Added version management system',
            'Updated documentation and README'
        ]
    },
    {
        version: '2.0.0',
        date: '2025-06-20',
        changes: [
            'Complete UI redesign with ydrRC branding',
            'Added comprehensive transmission database',
            'Improved calculation accuracy',
            'Added copy-to-clipboard functionality',
            'Enhanced mobile responsiveness'
        ]
    },
    {
        version: '1.0.0',
        date: '2024-12-01',
        changes: [
            'Initial release',
            'Basic gear ratio calculations',
            'Speed calculations',
            'Original design and layout'
        ]
    }
];

/**
 * Update version display in the UI
 */
function updateVersionDisplay() {
    const versionEl = document.getElementById('versionNumber');
    if (versionEl) {
        versionEl.textContent = APP_VERSION.full;
        versionEl.title = `Full version: ${APP_VERSION.display}`;
    }
    
    // Add version to console for debugging
    console.log(`🔧 RC Crawler Calculator ${APP_VERSION.display}`);
    console.log(`📅 Release Date: ${APP_VERSION.releaseDate}`);
    
    // Add version to page title for identification
    const currentTitle = document.title;
    if (!currentTitle.includes(' - v')) {
        document.title += ` - v${APP_VERSION.full}`;
    }
    
    // Add version meta tag
    let versionMeta = document.querySelector('meta[name="version"]');
    if (!versionMeta) {
        versionMeta = document.createElement('meta');
        versionMeta.name = 'version';
        document.head.appendChild(versionMeta);
    }
    versionMeta.content = APP_VERSION.full;
}

/**
 * Get version information for export
 * @returns {Object} Version information object
 */
function getVersionInfo() {
    return {
        version: APP_VERSION.full,
        build: APP_VERSION.build,
        releaseDate: APP_VERSION.releaseDate,
        timestamp: new Date().toISOString()
    };
}

/**
 * Check if this is a newer version than stored version
 * @param {string} storedVersion - Previously stored version string
 * @returns {boolean} True if current version is newer
 */
function isNewerVersion(storedVersion) {
    if (!storedVersion) return true;
    
    const stored = storedVersion.split('.').map(n => parseInt(n));
    const current = [APP_VERSION.major, APP_VERSION.minor, APP_VERSION.patch];
    
    for (let i = 0; i < 3; i++) {
        if (current[i] > (stored[i] || 0)) return true;
        if (current[i] < (stored[i] || 0)) return false;
    }
    
    return false;
}

/**
 * Show version update notification if needed
 */
function checkForVersionUpdate() {
    try {
        const lastVersion = localStorage.getItem('rcCalculatorVersion');
        
        if (isNewerVersion(lastVersion)) {
            console.log('🎉 New version detected!');
            
            // Store current version
            localStorage.setItem('rcCalculatorVersion', APP_VERSION.full);
            
            // Show update notification (optional)
            if (lastVersion) {
                showVersionUpdateNotification(lastVersion, APP_VERSION.full);
            }
        }
    } catch (error) {
        // Handle localStorage not available
        console.log('Version check skipped (localStorage not available)');
    }
}

/**
 * Show version update notification
 * @param {string} oldVersion - Previous version
 * @param {string} newVersion - Current version
 */
function showVersionUpdateNotification(oldVersion, newVersion) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        max-width: 300px;
        animation: slideInRight 0.5s ease-out;
    `;
    
    notification.innerHTML = `
        <div style="margin-bottom: 8px;">🎉 Calculator Updated!</div>
        <div style="font-size: 12px; font-weight: normal; opacity: 0.9;">
            v${oldVersion} → v${newVersion}
        </div>
        <button onclick="this.parentNode.remove()" style="
            position: absolute;
            top: 5px;
            right: 8px;
            background: none;
            border: none;
            color: white;
            font-size: 16px;
            cursor: pointer;
            opacity: 0.7;
        ">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

/**
 * Get version changelog for display
 * @param {number} limit - Maximum number of versions to return
 * @returns {Array} Array of version history objects
 */
function getVersionChangelog(limit = 3) {
    return VERSION_HISTORY.slice(0, limit);
}

/**
 * Add version information to export content
 * @param {string} content - Original export content
 * @returns {string} Content with version information added
 */
function addVersionToExport(content) {
    const versionInfo = getVersionInfo();
    const versionSection = `
CALCULATOR VERSION:
==================
Version:           ${versionInfo.version}
Build:             ${versionInfo.build}
Release Date:      ${versionInfo.releaseDate}
Export Timestamp:  ${versionInfo.timestamp}

`;
    
    // Insert version info after the header
    const headerEnd = content.indexOf('Export Date:');
    if (headerEnd !== -1) {
        const afterDate = content.indexOf('\n', headerEnd) + 1;
        return content.slice(0, afterDate) + versionSection + content.slice(afterDate);
    }
    
    return content;
}

// Initialize version system when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    updateVersionDisplay();
    checkForVersionUpdate();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        APP_VERSION,
        VERSION_HISTORY,
        updateVersionDisplay,
        getVersionInfo,
        isNewerVersion,
        checkForVersionUpdate,
        getVersionChangelog,
        addVersionToExport
    };
}