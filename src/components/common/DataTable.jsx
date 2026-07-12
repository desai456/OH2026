import React from "react";

export default function DataTable({ columns, rows, renderCell }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>{columns.map((c) => <td key={c}>{renderCell(row, c)}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
