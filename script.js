// Clean and filter names so indices always match
function getCleanCadetNames() {
    return document
        .getElementById("cadetNames")
        .value
        .split("\n")
        .map(name => name.trim())
        .filter(name => name !== "");
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
}

function generateReport() {
    const year = document.getElementById("year").value;
    const strength = document.getElementById("strength").value;
    const names = getCleanCadetNames();

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
    localStorage.setItem("cadetNames", names);
    alert("Cadet names saved successfully.");
}

function clearCadets() {
    localStorage.removeItem("cadetNames");
    document.getElementById("cadetNames").value = "";
    document.getElementById("attendanceSection").innerHTML = "";
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

// Load saved names automatically on start
window.onload = function () {
    const savedNames = localStorage.getItem("cadetNames");
    if (savedNames) {
        document.getElementById("cadetNames").value = savedNames;
        loadCadets();
    }
};
