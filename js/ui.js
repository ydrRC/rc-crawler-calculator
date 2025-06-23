/**
 * RC Crawler Calculator - UI Module
 * Simple, working version
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting initialization...');
    
    // Populate dropdowns
    populateTransmissions();
    populateAxles();
    
    // Add event listeners
    addEventListeners();
    
    // Set defaults after dropdowns are populated
    setDefaults();
    
    // Initial calculation
    calculate();
    
    console.log('Initialization complete');
});

function populateTransmissions() {
    const select = document.getElementById('transmission');
    if (!select) {
        console.error('Transmission select not found');
        return;
    }
    
    console.log('Populating transmissions...');
    const transmissions = getTransmissionNames();
    
    transmissions.forEach(transmission => {
        const option = document.createElement('option');
        option.value = transmission;
        option.textContent = transmission;
        select.appendChild(option);
    });
    
    console.log(`Added ${transmissions.length} transmissions`);
}

function populateAxles() {
    const frontSelect = document.getElementById('frontAxle');
    const rearSelect = document.getElementById('rearAxle');
    
    if (!frontSelect || !rearSelect) {
        console.error('Axle selects not found');
        return;
    }
    
    console.log('Populating axles...');
    const axles = getAxleNames();
    
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
    
    console.log(`Added ${axles.length} axles`);
}

function setDefaults() {
    console.log('Setting default values...');
    
    // Set default transmission
    const transmissionEl = document.getElementById('transmission');
    if (transmissionEl) {
        transmissionEl.value = 'Axial 3-Gear';
        console.log('Set default transmission: Axial 3-Gear');
    }
    
    // Set default front axle
    const frontAxleEl = document.getElementById('frontAxle');
    if (frontAxleEl) {
        frontAxleEl.value = 'AR44 / AR45 / SCX Pro / Element';
        console.log('Set default front axle: AR44 / AR45 / SCX Pro / Element');
    }
    
    // Set default rear axle
    const rearAxleEl = document.getElementById('rearAxle');
    if (rearAxleEl) {
        rearAxleEl.value = 'AR44 / AR45 / SCX Pro / Element';
        console.log('Set default rear axle: AR44 / AR45 / SCX Pro / Element');
    }
    
    // Ensure tire size formatting and validation is applied
    formatTireSize();
    
    console.log('Default values set');
}

function addEventListeners() {
    console.log('Adding event listeners...');
    
    // Basic inputs
    const inputs = ['pinion', 'spur', 'transmission', 'frontAxle', 'rearAxle', 'reverseTransmission', 'motorKV', 'maxVoltage', 'tireSize', 'tireSizeUnit'];
    
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', calculate);
            element.addEventListener('input', debounceCalculate);
            console.log(`Added listeners to ${id}`);
        } else {
            console.warn(`Element ${id} not found`);
        }
    });
    
    // Special formatting for tire size
    const tireSizeEl = document.getElementById('tireSize');
    if (tireSizeEl) {
        tireSizeEl.addEventListener('blur', formatTireSize);
        console.log('Added tire size formatting listener');
    }
    
    // Also format when unit changes
    const tireSizeUnitEl = document.getElementById('tireSizeUnit');
    if (tireSizeUnitEl) {
        tireSizeUnitEl.addEventListener('change', handleTireSizeUnitChange);
        console.log('Added tire size unit change listener');
    }
    
    // Voltage preset
    const voltagePreset = document.getElementById('voltagePreset');
    if (voltagePreset) {
        voltagePreset.addEventListener('change', handleVoltagePreset);
        console.log('Added voltage preset listener');
    }
    
    // Transmission for spur gear auto-fill
    const transmission = document.getElementById('transmission');
    if (transmission) {
        transmission.addEventListener('change', handleTransmissionChange);
        console.log('Added transmission listener');
    }
    
    // Import/Export buttons
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportConfiguration);
        console.log('Added export button listener');
    }
    
    const importFile = document.getElementById('importFile');
    if (importFile) {
        importFile.addEventListener('change', importConfiguration);
        console.log('Added import file listener');
    }
}

function handleTireSizeUnitChange() {
    const tireSizeEl = document.getElementById('tireSize');
    const tireSizeUnitEl = document.getElementById('tireSizeUnit');
    
    if (!tireSizeEl || !tireSizeUnitEl) return;
    
    let currentValue = parseFloat(tireSizeEl.value);
    if (isNaN(currentValue)) return;
    
    const newUnit = tireSizeUnitEl.value;
    const previousUnit = newUnit === 'mm' ? 'inches' : 'mm';
    
    // Convert the value to new units
    if (newUnit === 'mm') {
        // Converting from inches to mm
        currentValue = currentValue * 25.4;
    } else {
        // Converting from mm to inches
        currentValue = currentValue / 25.4;
    }
    
    // Set the converted value
    tireSizeEl.value = currentValue.toString();
    
    // Apply formatting and validation for the new unit
    formatTireSize();
    
    // Visual feedback for conversion
    tireSizeEl.style.backgroundColor = '#e3f2fd';
    setTimeout(() => tireSizeEl.style.backgroundColor = 'white', 500);
}

function formatTireSize() {
    const tireSizeEl = document.getElementById('tireSize');
    const tireSizeUnitEl = document.getElementById('tireSizeUnit');
    
    if (!tireSizeEl || !tireSizeUnitEl) return;
    
    let value = parseFloat(tireSizeEl.value);
    if (isNaN(value)) return;
    
    if (tireSizeUnitEl.value === 'mm') {
        // Validate range for mm (51-152)
        if (value < 51) {
            value = 51;
            tireSizeEl.style.backgroundColor = '#fff3e0';
            setTimeout(() => tireSizeEl.style.backgroundColor = 'white', 1000);
        } else if (value > 152) {
            value = 152;
            tireSizeEl.style.backgroundColor = '#fff3e0';
            setTimeout(() => tireSizeEl.style.backgroundColor = 'white', 1000);
        }
        
        // Round to nearest whole number for mm
        tireSizeEl.value = Math.round(value).toString();
        
        // Update input attributes for mm
        tireSizeEl.min = '51';
        tireSizeEl.max = '152';
        tireSizeEl.step = '1';
    } else {
        // Validate range for inches (2-6)
        if (value < 2) {
            value = 2;
            tireSizeEl.style.backgroundColor = '#fff3e0';
            setTimeout(() => tireSizeEl.style.backgroundColor = 'white', 1000);
        } else if (value > 6) {
            value = 6;
            tireSizeEl.style.backgroundColor = '#fff3e0';
            setTimeout(() => tireSizeEl.style.backgroundColor = 'white', 1000);
        }
        
        // Keep two decimal places for inches
        tireSizeEl.value = value.toFixed(2);
        
        // Update input attributes for inches
        tireSizeEl.min = '2';
        tireSizeEl.max = '6';
        tireSizeEl.step = '0.01';
    }
}

function handleVoltagePreset() {
    const presetEl = document.getElementById('voltagePreset');
    const voltageEl = document.getElementById('maxVoltage');
    
    if (!presetEl || !voltageEl) return;
    
    const presetValue = presetEl.value;
    
    if (presetValue === '') {
        voltageEl.disabled = false;
        voltageEl.style.backgroundColor = 'white';
        voltageEl.style.cursor = 'text';
    } else {
        voltageEl.value = presetValue;
        voltageEl.disabled = true;
        voltageEl.style.backgroundColor = '#e9ecef';
        voltageEl.style.cursor = 'not-allowed';
    }
    
    calculate();
}

function handleTransmissionChange() {
    const transmissionEl = document.getElementById('transmission');
    const spurEl = document.getElementById('spur');
    
    if (!transmissionEl || !spurEl) return;
    
    const transmissionName = transmissionEl.value;
    
    if (transmissionName && transmissionName.toLowerCase().includes('spur')) {
        const spurCount = extractSpurGearCount(transmissionName);
        
        if (spurCount) {
            spurEl.value = spurCount;
            spurEl.disabled = true;
            spurEl.style.backgroundColor = '#e9ecef';
            spurEl.style.cursor = 'not-allowed';
            
            const spurLabel = document.querySelector('label[for="spur"]');
            if (spurLabel && !spurLabel.textContent.includes('(Auto)')) {
                spurLabel.textContent = spurLabel.textContent.replace(':', ' (Auto):');
            }
        }
    } else {
        spurEl.disabled = false;
        spurEl.style.backgroundColor = 'white';
        spurEl.style.cursor = 'text';
        
        const spurLabel = document.querySelector('label[for="spur"]');
        if (spurLabel && spurLabel.textContent.includes('(Auto)')) {
            spurLabel.textContent = spurLabel.textContent.replace(' (Auto)', '');
        }
    }
    
    calculate();
}

function extractSpurGearCount(transmissionName) {
    const spurRegex = /(\d+)\s*\([^)]*\)\s*spur/i;
    const match = transmissionName.match(spurRegex);
    
    if (match && match[1]) {
        return parseInt(match[1], 10);
    }
    
    return null;
}

let debounceTimer = null;

function debounceCalculate() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(calculate, 300);
}

function exportConfiguration() {
    try {
        // Get current configuration
        const config = {
            pinion: document.getElementById('pinion').value,
            spur: document.getElementById('spur').value,
            transmission: document.getElementById('transmission').value,
            frontAxle: document.getElementById('frontAxle').value,
            rearAxle: document.getElementById('rearAxle').value,
            reverseTransmission: document.getElementById('reverseTransmission').checked,
            motorKV: document.getElementById('motorKV').value,
            voltagePreset: document.getElementById('voltagePreset').value,
            maxVoltage: document.getElementById('maxVoltage').value,
            tireSize: document.getElementById('tireSize').value,
            tireSizeUnit: document.getElementById('tireSizeUnit').value
        };
        
        // Get current results
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
        
        // Create ASCII content
        const content = createExportContent(config, results);
        
        // Create and download file
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `crawler-config-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Configuration exported successfully');
    } catch (error) {
        console.error('Export error:', error);
        alert('Error exporting configuration. Please try again.');
    }
}

function createExportContent(config, results) {
    const timestamp = new Date().toLocaleString();
    const formatted = calculator.getFormattedResults();
    
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
Voltage Preset:        ${config.voltagePreset ? document.getElementById('voltagePreset').options[document.getElementById('voltagePreset').selectedIndex].text : 'Custom'}
Max Voltage:           ${config.maxVoltage}V
Tire Size:             ${config.tireSize} ${config.tireSizeUnit}

CALCULATED RESULTS:
==================
Motor Gear Ratio:      ${formatted.motorRatio}
Final Front Ratio:     ${formatted.finalFrontRatio}
Final Rear Ratio:      ${formatted.finalRearRatio}
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

function importConfiguration(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            parseAndApplyConfig(content);
            console.log('Configuration imported successfully');
        } catch (error) {
            console.error('Import error:', error);
            alert('Error importing configuration. Please check the file format.');
        }
    };
    reader.readAsText(file);
}

function parseAndApplyConfig(content) {
    // Extract configuration data between CONFIG_START and CONFIG_END
    const configMatch = content.match(/CONFIG_START\s*([\s\S]*?)\s*CONFIG_END/);
    if (!configMatch) {
        throw new Error('Invalid configuration file format');
    }
    
    const configData = configMatch[1];
    const config = {};
    
    // Parse key=value pairs
    const lines = configData.split('\n');
    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && trimmed.includes('=')) {
            const [key, value] = trimmed.split('=', 2);
            config[key.trim()] = value.trim();
        }
    });
    
    // Apply configuration to form
    if (config.pinion) document.getElementById('pinion').value = config.pinion;
    if (config.spur) document.getElementById('spur').value = config.spur;
    if (config.transmission) document.getElementById('transmission').value = config.transmission;
    if (config.frontAxle) document.getElementById('frontAxle').value = config.frontAxle;
    if (config.rearAxle) document.getElementById('rearAxle').value = config.rearAxle;
    if (config.reverseTransmission) document.getElementById('reverseTransmission').checked = config.reverseTransmission === 'true';
    if (config.motorKV) document.getElementById('motorKV').value = config.motorKV;
    if (config.tireSize) {
        const tireSize = parseFloat(config.tireSize);
        document.getElementById('tireSize').value = tireSize.toString();
        // Format will be applied based on unit after this
        setTimeout(formatTireSize, 50);
    }
    if (config.tireSizeUnit) document.getElementById('tireSizeUnit').value = config.tireSizeUnit;
    
    // Handle voltage settings
    const voltagePresetEl = document.getElementById('voltagePreset');
    const maxVoltageEl = document.getElementById('maxVoltage');
    
    if (config.voltagePreset && config.voltagePreset !== '') {
        voltagePresetEl.value = config.voltagePreset;
        maxVoltageEl.value = config.maxVoltage;
        maxVoltageEl.disabled = true;
        maxVoltageEl.style.backgroundColor = '#e9ecef';
        maxVoltageEl.style.cursor = 'not-allowed';
    } else {
        voltagePresetEl.value = '';
        maxVoltageEl.value = config.maxVoltage;
        maxVoltageEl.disabled = false;
        maxVoltageEl.style.backgroundColor = 'white';
        maxVoltageEl.style.cursor = 'text';
    }
    
    // Handle transmission-based spur gear settings
    handleTransmissionChange();
    
    // Recalculate with new settings
    calculate();
    
    // Clear file input
    document.getElementById('importFile').value = '';
    
    alert('Configuration imported successfully!');
}

function calculate() {
    try {
        const params = {
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
        
        const results = calculator.calculateAll(params);
        const formatted = calculator.getFormattedResults();
        
        // Get individual component ratios
        const transmission = getTransmission(params.transmissionName);
        const frontAxleRatio = getAxle(params.frontAxleName);
        const rearAxleRatio = getAxle(params.rearAxleName);
        
        // Update all result displays
        const motorRatioEl = document.getElementById('motorRatio');
        const transmissionRatioEl = document.getElementById('transmissionRatio');
        const frontAxleRatioEl = document.getElementById('frontAxleRatio');
        const rearAxleRatioEl = document.getElementById('rearAxleRatio');
        const frontRatioEl = document.getElementById('frontRatio');
        const rearRatioEl = document.getElementById('rearRatio');
        const frontSpeedEl = document.getElementById('frontSpeed');
        const rearSpeedEl = document.getElementById('rearSpeed');
        
        if (motorRatioEl) motorRatioEl.textContent = formatted.motorRatio;
        
        // Display transmission ratios
        if (transmissionRatioEl && transmission) {
            const frontTransRatio = params.reverseTransmission ? transmission.rear : transmission.front;
            const rearTransRatio = params.reverseTransmission ? transmission.front : transmission.rear;
            
            if (frontTransRatio === rearTransRatio) {
                transmissionRatioEl.textContent = `${frontTransRatio.toFixed(3)}:1`;
            } else {
                transmissionRatioEl.textContent = `F:${frontTransRatio.toFixed(3)} R:${rearTransRatio.toFixed(3)}`;
            }
        } else if (transmissionRatioEl) {
            transmissionRatioEl.textContent = '-';
        }
        
        // Display axle ratios
        if (frontAxleRatioEl) {
            frontAxleRatioEl.textContent = frontAxleRatio ? `${frontAxleRatio.toFixed(3)}:1` : '-';
        }
        if (rearAxleRatioEl) {
            rearAxleRatioEl.textContent = rearAxleRatio ? `${rearAxleRatio.toFixed(3)}:1` : '-';
        }
        
        // Display final ratios and speeds
        if (frontRatioEl) frontRatioEl.textContent = formatted.finalFrontRatio;
        if (rearRatioEl) rearRatioEl.textContent = formatted.finalRearRatio;
        if (frontSpeedEl) frontSpeedEl.textContent = formatted.frontSpeed;
        if (rearSpeedEl) rearSpeedEl.textContent = formatted.rearSpeed;
        
    } catch (error) {
        console.error('Calculation error:', error);
    }
}