function sortTable(column, reverse = false) {
    if (autoRefresh) {
        alert("You have enabled leaderboard, please disable it to sort the table.");
    }
    else {
        const table = document.getElementById("runnersTable");
        const rows = Array.from(table.rows).slice(1); // Exclude header row

        let compareFunction;
        switch (column) {
            case 'name':
            case 'student_id':
                compareFunction = (a, b) => a.cells[columnIndex(column)].innerText.localeCompare(b.cells[columnIndex(column)].innerText);
                break;
            case 'house':
                compareFunction = (a, b) => {
                    const houseOrder = ['Spring', 'Summer', 'Autumn', 'Winter'];
                    const houseA = a.cells[columnIndex('house')].innerText;
                    const houseB = b.cells[columnIndex('house')].innerText;
                    return houseOrder.indexOf(houseA) - houseOrder.indexOf(houseB);
                };
                break;
            case 'lap_count':
                compareFunction = (a, b) => parseInt(a.cells[columnIndex(column)].innerText) - parseInt(b.cells[columnIndex(column)].innerText);
                break;
            case 'time':
                compareFunction = (a, b) => {
                    const timeA = parseTime(a.cells[columnIndex('time')].innerText);
                    const timeB = parseTime(b.cells[columnIndex('time')].innerText);
                    return timeA - timeB;
                };
                break;
        }

        rows.sort((a, b) => reverse ? -compareFunction(a, b) : compareFunction(a, b));

        // Re-append sorted rows
        rows.forEach(row => table.appendChild(row));
    }
}

function columnIndex(column) {
    switch (column) {
        case 'name':
            return 0;
        case 'student_id':
            return 1;
        case 'house':
            return 2;
        case 'lap_count':
            return 3;
        case 'time':
            return 4;
        default:
            return -1;
    }
}

function parseTime(timeStr) {
    const [minutes, seconds] = timeStr.split(' ').map(part => parseInt(part));
    return (minutes * 60) + seconds;
}