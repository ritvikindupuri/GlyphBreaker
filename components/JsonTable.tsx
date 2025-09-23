import React from 'react';

interface JsonTableProps {
  data: {
    headers: string[];
    rows: (string | number)[][];
  };
}

export const JsonTable: React.FC<JsonTableProps> = ({ data }) => {
  const { headers, rows } = data;

  if (!headers || !rows) {
    return <div className="text-red-400">Invalid table data format.</div>;
  }

  return (
    <div className="my-2 border border-sentinel-border rounded-lg overflow-hidden bg-sentinel-bg">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-sentinel-text-primary">
          <thead className="bg-sentinel-surface/50 text-xs uppercase">
            <tr>
              {headers.map((header, index) => (
                <th key={index} scope="col" className="px-4 py-3 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t border-sentinel-border">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-3 whitespace-nowrap">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JsonTable;
