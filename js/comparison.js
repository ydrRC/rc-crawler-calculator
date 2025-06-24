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
    }

    addComparisonEventListeners() {
        // Toggle comparison visibility
        const toggleBtn = document.getElementById('toggleComparison');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleComparison());
        }

        // Copy current setup buttons
        const copyToA = document.getElementById('copyCurrentToA');
        const copyToB = document.getElementById('copyCurrentToB');
        
        if (copyToA) {
            copyToA.addEventListener('click', () => this.copyCurrentSetup('A'));
        }
        
        if (copyToB) {
            copyToB.addEventListener('click', () => this.copyCurrentSetup('B'));
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
    }

    toggleComparison() {
        const content = document.getElementById('comparisonContent');
        const toggleBtn = document.getElementById('toggleComparison');
        
        if (!content || !toggleBtn) {
            console.error('Comparison elements not found');
            return;
        }
        
        this.isVisible = !this.isVisible;
        
        if (this.isVisible) {
            content.style.display = 'block';
            toggleBtn.textContent = 'Hide Comparison';
            console.log('Comparison tool opened');
            setTimeout(() => this.calculateComparison(), 100);
        } else {
            content.style.display = 'none';
            toggleBtn.textContent = 'Show Comparison';
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