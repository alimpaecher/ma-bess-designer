// ============================================
// BESS Dashboard — Main Controller
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // --- Input elements ---
    const inputs = {
        annualLoad: document.getElementById('annualLoad'),
        solarSize: document.getElementById('solarSize'),
        islandingDays: document.getElementById('islandingDays'),
        dod: document.getElementById('dod'),
        containerCap: document.getElementById('containerCap'),
        peakSunHours: document.getElementById('peakSunHours'),
        rte: document.getElementById('rte'),
        elecRate: document.getElementById('elecRate'),
        smartAdder: document.getElementById('smartAdder'),
        installedCost: document.getElementById('installedCost')
    };

    // --- Slider output displays ---
    const outputs = {
        islandingDaysVal: document.getElementById('islandingDaysVal'),
        dodVal: document.getElementById('dodVal'),
        peakSunHoursVal: document.getElementById('peakSunHoursVal'),
        rteVal: document.getElementById('rteVal')
    };

    function getInputValues() {
        return {
            annualLoad: parseFloat(inputs.annualLoad.value) || 120000,
            solarSize: parseFloat(inputs.solarSize.value) || 191.4,
            islandingDays: parseInt(inputs.islandingDays.value) || 3,
            dod: parseInt(inputs.dod.value) || 80,
            containerCap: parseInt(inputs.containerCap.value) || 5365,
            peakSunHours: parseFloat(inputs.peakSunHours.value) || 4.91,
            rte: parseInt(inputs.rte.value) || 95,
            elecRate: parseFloat(inputs.elecRate.value) || 0.2393,
            smartAdder: parseFloat(inputs.smartAdder.value) || 0.0265,
            installedCost: parseFloat(inputs.installedCost.value) || 350
        };
    }

    function updateSliderOutputs() {
        outputs.islandingDaysVal.textContent = inputs.islandingDays.value;
        outputs.dodVal.textContent = inputs.dod.value + '%';
        outputs.peakSunHoursVal.textContent = parseFloat(inputs.peakSunHours.value).toFixed(2);
        outputs.rteVal.textContent = inputs.rte.value + '%';
    }

    function updateDashboard() {
        updateSliderOutputs();

        const vals = getInputValues();
        const r = calculateAll(vals);

        // --- Update sizing cards ---
        document.getElementById('cardDailyLoad').textContent = fmt(r.dailyLoad, 1);
        document.getElementById('cardIslandingNeed').textContent = fmt(r.islandingNeed, 0);
        document.getElementById('cardNameplate').textContent = fmt(r.nameplateCapacity, 0);
        document.getElementById('cardUsable').textContent = fmt(r.usableCapacity, 0);
        document.getElementById('cardContainers').textContent = r.containersNeeded;
        document.getElementById('cardContainerModel').textContent = r.containerSpec.name;
        document.getElementById('cardInverter').textContent = fmt(r.inverterSize);
        document.getElementById('cardSolarDaily').textContent = fmt(r.dailySolarProduction, 0);
        document.getElementById('cardSolarAnnual').textContent = fmt(r.annualSolarProduction, 0);

        // --- Update financial cards ---
        document.getElementById('cardTotalCost').textContent = fmtCurrency(r.totalSystemCost);
        document.getElementById('cardSmartBase').textContent = fmtCurrency(r.smartBaseRevenue);
        document.getElementById('cardStorageAdder').textContent = fmtCurrency(r.storageAdderRevenue);
        document.getElementById('cardCostOffset').textContent = fmtCurrency(r.energyCostOffset);
        document.getElementById('cardPayback').textContent = r.paybackYears < 100 ? fmt(r.paybackYears, 1) : '100+';

        // --- Update compliance checks ---
        updateCheck('checkDuration', r.meetsDuration,
            `Minimum 2-hour duration at rated capacity (actual: ${fmt(r.durationHours, 1)} hrs)`);
        updateCheck('checkRTE', r.meetsRTE,
            `Round-trip efficiency ≥ 70% (LFP: ~${vals.rte}%)`);
        updateCheck('checkSize', r.meetsMinSize,
            `System ≥ 1 MW for storage adder (actual: ${fmt(r.totalInstalledCapacity)} kWh)`);

        // --- Update chart ---
        createOrUpdateChart(r);

        // --- Update schematic ---
        drawSchematic(r);
    }

    function updateCheck(id, passes, text) {
        const el = document.getElementById(id);
        if (el) {
            el.className = passes ? 'pass' : 'warn';
            el.textContent = text;
        }
    }

    // --- Attach listeners ---
    Object.values(inputs).forEach(el => {
        el.addEventListener('input', updateDashboard);
        el.addEventListener('change', updateDashboard);
    });

    // --- Reference tag click handlers ---
    document.querySelectorAll('.ref-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            const refId = 'ref-' + tag.dataset.ref;
            const refEl = document.getElementById(refId);
            if (refEl) {
                refEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                refEl.style.background = 'rgba(59, 130, 246, 0.2)';
                setTimeout(() => { refEl.style.background = ''; }, 2000);
            }
        });
    });

    // --- Initial render ---
    updateDashboard();
});
