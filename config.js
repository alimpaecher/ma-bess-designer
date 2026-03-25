// ============================================
// BESS Dashboard — Configuration & Constants
// ============================================

// Boston, MA monthly solar radiation (kWh/m²/day)
// Source: Solar Energy Local — Boston, MA [Ref 4]
const MONTHLY_SOLAR = {
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    radiation: [3.92, 4.66, 5.01, 5.42, 5.54, 5.64, 6.01, 5.77, 5.51, 4.56, 3.57, 3.28],
    daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
};

// Battery container specifications [Ref 3]
const CONTAINER_SPECS = {
    5365: { name: 'BYD MC Cube', kWh: 5365, lengthM: 6.06, widthM: 2.44, heightM: 2.90, weightKg: 4200 },
    6432: { name: 'BYD MC Cube-T', kWh: 6432, lengthM: 6.06, widthM: 2.44, heightM: 2.90, weightKg: 5000 },
    5000: { name: 'Tesla Megapack 3', kWh: 5000, lengthM: 6.06, widthM: 2.44, heightM: 2.59, weightKg: 4500 },
    3354: { name: 'CATL EnerOne', kWh: 3354, lengthM: 6.06, widthM: 2.44, heightM: 2.90, weightKg: 3800 }
};

// NFPA 855 setback/spacing requirements in meters [Ref 8]
const NFPA = {
    unitSpacingM: 0.91,      // 3 ft min between ESS units (Section 15.5)
    egressSetbackM: 3.05,    // 10 ft min to means of egress
    fireAccessM: 6.10,       // 20 ft fire department vehicle access lane
    buildingSetbackM: 3.05   // 10 ft from buildings/exposures
};

// Convert meters to feet
const M_TO_FT = 3.28084;

// SMART program defaults [Ref 6]
const SMART_BASE_RATE = 0.2821; // $/kWh PY 2025 base rate

// Utility to format numbers with commas
function fmt(n, decimals = 0) {
    return Number(n).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

function fmtCurrency(n) {
    return '$' + fmt(n, 0);
}
