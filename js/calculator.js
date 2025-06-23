/**
 * RC Crawler Calculator - Calculation Engine
 * Handles all gear ratio and speed calculations
 */

class CrawlerCalculator {
    constructor() {
        this.results = {
            motorRatio: 0,
            finalFrontRatio: 0,
            finalRearRatio: 0,
            frontSpeed: 0,
            rearSpeed: 0,
            overdrivePercentage: 0
        };
    }

    /**
     * Calculate motor gear ratio
     * @param {number} spurTeeth - Number of spur gear teeth
     * @param {number} pinionTeeth - Number of pinion gear teeth
     * @returns {number} Motor gear ratio
     */
    calculateMotorRatio(spurTeeth, pinionTeeth) {
        if (!spurTeeth || !pinionTeeth || pinionTeeth === 0) {
            return 0;
        }
        return spurTeeth / pinionTeeth;
    }

    /**
     * Calculate overdrive percentage using percent difference formula
     * @param {number} frontRatio - Front axle final ratio
     * @param {number} rearRatio - Rear axle final ratio
     * @returns {number} Overdrive percentage
     */
    calculateOverdrivePercentage(frontRatio, rearRatio) {
        if (!frontRatio || !rearRatio || frontRatio === 0 || rearRatio === 0) {
            return 0;
        }
        
        // Percent difference formula: ((rear - front) / average) * 100
        // where average = (rear + front) / 2
        const average = (rearRatio + frontRatio) / 2;
        return ((rearRatio - frontRatio) / average) * 100;
    }

    /**
     * Calculate final drive ratios
     * @param {Object} params - Calculation parameters
     * @param {number} params.spurTeeth - Spur gear teeth
     * @param {number} params.pinionTeeth - Pinion gear teeth
     * @param {string} params.transmissionName - Transmission name
     * @param {string} params.frontAxleName - Front axle name
     * @param {string} params.rearAxleName - Rear axle name
     * @param {boolean} params.reverseTransmission - Whether to reverse transmission
     * @returns {Object} Calculated ratios
     */
    calculateRatios(params) {
        const {
            spurTeeth,
            pinionTeeth,
            transmissionName,
            frontAxleName,
            rearAxleName,
            reverseTransmission = false
        } = params;

        // Calculate motor ratio
        const motorRatio = this.calculateMotorRatio(spurTeeth, pinionTeeth);
        this.results.motorRatio = motorRatio;

        // Get transmission and axle data
        const transmission = getTransmission(transmissionName);
        const frontAxleRatio = getAxle(frontAxleName);
        const rearAxleRatio = getAxle(rearAxleName);

        if (!transmission || frontAxleRatio === null || rearAxleRatio === null) {
            this.results.finalFrontRatio = 0;
            this.results.finalRearRatio = 0;
            this.results.overdrivePercentage = 0;
            return this.results;
        }

        // Apply reverse transmission logic
        const frontTransRatio = reverseTransmission ? transmission.rear : transmission.front;
        const rearTransRatio = reverseTransmission ? transmission.front : transmission.rear;

        // Calculate final ratios
        this.results.finalFrontRatio = motorRatio * frontTransRatio * frontAxleRatio;
        this.results.finalRearRatio = motorRatio * rearTransRatio * rearAxleRatio;

        // Calculate overdrive percentage
        this.results.overdrivePercentage = this.calculateOverdrivePercentage(
            this.results.finalFrontRatio, 
            this.results.finalRearRatio
        );

        return this.results;
    }

    /**
     * Calculate theoretical speeds
     * @param {Object} params - Speed calculation parameters
     * @param {number} params.motorKV - Motor KV rating
     * @param {number} params.maxVoltage - Maximum battery voltage
     * @param {number} params.tireSize - Tire size
     * @param {string} params.tireSizeUnit - Tire size unit ('inches' or 'mm')
     * @returns {Object} Calculated speeds
     */
    calculateSpeeds(params) {
        const {
            motorKV,
            maxVoltage,
            tireSize,
            tireSizeUnit = 'inches'
        } = params;

        // Validate inputs
        if (!motorKV || !maxVoltage || !tireSize || 
            !this.results.finalFrontRatio || !this.results.finalRearRatio) {
            this.results.frontSpeed = 0;
            this.results.rearSpeed = 0;
            return this.results;
        }

        // Convert tire size to inches if needed
        const tireSizeInches = tireSizeUnit === 'mm' ? tireSize / 25.4 : tireSize;
        const tireCircumference = Math.PI * tireSizeInches; // inches

        // Calculate motor RPM
        const motorRPM = motorKV * maxVoltage;

        // Calculate wheel RPM
        const frontWheelRPM = motorRPM / this.results.finalFrontRatio;
        const rearWheelRPM = motorRPM / this.results.finalRearRatio;

        // Calculate speeds in MPH
        // Formula: (RPM * circumference * 60) / (12 inches/foot * 5280 feet/mile)
        const frontSpeedMPH = (frontWheelRPM * tireCircumference * 60) / (12 * 5280);
        const rearSpeedMPH = (rearWheelRPM * tireCircumference * 60) / (12 * 5280);

        this.results.frontSpeed = frontSpeedMPH;
        this.results.rearSpeed = rearSpeedMPH;

        return this.results;
    }

    /**
     * Calculate all parameters at once
     * @param {Object} params - All calculation parameters
     * @returns {Object} Complete calculation results
     */
    calculateAll(params) {
        // Calculate ratios first
        this.calculateRatios(params);
        
        // Then calculate speeds
        this.calculateSpeeds(params);
        
        return this.results;
    }

    /**
     * Get formatted results for display
     * @returns {Object} Formatted results
     */
    getFormattedResults() {
        return {
            motorRatio: this.formatRatio(this.results.motorRatio),
            finalFrontRatio: this.formatRatio(this.results.finalFrontRatio),
            finalRearRatio: this.formatRatio(this.results.finalRearRatio),
            frontSpeed: this.formatSpeed(this.results.frontSpeed),
            rearSpeed: this.formatSpeed(this.results.rearSpeed),
            overdrivePercentage: this.formatPercentage(this.results.overdrivePercentage)
        };
    }

    /**
     * Format ratio for display
     * @param {number} ratio - Ratio value
     * @returns {string} Formatted ratio string
     */
    formatRatio(ratio) {
        if (!ratio || ratio === 0) return '-';
        return `${ratio.toFixed(3)}:1`;
    }

    /**
     * Format speed for display
     * @param {number} speed - Speed in MPH
     * @returns {string} Formatted speed string
     */
    formatSpeed(speed) {
        if (!speed || speed === 0) return '-';
        return `${speed.toFixed(2)} MPH`;
    }

    /**
     * Format percentage for display
     * @param {number} percentage - Percentage value
     * @returns {string} Formatted percentage string
     */
    formatPercentage(percentage) {
        if (percentage === 0 || !isFinite(percentage)) return '-';
        const sign = percentage > 0 ? '+' : '';
        return `${sign}${percentage.toFixed(1)}%`;
    }

    /**
     * Validate calculation inputs
     * @param {Object} params - Input parameters
     * @returns {Object} Validation result
     */
    validateInputs(params) {
        const errors = [];
        const warnings = [];

        // Check required fields for ratio calculation
        if (!params.spurTeeth || params.spurTeeth < 20 || params.spurTeeth > 100) {
            errors.push('Spur gear teeth must be between 20 and 100');
        }

        if (!params.pinionTeeth || params.pinionTeeth < 8 || params.pinionTeeth > 30) {
            errors.push('Pinion gear teeth must be between 8 and 30');
        }

        if (!params.transmissionName) {
            errors.push('Please select a transmission');
        }

        if (!params.frontAxleName) {
            errors.push('Please select a front axle');
        }

        if (!params.rearAxleName) {
            errors.push('Please select a rear axle');
        }

        // Check optional fields for speed calculation
        if (params.motorKV && (params.motorKV < 100 || params.motorKV > 5000)) {
            warnings.push('Motor KV should typically be between 100 and 5000');
        }

        if (params.maxVoltage && (params.maxVoltage < 3 || params.maxVoltage > 20)) {
            warnings.push('Battery voltage should typically be between 3V and 20V');
        }

        if (params.tireSize && (params.tireSize < 1 || params.tireSize > 10)) {
            warnings.push('Tire size seems unusual - please verify');
        }

        // Check for extreme gear ratios
        if (params.spurTeeth && params.pinionTeeth) {
            const motorRatio = params.spurTeeth / params.pinionTeeth;
            if (motorRatio > 10) {
                warnings.push('Very high motor ratio may result in slow speeds');
            } else if (motorRatio < 2) {
                warnings.push('Very low motor ratio may stress the motor');
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Compare two different setups
     * @param {Object} setup1 - First setup parameters
     * @param {Object} setup2 - Second setup parameters
     * @returns {Object} Comparison results
     */
    compareSetups(setup1, setup2) {
        const calc1 = new CrawlerCalculator();
        const calc2 = new CrawlerCalculator();

        const results1 = calc1.calculateAll(setup1);
        const results2 = calc2.calculateAll(setup2);

        return {
            setup1: results1,
            setup2: results2,
            differences: {
                motorRatio: results2.motorRatio - results1.motorRatio,
                finalFrontRatio: results2.finalFrontRatio - results1.finalFrontRatio,
                finalRearRatio: results2.finalRearRatio - results1.finalRearRatio,
                frontSpeed: results2.frontSpeed - results1.frontSpeed,
                rearSpeed: results2.rearSpeed - results1.rearSpeed,
                overdrivePercentage: results2.overdrivePercentage - results1.overdrivePercentage
            }
        };
    }
}

// Create global calculator instance
const calculator = new CrawlerCalculator();