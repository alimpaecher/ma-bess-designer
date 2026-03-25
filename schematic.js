// ============================================
// BESS Dashboard — SVG Site Layout Schematic
// ============================================

function drawSchematic(results) {
    const svg = document.getElementById('siteSchematic');
    const s = results.site;

    // Scale: fit the total site into the SVG viewBox (800x600)
    const margin = 40;
    const availW = 800 - margin * 2;
    const availH = 600 - margin * 2;
    const scaleX = availW / s.totalWidth;
    const scaleY = availH / s.totalDepth;
    const scale = Math.min(scaleX, scaleY);

    // Center offset
    const ox = margin + (availW - s.totalWidth * scale) / 2;
    const oy = margin + (availH - s.totalDepth * scale) / 2;

    let html = '';

    // Helper to convert site-ft to SVG coords
    const sx = (ft) => ox + ft * scale;
    const sy = (ft) => oy + ft * scale;
    const sw = (ft) => ft * scale;

    // --- Total site boundary ---
    html += `<rect x="${sx(0)}" y="${sy(0)}" width="${sw(s.totalWidth)}" height="${sw(s.totalDepth)}"
        fill="none" stroke="#999" stroke-width="2" stroke-dasharray="8,4" rx="4"/>`;

    // Total site label
    html += `<text x="${sx(s.totalWidth/2)}" y="${sy(0) - 8}" text-anchor="middle"
        fill="#666" font-size="11">${s.totalWidth} ft x ${s.totalDepth} ft — Total Site (${fmt(s.totalAreaSqFt)} sq ft)</text>`;

    // --- Fire access lane (bottom) ---
    const fireY = sy(0);
    html += `<rect x="${sx(0)}" y="${fireY}" width="${sw(s.totalWidth)}" height="${sw(s.fireAccessFt)}"
        fill="rgba(207, 34, 46, 0.06)" stroke="#cf222e" stroke-width="1" stroke-dasharray="4,4"/>`;
    html += `<text x="${sx(s.totalWidth/2)}" y="${fireY + sw(s.fireAccessFt)/2 + 4}"
        text-anchor="middle" fill="#cf222e" font-size="11" font-weight="600">
        FIRE ACCESS LANE — ${s.fireAccessFt} ft wide [NFPA 855]</text>`;

    // --- Dimension: fire access height ---
    const dimX1 = sx(s.totalWidth) + 10;
    html += drawDimension(dimX1, fireY, dimX1, fireY + sw(s.fireAccessFt), `${s.fireAccessFt}'`, 'right');

    // --- Setback zone ---
    const setbackStartY = s.fireAccessFt;
    const padStartX = s.setbackFt;
    const padStartY = s.fireAccessFt + s.setbackFt;

    // Setback rect
    html += `<rect x="${sx(padStartX)}" y="${sy(padStartY)}" width="${sw(s.padWidth)}" height="${sw(s.padDepth)}"
        fill="rgba(9, 105, 218, 0.04)" stroke="#0969da" stroke-width="1.5" rx="3"/>`;

    // Setback label
    html += `<text x="${sx(padStartX + s.padWidth/2)}" y="${sy(padStartY) - 6}"
        text-anchor="middle" fill="#0969da" font-size="10">
        Equipment Pad — ${s.padWidth} ft x ${s.padDepth} ft (${fmt(s.padAreaSqFt)} sq ft)</text>`;

    // --- Setback dimension lines ---
    // Left setback
    html += drawDimension(
        sx(0), sy(padStartY + s.padDepth/2),
        sx(padStartX), sy(padStartY + s.padDepth/2),
        `${s.setbackFt}' setback`, 'below'
    );
    // Bottom setback
    html += drawDimension(
        sx(padStartX + s.padWidth/2), sy(setbackStartY),
        sx(padStartX + s.padWidth/2), sy(padStartY),
        `${s.setbackFt}' setback`, 'left'
    );

    // --- Draw containers ---
    const spec = results.containerSpec;
    let containerIdx = 0;
    for (let row = 0; row < s.rows; row++) {
        for (let col = 0; col < s.cols; col++) {
            if (containerIdx >= results.containersNeeded) break;

            const cx = padStartX + col * (s.cLenFt + s.spacingFt);
            const cy = padStartY + row * (s.cWidFt + s.spacingFt);

            // Container rect
            html += `<rect x="${sx(cx)}" y="${sy(cy)}" width="${sw(s.cLenFt)}" height="${sw(s.cWidFt)}"
                fill="rgba(26, 127, 55, 0.08)" stroke="#1a7f37" stroke-width="2" rx="3"/>`;

            // Container label
            const labelY = sy(cy) + sw(s.cWidFt) / 2;
            html += `<text x="${sx(cx + s.cLenFt/2)}" y="${labelY - 6}" text-anchor="middle"
                fill="#1a7f37" font-size="10" font-weight="600">${spec.name}</text>`;
            html += `<text x="${sx(cx + s.cLenFt/2)}" y="${labelY + 8}" text-anchor="middle"
                fill="#666" font-size="9">${fmt(spec.kWh)} kWh</text>`;
            html += `<text x="${sx(cx + s.cLenFt/2)}" y="${labelY + 20}" text-anchor="middle"
                fill="#999" font-size="8">${s.cLenFt}' x ${s.cWidFt}'</text>`;

            // Spacing dimension between containers (horizontal)
            if (col > 0) {
                const prevEndX = padStartX + (col - 1) * (s.cLenFt + s.spacingFt) + s.cLenFt;
                html += drawDimension(
                    sx(prevEndX), sy(cy + s.cWidFt) + 12,
                    sx(cx), sy(cy + s.cWidFt) + 12,
                    `${s.spacingFt}'`, 'below'
                );
            }

            containerIdx++;
        }
    }

    // Spacing between rows
    if (s.rows > 1) {
        const rowSpaceY1 = padStartY + s.cWidFt;
        const rowSpaceY2 = padStartY + s.cWidFt + s.spacingFt;
        html += drawDimension(
            sx(padStartX) - 15, sy(rowSpaceY1),
            sx(padStartX) - 15, sy(rowSpaceY2),
            `${s.spacingFt}'`, 'left'
        );
    }

    // --- Legend ---
    const legendX = sx(0) + 10;
    const legendY = sy(s.totalDepth) - 60;
    html += `<rect x="${legendX}" y="${legendY}" width="200" height="55" fill="#f9f9f9" stroke="#ccc" rx="4"/>`;
    html += `<text x="${legendX + 10}" y="${legendY + 15}" fill="#666" font-size="9" font-weight="600">LEGEND</text>`;
    html += `<rect x="${legendX + 10}" y="${legendY + 22}" width="12" height="8" fill="rgba(26,127,55,0.08)" stroke="#1a7f37"/>`;
    html += `<text x="${legendX + 28}" y="${legendY + 30}" fill="#666" font-size="9">BESS Container</text>`;
    html += `<rect x="${legendX + 10}" y="${legendY + 36}" width="12" height="8" fill="rgba(207,34,46,0.06)" stroke="#cf222e"/>`;
    html += `<text x="${legendX + 28}" y="${legendY + 44}" fill="#666" font-size="9">Fire Access Lane</text>`;

    svg.innerHTML = html;

    // Update footprint info
    document.getElementById('siteFootprintInfo').innerHTML = `
        <div>Equipment Pad: <span>${s.padWidth} ft x ${s.padDepth} ft = ${fmt(s.padAreaSqFt)} sq ft</span></div>
        <div>Total Site: <span>${s.totalWidth} ft x ${s.totalDepth} ft = ${fmt(s.totalAreaSqFt)} sq ft</span></div>
        <div>Containers: <span>${results.containersNeeded} x ${spec.name}</span></div>
        <div>Total Capacity: <span>${fmt(results.totalInstalledCapacity)} kWh (${fmt(results.totalInstalledCapacity/1000, 1)} MWh)</span></div>
    `;
}

function drawDimension(x1, y1, x2, y2, label, side) {
    let html = '';
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    // Line
    html += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#999" stroke-width="0.75"/>`;

    // End ticks
    if (Math.abs(y1 - y2) < 2) {
        // Horizontal
        html += `<line x1="${x1}" y1="${y1 - 4}" x2="${x1}" y2="${y1 + 4}" stroke="#999" stroke-width="0.75"/>`;
        html += `<line x1="${x2}" y1="${y2 - 4}" x2="${x2}" y2="${y2 + 4}" stroke="#999" stroke-width="0.75"/>`;
        const ty = side === 'below' ? midY + 12 : midY - 5;
        html += `<text x="${midX}" y="${ty}" text-anchor="middle" fill="#888" font-size="8">${label}</text>`;
    } else {
        // Vertical
        html += `<line x1="${x1 - 4}" y1="${y1}" x2="${x1 + 4}" y2="${y1}" stroke="#999" stroke-width="0.75"/>`;
        html += `<line x1="${x2 - 4}" y1="${y2}" x2="${x2 + 4}" y2="${y2}" stroke="#999" stroke-width="0.75"/>`;
        const tx = side === 'left' ? midX - 8 : midX + 8;
        const anchor = side === 'left' ? 'end' : 'start';
        html += `<text x="${tx}" y="${midY + 3}" text-anchor="${anchor}" fill="#888" font-size="8">${label}</text>`;
    }

    return html;
}
