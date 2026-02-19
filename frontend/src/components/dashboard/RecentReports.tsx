import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const recentReports = [
    {
        id: "INV001",
        name: "Monthly Sales Report",
        status: "Completed",
        date: "2024-03-15",
        type: "Sales",
    },
    {
        id: "INV002",
        name: "User Growth Analysis",
        status: "Processing",
        date: "2024-03-14",
        type: "Analytics",
    },
    {
        id: "INV003",
        name: "Q1 Financial Summary",
        status: "Completed",
        date: "2024-03-12",
        type: "Finance",
    },
    {
        id: "INV004",
        name: "Inventory Status",
        status: "Failed",
        date: "2024-03-10",
        type: "Operations",
    },
    {
        id: "INV005",
        name: "Customer Feedback",
        status: "Completed",
        date: "2024-03-08",
        type: "Support",
    },
];

export function RecentReports() {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {recentReports.map((report) => (
                    <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.id}</TableCell>
                        <TableCell>{report.name}</TableCell>
                        <TableCell>{report.type}</TableCell>
                        <TableCell>{report.status}</TableCell>
                        <TableCell className="text-right">{report.date}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
