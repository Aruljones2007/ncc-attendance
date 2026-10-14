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

// Render cadet cards on screen using saved statuses
function renderCadets() {
    const names = getCleanCadetNames();
    let html = "";

    const savedStatuses = JSON.parse(
        localStorage.getItem(`cadetStatuses_${currentTab}`) || "{}"
    );

    names.forEach((name, index) => {
        const status = savedStatuses[index] || "Present";
        let statusClass = "present";

        if (status === "Permission") {
            statusClass = "permission";
        } else if (status === "Late Fallin Permission") {
            statusClass = "late-permission";
        } else if (status === "Absent") {
            statusClass = "absent";
        }

        html += `
            <div class="cadet ${statusClass}"
                 id="cadet${index}"
                 data-status="${status}"
                 onclick="toggleStatus(${index})">
                <strong>${name}</strong><br>
                <span id="label${index}">${status}</span>
            </div>
        `;
    });

    document.getElementById("attendanceSection").innerHTML = html;
    updateStrength();
}

// Load Cadets button: saves current list permanently AND loads cards
function loadCadets() {
    persistNamesToStorage();
    saveYear();
    renderCadets();
}

// Save Names button: saves current list permanently AND loads/updates cards
function saveCadets() {
    persistNamesToStorage();
    saveYear();
    renderCadets();
    alert("Cadet names and cards saved permanently.");
}

// Toggle card status and save it immediately so it survives page refresh
function toggleStatus(index) {
    const card = document.getElementById(`cadet${index}`);
    const label = document.getElementById(`label${index}`);

    if (!card || !label) return;

    const current = card.getAttribute("data-status");
    let nextStatus = "Present";
    let nextClass = "cadet present";

    if (current === "Present") {
        nextStatus = "Permission";
        nextClass = "cadet permission";
    } else if (current === "Permission") {
        nextStatus = "Late Fallin Permission";
        nextClass = "cadet late-permission";
    } else if (current === "Late Fallin Permission") {
        nextStatus = "Absent";
        nextClass = "cadet absent";
    } else {
        nextStatus = "Present";
        nextClass = "cadet present";
    }

    card.setAttribute("data-status", nextStatus);
    card.className = nextClass;
    label.innerText = nextStatus;

    // Save updated status for this cadet card
    const savedStatuses = JSON.parse(
        localStorage.getItem(`cadetStatuses_${currentTab}`) || "{}"
    );
    savedStatuses[index] = nextStatus;
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
