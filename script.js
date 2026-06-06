function loadCadets() {

    const names =
        document.getElementById("cadetNames")
        .value
        .split("\n");

    let html = "";

    names.forEach((name, index) => {

        if (name.trim() !== "") {

            html += `
                <div class="cadet present"
                     id="cadet${index}"
                     data-status="Present"
                     onclick="toggleStatus(${index})">

                    <strong>${name}</strong><br>
                    <span id="label${index}">
                        Present
                    </span>

                </div>
            `;
        }
    });

    document.getElementById("attendanceSection").innerHTML = html;
}

function generateReport() {

    const year = document.getElementById("year").value;
    const strength = document.getElementById("strength").value;

    const names = document
        .getElementById("cadetNames")
        .value
        .split("\n");

    let present = [];
    let permission = [];
    let absent = [];

    let count = 0;

    names.forEach(name => {

        if (name.trim() !== "") {

            const status =
            document
                .getElementById(`cadet${count}`)
                .getAttribute("data-status");

            if (status === "Present")
                present.push(name);

            else if (status === "Permission")
                permission.push(name);

            else
                absent.push(name);

            count++;
        }
    });

    let report = "";

    report += "REPORTING SENIORS,\n\n";

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
    
    report += "\nSeniors.";

    document.getElementById("report").value = report;
}

// Load saved names automatically
window.onload = function () {

    const savedNames = localStorage.getItem("cadetNames");

    if (savedNames) {
        document.getElementById("cadetNames").value = savedNames;
        loadCadets();
    }
};

function saveCadets() {

    const names =
        document.getElementById("cadetNames").value;

    localStorage.setItem("cadetNames", names);

    alert("Cadet names saved successfully.");
}

function clearCadets() {

    localStorage.removeItem("cadetNames");

    document.getElementById("cadetNames").value = "";

    document.getElementById("attendanceSection").innerHTML = "";

    alert("Saved names removed.");
}

function changeColor(select) {

    if(select.value === "Present"){
        select.style.backgroundColor = "#28a745";
        select.style.color = "white";
    }

    else if(select.value === "Permission"){
        select.style.backgroundColor = "#ffc107";
        select.style.color = "black";
    }

    else{
        select.style.backgroundColor = "#dc3545";
        select.style.color = "white";
    }
}

function toggleStatus(index) {

    const card =
        document.getElementById(`cadet${index}`);

    const label =
        document.getElementById(`label${index}`);

    const current =
        card.getAttribute("data-status");

    if (current === "Present") {

        card.setAttribute(
            "data-status",
            "Permission"
        );

        card.className =
            "cadet permission";

        label.innerText =
            "Permission";
    }

    else if (current === "Permission") {

        card.setAttribute(
            "data-status",
            "Absent"
        );

        card.className =
            "cadet absent";

        label.innerText =
            "Absent";
    }

    else {

        card.setAttribute(
            "data-status",
            "Present"
        );

        card.className =
            "cadet present";

        label.innerText =
            "Present";
    }
}

function copyReport() {

    const report =
        document.getElementById("report");

    if (report.value.trim() === "") {

        alert("Generate a report first.");
        return;
    }

    navigator.clipboard.writeText(report.value)
        .then(() => {
            alert("Report copied successfully.");
        })
        .catch(() => {
            report.select();
            document.execCommand("copy");
            alert("Report copied successfully.");
        });
}