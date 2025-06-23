/**
 * RC Crawler Calculator - UI Module
 * Handles user interface interactions and DOM manipulation
 */

class CrawlerUI {
    constructor() {
        this.elements = {};
        this.debounceTimer = null;
        this.init();
    }

    /**
     * Initialize the UI
     */
    init() {
        this.cacheElements();
        this.populateDropdowns();
        this.addEventListeners();
        this.calculate(); // Initial calculation
    }

    /**
     * Cache DOM elements for better performance
     */
    cacheElements() {
        this.elements = {
            // Input elements
            pinion: document.getElementById('pinion'),
            spur: document.getElementById('spur'),
            transmission: document.getElementById('transmission'),
            frontAxle: document.getElementById('frontAxle'),
            rearAxle: document.getElementById('rearAxle'),
            reverseTransmission: document.getElementById('reverseTransmission'),
            motorKV: document.getElementById('motorKV'),
            maxVoltage: document.getElementById('maxVoltage'),
            tireSize: document.getElementById('tireSize'),
            tireSizeUnit: document.getElementById('tireSizeUnit'),

            // Result elements
            motorRatio: document.getElementById('motorRatio'),
            frontRatio: document.getElementById('frontRatio'),
            rearRatio: document.getElementById('rearRatio'),
            frontSpeed: document.getElementById('frontSpeed'),
            rearSpeed: document.getElementById('rearSpeed')
        };
    }

    /**
     * Populate dropdown options
     */
    populateDropdowns() {
        this.populateTransmissions();
        this.populateAxles();
    }

    /**
     * Populate transmission dropdown
     */
    populateTransmissions() {
        const select = this.elements.transmission;
        const transmissions = getTransmissionNames();

        // Clear existing options (except the first placeholder)
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }

        // Add transmission options
        transmissions.forEach(transmission => {
            const option = document.createElement('option');
            option.value = transmission;
            option.textContent = transmission;
            select.appendChild(option);
        });
    }

    /**
     * Populate axle dropdowns
     */
    populateAxles() {
        const frontSelect = this.elements.frontAxle;
        const rearSelect = this.elements.rearAxle;
        const axles = getAxleNames();

        // Clear existing options (except the first placeholder)
        [frontSelect, rearSelect].forEach(select => {
            while (select.children.length > 1) {
                select.removeChild(select.lastChild);
            }
        });

        // Add axle options to both dropdowns
        axles.forEach(axle => {
            // Front axle option
            const frontOption = document.createElement('option');
            frontOption.value = axle;
            frontOption.textContent = axle;
            frontSelect.appendChild(frontOption);

            // Rear axle option
            const rearOption = document.createElement('option');
            rearOption.value = axle;
            rearOption.textContent = axle;
            rearSelect.appendChild(rearOption);
        });
    }

    /**
     * Add event listeners to all input elements
     */
    addEventListeners() {
        // Input change listeners
        Object.values(this.elements).forEach(element => {
            if (element && element.addEventListener) {
                element.addEventListener('input', () => this.debouncedCalculate());
                element.addEventListener('change', () => this.calculate());
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Window resize listener for responsive updates
        window.addEventListener('resize', () => this.handleResize());
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + R: Reset form
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            this.resetForm();
        }

        // Escape: Clear selections
        if (e.key === 'Escape') {
            this.clearSelections();
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Add any responsive adjustments here if needed
        console.log('Window resized');
    }

    /**
     * Debounced calculation for input events
     */
    debouncedCalculate() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => this.calculate(), 300);
    }

    /**
     * Perform calculations and update UI
     */
    calculate() {
        try {
            // Gather input values
            const params = this.getInputValues();

            // Validate inputs
            const validation = calculator.validateInputs(params);
            this.displayValidation(validation);

            // Perform calculations
            const results = calculator.calculateAll(params);

            // Update UI with results
            this.updateResults(results);

            // Add visual feedback
            this.addCalculationFeedback();

        } catch (error) {
            console.error('Calculation error:', error);
            this.displayError('An error occurred during calculation');
        }
    }

    /**
     * Get all input values
     * @returns {Object} Input parameters
     */
    getInputValues() {
        return {
            spurTeeth: parseFloat(this.elements.spur.value) || 0,
            pinionTeeth: parseFloat(this.elements.pinion.value) || 0,
            transmissionName: this.elements.transmission.value,
            frontAxleName: this.elements.frontAxle.value,
            rearAxleName: this.elements.rearAxle.value,
            reverseTransmission: this.elements.reverseTransmission.checked,
            motorKV: parseFloat(this.elements.motorKV.value) || 0,
            maxVoltage: parseFloat(this.elements.maxVoltage.value) || 0,
            tireSize: parseFloat(this.elements.tireSize.value) || 0,
            tireSizeUnit: this.elements.tireSizeUnit.value
        };
    }

    /**
     * Update result displays
     * @param {Object} results - Calculation results
     */
    updateResults(results) {
        const formatted = calculator.getFormattedResults();

        // Update result elements with animation
        this.animateValueChange(this.elements.motorRatio, formatted.motorRatio);
        this.animateValueChange(this.elements.frontRatio, formatted.finalFrontRatio);
        this.animateValueChange(this.elements.rearRatio, formatted.finalRearRatio);
        this.animateValueChange(this.elements.frontSpeed, formatted.frontSpeed);
        this.animateValueChange(this.elements.rearSpeed, formatted.rearSpeed);
    }

    /**
     * Animate value changes
     * @param {HTMLElement} element - Element to update
     * @param {string} newValue - New value to display
     */
    animateValueChange(element, newValue) {
        if (!element) return;

        const oldValue = element.textContent;
        if (oldValue !== newValue) {
            element.style.transform = 'scale(1.1)';
            element.style.transition = 'transform 0.2s ease';
            
            setTimeout(() => {
                element.textContent = newValue;
                element.style.transform = 'scale(1)';
            }, 100);
        }
    }

    /**
     * Display validation messages
     * @param {Object} validation - Validation results
     */
    displayValidation(validation) {
        // Remove existing validation messages
        this.clearValidationMessages();

        // Display errors
        if (validation.errors.length > 0) {
            validation.errors.forEach(error => {
                console.warn('Validation error:', error);
            });
        }

        // Display warnings
        if (validation.warnings.length > 0) {
            validation.warnings.forEach(warning => {
                console.info('Validation warning:', warning);
            });
        }
    }

    /**
     * Clear validation messages
     */
    clearValidationMessages() {
        // Remove any existing validation UI elements
        const existingMessages = document.querySelectorAll('.validation-message');
        existingMessages.forEach(msg => msg.remove());
    }

    /**
     * Display error message
     * @param {string} message - Error message
     */
    displayError(message) {
        console.error(message);
        // Could add visual error display here
    }

    /**
     * Add visual feedback for calculation
     */
    addCalculationFeedback() {
        const resultsSection = document.querySelector('.results-section');
        if (resultsSection) {
            resultsSection.style.boxShadow = '0 0 20px rgba(52, 152, 219, 0.3)';
            setTimeout(() => {
                resultsSection.style.boxShadow = '';
            }, 500);
        }
    }

    /**
     * Reset form to default values
     */
    resetForm() {
        this.elements.pinion.value = '10';
        this.elements.spur.value = '54';
        this.elements.transmission.value = '';
        this.elements.frontAxle.value = '';
        this.elements.rearAxle.value = '';
        this.elements.reverseTransmission.checked = false;
        this.elements.motorKV.value = '1800';
        this.elements.maxVoltage.value = '11.1';
        this.elements.tireSize.value = '4.19';
        this.elements.tireSizeUnit.value = 'inches';

        this.calculate();
    }

    /**
     * Clear dropdown selections
     */
    clearSelections() {
        this.elements.transmission.value = '';
        this.elements.frontAxle.value = '';
        this.elements.rearAxle.value = '';
        this.calculate();
    }

    /**
     * Export current configuration
     * @returns {Object} Current configuration
     */
    exportConfiguration() {
        return {
            ...this.getInputValues(),
            timestamp: new Date().toISOString(),
            results: calculator.getFormattedResults()
        };
    }

    /**
     * Import configuration
     * @param {Object} config - Configuration to import
     */
    importConfiguration(config) {
        if (!config) return;

        // Set input values
        if (config.spurTeeth) this.elements.spur.value = config.spurTeeth;
        if (config.pinionTeeth) this.elements.pinion.value = config.pinionTeeth;
        if (config.transmissionName) this.elements.transmission.value = config.transmissionName;
        if (config.frontAxleName) this.elements.frontAxle.value = config.frontAxleName;
        if (config.rearAxleName) this.elements.rearAxle.value = config.rearAxleName;
        if (config.reverseTransmission !== undefined) this.elements.reverseTransmission.checked = config.reverseTransmission;
        if (config.motorKV) this.elements.motorKV.value = config.motorKV;
        if (config.maxVoltage) this.elements.maxVoltage.value = config.maxVoltage;
        if (config.tireSize) this.elements.tireSize.value = config.tireSize;
        if (config.tireSizeUnit) this.elements.tireSizeUnit.value = config.tireSizeUnit;

        // Recalculate
        this.calculate();
    }
}

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.crawlerUI = new CrawlerUI();
    console.log('RC Crawler Calculator initialized');
});