let currentPage = 1;
const rowsPerPage = 9;
const tableBody = document.getElementById('tableBody');

// Filter in DOM rather than requests to server
const searchInput = document.getElementById("searchInput");
function filterTable() {
    const query = searchInput.value.toLowerCase();
    const rows = tableBody.getElementsByTagName("tr");

    for (const row of rows) {
        const cells = row.getElementsByTagName("td");
        let match = false;

        // Iterate over all cells to find matches
        for (const cell of cells) {
            if (cell.innerText.toLowerCase().includes(query)) {
                match = true;
                break;
            }
        }
        // Show or hide row according to the coincidence
        row.style.display = match ? '' : 'none';
    }
}

function paginateTable() {
    const rows = Array.from(tableBody.getElementsByTagName('tr'));
    rows.forEach((row, index) => {
        row.style.display = index >= (currentPage - 1) * rowsPerPage && index < currentPage * rowsPerPage ? '' : 'none';
    });
}

function nextPage() {
    if ((currentPage * rowsPerPage) < tableBody.getElementsByTagName('tr').length) {
        currentPage++;
        paginateTable();
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        paginateTable();
    }
}

paginateTable();