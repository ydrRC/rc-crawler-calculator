function initializeUI() {
    console.log('Initializing RC Crawler Calculator UI...');
    
    populateTransmissions();
    populateAxles();
    
    setTimeout(() => {
        setDefaults();
        calculate();
    }, 100);
    
    addEventListeners();
    
    console.log('UI initialization complete');
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
    
    setupVoltagePresetListener();
    
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

function calculate() {
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

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing calculator...');
    initializeUI();
});