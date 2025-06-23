function exportConfiguration() {
    try {
        console.log('Starting export...');
        
        // Get current configuration with error handling
        const config = {};
        
        // Safely get each form value
        const getElementValue = (id, defaultValue = '') => {
            try {
                const element = document.getElementById(id);
                return element ? element.value : defaultValue;
            } catch (error) {
                console.warn(`Could not get value for ${id}:`, error);
                return defaultValue;
            }
        };
        
        const getElementChecked = (id, defaultValue = false) => {
            try {
                const element = document.getElementById(id);
                return element ? element.checked : defaultValue;
            } catch (error) {
                console.warn(`Could not get checked state for ${id}:`, error);
                return defaultValue;
            }
        };
        
        config.pinion = getElementValue('pinion');
        config.spur = getElementValue('spur');
        config.transmission = getElementValue('transmission');
        config.frontAxle = getElementValue('frontAxle');
        config.rearAxle = getElementValue('rearAxle');
        config.reverseTransmission = getElementChecked('reverseTransmission');
        config.motorKV = getElementValue('motorKV');
        config.voltagePreset = getElementValue('voltagePreset');
        config.maxVoltage = getElementValue('maxVoltage');
        config.tireSize = getElementValue('tireSize');
        config.tireSizeUnit = getElementValue('tireSizeUnit');
        
        console.log('Configuration collected:', config);
        
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
        
        console.log('Results calculated:', results);
        
        // Create export content
        const content = createExportContent(config, results);
        
        console.log('Export content created, length:', content.length);
        
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
        
        // Show success feedback
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
        alert('Error exporting configuration. Please check the console for details and try again.');
    }
}

function createExportContent(config, results) {
    const timestamp = new Date().toLocaleString();
    const formatted = calculator.getFormattedResults();
    
    // Safely get voltage preset text
    let voltagePresetText = 'Custom';
    try {
        const voltagePresetEl = document.getElementById('voltagePreset');
        if (voltagePresetEl && voltagePresetEl.selectedIndex >= 0) {
            const selectedOption = voltagePresetEl.options[voltagePresetEl.selectedIndex];
            if (selectedOption && selectedOption.text && config.voltagePreset) {
                voltagePresetText = selectedOption.text;
            }
        }
    } catch (error) {
        console.warn('Could not get voltage preset text:', error);
        voltagePresetText = 'Custom';
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