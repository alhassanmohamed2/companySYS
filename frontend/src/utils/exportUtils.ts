export function generateCSV(data: any[], filename: string) {
    if (!data || !data.length) return;

    // Get all unique keys from all objects
    const headers = Array.from(new Set(data.flatMap(Object.keys)));

    const csvContent = [
        // Header row
        headers.join(','),
        // Data rows
        ...data.map(row =>
            headers.map(fieldName => {
                let cellData = row[fieldName];
                if (cellData === null || cellData === undefined) {
                    cellData = '';
                } else if (typeof cellData === 'object') {
                    // Flatten simple objects like user { id, username }
                    cellData = cellData.username || cellData.name || JSON.stringify(cellData);
                }

                // Escape quotes and wrap in quotes if contains comma
                let strData = String(cellData).replace(/"/g, '""');
                if (strData.includes(',') || strData.includes('\n') || strData.includes('"')) {
                    return `"${strData}"`;
                }
                return strData;
            }).join(',')
        )
    ].join('\n');

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
