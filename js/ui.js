/**
 * RC Crawler Calculator - UI Components
 * Handles user interface interactions and display updates
 */

function initializeUI() {
    console.log('Initializing RC Crawler Calculator UI...');
    
    try {
        populateTransmissions();
        populateAxles();
        
        setTimeout(() => {
            setDefaults();
            calculate();
        }, 100);
		
		// Add this to the initializeUI function
		setTimeout(() => {
		if (typeof setupComparison !== 'undefined') {
			setupComparison.initialize();
		}
		}, 500);
        
        addEventListeners();
        
        console.log('UI initialization complete');
    } catch (error) {
        console.error('UI initialization error:', error);
        showErrorMessage('Failed to initialize calculator. Please refresh the page.');
    }
}

function populateTransmissions() {
    const select = document.getElementById('transmission');
    if (!select) {
        console.error('Transmission select element not found');
        return;
    }
    
    const transmissions = getTransmissionNames();
    
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }
    
    transmissions.forEach(transmission => {
        const option = document.createElement('option');
        option.value = transmission;
        option.textContent = transmission;
        select.appendChild(option);
    });
    
    console.log(`Populated ${transmissions.length} transmissions`);
}

function populateAxles() {
    const frontSelect = document.getElementById('frontAxle');
    const rearSelect = document.getElementById('rearAxle');
    
    if (!frontSelect || !rearSelect) {
        console.error('Axle select elements not found');
        return;
    }
    
    const axles = getAxleNames();
    
    while (frontSelect.children.length > 1) {
        frontSelect.removeChild(frontSelect.lastChild);
    }
    while (rearSelect.children.length > 1) {
        rearSelect.removeChild(rearSelect.lastChild);
    }
    
    axles.forEach(axle => {
        const frontOption = document.createElement('option');
        frontOption.value = axle;
        frontOption.textContent = axle;
        frontSelect.appendChild(frontOption);
        
        const rearOption = document.createElement('option');
        rearOption.value = axle;
        rearOption.textContent = axle;
        rearSelect.appendChild(rearOption);
    });
    
    console.log(`Populated ${axles.length} axles`);
}

function setDefaults() {
    const defaults = {
        transmission: 'Axial 3-Gear',
        frontAxle: 'AR44 / AR45 / SCX Pro / Element',
        rearAxle: 'AR44 / AR45 / SCX Pro / Element'
    };
    
    Object.entries(defaults).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        }
    });
    
    console.log('Default values set');
}

function addEventListeners() {
    const inputs = [
        'pinion', 'spur', 'transmission', 'frontAxle', 'rearAxle', 
        'reverseTransmission', 'motorKV', 'maxVoltage', 'tireSize', 'tireSizeUnit'
    ];
    
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', calculate);
            if (element.type !== 'select-one' && element.type !== 'checkbox') {
                element.addEventListener('input', debounceCalculate);
            }
        }
    });
    
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportConfiguration);
    }
    
    const importFile = document.getElementById('importFile');
    if (importFile) {
        importFile.addEventListener('change', handleImportFile);
    }
    
    setupVoltagePresetListener();
    setupResultClickListeners();
    
    console.log('Event listeners added');
}

function setupVoltagePresetListener() {
    const voltagePresetEl = document.getElementById('voltagePreset');
    const maxVoltageEl = document.getElementById('maxVoltage');
    
    if (voltagePresetEl && maxVoltageEl) {
        voltagePresetEl.addEventListener('change', function() {
            if (this.value) {
                maxVoltageEl.value = this.value;
                maxVoltageEl.disabled = true;
                maxVoltageEl.style.backgroundColor = '#e9ecef';
                maxVoltageEl.style.cursor = 'not-allowed';
            } else {
                maxVoltageEl.disabled = false;
                maxVoltageEl.style.backgroundColor = 'white';
                maxVoltageEl.style.cursor = 'text';
            }
            calculate();
        });
    }
    
    // Add tire size unit conversion and validation
    const tireSizeUnitEl = document.getElementById('tireSizeUnit');
    const tireSizeEl = document.getElementById('tireSize');
    
    if (tireSizeUnitEl && tireSizeEl) {
        let lastUnit = tireSizeUnitEl.value; // Track the previous unit
        
        // Set initial min/max based on current unit
        updateTireSizeValidation(tireSizeUnitEl.value, tireSizeEl);
        
        tireSizeUnitEl.addEventListener('change', function() {
            const currentUnit = this.value;
            const currentValue = parseFloat(tireSizeEl.value);
            
            // Only convert if there's a valid value
            if (currentValue && currentValue > 0) {
                let convertedValue;
                
                if (lastUnit === 'inches' && currentUnit === 'mm') {
                    // Convert inches to mm
                    convertedValue = currentValue * 25.4;
                } else if (lastUnit === 'mm' && currentUnit === 'inches') {
                    // Convert mm to inches
                    convertedValue = currentValue / 25.4;
                } else {
                    // No conversion needed
                    convertedValue = currentValue;
                }
                
                // Update the tire size input with converted value
                if (convertedValue !== currentValue) {
                    tireSizeEl.value = convertedValue.toFixed(2);
                    console.log(`Converted tire size: ${currentValue} ${lastUnit} → ${convertedValue.toFixed(2)} ${currentUnit}`);
                }
            }
            
            // Update validation ranges for new unit
            updateTireSizeValidation(currentUnit, tireSizeEl);
            
            // Update last unit for next conversion
            lastUnit = currentUnit;
            
            // Recalculate
            calculate();
        });
    }
}

function updateTireSizeValidation(unit, tireSizeEl) {
    if (unit === 'inches') {
        tireSizeEl.min = '2';
        tireSizeEl.max = '6';
    } else if (unit === 'mm') {
        tireSizeEl.min = '50.80';
        tireSizeEl.max = '152.40';
    }
}

function setupResultClickListeners() {
    const resultItems = document.querySelectorAll('.result-item.clickable');
    resultItems.forEach(item => {
        item.addEventListener('click', () => copyToClipboard(item));
    });
}

function calculate() {
    try {
        const params = getCalculationParameters();
        const results = calculator.calculateAll(params);
        const formatted = calculator.getFormattedResults();
        
        updateResultsDisplay(params, results, formatted);
        
    } catch (error) {
        console.error('Calculation error:', error);
        showErrorMessage('Calculation error occurred. Please check your inputs.');
    }
}

function getCalculationParameters() {
    return {
        spurTeeth: parseFloat(document.getElementById('spur').value) || 0,
        pinionTeeth: parseFloat(document.getElementById('pinion').value) || 0,
        transmissionName: document.getElementById('transmission').value,
        frontAxleName: document.getElementById('frontAxle').value,
        rearAxleName: document.getElementById('rearAxle').value,
        reverseTransmission: document.getElementById('reverseTransmission').checked,
        motorKV: parseFloat(document.getElementById('motorKV').value) || 0,
        maxVoltage: parseFloat(document.getElementById('maxVoltage').value) || 0,
        tireSize: parseFloat(document.getElementById('tireSize').value) || 0,
        tireSizeUnit: document.getElementById('tireSizeUnit').value
    };
}

function updateResultsDisplay(params, results, formatted) {
    const transmission = getTransmission(params.transmissionName);
    const frontAxleRatio = getAxle(params.frontAxleName);
    const rearAxleRatio = getAxle(params.rearAxleName);
    
    updateElement('motorRatio', formatted.motorRatio);
    updateTransmissionRatio(transmission, params.reverseTransmission);
    updateElement('frontAxleRatio', frontAxleRatio ? `${frontAxleRatio.toFixed(3)}:1` : '-');
    updateElement('rearAxleRatio', rearAxleRatio ? `${rearAxleRatio.toFixed(3)}:1` : '-');
    updateElement('frontRatio', formatted.finalFrontRatio);
    updateElement('rearRatio', formatted.finalRearRatio);
    updateElement('overdrivePercentage', formatted.overdrivePercentage);
    updateElement('frontSpeed', formatted.frontSpeed);
    updateElement('rearSpeed', formatted.rearSpeed);
}

function updateTransmissionRatio(transmission, reverseTransmission) {
    const transmissionRatioEl = document.getElementById('transmissionRatio');
    if (!transmissionRatioEl) return;
    
    if (!transmission) {
        transmissionRatioEl.textContent = '-';
        return;
    }
    
    const frontTransRatio = reverseTransmission ? transmission.rear : transmission.front;
    const rearTransRatio = reverseTransmission ? transmission.front : transmission.rear;
    
    if (frontTransRatio === rearTransRatio) {
        transmissionRatioEl.textContent = `${frontTransRatio.toFixed(3)}:1`;
    } else {
        transmissionRatioEl.textContent = `F:${frontTransRatio.toFixed(3)} R:${rearTransRatio.toFixed(3)}`;
    }
}

function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

let debounceTimer = null;
function debounceCalculate() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(calculate, 300);
}

function copyToClipboard(element) {
    const valueElement = element.querySelector('.value');
    const titleElement = element.querySelector('h3');
    
    if (!valueElement || !titleElement) return;
    
    let value = valueElement.textContent.trim();
    const title = titleElement.textContent.trim();
    
    if (!value || value === '-') {
        showCopyFeedback(element, 'No value to copy', 'error');
        return;
    }
    
    if (value.includes(':1')) {
        value = value.split(':1')[0];
    } else {
        const numberMatch = value.match(/[\d,.]+/);
        if (numberMatch) {
            value = numberMatch[0];
        }
    }
    
    const textToCopy = value;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            showCopyFeedback(element, 'Copied!', 'success');
        }).catch(() => {
            fallbackCopyToClipboard(textToCopy, element);
        });
    } else {
        fallbackCopyToClipboard(textToCopy, element);
    }
}

function fallbackCopyToClipboard(text, element) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopyFeedback(element, 'Copied!', 'success');
        } else {
            showCopyFeedback(element, 'Copy failed', 'error');
        }
    } catch (err) {
        showCopyFeedback(element, 'Copy not supported', 'error');
    }
    
    document.body.removeChild(textArea);
}

function showCopyFeedback(element, message, type) {
    element.classList.add('copied');
    
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: bold;
        z-index: 1000;
        pointer-events: none;
        animation: fadeInOut 1.5s ease-out forwards;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
    `;
    document.head.appendChild(style);
    
    element.style.position = 'relative';
    element.appendChild(feedback);
    
    setTimeout(() => {
        element.classList.remove('copied');
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
        if (style.parentNode) {
            style.parentNode.removeChild(style);
        }
    }, 1500);
}

function exportConfiguration() {
    try {
        console.log('Starting export...');
        
        const config = getFormConfiguration();
        const results = calculator.calculateAll({
            spurTeeth: parseFloat(config.spur) || 0,
            pinionTeeth: parseFloat(config.pinion) || 0,
            transmissionName: config.transmission,
            frontAxleName: config.frontAxle,
            rearAxleName: config.rearAxle,
            reverseTransmission: config.reverseTransmission,
            motorKV: parseFloat(config.motorKV) || 0,
            maxVoltage: parseFloat(config.maxVoltage) || 0,
            tireSize: parseFloat(config.tireSize) || 0,
            tireSizeUnit: config.tireSizeUnit
        });
        
        let content = createExportContent(config, results);
        
        if (typeof addVersionToExport === 'function') {
            content = addVersionToExport(content);
        }
        
        downloadFile(content, `crawler-config-${new Date().toISOString().slice(0, 10)}.txt`);
        
        showExportFeedback();
        console.log('Configuration exported successfully');
        
    } catch (error) {
        console.error('Export error:', error);
        showErrorMessage('Error exporting configuration. Please try again.');
    }
}

function getFormConfiguration() {
    const getElementValue = (id, defaultValue = '') => {
        const element = document.getElementById(id);
        return element ? element.value : defaultValue;
    };
    
    const getElementChecked = (id, defaultValue = false) => {
        const element = document.getElementById(id);
        return element ? element.checked : defaultValue;
    };
    
    return {
        pinion: getElementValue('pinion'),
        spur: getElementValue('spur'),
        transmission: getElementValue('transmission'),
        frontAxle: getElementValue('frontAxle'),
        rearAxle: getElementValue('rearAxle'),
        reverseTransmission: getElementChecked('reverseTransmission'),
        motorKV: getElementValue('motorKV'),
        voltagePreset: getElementValue('voltagePreset'),
        maxVoltage: getElementValue('maxVoltage'),
        tireSize: getElementValue('tireSize'),
        tireSizeUnit: getElementValue('tireSizeUnit')
    };
}

function createExportContent(config, results) {
    const timestamp = new Date().toLocaleString();
    const formatted = calculator.getFormattedResults();
    
    let voltagePresetText = 'Custom';
    const voltagePresetEl = document.getElementById('voltagePreset');
    if (voltagePresetEl && voltagePresetEl.selectedIndex >= 0) {
        const selectedOption = voltagePresetEl.options[voltagePresetEl.selectedIndex];
        if (selectedOption && selectedOption.text && config.voltagePreset) {
            voltagePresetText = selectedOption.text;
        }
    }
    
    return `===============================================
         RC CRAWLER GEAR RATIO CALCULATOR
                 ydrRC Configuration
===============================================
Export Date: ${timestamp}

DRIVETRAIN CONFIGURATION:
========================
Pinion Gear:           ${config.pinion} teeth
Spur Gear:             ${config.spur} teeth
Transmission:          ${config.transmission}
Front Axle:            ${config.frontAxle}
Rear Axle:             ${config.rearAxle}
Reverse Transmission:  ${config.reverseTransmission ? 'YES' : 'NO'}

POWER SYSTEM:
=============
Motor KV:              ${config.motorKV}
Voltage Preset:        ${voltagePresetText}
Max Voltage:           ${config.maxVoltage}V
Tire Size:             ${config.tireSize} ${config.tireSizeUnit}

CALCULATED RESULTS:
==================
Motor Gear Ratio:      ${formatted.motorRatio}
Final Front Ratio:     ${formatted.finalFrontRatio}
Final Rear Ratio:      ${formatted.finalRearRatio}
Overdrive Percentage:  ${formatted.overdrivePercentage}
Approx. Front Speed:   ${formatted.frontSpeed}
Approx. Rear Speed:    ${formatted.rearSpeed}

CONFIGURATION DATA (DO NOT EDIT):
=================================
CONFIG_START
pinion=${config.pinion}
spur=${config.spur}
transmission=${config.transmission}
frontAxle=${config.frontAxle}
rearAxle=${config.rearAxle}
reverseTransmission=${config.reverseTransmission}
motorKV=${config.motorKV}
voltagePreset=${config.voltagePreset}
maxVoltage=${config.maxVoltage}
tireSize=${config.tireSize}
tireSizeUnit=${config.tireSizeUnit}
CONFIG_END

===============================================
Generated by ydrRC Crawler Calculator
===============================================`;
}

function downloadFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function showExportFeedback() {
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        const originalText = exportBtn.textContent;
        exportBtn.textContent = 'Exported!';
        exportBtn.style.backgroundColor = '#28a745';
        setTimeout(() => {
            exportBtn.textContent = originalText;
            exportBtn.style.backgroundColor = '#000000';
        }, 2000);
    }
}

function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log('Importing file:', file.name);
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            const config = parseImportContent(content);
            
            if (config && Object.keys(config).length > 0) {
                applyImportedConfig(config);
                showImportFeedback('Configuration imported successfully!', 'success');
                setTimeout(calculate, 100);
            } else {
                showImportFeedback('Could not find valid configuration data in file', 'error');
            }
        } catch (error) {
            console.error('Import error:', error);
            showImportFeedback('Error: ' + error.message, 'error');
        }
        
        event.target.value = '';
    };
    
    reader.onerror = function() {
        showImportFeedback('Failed to read file', 'error');
        event.target.value = '';
    };
    
    reader.readAsText(file);
}

function parseImportContent(content) {
    console.log('Parsing import content...');
    
    const configStart = content.indexOf('CONFIG_START');
    const configEnd = content.indexOf('CONFIG_END');
    
    if (configStart === -1 || configEnd === -1) {
        const lines = content.split('\n');
        const config = {};
        let foundAny = false;
        
        const knownKeys = [
            'pinion', 'spur', 'transmission', 'frontAxle', 'rearAxle', 
            'reverseTransmission', 'motorKV', 'voltagePreset', 'maxVoltage', 
            'tireSize', 'tireSizeUnit'
        ];
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.includes('=') && !trimmed.startsWith('#') && !trimmed.startsWith('=')) {
                const parts = trimmed.split('=');
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const value = parts.slice(1).join('=').trim();
                    
                    if (knownKeys.includes(key)) {
                        if (value === 'true') {
                            config[key] = true;
                        } else if (value === 'false') {
                            config[key] = false;
                        } else {
                            config[key] = value;
                        }
                        foundAny = true;
                    }
                }
            }
        }
        
        return foundAny ? config : null;
    }
    
    const configSection = content.substring(configStart + 12, configEnd).trim();
    const config = {};
    const lines = configSection.split('\n');
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && trimmed.includes('=')) {
            const equalPos = trimmed.indexOf('=');
            const key = trimmed.substring(0, equalPos).trim();
            const value = trimmed.substring(equalPos + 1).trim();
            
            if (key) {
                if (value === 'true') {
                    config[key] = true;
                } else if (value === 'false') {
                    config[key] = false;
                } else {
                    config[key] = value;
                }
            }
        }
    }
    
    return config;
}

function applyImportedConfig(config) {
    console.log('Applying imported config:', config);
    
    const setValue = (id, value) => {
        const element = document.getElementById(id);
        if (element && value !== undefined && value !== null && value !== '') {
            element.value = value;
            return true;
        }
        return false;
    };
    
    const setChecked = (id, checked) => {
        const element = document.getElementById(id);
        if (element && checked !== undefined && checked !== null) {
            element.checked = checked;
            return true;
        }
        return false;
    };
    
    setValue('pinion', config.pinion);
    setValue('spur', config.spur);
    setValue('transmission', config.transmission);
    setValue('frontAxle', config.frontAxle);
    setValue('rearAxle', config.rearAxle);
    setChecked('reverseTransmission', config.reverseTransmission);
    setValue('motorKV', config.motorKV);
    setValue('voltagePreset', config.voltagePreset);
    setValue('maxVoltage', config.maxVoltage);
    setValue('tireSize', config.tireSize);
    setValue('tireSizeUnit', config.tireSizeUnit);
    
    const voltagePreset = document.getElementById('voltagePreset');
    const maxVoltage = document.getElementById('maxVoltage');
    
    if (voltagePreset && maxVoltage) {
        if (config.voltagePreset && config.voltagePreset !== '') {
            maxVoltage.disabled = true;
            maxVoltage.style.backgroundColor = '#e9ecef';
            maxVoltage.style.cursor = 'not-allowed';
        } else {
            maxVoltage.disabled = false;
            maxVoltage.style.backgroundColor = 'white';
            maxVoltage.style.cursor = 'text';
        }
    }
}

function showImportFeedback(message, type) {
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 15px 20px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideInRight 0.3s ease-out;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        if (feedback.parentNode) feedback.parentNode.removeChild(feedback);
        if (style.parentNode) style.parentNode.removeChild(style);
    }, 3000);
}

function showErrorMessage(message) {
    console.error(message);
    showImportFeedback(message, 'error');
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing calculator...');
    initializeUI();
});