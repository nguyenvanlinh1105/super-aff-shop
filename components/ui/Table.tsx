"use client";

import {
  useEffect,
  useRef,
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";

function applyColumnLabels(table: HTMLTableElement) {
  const headerCells = Array.from(table.querySelectorAll("thead th"));
  if (headerCells.length === 0) return;
  const labels = headerCells.map((th) => th.textContent?.trim() ?? "");

  table.querySelectorAll("tbody tr").forEach((row) => {
    const cells = Array.from(row.children);
    cells.forEach((cell, index) => {
      if (cell.tagName !== "TD") return;
      const label = labels[index];
      if (label && !cell.hasAttribute("data-label")) {
        cell.setAttribute("data-label", label);
      }
    });
  });
}

export function Table(props: TableHTMLAttributes<HTMLTableElement>) {
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    if (tableRef.current) applyColumnLabels(tableRef.current);
  });

  return (
    <div className="responsive-table overflow-x-auto rounded-3xl bg-white shadow-cute border border-primary-100/80 w-full">
      <table ref={tableRef} className="w-full min-w-[600px] border-collapse text-left text-[14px]" {...props} />
    </div>
  );
}

export function Thead(props: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className="border-b border-primary-100 bg-primary-50/60 backdrop-blur-sm"
      {...props}
    />
  );
}

export function Th({
  align = "left",
  className = "",
  ...props
}: ThHTMLAttributes<HTMLTableCellElement> & { align?: "left" | "right" | "center" }) {
  return (
    <th
      className={`whitespace-nowrap px-4 md:px-6 py-3.5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-neutral-500 ${
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"
      } ${className}`}
      {...props}
    />
  );
}

export function Tr(props: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className="border-b border-primary-50/80 transition-colors duration-150 last:border-0 hover:bg-primary-50/50"
      {...props}
    />
  );
}

export function Td({
  numeric = false,
  className = "",
  ...props
}: TdHTMLAttributes<HTMLTableCellElement> & { numeric?: boolean }) {
  return (
    <td
      className={`whitespace-nowrap px-4 md:px-6 py-3.5 text-[13px] text-neutral-700 ${
        numeric ? "text-right tabular-nums font-semibold text-neutral-900" : ""
      } ${className}`}
      {...props}
    />
  );
}

