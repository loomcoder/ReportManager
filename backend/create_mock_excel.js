const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const data = [
    ["Region", "Product", "Sales", "Date"],
    ["North", "Widget A", 1200, "2023-01-15"],
    ["South", "Widget B", 800, "2023-01-16"],
    ["East", "Widget A", 1500, "2023-01-17"],
    ["West", "Widget C", 2000, "2023-01-18"],
    ["North", "Widget B", 950, "2023-01-19"]
];

const wb = xlsx.utils.book_new();
const ws = xlsx.utils.aoa_to_sheet(data);
xlsx.utils.book_append_sheet(wb, ws, "Q4 Data");

const filePath = path.join(uploadDir, 'marketing_data.xlsx');
xlsx.writeFile(wb, filePath);

console.log(`Created mock Excel file at ${filePath}`);
