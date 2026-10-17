let currentTab = localStorage.getItem("activeCadetTab") || "tab1";

// Clean and filter names
function getCleanCadetNames() {
    return document
        .getElementById("cadetNames")
        .value
        .split("\n")
        .map(name => name.trim())
        .filter(name => name !== "");
}

// Auto-calculate strength
function updateStrength() {
    const names = getCleanCadetNames();
    const strengthInput = document.getElementById("strength");
    if (strengthInput) {
        strengthInput.value = names.length;
    }
    return names.length;
}

function saveYear() {
    const yearInput = document.getElementById("year");
    if (yearInput) {
        localStorage.setItem(`cadetYear_${currentTab}`, yearInput.value);
    }
}

function persistNamesToStorage() {
    const namesInput = document.getElementById("cadetNames");
    if (namesInput) {
        localStorage.setItem(`cadetNames_${currentTab}`, namesInput.value);
    }
}

// Switch between tabs
function switchTab(tabId) {
    currentTab = tabId;
    localStorage.setItem("activeCadetTab", currentTab);

    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
    });

    const savedYear = localStorage.getItem(`cadetYear_${currentTab}`);
    document.getElementById("year").value = savedYear !== null ? savedYear : "";

    const savedNames = localStorage.getItem(`cadetNames_${currentTab}`) || "";
    document.getElementById("cadetNames").value = savedNames;

    const savedReport = localStorage.getItem(`cadetReport_${currentTab}`) || "";
    document.getElementById("report").value = savedReport;

    renderCadets();
}

// Render cadet rows with radio buttons
function renderCadets() {
    const names = getCleanCadetNames();
    let html = "";

    // Safety check in case local storage data is corrupted
    let savedStatuses = {};
    try {
        savedStatuses = JSON.parse(localStorage.getItem(`cadetStatuses_${currentTab}`) || "{}");
    } catch (e) {
        savedStatuses = {};
    }

    names.forEach((name, index) => {
        const status = savedStatuses[index] || "Present";
        
        let rowClass = "present";
        if (status === "Permission") rowClass = "permission";
        if (status === "Late Fallin Permission") rowClass = "late-permission";
        if (status === "Absent") rowClass = "absent";

        html += `
            <div class="cadet-row ${rowClass}" id="cadetRow${index}">
                <strong>${name}</strong>
                <div class="radio-group">
                    <label>
                        <input type="radio" name="status_${index}" value="Present" 
                            ${status === "Present" ? "checked" : ""} 
                            onchange="updateCadetStatus(${index}, 'Present')"> Present
                    </label>
                    <label>
                        <input type="radio" name="status_${index}" value="Permission" 
                            ${status === "Permission" ? "checked" : ""} 
                            onchange="updateCadetStatus(${index}, 'Permission')"> Permission
                    </label>
                    <label>
                        <input type="radio" name="status_${index}" value="Late Fallin Permission" 
                            ${status === "Late Fallin Permission" ? "checked" : ""} 
                            onchange="updateCadetStatus(${index}, 'Late Fallin Permission')"> Late
                    </label>
                    <label>
                        <input type="radio" name="status_${index}" value="Absent" 
                            ${status === "Absent" ? "checked" : ""} 
                            onchange="updateCadetStatus(${index}, 'Absent')"> Absent
                    </label>
                </div>
            </div>
        `;
    });

    document.getElementById("attendanceSection").innerHTML = html;
    updateStrength();
}

// Update status directly when radio clicked
function updateCadetStatus(index, newStatus) {
    const row = document.getElementById(`cadetRow${index}`);
    if (row) {
        row.className = "cadet-row present"; 
        if (newStatus === "Permission") row.className = "cadet-row permission";
        if (newStatus === "Late Fallin Permission") row.className = "cadet-row late-permission";
        if (newStatus === "Absent") row.className = "cadet-row absent";
    }

    let savedStatuses = {};
    try {
        savedStatuses = JSON.parse(localStorage.getItem(`cadetStatuses_${currentTab}`) || "{}");
    } catch (e) {
        savedStatuses = {};
    }
    
    savedStatuses[index] = newStatus;
    localStorage.setItem(`cadetStatuses_${currentTab}`, JSON.stringify(savedStatuses));
}

// Fixed Report Generator: Reads directly from local storage memory
function generateReport() {
    const year = document.getElementById("year").value;
    const names = getCleanCadetNames();
    const strength = updateStrength();

    saveYear();
    persistNamesToStorage();

    let savedStatuses = {};
    try {
        savedStatuses = JSON.parse(localStorage.getItem(`cadetStatuses_${currentTab}`) || "{}");
    } catch (e) {
        savedStatuses = {};
    }

    let present = [];
    let permission = [];
    let latePermission = [];
    let absent = [];

    names.forEach((name, index) => {
        const status = savedStatuses[index] || "Present";

        if (status === "Present") {
            present.push(name);
        } else if (status === "Permission") {
            permission.push(name);
        } else if (status === "Late Fallin Permission") {
            latePermission.push(name);
        } else {
            absent.push(name);
        }
    });

    let report = "REPORTING SENIORS,\n\n";
    report += `${year} total strength ${strength} seniors,\n\n`;

    report += `At present ${present.length} seniors,\n\n`;
    present.forEach(name => {
        report += `${name}\n`;
    });

    if (permission.length > 0) {
        report += `\n${permission.length} permission seniors,\n\n`;
        permission.forEach(name => {
            report += `${name}\n`;
        });
    }

    if (latePermission.length > 0) {
        report += `\n${latePermission.length} late fallin permission seniors,\n\n`;
        latePermission.forEach(name => {
            report += `${name}\n`;
        });
    }

    if (absent.length > 0) {
        report += `\n${absent.length} absent seniors,\n\n`;
        absent.forEach(name => {
            report += `${name}\n`;
        });
    }

    const finalReport = report.trim();
    document.getElementById("report").value = finalReport;
    localStorage.setItem(`cadetReport_${currentTab}`, finalReport);
}

function clearCadets() {
    localStorage.removeItem(`cadetNames_${currentTab}`);
    localStorage.removeItem(`cadetStatuses_${currentTab}`);
    localStorage.removeItem(`cadetReport_${currentTab}`);
    document.getElementById("cadetNames").value = "";
    document.getElementById("attendanceSection").innerHTML = "";
    document.getElementById("report").value = "";
    updateStrength();
    alert("Saved names and cards removed.");
}

function copyReport() {
    const report = document.getElementById("report");
    if (report.value.trim() === "") {
        alert("Generate a report first.");
        return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(report.value)
            .then(() => alert("Report copied successfully."))
            .catch(() => fallbackCopy(report));
    } else {
        fallbackCopy(report);
    }
}

function fallbackCopy(element) {
    element.select();
    document.execCommand("copy");
    alert("Report copied successfully.");
}

// Bulk Reset: Clears all saved statuses for the current tab, defaulting everyone to Present
function resetAllToPresent() {
    if (confirm("Reset all cadets in this tab to Present?")) {
        // Clearing the specific status memory forces the app to default to Present
        localStorage.removeItem(`cadetStatuses_${currentTab}`);
        renderCadets();
        alert("All cadets reset to Present.");
    }
}

// WhatsApp Sharing: Encodes the text and opens the WhatsApp app/web link
function shareToWhatsApp() {
    const report = document.getElementById("report");
    
    if (report.value.trim() === "") {
        alert("Generate a report first.");
        return;
    }
    
    // Convert the text format so URLs can read spaces and new lines
    const encodedText = encodeURIComponent(report.value);
    
    // Opens WhatsApp (works on both mobile app and desktop web)
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
}

window.onload = function () {
    const oldSavedNames = localStorage.getItem("cadetNames");
    if (oldSavedNames && !localStorage.getItem("cadetNames_tab1")) {
        localStorage.setItem("cadetNames_tab1", oldSavedNames);
    }

    const yearInput = document.getElementById("year");
    if (yearInput) {
        yearInput.addEventListener("input", saveYear);
        yearInput.addEventListener("change", saveYear);
    }

    const cadetNamesInput = document.getElementById("cadetNames");
    if (cadetNamesInput) {
        cadetNamesInput.addEventListener("input", function () {
            persistNamesToStorage();
            renderCadets();
        });
    }

    switchTab(currentTab);
};
