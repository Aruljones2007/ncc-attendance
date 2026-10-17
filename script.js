let currentTab = localStorage.getItem("activeCadetTab") || "tab1";

// Clean and filter names so indices always match
function getCleanCadetNames() {
    return document
        .getElementById("cadetNames")
        .value
        .split("\n")
        .map(name => name.trim())
        .filter(name => name !== "");
}

// Auto-calculate strength based on total valid cadet names
function updateStrength() {
    const names = getCleanCadetNames();
    const strengthInput = document.getElementById("strength");
    if (strengthInput) {
        strengthInput.value = names.length;
    }
    return names.length;
}

// Permanently save the Year value for the active tab
function saveYear() {
    const yearInput = document.getElementById("year");
    if (yearInput) {
        localStorage.setItem(`cadetYear_${currentTab}`, yearInput.value);
    }
}

// Permanently save the Cadet Names in the textarea for the active tab
function persistNamesToStorage() {
    const namesInput = document.getElementById("cadetNames");
    if (namesInput) {
        localStorage.setItem(`cadetNames_${currentTab}`, namesInput.value);
    }
}

// Switch between tabs (Set 1, Set 2, Set 3)
function switchTab(tabId) {
    currentTab = tabId;
    localStorage.setItem("activeCadetTab", currentTab);

    // Highlight active tab button
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
    });

    // Restore saved year for this tab
    const savedYear = localStorage.getItem(`cadetYear_${currentTab}`);
    document.getElementById("year").value = savedYear !== null ? savedYear : "";

    // Restore saved cadet names for this tab
    const savedNames = localStorage.getItem(`cadetNames_${currentTab}`) || "";
    document.getElementById("cadetNames").value = savedNames;

    // Restore saved report for this tab (if any)
    const savedReport = localStorage.getItem(`cadetReport_${currentTab}`) || "";
    document.getElementById("report").value = savedReport;

    // Render cadet cards and restore their saved attendance statuses
    renderCadets();
}

// Render cadet rows with radio buttons and dynamic colors
function renderCadets() {
    const names = getCleanCadetNames();
    let html = "";

    const savedStatuses = JSON.parse(
        localStorage.getItem(`cadetStatuses_${currentTab}`) || "{}"
    );

    names.forEach((name, index) => {
        const status = savedStatuses[index] || "Present";
        
        // Assign the correct background color class based on status
        let rowClass = "present";
        if (status === "Permission") rowClass = "permission";
        if (status === "Late Fallin Permission") rowClass = "late-permission";
        if (status === "Absent") rowClass = "absent";

        html += `
            <div class="cadet-row ${rowClass}" id="cadetRow${index}" data-status="${status}">
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

// Update status and row color directly when a radio button is selected
function updateCadetStatus(index, newStatus) {
    const row = document.getElementById(`cadetRow${index}`);
    if (!row) return;

    // Update the HTML data attribute
    row.setAttribute("data-status", newStatus);
    
    // Instantly update the row's background color class
    row.className = "cadet-row present"; 
    if (newStatus === "Permission") row.className = "cadet-row permission";
    if (newStatus === "Late Fallin Permission") row.className = "cadet-row late-permission";
    if (newStatus === "Absent") row.className = "cadet-row absent";

    // Save updated status to localStorage
    const savedStatuses = JSON.parse(
        localStorage.getItem(`cadetStatuses_${currentTab}`) || "{}"
    );
    savedStatuses[index] = newStatus;
    localStorage.setItem(`cadetStatuses_${currentTab}`, JSON.stringify(savedStatuses));
}

function generateReport() {
    const year = document.getElementById("year").value;
    const names = getCleanCadetNames();
    const strength = updateStrength();

    saveYear();
    persistNamesToStorage();

    let present = [];
    let permission = [];
    let latePermission = [];
    let absent = [];

    names.forEach((name, index) => {
        const card = document.getElementById(`cadet${index}`);
        if (!card) return;

        const status = card.getAttribute("data-status");

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

    // Only show Permission if greater than 0
    if (permission.length > 0) {
        report += `\n${permission.length} permission seniors,\n\n`;
        permission.forEach(name => {
            report += `${name}\n`;
        });
    }

    // Only show Late Fallin Permission if greater than 0
    if (latePermission.length > 0) {
        report += `\n${latePermission.length} late fallin permission seniors,\n\n`;
        latePermission.forEach(name => {
            report += `${name}\n`;
        });
    }

    // Only show Absent if greater than 0
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
