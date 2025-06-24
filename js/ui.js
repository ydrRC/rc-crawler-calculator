/**
 * RC Crawler Calculator - UI Components
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
        
        addEventListeners();
        
        console.log('UI initialization complete');
    } catch (error) {
        console.error('UI initialization error:', error);
    }
}

function populateTransmissions() {
    const select = document.getElementById('transmission');
    if (!select) return;
    
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
    
    if (!frontSelect || !rearSelect) return;
    
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
    const transmissionEl = document.getElementById('transmission');
    if (transmissionEl) {
        transmissionEl.value = 'Axial 3-Gear';
    }
    
    const frontAxleEl = document.getElementById('frontAxle');
    if (frontAxleEl) {
        frontAxleEl.value = 'AR44 / AR45 / SCX Pro / Element';
    }
    
    const rearAxleEl = document.getElementById('rearAxle');
    if (rearAxleEl) {
        rearAxleEl.value = 'AR44 / AR45 / SCX Pro / Element';
    }
    
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
}

function setupResultClickListeners() {
    const resultItems = document.querySelectorAll('.result-item.clickable');
    resultItems.forEach(item => {
        item.addEventListener('click', () => copyToClipboard(item));
    });
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
        
    } catch (error) {
        console.error('Calculation error:', error);
    }
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
    if (!valueElement) return;
    
    let value = valueElement.textContent.trim();
    if (!value || value === '-') return;
    
    if (value.includes(':1')) {
        value = value.split(':1')[0];
    } else {
        const numberMatch = value.match(/[\d,.]+/);
        if (numberMatch) {
            value = numberMatch[0];
        }
    }
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(() => {
            showCopyFeedback(element, 'Copied!', 'success');
        }).catch(() => {
            fallbackCopyToClipboard(value, element);
        });
    } else {
        fallbackCopyToClipboard(value, element);
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
        }
    } catch (err) {
        console.log('Copy not supported');
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
    `;
    
    element.style.position = 'relative';
    element.appendChild(feedback);
    
    setTimeout(() => {
        element.classList.remove('copied');
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, 1500);
}

function exportConfiguration() {
    try {
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
        
        const timestamp = new Date().toLocaleString();
        const content = `===============================================
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
Max Voltage:           ${config.maxVoltage}V
Tire Size:             ${config.tireSize} ${config.tireSizeUnit}

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
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `crawler-config-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
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
        
    } catch (error) {
        console.error('Export error:', error);
    }
}

function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            const configStart = content.indexOf('CONFIG_START');
            const configEnd = content.indexOf('CONFIG_END');
            
            if (configStart === -1 || configEnd === -1) {
                showImportFeedback('Could not find valid configuration data in file', 'error');
                return;
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
            
            applyImportedConfig(config);
            showImportFeedback('Configuration imported successfully!', 'success');
            setTimeout(calculate, 100);
            
        } catch (error) {
            showImportFeedback('Error: ' + error.message, 'error');
        }
        
        event.target.value = '';
    };
    
    reader.readAsText(file);
}

function applyImportedConfig(config) {
    const setValue = (id, value) => {
        const element = document.getElementById(id);
        if (element && value !== undefined && value !== null && value !== '') {
            element.value = value;
        }
    };
    
    const setChecked = (id, checked) => {
        const element = document.getElementById(id);
        if (element && checked !== undefined && checked !== null) {
            element.checked = checked;
        }
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
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing calculator...');
    initializeUI();
});