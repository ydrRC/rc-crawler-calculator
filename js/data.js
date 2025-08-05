/**
 * RC Crawler Calculator - Data Components
 * Contains transmission and axle data for gear ratio calculations
 */

const TRANSMISSIONS = {
    "Axial 3-Gear": { front: 2.600, rear: 2.600 },
    "Axial Capra - 34(32) Spur": { front: 1.800, rear: 1.800 },
    "Axial Capra UTB18 40 (48) Spur": { front: 3.825, rear: 3.825 },
    "Axial Capra UTB18 [TGH] 42 (48) Spur": { front: 3.825, rear: 3.825 },
    "Axial LCXU (Basecamp) - Portal": { front: 1.643, rear: 1.643 },
    "Axial LCXU (Basecamp) - Straight": { front: 2.614, rear: 2.614 },
    "Axial SCX10 Pro - 0% OD": { front: 2.222, rear: 2.222 },
    "Axial SCX10 Pro - 40% OD": { front: 2.222, rear: 3.322 },
    "Axial SCX10.3 Portal high 40(32) Spur": { front: 1.520, rear: 1.520 },
    "Axial SCX10.3 Portal low 40(32) Spur": { front: 2.220, rear: 2.220 },
    "Axial SCX10.3 Straight high 40(32) Spur": { front: 2.590, rear: 2.590 },
    "Axial SCX10.3 Straight low 40(32) Spur": { front: 3.780, rear: 3.780 },
    "Axial Yeti / RR10": { front: 1.939, rear: 1.939 },
    "CCW Hidden Ninja": { front: 2.860, rear: 3.600 },
    "Dlux Cheez Berger 17% OD - 48(48) Spur": { front: 3.373, rear: 4.000 },
    "Dlux Cheez Berger No OD - 48(48) Spur": { front: 4.000, rear: 4.000 },
    "Dlux Fargo 36(48) Spur": { front: 9.000, rear: 9.000 },
    "Dlux Ham Berger - 48(48) Spur": { front: 5.000, rear: 5.000 },
    "Dlux NOD-2 - 44(48) Spur": { front: 4.000, rear: 4.000 },
    "Dlux OD-3 - 44(48) Spur": { front: 3.660, rear: 4.411 },
    "Dlux OD-3 NO OD - 44(48) Spur": { front: 3.667, rear: 3.667 },
    "Dlux OD-4 - 36(48) Spur": { front: 3.000, rear: 4.000 },
    "Dlux Portal - 36(48) Spur": { front: 3.000, rear: 3.000 },
    "Dlux Slider - 48(48) Spur": { front: 5.000, rear: 5.000 },
    "Element Stealth KNK": { front: 2.600, rear: 3.267 },
    "Element Stealth No OD": { front: 2.600, rear: 2.600 },
    "Element Stealth Opt 1": { front: 2.600, rear: 2.748 },
    "Element Stealth Opt 2": { front: 2.600, rear: 2.908 },
    "Exo Alpinist 0% - 36(48) Spur": { front: 4.910, rear: 4.910 },
    "Exo Alpinist 28% - 36(48) Spur": { front: 4.910, rear: 6.540 },
    "Exo Boulderer - 36(48) Spur": { front: 4.000, rear: 4.000 },
    "Exo Trad Climber Alpinist - 36(48) Spur": { front: 4.910, rear: 4.910 },
    "Exo Twin Rope Dual Motor": { front: 4.000, rear: 4.000 },
    "High Altitude PS200": { front: 1.540, rear: 2.000 },
    "Hotline Performance ODD - 36(48) Spur": { front: 3.000, rear: 4.000 },
    "HPI Venture Trans & Case - 60(48) Spur": { front: 2.297, rear: 2.297 },
    "Losi Comp Crawler - 30(48) Spur": { front: 1.333, rear: 1.333 },
	"MOA 1:1": { front: 1.000, rear: 1.000 },    
	"MEUS Racing LCG-Gold Rush": { front: 2.000, rear: 2.533 },
    "Nordic Crawl ULV 40(48) Spur": { front: 2.860, rear: 2.860 },
	"Procrawler Grind 328 LCG OD": { front: 1.950, rear: 1.350 },
    "Procrawler Grind 431 LCG OD": { front: 1.833, rear: 2.500 },
    "Reefs XPT3 LCG - 36(48) Spur": { front: 3.750, rear: 3.750 },
    "Salinas Mullet": { front: 2.294, rear: 1.706 },
    "Salinas ODT V1 (High)": { front: 1.529, rear: 2.647 },
    "Salinas ODT V1 (Low)": { front: 1.706, rear: 2.294 },
    "Salinas ODT V1 (Med)": { front: 1.706, rear: 2.647 },
    "Supershafty SS-F6 0%": { front: 1.929, rear: 1.929 },
    "Supershafty SS-F6 18%": { front: 1.929, rear: 2.330 },
    "Supershafty SS-F6 26%": { front: 1.929, rear: 2.505 },
    "TGH 2.LOW": { front: 1.940, rear: 2.650 },
    "TGH Creeper-T": { front: 1.900, rear: 2.600 },
    "TGH O.G.": { front: 1.920, rear: 1.920 },
    "TGH O.G. OD": { front: 1.660, rear: 1.900 },
    "TGH T-210 - 26(32) Spur": { front: 5.138, rear: 7.007 },
    "ToyZuki 2.5 Transfercase": { front: 1.800, rear: 2.600 },
    "ToyZuki V1 Transfercase": { front: 2.600, rear: 2.600 },
    "Traxxas TRX-4 High Gear": { front: 0.800, rear: 0.800 },
    "Traxxas TRX-4 Low Gear": { front: 2.000, rear: 2.000 },
    "Traxxas TRX-4 Sport": { front: 2.000, rear: 2.000 },
    "VP VFD OD (21%)": { front: 2.560, rear: 3.150 },
    "VP VFD Twin High (46%)": { front: 1.966, rear: 3.150 },
    "VP VFD/VFD Twin Low (6.5%)": { front: 2.950, rear: 3.150 }
};

const AXLES = {
    "AR44 / AR45 / SCX Pro OD2": 3.000,
    "AR44 / AR45 / SCX Pro OD1": 3.375,
    "AR44 / AR45 / SCX Pro / Element": 3.750,
    "AR44 / AR45 / SCX Pro UD": 4.125,
    "AR45P / Capra / SCX Pro Portal OD2 (12/23)": 5.750,
    "AR45P / Capra / SCX Pro Portal OD1 (12/23)": 6.469,
    "AR45P / Capra / SCX Pro Portal (12/23)": 7.188,
    "AR45P / Capra / SCX Pro Portal UD (12/23)": 7.906,
    "AR45P / Capra / SCX Pro Portal OD2 (13/22)": 5.077,
    "AR45P / Capra / SCX Pro Portal OD1 (13/22)": 5.712,
    "AR45P / Capra / SCX Pro Portal (13/22)": 6.346,
    "AR45P / Capra / SCX Pro Portal UD (13/22)": 6.981,
    "AR45P / Capra / SCX Pro Portal OD2 (14/21)": 4.500,
    "AR45P / Capra / SCX Pro Portal OD1 (14/21)": 5.063,
    "AR45P / Capra / SCX Pro Portal (14/21)": 5.625,
    "AR45P / Capra / SCX Pro Portal UD (14/21)": 6.188,
    "AR45P / Capra / SCX Pro Portal OD2 (15/20)": 4.000,
    "AR45P / Capra / SCX Pro Portal OD1 (15/20)": 4.500,
    "AR45P / Capra / SCX Pro Portal (15/20)": 5.000,
    "AR45P / Capra / SCX Pro Portal UD (15/20)": 5.500,
    "AR45P / Capra / SCX Pro Portal OD2 (16/19)": 3.563,
    "AR45P / Capra / SCX Pro Portal OD1 (16/19)": 4.008,
    "AR45P / Capra / SCX Pro Portal (16/19)": 4.453,
    "AR45P / Capra / SCX Pro Portal UD (16/19)": 4.898,
    "AR60 OD": 2.571,
    "AR60 STD": 2.923,
    "AR60 UD": 3.308,
    "AR60P OD (12/23)": 4.929,
    "AR60P STD (12/23)": 5.603,
    "AR60P UD (12/23)": 6.340,
    "AR60P OD (13/22)": 4.352,
    "AR60P STD (13/22)": 4.947,
    "AR60P UD (13/22)": 5.598,
    "AR60P OD (14/21)": 3.857,
    "AR60P STD (14/21)": 4.385,
    "AR60P UD (14/21)": 4.962,
    "AR60P OD (15/20)": 3.429,
    "AR60P STD (15/20)": 3.897,
    "AR60P UD (15/20)": 4.410,
    "AR60P OD (16/19)": 3.054,
    "AR60P STD (16/19)": 3.471,
    "AR60P UD (16/19)": 3.928,
    "Axial AF16P STD (12/29)": 7.994,
    "Axial AF16P STD (13/28)": 7.124,
    "Axial AF16P STD (14/27)": 6.379,
    "Axial AF16P OD (12/29)": 7.064,
    "Axial AF16P OD (13/28)": 6.296,
    "Axial AF16P OD (14/27)": 5.637,
    "Dlux Superlite LOW": 14.286,
    "Dlux Superlite STD": 11.429,
    "Dlux SLP LOW (12/23)": 27.382,
    "Dlux SLP STD (12/23)": 21.906,
    "Dlux SLP LOW (15/20)": 19.048,
    "Dlux SLP STD (15/20)": 15.239,
    "Element IFS with SSD Portal (14/16)": 4.286,
    "Element IFS with SSD Portal (16/14)": 3.281,
    "Element Portal (15/20)": 5.500,
    "Element Portal (12/23)": 7.906,
    "HPI Venture": 3.308,
	"Losi Comp Crawler Worm Drive": 21.000,
    "MEUS Racing Nylon Portal OD2 (20/28)": 4.200,
    "MEUS Racing Nylon Portal OD1 (20/28)": 4.725,
    "MEUS Racing Nylon Portal (20/28)": 5.250,
    "MEUS Racing Nylon Portal UD (20/28)": 5.775,
    "TRX-4 OD": 7.028,
    "TRX-4 STD": 7.899,
    "TRX-4 UD": 8.944,
    "UTB18 STD (13/28) Dlux": 5.467,
    "UTB18 STD (14/27) TGH": 4.896,
    "UTB18 STD (15/26) STK": 4.400,
    "UTB18 STD (16/25) Treal": 3.966,
    "UTB18 STD (17/24) Treal": 3.584,
    "UTB18 OD (13/28) Dlux": 4.639,
    "UTB18 OD (14/27) TGH": 4.154,
    "UTB18 OD (15/26) STK": 3.733,
    "UTB18 OD (16/25) Treal": 3.365,
    "UTB18 OD (17/24) Treal": 3.041,
    "VP Portal OD2 (18/30)": 5.000,
    "VP Portal OD1 (18/30)": 5.625,
    "VP Portal (18/30)": 6.250,
    "VP Portal UD (18/30)": 6.875,
    "VP Portal OD2 (20/28)": 4.200,
    "VP Portal OD1 (20/28)": 4.725,
    "VP Portal (20/28)": 5.250,
    "VP Portal UD (20/28)": 5.775
};

function getTransmissionNames() {
    return Object.keys(TRANSMISSIONS).sort();
}

function getAxleNames() {
    return Object.keys(AXLES).sort();
}

function getTransmission(name) {
    return TRANSMISSIONS[name] || null;
}

function getAxle(name) {
    return AXLES[name] || null;
}

/**
 * Convert MPH to KM/H
 * @param {number} mph - Speed in miles per hour
 * @returns {number} Speed in kilometers per hour
 */
function mphToKmh(mph) {
    return mph * 1.60934;
}

/**
 * Format speed for display with both MPH and KM/H
 * @param {number} speedMPH - Speed in MPH
 * @returns {string} Formatted speed string
 */
function formatSpeedDisplay(speedMPH) {
    if (!speedMPH || speedMPH === 0) return '-';
    const speedKMH = mphToKmh(speedMPH);
    return `${speedMPH.toFixed(2)} MPH (${speedKMH.toFixed(2)} KM/H)`;
}