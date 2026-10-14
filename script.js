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

// Permanently save the Year value for the active tab whenever modified
function saveYear() {
    const yearInput = document.getElementById("year");
    if (yearInput) {
        localStorage.setItem(`cadetYear_${currentTab}`, yearInput.value);
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

    // Clear old report text when switching tabs
    document.getElementById("report").value = "";

    // Render cadet cards and update auto-strength
    loadCadets();
}

function loadCadets() {
    const names = getCleanCadetNames();
    let html = "";

    names.forEach((name, index) => {
        html += `
            <div class="cadet present"
                 id="cadet${index}"
                 data-status="Present"
                 onclick="toggleStatus(${index})">
                <strong>${name}</strong><br>
                <span id="label${index}">Present</span>
            </div>
        `;
    });

    document.getElementById("attendanceSection").innerHTML = html;
    updateStrength();
}

function generateReport() {
    const year = document.getElementById("year").value;
    const names = getCleanCadetNames();
    const strength = updateStrength();

    saveYear();

    let present = [];
    let permission = [];
    let absent = [];

    names.forEach((name, index) => {
        const card = document.getElementById(`cadet${index}`);
        if (!card) return;

        const status = card.getAttribute("data-status");

        if (status === "Present") {
            present.push(name);
        } else if (status === "Permission") {
            permission.push(name);
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

    report += `\n${permission.length} permission seniors,\n\n`;
    permission.forEach(name => {
        report += `${name}\n`;
    });

    report += `\n${absent.length} absent seniors,\n\n`;
    absent.forEach(name => {
        report += `${name}\n`;
    });

    document.getElementById("report").value = report;
}

function toggleStatus(index) {
    const card = document.getElementById(`cadet${index}`);
    const label = document.getElementById(`label${index}`);

    if (!card || !label) return;

    const current = card.getAttribute("data-status");

    if (current === "Present") {
        card.setAttribute("data-status", "Permission");
        card.className = "cadet permission";
        label.innerText = "Permission";
    } else if (current === "Permission") {
        card.setAttribute("data-status", "Absent");
        card.className = "cadet absent";
        label.innerText = "Absent";
    } else {
        card.setAttribute("data-status", "Present");
        card.className = "cadet present";
        label.innerText = "Present";
    }
}

function saveCadets() {
    const names = document.getElementById("cadetNames").value;
    localStorage.setItem(`cadetNames_${currentTab}`, names);
    saveYear();
    updateStrength();
    alert("Cadet names saved successfully.");
}

function clearCadets() {
    localStorage.removeItem(`cadetNames_${currentTab}`);
    document.getElementById("cadetNames").value = "";
    document.getElementById("attendanceSection").innerHTML = "";
    updateStrength();
    alert("Saved names removed.");
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

// Load saved data automatically on start
window.onload = function () {
    // Migrate old saved names into Set 1 (tab1) if they exist
    const oldSavedNames = localStorage.getItem("cadetNames");
    if (oldSavedNames && !localStorage.getItem("cadetNames_tab1")) {
        localStorage.setItem("cadetNames_tab1", oldSavedNames);
    }

    // Automatically save Year whenever the user types in the Year box
    const yearInput = document.getElementById("year");
    if (yearInput) {
        yearInput.addEventListener("input", saveYear);
        yearInput.addEventListener("change", saveYear);
    }

    // Automatically update Total Strength as names are typed or pasted
    const cadetNamesInput = document.getElementById("cadetNames");
    if (cadetNamesInput) {
        cadetNamesInput.addEventListener("input", updateStrength);
    }

    // Initialize the last active tab
    switchTab(currentTab);
};
