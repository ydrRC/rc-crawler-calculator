/**
 * RC Crawler Calculator - UI Components
 * Handles user interface interactions and display updates
 */

let uiInitialized = false;

function initializeUI() {
    if (uiInitialized) {
        console.log('UI already initialized, skipping...');
        return;
    }
    
    console.log('Initializing RC Crawler Calculator UI...');
    
    try {
        populateTransmissions();
        populateAxles();
        
        setTimeout(() => {
            setDefaults();
            calculate();
        }, 100);
        
        addEventListeners();
        
        uiInitialized = true;
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
    
    const printMainBtn = document.getElementById('printMainBtn');
    if (printMainBtn) {
        printMainBtn.addEventListener('click', printMainCalculator);
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
        // Store the current unit as a data attribute to avoid confusion
        tireSizeUnitEl.dataset.lastUnit = tireSizeUnitEl.value;
        
        // Set initial min/max based on current unit
        updateTireSizeValidation(tireSizeUnitEl.value, tireSizeEl);
        
        tireSizeUnitEl.addEventListener('change', function() {
            const currentUnit = this.value;
            const lastUnit = this.dataset.lastUnit || 'inches';
            const currentValue = parseFloat(tireSizeEl.value);
            
            console.log(`Unit change: ${lastUnit} → ${currentUnit}, value: ${currentValue}`);
            
            // Only convert if there's a valid value and units are actually different
            if (currentValue && currentValue > 0 && lastUnit !== currentUnit) {
                let convertedValue;
                
                if (lastUnit === 'inches' && currentUnit === 'mm') {
                    // Convert inches to mm
                    convertedValue = currentValue * 25.4;
                    console.log(`Converting ${currentValue} inches to ${convertedValue.toFixed(2)} mm`);
                } else if (lastUnit === 'mm' && currentUnit === 'inches') {
                    // Convert mm to inches
                    convertedValue = currentValue / 25.4;
                    console.log(`Converting ${currentValue} mm to ${convertedValue.toFixed(2)} inches`);
                } else {
                    // No conversion needed
                    convertedValue = currentValue;
                    console.log(`No conversion needed, same units: ${currentUnit}`);
                }
                
                // Update the tire size input with converted value
                if (convertedValue !== currentValue) {
                    tireSizeEl.value = convertedValue.toFixed(2);
                    console.log(`Updated tire size: ${currentValue} ${lastUnit} → ${convertedValue.toFixed(2)} ${currentUnit}`);
                }
            } else {
                console.log(`Skipping conversion: value=${currentValue}, lastUnit=${lastUnit}, currentUnit=${currentUnit}`);
            }
            
            // Update validation ranges for new unit
            updateTireSizeValidation(currentUnit, tireSizeEl);
            
            // Update last unit for next conversion
            this.dataset.lastUnit = currentUnit;
            
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

function printMainCalculator() {
    const params = getCalculationParameters();
    const results = calculator.calculateAll(params);
    const formatted = calculator.getFormattedResults();
    
    // Get transmission and axle info
    const transmission = getTransmission(params.transmissionName);
    const frontAxleRatio = getAxle(params.frontAxleName);
    const rearAxleRatio = getAxle(params.rearAxleName);
    
    // Get voltage preset text
    let voltagePresetText = 'Custom';
    const voltagePresetEl = document.getElementById('voltagePreset');
    if (voltagePresetEl && voltagePresetEl.value) {
        const selectedOption = voltagePresetEl.options[voltagePresetEl.selectedIndex];
        if (selectedOption && selectedOption.text) {
            voltagePresetText = selectedOption.text;
        }
    }
    
    const printContent = `
        <div class="print-header">
            <h1>RC Crawler Calculator Results</h1>
            <p class="print-date">Generated: ${new Date().toLocaleString()}</p>
        </div>

        <div class="print-section">
            <h3>Drivetrain Configuration</h3>
            <table class="config-table">
                <tr><td>Pinion Gear</td><td>${params.pinionTeeth} teeth</td></tr>
                <tr><td>Spur Gear</td><td>${params.spurTeeth} teeth</td></tr>
                <tr><td>Transmission</td><td>${params.transmissionName}</td></tr>
                <tr><td>Front Axle</td><td>${params.frontAxleName}</td></tr>
                <tr><td>Rear Axle</td><td>${params.rearAxleName}</td></tr>
                <tr><td>Reverse Transmission</td><td>${params.reverseTransmission ? 'YES' : 'NO'}</td></tr>
            </table>
        </div>

        <div class="print-section">
            <h3>Power System</h3>
            <table class="config-table">
                <tr><td>Motor KV</td><td>${params.motorKV || 'Not specified'}</td></tr>
                <tr><td>Battery Configuration</td><td>${voltagePresetText}</td></tr>
                <tr><td>Max Voltage</td><td>${params.maxVoltage || 'Not specified'}V</td></tr>
                <tr><td>Tire Size</td><td>${params.tireSize} ${params.tireSizeUnit}</td></tr>
            </table>
        </div>

        <div class="print-section">
            <h3>Calculated Results</h3>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Measurement</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Motor Gear Ratio</td><td class="result-value">${formatted.motorRatio}</td></tr>
                    <tr><td>Transmission Ratio (F/R)</td><td class="result-value">${getTransmissionRatioText(transmission, params.reverseTransmission)}</td></tr>
                    <tr><td>Front Axle Ratio</td><td class="result-value">${frontAxleRatio ? frontAxleRatio.toFixed(3) + ':1' : '-'}</td></tr>
                    <tr><td>Rear Axle Ratio</td><td class="result-value">${rearAxleRatio ? rearAxleRatio.toFixed(3) + ':1' : '-'}</td></tr>
                    <tr class="highlight"><td>Final Front Ratio</td><td class="result-value">${formatted.finalFrontRatio}</td></tr>
                    <tr class="highlight"><td>Final Rear Ratio</td><td class="result-value">${formatted.finalRearRatio}</td></tr>
                    <tr class="highlight"><td>Overdrive Percentage</td><td class="result-value">${formatted.overdrivePercentage}</td></tr>
                    <tr class="speed-result"><td>Approx. Front Speed</td><td class="result-value">${formatted.frontSpeed}</td></tr>
                    <tr class="speed-result"><td>Approx. Rear Speed</td><td class="result-value">${formatted.rearSpeed}</td></tr>
                </tbody>
            </table>
        </div>

        <div class="print-footer">
            <p>Generated by ydrRC Crawler Calculator</p>
        </div>
`;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>RC Crawler Calculator - Results</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    font-size: 12px;
                    line-height: 1.4;
                    color: #333;
                    background: white;
                    padding: 20px;
                }
                
                .print-header {
                    text-align: center;
                    border-bottom: 3px solid #000;
                    padding-bottom: 15px;
                    margin-bottom: 25px;
                }
                
                .print-header h1 {
                    font-size: 24px;
                    font-weight: bold;
                    color: #000;
                    margin-bottom: 5px;
                }
                
                .print-header h2 {
                    font-size: 16px;
                    color: #666;
                    font-weight: normal;
                    margin-bottom: 10px;
                }
                
                .print-date {
                    font-size: 10px;
                    color: #888;
                    font-style: italic;
                }
                
                .print-section {
                    margin-bottom: 25px;
                    page-break-inside: avoid;
                }
                
                .print-section h3 {
                    font-size: 16px;
                    font-weight: bold;
                    color: #000;
                    border-bottom: 2px solid #ccc;
                    padding-bottom: 5px;
                    margin-bottom: 15px;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 10px;
                }
                
                .config-table td {
                    padding: 8px 12px;
                    border-bottom: 1px solid #eee;
                }
                
                .config-table td:first-child {
                    font-weight: 600;
                    color: #444;
                    width: 40%;
                    background: #f8f9fa;
                }
                
                .results-table th,
                .results-table td {
                    padding: 10px 15px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }
                
                .results-table thead th {
                    background: #000;
                    color: white;
                    font-weight: bold;
                    font-size: 14px;
                }
                
                .results-table tbody tr:nth-child(even) {
                    background: #f8f9fa;
                }
                
                .results-table .highlight {
                    background: #e3f2fd !important;
                    font-weight: 600;
                }
                
                .results-table .speed-result {
                    background: #f3e5f5 !important;
                    font-weight: 600;
                }
                
                .result-value {
                    font-family: 'Courier New', monospace;
                    font-weight: bold;
                    color: #000;
                    text-align: right;
                }
                
                .print-footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 15px;
                    border-top: 2px solid #ccc;
                    font-size: 10px;
                    color: #888;
                }
                
                @media print {
                    body { margin: 0; padding: 15px; font-size: 11px; }
                    .print-header h1 { font-size: 20px; }
                    .print-section h3 { font-size: 14px; }
                    .results-table th, .results-table td { padding: 6px 10px; }
                }
            </style>
        </head>
        <body>${printContent}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

function getTransmissionRatioText(transmission, reverseTransmission) {
    if (!transmission) return '-';
    
    const frontTransRatio = reverseTransmission ? transmission.rear : transmission.front;
    const rearTransRatio = reverseTransmission ? transmission.front : transmission.rear;
    
    if (frontTransRatio === rearTransRatio) {
        return `${frontTransRatio.toFixed(3)}:1`;
    } else {
        return `F:${frontTransRatio.toFixed(3)} R:${rearTransRatio.toFixed(3)}`;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing calculator...');
    initializeUI();
});