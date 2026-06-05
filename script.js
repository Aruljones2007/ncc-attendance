function loadCadets() {

    const names = document
        .getElementById("cadetNames")
        .value
        .split("\n");

    let html = "";

    names.forEach((name, index) => {

        if (name.trim() !== "") {

            html += `
            <div class="cadet">
                <b>${name}</b><br>

                <select id="status${index}">
                    <option>Present</option>
                    <option>Permission</option>
                    <option>Absent</option>
                </select>
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
                document.getElementById("status" + count).value;

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