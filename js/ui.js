/**
 * RC Crawler Calculator - UI Components
 * Handles user interface interactions and display updates
 */

/**
 * Initialize the calculator UI
 */
function initializeUI() {
    console.log('Initializing RC Crawler Calculator UI...');
    
    try {
        populateTransmissions();
        populateAxles();
        
        // Set defaults after population
        setTimeout(() => {
            setDefaults();
            calculate();
        }, 100);
        
        addEventListeners();
        
        console.log('UI initialization complete');
    } catch (error) {
        console.error('UI initialization error:', error);
        showErrorMessage('Failed to initialize calculator. Please refresh the page.');
    }
}

/**
 * Populate transmission dropdown
 */
function populateTransmissions() {
    const select = document.getElementById('transmission');
    if (!select) {
        console.error('Transmission select element not found');
        return;
    }
    
    const transmissions = getTransmissionNames();
    
    // Clear existing options except the first one
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

/**
 * Populate axle dropdowns
 */
function populateAxles() {
    const frontSelect = document.getElementById('frontAxle');
    const rearSelect = document.getElementById('rearAxle');
    
    if (!frontSelect || !rearSelect) {
        console.error('Axle select elements not found');
        return;
    }
    
    const axles = getAxleNames();
    
    // Clear existing options except the first one
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

/**
 * Set default values for the form
 */
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

/**
 * Add event listeners to form elements
 */
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
    
    // Add export button listener
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportConfiguration);
    }
    
    // Add import file listener
    const importFile = document.getElementById('importFile');
    if (importFile) {
        importFile.addEventListener('change', handleImportFile);
    }
    
    // Add voltage preset listener
    setupVoltagePresetListener();
    
    // Add result click listeners for copy functionality
    setupResultClickListeners();
    
    console.log('Event listeners added');
}

/**
 * Setup voltage preset functionality
 */
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

/**
 * Setup click listeners for result items (copy functionality)
 */
function setupResultClickListeners() {
    const resultItems = document.querySelectorAll('.result-item.clickable');
    resultItems.forEach(item => {
        item.addEventListener('click', () => copyToClipboard(item));
    });
}

/**
 * Main calculation function
 */
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

/**
 * Get calculation parameters from form
 * @returns {Object} Calculation parameters
 */
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

/**
 * Update the results display
 * @param {Object} params - Calculation parameters
 * @param {Object} results - Raw calculation results
 * @param {Object} formatted - Formatted results
 */
function updateResultsDisplay(params, results, formatted) {
    const transmission = getTransmission(params.transmissionName);
    const frontAxleRatio = getAxle(params.frontAxleName);
    const rearAxleRatio = getAxle(params.rearAxleName);
    
    // Update individual result elements
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

/**
 * Update transmission ratio display
 * @param {Object} transmission - Transmission data
 * @param {boolean} reverseTransmission - Whether transmission is reversed
 */
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

/**
 * Update a single display element
 * @param {string} id - Element ID
 * @param {string} value - Value to display
 */
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

/**
 * Debounced calculation function
 */
let debounceTimer = null;
function debounceCalculate() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(calculate, 300);
}

/**
 * Copy result value to clipboard
 * @param {HTMLElement} element - Result element
 */
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
    
    // Extract numeric value from formatted text
    if (value.includes(':1')) {
        value = value.split(':1')[0];