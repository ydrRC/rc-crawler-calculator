/**
 * RC Crawler Calculator - Comparison Feature
 * Standalone comparison functionality
 */

class SetupComparison {
    constructor() {
        this.isVisible = false;
        this.setupA = new CrawlerCalculator();
        this.setupB = new CrawlerCalculator();
        this.comparisonDebounceTimer = null;
    }

    initialize() {
        console.log('Initializing comparison feature...');
        
        // Check if required functions are available
        if (typeof getTransmissionNames !== 'function') {
            console.error('getTransmissionNames function not available for comparison');
            return;
        }
        
        if (typeof getAxleNames !== 'function') {
            console.error('getAxleNames function not available for comparison');
            return;
        }
        
        if (typeof calculator === 'undefined') {
            console.error('calculator not available for comparison');
            return;
        }
        
        this.populateComparisonDropdowns();
        this.addComparisonEventListeners();
        this.setComparisonDefaults();
        console.log('Comparison feature initialized successfully');
    }

    populateComparisonDropdowns() {
        console.log('Populating comparison dropdowns...');
        
        // Check if functions are available
        if (typeof getTransmissionNames !== 'function') {
            console.error('getTransmissionNames function not available');
            return;
        }
        
        if (typeof getAxleNames !== 'function') {
            console.error('getAxleNames function not available');
            return;
        }

        // Populate transmission dropdowns
        const transmissionA = document.getElementById('setupA_transmission');
        const transmissionB = document.getElementById('setupB_transmission');
        
        if (!transmissionA || !transmissionB) {
            console.error('Transmission dropdown elements not found');
            return;
        }
        
        try {
            const transmissions = getTransmissionNames();
            console.log(`Found ${transmissions.length} transmissions for comparison`);
            
            transmissions.forEach(transmission => {
                const optionA = document.createElement('option');
                optionA.value = transmission;
                optionA.textContent = transmission;
                transmissionA.appendChild(optionA);
                
                const optionB = document.createElement('option');
                optionB.value = transmission;
                optionB.textContent = transmission;
                transmissionB.appendChild(optionB);
            });
        } catch (error) {
            console.error('Error populating transmission dropdowns:', error);
            return;
        }

        // Populate axle dropdowns
        const frontAxleA = document.getElementById('setupA_frontAxle');
        const rearAxleA = document.getElementById('setupA_rearAxle');
        const frontAxleB = document.getElementById('setupB_frontAxle');
        const rearAxleB = document.getElementById('setupB_rearAxle');
        
        if (!frontAxleA || !rearAxleA || !frontAxleB || !rearAxleB) {
            console.error('Axle dropdown elements not found');
            return;
        }
        
        try {
            const axles = getAxleNames();
            console.log(`Found ${axles.length} axles for comparison`);
            
            axles.forEach(axle => {
                const frontOptionA = document.createElement('option');
                frontOptionA.value = axle;
                frontOptionA.textContent = axle;
                frontAxleA.appendChild(frontOptionA);
                
                const rearOptionA = document.createElement('option');
                rearOptionA.value = axle;
                rearOptionA.textContent = axle;
                rearAxleA.appendChild(rearOptionA);
                
                const frontOptionB = document.createElement('option');
                frontOptionB.value = axle;
                frontOptionB.textContent = axle;
                frontAxleB.appendChild(frontOptionB);
                
                const rearOptionB = document.createElement('option');
                rearOptionB.value = axle;
                rearOptionB.textContent = axle;
                rearAxleB.appendChild(rearOptionB);
            });
            
            console.log('Comparison dropdowns populated successfully');
        } catch (error) {
            console.error('Error populating axle dropdowns:', error);
        }
    }

    setComparisonDefaults() {
        // Set defaults for Setup A
        const defaultsA = {
            transmission: 'Axial 3-Gear',
            frontAxle: 'AR44 / AR45 / SCX Pro / Element',
            rearAxle: 'AR44 / AR45 / SCX Pro / Element'
        };
        
        // Set defaults for Setup B  
        const defaultsB = {
            transmission: 'Traxxas TRX-4 High Gear',
            frontAxle: 'AR44 / AR45 / SCX Pro / Element',
            rearAxle: 'AR44 / AR45 / SCX Pro / Element'
        };
        
        Object.entries(defaultsA).forEach(([key, value]) => {
            const element = document.getElementById(`setupA_${key}`);
            if (element) element.value = value;
        });
        
        Object.entries(defaultsB).forEach(([key, value]) => {
            const element = document.getElementById(`setupB_${key}`);
            if (element) element.value = value;
        });
        
        // Set initial validation ranges for tire sizes
        const setupATireSize = document.getElementById('setupA_tireSize');
        const setupATireUnit = document.getElementById('setupA_tireSizeUnit');
        const setupBTireSize = document.getElementById('setupB_tireSize');
        const setupBTireUnit = document.getElementById('setupB_tireSizeUnit');
        
        if (setupATireSize && setupATireUnit) {
            this.updateTireSizeValidation(setupATireUnit.value, setupATireSize);
        }
        
        if (setupBTireSize && setupBTireUnit) {
            this.updateTireSizeValidation(setupBTireUnit.value, setupBTireSize);
        }
    }

    addComparisonEventListeners() {
        // Toggle comparison visibility
        const toggleBtn = document.getElementById('toggleComparison');
        if (toggleBtn) {
            console.log('Found toggle comparison button, adding listener');
            toggleBtn.addEventListener('click', () => this.toggleComparison());
        } else {
            console.error('Toggle comparison button not found!');
        }

        // Copy current setup buttons
        const copyToA = document.getElementById('copyCurrentToA');
        const copyToB = document.getElementById('copyCurrentToB');
        
        if (copyToA) {
            copyToA.addEventListener('click', () => this.copyCurrentSetup('A'));
        } else {
            console.error('Copy to A button not found!');
        }
        
        if (copyToB) {
            copyToB.addEventListener('click', () => this.copyCurrentSetup('B'));
        } else {
            console.error('Copy to B button not found!');
        }

        // Add change listeners to all comparison inputs
        const setupInputs = [
            'setupA_pinion', 'setupA_spur', 'setupA_transmission', 'setupA_frontAxle', 'setupA_rearAxle',
            'setupA_motorKV', 'setupA_voltage', 'setupA_tireSize', 'setupA_tireSizeUnit',
            'setupB_pinion', 'setupB_spur', 'setupB_transmission', 'setupB_frontAxle', 'setupB_rearAxle',
            'setupB_motorKV', 'setupB_voltage', 'setupB_tireSize', 'setupB_tireSizeUnit'
        ];

        setupInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.calculateComparison());
                if (element.type !== 'select-one') {
                    element.addEventListener('input', () => this.debounceComparisonCalculation());
                }
            }
        });
        
        // Add tire size unit conversion for Setup A
        this.setupTireSizeConversion('setupA');
        
        // Add tire size unit conversion for Setup B
        this.setupTireSizeConversion('setupB');
        
        // Add print comparison button listener
        const printComparisonBtn = document.getElementById('printComparisonBtn');
        if (printComparisonBtn) {
            printComparisonBtn.addEventListener('click', () => this.printComparison());
            console.log('Print comparison button listener added');
        } else {
            console.log('Print comparison button not found (this is normal on page load)');
        }
    }

    setupTireSizeConversion(setupPrefix) {
        const tireSizeUnitEl = document.getElementById(`${setupPrefix}_tireSizeUnit`);
        const tireSizeEl = document.getElementById(`${setupPrefix}_tireSize`);
        
        if (tireSizeUnitEl && tireSizeEl) {
            // Initialize the lastUnit dataset if it doesn't exist
            if (!tireSizeUnitEl.dataset.lastUnit) {
                tireSizeUnitEl.dataset.lastUnit = tireSizeUnitEl.value;
                console.log(`${setupPrefix}: Initialized lastUnit to ${tireSizeUnitEl.value}`);
            }
            
            // Set initial validation ranges
            this.updateTireSizeValidation(tireSizeUnitEl.value, tireSizeEl);
            
            tireSizeUnitEl.addEventListener('change', function() {
                const currentUnit = this.value;
                const lastUnit = this.dataset.lastUnit || 'inches';
                const currentValue = parseFloat(tireSizeEl.value);
                
                console.log(`${setupPrefix} unit change: ${lastUnit} → ${currentUnit}, value: ${currentValue}`);
                
                // Only convert if there's a valid value and units are actually different
                if (currentValue && currentValue > 0 && lastUnit !== currentUnit) {
                    let convertedValue;
                    
                    if (lastUnit === 'inches' && currentUnit === 'mm') {
                        // Convert inches to mm
                        convertedValue = currentValue * 25.4;
                        console.log(`${setupPrefix}: Converting ${currentValue} inches to ${convertedValue.toFixed(2)} mm`);
                    } else if (lastUnit === 'mm' && currentUnit === 'inches') {
                        // Convert mm to inches
                        convertedValue = currentValue / 25.4;
                        console.log(`${setupPrefix}: Converting ${currentValue} mm to ${convertedValue.toFixed(2)} inches`);
                    } else {
                        // No conversion needed
                        convertedValue = currentValue;
                        console.log(`${setupPrefix}: No conversion needed, same units: ${currentUnit}`);
                    }
                    
                    // Update the tire size input with converted value
                    if (convertedValue !== currentValue) {
                        tireSizeEl.value = convertedValue.toFixed(2);
                        console.log(`${setupPrefix}: Updated tire size: ${currentValue} ${lastUnit} → ${convertedValue.toFixed(2)} ${currentUnit}`);
                    }
                }
                
                // Update validation ranges for new unit
                setupComparison.updateTireSizeValidation(currentUnit, tireSizeEl);
                
                // Update last unit for next conversion
                this.dataset.lastUnit = currentUnit;
                
                // Recalculate comparison
                setTimeout(() => setupComparison.calculateComparison(), 100);
            });
        }
    }

    updateTireSizeValidation(unit, tireSizeEl) {
        if (unit === 'inches') {
            tireSizeEl.min = '2';
            tireSizeEl.max = '6';
            console.log(`Updated validation for inches: min=2, max=6`);
        } else if (unit === 'mm') {
            tireSizeEl.min = '50.80';
            tireSizeEl.max = '152.40';
            console.log(`Updated validation for mm: min=50.80, max=152.40`);
        }
        console.log(`Tire input ${tireSizeEl.id} validation: min=${tireSizeEl.min}, max=${tireSizeEl.max}`);
    }

    toggleComparison() {
        const content = document.getElementById('comparisonContent');
        const toggleBtn = document.getElementById('toggleComparison');
        const printBtn = document.getElementById('printComparisonBtn');
        
        if (!content || !toggleBtn) {
            console.error('Comparison elements not found');
            return;
        }
        
        this.isVisible = !this.isVisible;
        
        if (this.isVisible) {
            content.style.display = 'block';
            toggleBtn.textContent = 'Hide Comparison';
            if (printBtn) printBtn.style.display = 'inline-block';
            console.log('Comparison tool opened');
            setTimeout(() => this.calculateComparison(), 100);
        } else {
            content.style.display = 'none';
            toggleBtn.textContent = 'Show Comparison';
            if (printBtn) printBtn.style.display = 'none';
            console.log('Comparison tool closed');
        }
    }

    copyCurrentSetup(setupLetter) {
        const currentParams = getCalculationParameters();
        
        const prefix = `setup${setupLetter}_`;
        
        // Copy values to comparison setup
        document.getElementById(`${prefix}pinion`).value = currentParams.pinionTeeth || '';
        document.getElementById(`${prefix}spur`).value = currentParams.spurTeeth || '';
        document.getElementById(`${prefix}transmission`).value = currentParams.transmissionName || '';
        document.getElementById(`${prefix}frontAxle`).value = currentParams.frontAxleName || '';
        document.getElementById(`${prefix}rearAxle`).value = currentParams.rearAxleName || '';
        document.getElementById(`${prefix}motorKV`).value = currentParams.motorKV || '';
        document.getElementById(`${prefix}voltage`).value = currentParams.maxVoltage || '';
        document.getElementById(`${prefix}tireSize`).value = currentParams.tireSize || '';
        document.getElementById(`${prefix}tireSizeUnit`).value = currentParams.tireSizeUnit || 'inches';
        
        // IMPORTANT: Update the lastUnit dataset after copying
        const tireSizeUnitEl = document.getElementById(`${prefix}tireSizeUnit`);
        if (tireSizeUnitEl) {
            tireSizeUnitEl.dataset.lastUnit = currentParams.tireSizeUnit || 'inches';
            console.log(`${prefix}: Set lastUnit to ${currentParams.tireSizeUnit || 'inches'} after copy`);
        }
        
        // Show feedback
        const button = document.getElementById(`copyCurrentTo${setupLetter}`);
        if (button) {
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.style.backgroundColor = '#28a745';
            setTimeout(() => {
                button.textContent = originalText;
                button.style.backgroundColor = '';
            }, 1500);
        }
        
        // Recalculate comparison
        setTimeout(() => this.calculateComparison(), 100);
    }

    getSetupParameters(setup) {
        const prefix = `setup${setup}_`;
        return {
            spurTeeth: parseFloat(document.getElementById(`${prefix}spur`).value) || 0,
            pinionTeeth: parseFloat(document.getElementById(`${prefix}pinion`).value) || 0,
            transmissionName: document.getElementById(`${prefix}transmission`).value,
            frontAxleName: document.getElementById(`${prefix}frontAxle`).value,
            rearAxleName: document.getElementById(`${prefix}rearAxle`).value,
            reverseTransmission: false, // Not implemented in comparison yet
            motorKV: parseFloat(document.getElementById(`${prefix}motorKV`).value) || 0,
            maxVoltage: parseFloat(document.getElementById(`${prefix}voltage`).value) || 0,
            tireSize: parseFloat(document.getElementById(`${prefix}tireSize`).value) || 0,
            tireSizeUnit: document.getElementById(`${prefix}tireSizeUnit`).value
        };
    }

    calculateComparison() {
        try {
            const paramsA = this.getSetupParameters('A');
            const paramsB = this.getSetupParameters('B');
            
            const resultsA = this.setupA.calculateAll(paramsA);
            const resultsB = this.setupB.calculateAll(paramsB);
            
            const formattedA = this.setupA.getFormattedResults();
            const formattedB = this.setupB.getFormattedResults();
            
            this.updateComparisonDisplay(resultsA, resultsB, formattedA, formattedB);
            this.generateComparisonSummary(paramsA, paramsB, resultsA, resultsB);
            
        } catch (error) {
            console.error('Comparison calculation error:', error);
        }
    }

    updateComparisonDisplay(resultsA, resultsB, formattedA, formattedB) {
        // Update Setup A results
        this.updateComparisonElement('compA_motorRatio', formattedA.motorRatio);
        this.updateComparisonElement('compA_frontRatio', formattedA.finalFrontRatio);
        this.updateComparisonElement('compA_rearRatio', formattedA.finalRearRatio);
        this.updateComparisonElement('compA_overdrive', formattedA.overdrivePercentage);
        this.updateComparisonElement('compA_frontSpeed', formattedA.frontSpeed);
        this.updateComparisonElement('compA_rearSpeed', formattedA.rearSpeed);
        
        // Update Setup B results
        this.updateComparisonElement('compB_motorRatio', formattedB.motorRatio);
        this.updateComparisonElement('compB_frontRatio', formattedB.finalFrontRatio);
        this.updateComparisonElement('compB_rearRatio', formattedB.finalRearRatio);
        this.updateComparisonElement('compB_overdrive', formattedB.overdrivePercentage);
        this.updateComparisonElement('compB_frontSpeed', formattedB.frontSpeed);
        this.updateComparisonElement('compB_rearSpeed', formattedB.rearSpeed);
        
        // Calculate and display differences
        this.updateDifferences(resultsA, resultsB);
    }

    updateComparisonElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    updateDifferences(resultsA, resultsB) {
        const differences = {
            motorRatio: resultsB.motorRatio - resultsA.motorRatio,
            frontRatio: resultsB.finalFrontRatio - resultsA.finalFrontRatio,
            rearRatio: resultsB.finalRearRatio - resultsA.finalRearRatio,
            overdrive: resultsB.overdrivePercentage - resultsA.overdrivePercentage,
            frontSpeed: resultsB.frontSpeed - resultsA.frontSpeed,
            rearSpeed: resultsB.rearSpeed - resultsA.rearSpeed
        };

        // Update difference displays with formatting and color coding
        this.updateDifferenceElement('comp_motorRatioDiff', differences.motorRatio, 'ratio');
        this.updateDifferenceElement('comp_frontRatioDiff', differences.frontRatio, 'ratio');
        this.updateDifferenceElement('comp_rearRatioDiff', differences.rearRatio, 'ratio');
        this.updateDifferenceElement('comp_overdriveDiff', differences.overdrive, 'percentage');
        this.updateDifferenceElement('comp_frontSpeedDiff', differences.frontSpeed, 'speed');
        this.updateDifferenceElement('comp_rearSpeedDiff', differences.rearSpeed, 'speed');
    }

    updateDifferenceElement(id, difference, type) {
        const element = document.getElementById(id);
        if (!element) return;

        // Remove existing classes
        element.classList.remove('positive', 'negative', 'neutral');

        if (!isFinite(difference) || Math.abs(difference) < 0.001) {
            element.textContent = '-';
            element.classList.add('neutral');
            return;
        }

        let formattedDiff = '';
        const sign = difference > 0 ? '+' : '';

        switch (type) {
            case 'ratio':
                formattedDiff = `${sign}${difference.toFixed(3)}`;
                break;
            case 'percentage':
                formattedDiff = `${sign}${difference.toFixed(2)}%`;
                break;
            case 'speed':
                const speedKMH = mphToKmh(Math.abs(difference));
                formattedDiff = `${sign}${Math.abs(difference).toFixed(2)} MPH (${sign}${speedKMH.toFixed(2)} KM/H)`;
                break;
        }

        element.textContent = formattedDiff;
        element.classList.add(difference > 0 ? 'positive' : 'negative');
    }

    generateComparisonSummary(paramsA, paramsB, resultsA, resultsB) {
        const summaryEl = document.getElementById('comparisonSummary');
        if (!summaryEl) return;

        const setupAName = document.getElementById('setupA_name').value || 'Setup A';
        const setupBName = document.getElementById('setupB_name').value || 'Setup B';

        let summary = [];

        // Check if both setups are valid
        if (!resultsA.finalFrontRatio || !resultsB.finalFrontRatio) {
            summary.push('<p>Please configure both setups to see comparison results.</p>');
            summaryEl.innerHTML = summary.join('');
            return;
        }

        // Speed comparison
        if (resultsA.rearSpeed && resultsB.rearSpeed) {
            const speedDiff = resultsB.rearSpeed - resultsA.rearSpeed;
            if (Math.abs(speedDiff) > 0.5) {
                const faster = speedDiff > 0 ? setupBName : setupAName;
                const slower = speedDiff > 0 ? setupAName : setupBName;
                const speedDiffKMH = mphToKmh(Math.abs(speedDiff));
                summary.push(`<div class="summary-highlight ${speedDiff > 0 ? '' : 'better'}">
                    <strong>Speed:</strong> ${faster} is ${Math.abs(speedDiff).toFixed(1)} MPH (${speedDiffKMH.toFixed(1)} KM/H) faster than ${slower}
                </div>`);
            }
        }

        // Gear ratio comparison
        const ratioA = resultsA.finalRearRatio;
        const ratioB = resultsB.finalRearRatio;
        if (ratioA && ratioB) {
            const ratioDiff = ratioB - ratioA;
            if (Math.abs(ratioDiff) > 1) {
                const higher = ratioDiff > 0 ? setupBName : setupAName;
                const lower = ratioDiff > 0 ? setupAName : setupBName;
                summary.push(`<div class="summary-highlight">
                    <strong>Gearing:</strong> ${higher} has ${Math.abs(ratioDiff).toFixed(1)} higher gear ratio (more torque, less speed)
                </div>`);
            }
        }

        // Overdrive comparison
        const overdriveA = resultsA.overdrivePercentage;
        const overdriveB = resultsB.overdrivePercentage;
        if (isFinite(overdriveA) && isFinite(overdriveB)) {
            if (overdriveA < 0 && overdriveB >= 0) {
                summary.push(`<div class="summary-highlight better">
                    <strong>Overdrive:</strong> ${setupBName} fixes the negative overdrive issue from ${setupAName}
                </div>`);
            } else if (overdriveB < 0 && overdriveA >= 0) {
                summary.push(`<div class="summary-highlight worse">
                    <strong>Overdrive:</strong> ${setupBName} creates a negative overdrive (rear faster than front)
                </div>`);
            }
        }

        // Use case recommendations
        if (ratioA && ratioB && resultsA.rearSpeed && resultsB.rearSpeed) {
            const avgRatioA = (resultsA.finalFrontRatio + resultsA.finalRearRatio) / 2;
            const avgRatioB = (resultsB.finalFrontRatio + resultsB.finalRearRatio) / 2;

            if (avgRatioA > 50 && avgRatioB < 30) {
                summary.push(`<div class="summary-highlight">
                    <strong>Use Case:</strong> ${setupAName} is better for technical crawling, ${setupBName} is better for speed/trail running
                </div>`);
            } else if (avgRatioB > 50 && avgRatioA < 30) {
                summary.push(`<div class="summary-highlight">
                    <strong>Use Case:</strong> ${setupBName} is better for technical crawling, ${setupAName} is better for speed/trail running
                </div>`);
            }
        }

        // Motor stress analysis
        if (resultsA.motorRatio && resultsB.motorRatio) {
            if (resultsA.motorRatio < 2.5 || resultsB.motorRatio < 2.5) {
                const lowRatio = resultsA.motorRatio < resultsB.motorRatio ? setupAName : setupBName;
                summary.push(`<div class="summary-highlight worse">
                    <strong>Warning:</strong> ${lowRatio} has a low motor ratio that may stress the motor
                </div>`);
            }
        }

        if (summary.length === 0) {
            summary.push('<p>Both setups are configured and ready for comparison. The differences are shown in the table above.</p>');
        }

        summaryEl.innerHTML = summary.join('');
    }

    debounceComparisonCalculation() {
        clearTimeout(this.comparisonDebounceTimer);
        this.comparisonDebounceTimer = setTimeout(() => this.calculateComparison(), 300);
    }

    printComparison() {
        const paramsA = this.getSetupParameters('A');
        const paramsB = this.getSetupParameters('B');
        const resultsA = this.setupA.calculateAll(paramsA);
        const resultsB = this.setupB.calculateAll(paramsB);
        const formattedA = this.setupA.getFormattedResults();
        const formattedB = this.setupB.getFormattedResults();
        
        const setupAName = document.getElementById('setupA_name').value || 'Setup A';
        const setupBName = document.getElementById('setupB_name').value || 'Setup B';
        
        // Calculate differences for display
        const differences = {
            motorRatio: resultsB.motorRatio - resultsA.motorRatio,
            frontRatio: resultsB.finalFrontRatio - resultsA.finalFrontRatio,
            rearRatio: resultsB.finalRearRatio - resultsA.finalRearRatio,
            overdrive: resultsB.overdrivePercentage - resultsA.overdrivePercentage,
            frontSpeed: resultsB.frontSpeed - resultsA.frontSpeed,
            rearSpeed: resultsB.rearSpeed - resultsA.rearSpeed
        };

        const printContent = `
        <div class="print-header">
            <h1>RC Crawler Setup Comparison</h1>
            <h2>${setupAName} vs ${setupBName}</h2>
            <p class="print-date">Generated: ${new Date().toLocaleString()}</p>
        </div>

        <div class="print-section">
            <h3>Setup Configurations</h3>
            <table class="comparison-config-table">
                <thead>
                    <tr>
                        <th>Parameter</th>
                        <th class="setup-col">${setupAName}</th>
                        <th class="setup-col">${setupBName}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Pinion Gear</td><td>${paramsA.pinionTeeth} teeth</td><td>${paramsB.pinionTeeth} teeth</td></tr>
                    <tr><td>Spur Gear</td><td>${paramsA.spurTeeth} teeth</td><td>${paramsB.spurTeeth} teeth</td></tr>
                    <tr><td>Transmission</td><td>${paramsA.transmissionName}</td><td>${paramsB.transmissionName}</td></tr>
                    <tr><td>Front Axle</td><td>${paramsA.frontAxleName}</td><td>${paramsB.frontAxleName}</td></tr>
                    <tr><td>Rear Axle</td><td>${paramsA.rearAxleName}</td><td>${paramsB.rearAxleName}</td></tr>
                    <tr><td>Motor KV</td><td>${paramsA.motorKV || 'Not set'}</td><td>${paramsB.motorKV || 'Not set'}</td></tr>
                    <tr><td>Voltage</td><td>${paramsA.maxVoltage}V</td><td>${paramsB.maxVoltage}V</td></tr>
                    <tr><td>Tire Size</td><td>${paramsA.tireSize} ${paramsA.tireSizeUnit}</td><td>${paramsB.tireSize} ${paramsB.tireSizeUnit}</td></tr>
                </tbody>
            </table>
        </div>

        <div class="print-section">
            <h3>Performance Comparison</h3>
            <table class="comparison-results-table">
                <thead>
                    <tr>
                        <th>Measurement</th>
                        <th class="setup-col">${setupAName}</th>
                        <th class="setup-col">${setupBName}</th>
                        <th class="diff-col">Difference</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Motor Ratio</td>
                        <td class="result-value">${formattedA.motorRatio}</td>
                        <td class="result-value">${formattedB.motorRatio}</td>
                        <td class="diff-value ${this.getDifferenceClass(differences.motorRatio)}">${this.formatDifference(differences.motorRatio, 'ratio')}</td>
                    </tr>
                    <tr class="highlight">
                        <td>Final Front Ratio</td>
                        <td class="result-value">${formattedA.finalFrontRatio}</td>
                        <td class="result-value">${formattedB.finalFrontRatio}</td>
                        <td class="diff-value ${this.getDifferenceClass(differences.frontRatio)}">${this.formatDifference(differences.frontRatio, 'ratio')}</td>
                    </tr>
                    <tr class="highlight">
                        <td>Final Rear Ratio</td>
                        <td class="result-value">${formattedA.finalRearRatio}</td>
                        <td class="result-value">${formattedB.finalRearRatio}</td>
                        <td class="diff-value ${this.getDifferenceClass(differences.rearRatio)}">${this.formatDifference(differences.rearRatio, 'ratio')}</td>
                    </tr>
                    <tr>
                        <td>Overdrive %</td>
                        <td class="result-value">${formattedA.overdrivePercentage}</td>
                        <td class="result-value">${formattedB.overdrivePercentage}</td>
                        <td class="diff-value ${this.getDifferenceClass(differences.overdrive)}">${this.formatDifference(differences.overdrive, 'percentage')}</td>
                    </tr>
                    <tr class="speed-result">
                        <td>Front Speed</td>
                        <td class="result-value">${formattedA.frontSpeed}</td>
                        <td class="result-value">${formattedB.frontSpeed}</td>
                        <td class="diff-value ${this.getDifferenceClass(differences.frontSpeed)}">${this.formatDifference(differences.frontSpeed, 'speed')}</td>
                    </tr>
                    <tr class="speed-result">
                        <td>Rear Speed</td>
                        <td class="result-value">${formattedA.rearSpeed}</td>
                        <td class="result-value">${formattedB.rearSpeed}</td>
                        <td class="diff-value ${this.getDifferenceClass(differences.rearSpeed)}">${this.formatDifference(differences.rearSpeed, 'speed')}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="print-section summary-section">
            <h3>Analysis Summary</h3>
            <div class="summary-content">
                ${this.generatePrintSummary(paramsA, paramsB, resultsA, resultsB, setupAName, setupBName)}
            </div>
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
                <title>RC Crawler Calculator - Comparison: ${setupAName} vs ${setupBName}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        font-size: 11px;
                        line-height: 1.4;
                        color: #333;
                        background: white;
                        padding: 15px;
                    }
                    
                    .print-header {
                        text-align: center;
                        border-bottom: 2px solid #000;
                        padding-bottom: 10px;
                        margin-bottom: 20px;
                    }
                    
                    .print-header h1 {
                        font-size: 18px;
                        font-weight: bold;
                        color: #000;
                        margin-bottom: 5px;
                    }
                    
                    .print-header h2 {
                        font-size: 14px;
                        color: #000;
                        font-weight: 600;
                        margin-bottom: 8px;
                    }
                    
                    .print-date {
                        font-size: 9px;
                        color: #888;
                        font-style: italic;
                    }
                    
                    .print-section {
                        margin-bottom: 20px;
                        page-break-inside: avoid;
                    }
                    
                    .print-section h3 {
                        font-size: 13px;
                        font-weight: bold;
                        color: #000;
                        border-bottom: 1px solid #ccc;
                        padding-bottom: 4px;
                        margin-bottom: 12px;
                    }
                    
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 10px;
                        font-size: 10px;
                    }
                    
                    .comparison-config-table th,
                    .comparison-config-table td,
                    .comparison-results-table th,
                    .comparison-results-table td {
                        padding: 8px 6px;
                        text-align: left;
                        border-bottom: 1px solid #ddd;
                    }
                    
                    .comparison-config-table thead th,
                    .comparison-results-table thead th {
                        background: #000;
                        color: white;
                        font-weight: bold;
                        font-size: 11px;
                    }
                    
                    .setup-col {
                        background: #e3f2fd !important;
                        font-weight: 600;
                    }
                    
                    .diff-col {
                        background: #fff3e0 !important;
                        font-weight: 600;
                    }
                    
                    .comparison-config-table tbody tr:nth-child(even),
                    .comparison-results-table tbody tr:nth-child(even) {
                        background: #f8f9fa;
                    }
                    
                    .comparison-results-table .highlight {
                        background: #e8f5e8 !important;
                        font-weight: 600;
                    }
                    
                    .comparison-results-table .speed-result {
                        background: #f3e5f5 !important;
                        font-weight: 600;
                    }
                    
                    .result-value {
                        font-family: 'Courier New', monospace;
                        font-weight: bold;
                        text-align: center;
                    }
                    
                    .diff-value {
                        font-family: 'Courier New', monospace;
                        font-weight: bold;
                        text-align: center;
                    }
                    
                    .diff-positive { color: #2e7d32; }
                    .diff-negative { color: #c62828; }
                    .diff-neutral { color: #666; }
                    
                    .summary-section {
                        background: #f8f9fa;
                        border: 2px solid #ddd;
                        border-radius: 5px;
                        padding: 15px;
                    }
                    
                    .summary-content {
                        line-height: 1.6;
                    }
                    
                    .summary-content p {
                        margin-bottom: 8px;
                        padding-left: 20px;
                        position: relative;
                    }
                    
                    .summary-content p:before {
                        content: "•";
                        position: absolute;
                        left: 0;
                        font-weight: bold;
                        color: #666;
                    }
                    
                    .print-footer {
                        text-align: center;
                        margin-top: 25px;
                        padding-top: 15px;
                        border-top: 2px solid #ccc;
                        font-size: 9px;
                        color: #888;
                    }
                    
                    @media print {
                        body { margin: 0; padding: 10px; font-size: 10px; }
                        .print-header h1 { font-size: 18px; }
                        .print-section h3 { font-size: 12px; }
                        table { font-size: 9px; }
                        th, td { padding: 4px 3px; }
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

    getDifferenceClass(difference) {
        if (!isFinite(difference) || Math.abs(difference) < 0.001) {
            return 'diff-neutral';
        }
        return difference > 0 ? 'diff-positive' : 'diff-negative';
    }

    formatDifference(difference, type) {
        if (!isFinite(difference) || Math.abs(difference) < 0.001) {
            return '-';
        }

        const sign = difference > 0 ? '+' : '';
        
        switch (type) {
            case 'ratio':
                return `${sign}${difference.toFixed(3)}`;
            case 'percentage':
                return `${sign}${difference.toFixed(2)}%`;
            case 'speed':
                const speedKMH = mphToKmh(Math.abs(difference));
                return `${sign}${Math.abs(difference).toFixed(2)} MPH (${sign}${speedKMH.toFixed(2)} KM/H)`;
            default:
                return `${sign}${difference.toFixed(2)}`;
        }
    }

    generatePrintSummary(paramsA, paramsB, resultsA, resultsB, setupAName, setupBName) {
        let summary = [];

        // Speed comparison
        if (resultsA.rearSpeed && resultsB.rearSpeed) {
            const speedDiff = resultsB.rearSpeed - resultsA.rearSpeed;
            if (Math.abs(speedDiff) > 0.5) {
                const faster = speedDiff > 0 ? setupBName : setupAName;
                const slower = speedDiff > 0 ? setupAName : setupBName;
                const speedDiffKMH = mphToKmh(Math.abs(speedDiff));
                summary.push(`<p><strong>${faster}</strong> is ${Math.abs(speedDiff).toFixed(1)} MPH (${speedDiffKMH.toFixed(1)} KM/H) faster than ${slower}</p>`);
            }
        }

        // Gear ratio comparison
        const ratioA = resultsA.finalRearRatio;
        const ratioB = resultsB.finalRearRatio;
        if (ratioA && ratioB) {
            const ratioDiff = ratioB - ratioA;
            if (Math.abs(ratioDiff) > 1) {
                const higher = ratioDiff > 0 ? setupBName : setupAName;
                summary.push(`<p><strong>${higher}</strong> has ${Math.abs(ratioDiff).toFixed(1)} higher gear ratio (more torque, less speed)</p>`);
            }
        }

        // Overdrive analysis
        const overdriveA = resultsA.overdrivePercentage;
        const overdriveB = resultsB.overdrivePercentage;
        if (isFinite(overdriveA) && isFinite(overdriveB)) {
            if (overdriveA < 0 && overdriveB >= 0) {
                summary.push(`<p><strong>${setupBName}</strong> fixes the negative overdrive issue from ${setupAName}</p>`);
            } else if (overdriveB < 0 && overdriveA >= 0) {
                summary.push(`<p><strong>Warning:</strong> ${setupBName} creates negative overdrive (rear faster than front)</p>`);
            }
        }

        // Use case recommendations
        if (ratioA && ratioB && resultsA.rearSpeed && resultsB.rearSpeed) {
            const avgRatioA = (resultsA.finalFrontRatio + resultsA.finalRearRatio) / 2;
            const avgRatioB = (resultsB.finalFrontRatio + resultsB.finalRearRatio) / 2;

            if (avgRatioA > 50 && avgRatioB < 30) {
                summary.push(`<p><strong>Recommendation:</strong> ${setupAName} is better for technical crawling, ${setupBName} is better for speed and trail running</p>`);
            } else if (avgRatioB > 50 && avgRatioA < 30) {
                summary.push(`<p><strong>Recommendation:</strong> ${setupBName} is better for technical crawling, ${setupAName} is better for speed and trail running</p>`);
            }
        }

        // Motor stress analysis
        if (resultsA.motorRatio && resultsB.motorRatio) {
            if (resultsA.motorRatio < 2.5 || resultsB.motorRatio < 2.5) {
                const lowRatio = resultsA.motorRatio < resultsB.motorRatio ? setupAName : setupBName;
                summary.push(`<p><strong>Warning:</strong> ${lowRatio} has a low motor ratio (${resultsA.motorRatio < resultsB.motorRatio ? resultsA.motorRatio.toFixed(2) : resultsB.motorRatio.toFixed(2)}) that may stress the motor</p>`);
            }
        }

        if (summary.length === 0) {
            summary.push('<p>Both setups are properly configured and ready for comparison. Review the performance differences in the table above.</p>');
        }

        return summary.join('');
    }
}

// Create global comparison instance
const setupComparison = new SetupComparison();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait longer for other scripts to load first and main UI to initialize
    setTimeout(() => {
        if (typeof getTransmissionNames === 'function' && 
            typeof calculator !== 'undefined' && 
            typeof initializeUI === 'function') {
            console.log('All dependencies available, initializing comparison...');
            setupComparison.initialize();
        } else {
            console.error('Comparison feature requires data.js, calculator.js, and ui.js to be loaded first');
            console.log('Available functions:');
            console.log('- getTransmissionNames:', typeof getTransmissionNames);
            console.log('- calculator:', typeof calculator);
            console.log('- initializeUI:', typeof initializeUI);
            
            // Try again after a longer delay
            setTimeout(() => {
                if (typeof getTransmissionNames === 'function' && typeof calculator !== 'undefined') {
                    console.log('Retrying comparison initialization...');
                    setupComparison.initialize();
                }
            }, 2000);
        }
    }, 1500); // Increased delay to ensure main UI loads first
});