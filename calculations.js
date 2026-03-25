// ============================================
// BESS Dashboard — Calculations Engine
// ============================================

function calculateAll(inputs) {
    const r = {};

    // --- Basic load calculations ---
    r.dailyLoad = inputs.annualLoad / 365;
    r.islandingNeed = r.dailyLoad * inputs.islandingDays;

    // --- Battery sizing ---
    // Nameplate = islanding need / DoD to account for not fully discharging
    r.nameplateCapacity = r.islandingNeed / (inputs.dod / 100);
    r.usableCapacity = r.islandingNeed;

    // --- Container count ---
    const spec = CONTAINER_SPECS[inputs.containerCap];
    r.containerSpec = spec;
    r.containersNeeded = Math.ceil(r.nameplateCapacity / spec.kWh);
    r.totalInstalledCapacity = r.containersNeeded * spec.kWh;

    // --- Inverter sizing ---
    // Inverter must handle peak load. Estimate peak as 2x average hourly load
    // plus solar array capacity for charging
    r.avgHourlyLoad = r.dailyLoad / 24;
    r.peakLoad = r.avgHourlyLoad * 2.5; // peak demand factor
    r.inverterSize = Math.ceil(Math.max(r.peakLoad, inputs.solarSize) / 50) * 50; // round up to nearest 50 kW

    // --- Solar production ---
    r.dailySolarProduction = inputs.solarSize * inputs.peakSunHours;
    r.annualSolarProduction = 0;

    // Monthly breakdown
    r.monthly = MONTHLY_SOLAR.labels.map((label, i) => {
        const radiation = MONTHLY_SOLAR.radiation[i];
        const days = MONTHLY_SOLAR.daysInMonth[i];
        const dailySolar = inputs.solarSize * radiation * (inputs.rte / 100);
        const monthlySolar = dailySolar * days;
        const monthlyLoad = r.dailyLoad * days;
        const surplus = monthlySolar - monthlyLoad;

        r.annualSolarProduction += monthlySolar;

        return {
            label,
            days,
            radiation,
            dailySolar,
            monthlySolar: Math.round(monthlySolar),
            monthlyLoad: Math.round(monthlyLoad),
            surplus: Math.round(surplus),
            batteryReserve: Math.round(r.totalInstalledCapacity * (inputs.dod / 100))
        };
    });

    // --- Financial calculations ---
    r.totalSystemCost = r.totalInstalledCapacity * inputs.installedCost;

    // SMART base rate revenue (on solar production)
    r.smartBaseRevenue = r.annualSolarProduction * SMART_BASE_RATE;

    // Storage adder revenue (on solar production, multiplied by storage adder)
    r.storageAdderRevenue = r.annualSolarProduction * inputs.smartAdder;

    // Energy cost offset (solar self-consumption value)
    const selfConsumed = Math.min(r.annualSolarProduction, inputs.annualLoad);
    r.energyCostOffset = selfConsumed * inputs.elecRate;

    // Total annual revenue
    r.totalAnnualRevenue = r.smartBaseRevenue + r.storageAdderRevenue + r.energyCostOffset;

    // Simple payback
    r.paybackYears = r.totalSystemCost / r.totalAnnualRevenue;

    // --- Site layout dimensions ---
    r.site = calculateSiteLayout(r.containersNeeded, spec);

    // --- Compliance checks ---
    r.durationHours = r.totalInstalledCapacity * (inputs.dod / 100) / r.peakLoad;
    r.meetsDuration = r.durationHours >= 2;
    r.meetsRTE = inputs.rte >= 70;
    r.meetsMinSize = r.totalInstalledCapacity >= 1000; // 1 MW = 1000 kWh for 1-hr, but check kW

    return r;
}

function calculateSiteLayout(containerCount, spec) {
    // Layout: containers in a row with NFPA spacing
    // Surrounded by setbacks and fire access lane

    const cLenFt = spec.lengthM * M_TO_FT;  // ~19.9 ft
    const cWidFt = spec.widthM * M_TO_FT;   // ~8 ft
    const spacingFt = NFPA.unitSpacingM * M_TO_FT; // 3 ft
    const setbackFt = NFPA.buildingSetbackM * M_TO_FT; // 10 ft
    const fireAccessFt = NFPA.fireAccessM * M_TO_FT; // 20 ft

    // Arrange containers: for small counts, single row; for larger, 2 rows
    let rows, cols;
    if (containerCount <= 3) {
        rows = 1;
        cols = containerCount;
    } else {
        rows = 2;
        cols = Math.ceil(containerCount / 2);
    }

    // Container pad dimensions
    const padWidth = cols * cLenFt + (cols - 1) * spacingFt;
    const padDepth = rows * cWidFt + (rows > 1 ? spacingFt : 0);

    // Total site with setbacks and fire access
    const totalWidth = setbackFt + padWidth + setbackFt;
    const totalDepth = fireAccessFt + setbackFt + padDepth + setbackFt;

    // Pad area
    const padAreaSqFt = padWidth * padDepth;
    const totalAreaSqFt = totalWidth * totalDepth;

    return {
        rows, cols,
        cLenFt: Math.round(cLenFt * 10) / 10,
        cWidFt: Math.round(cWidFt * 10) / 10,
        spacingFt: Math.round(spacingFt * 10) / 10,
        setbackFt: Math.round(setbackFt * 10) / 10,
        fireAccessFt: Math.round(fireAccessFt * 10) / 10,
        padWidth: Math.round(padWidth * 10) / 10,
        padDepth: Math.round(padDepth * 10) / 10,
        totalWidth: Math.round(totalWidth * 10) / 10,
        totalDepth: Math.round(totalDepth * 10) / 10,
        padAreaSqFt: Math.round(padAreaSqFt),
        totalAreaSqFt: Math.round(totalAreaSqFt)
    };
}
