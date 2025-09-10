"use client";
import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";

/**
 * States Page (Admin Panel)
 * Features: Add, Edit, Delete, Search, Filter
 */
export default function StatesPage() {
  const statusOptions = [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
  ];

  const [states, setStates] = useState([
    { id: 1, name: "California", status: "Active" },
    { id: 2, name: "Texas", status: "Active" },
    { id: 3, name: "Florida", status: "Inactive" },
    { id: 4, name: "Maharashtra", status: "Active" },
    { id: 5, name: "Kerala", status: "Inactive" },
  ]);

  const [editVisible, setEditVisible] = useState(false);
  const [editing, setEditing] = useState(null);

  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState("Active");

  // Search & Filter
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);

  // Open sidebar for Edit
  const openEdit = (row) => {
    setEditing(row);
    setEditName(row.name);
    setEditStatus(row.status);
    setEditVisible(true);
  };

  // Open sidebar for Add
  const openAdd = () => {
    setEditing(null);
    setEditName("");
    setEditStatus("Active");
    setEditVisible(true);
  };

  // Save Edit or Add
  const saveEdit = () => {
    if (editing) {
      // Update existing state
      setStates((prev) =>
        prev.map((s) =>
          s.id === editing.id ? { ...s, name: editName, status: editStatus } : s
        )
      );
    } else {
      // Add new state
      const newState = {
        id: states.length + 1,
        name: editName,
        status: editStatus,
      };
      setStates((prev) => [...prev, newState]);
    }
    setEditVisible(false);
    setEditing(null);
  };

  // Delete state
  const removeState = (row) => {
    if (confirm(`Delete state ${row.name}?`)) {
      setStates((prev) => prev.filter((s) => s.id !== row.id));
    }
  };

  // Table custom cells
  const statusBody = (row) => (
    <Tag
      value={row.status}
      severity={row.status === "Active" ? "success" : "danger"}
      rounded
    />
  );

  const actionBody = (row) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        rounded
        text
        severity="info"
        aria-label="Edit"
        className="p-button-sm"
        onClick={() => openEdit(row)}
      />
      <Button
        icon="pi pi-trash"
        rounded
        text
        severity="danger"
        aria-label="Delete"
        className="p-button-sm"
        onClick={() => removeState(row)}
      />
    </div>
  );

  // Filtered Data
  const filteredStates = states.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(globalFilter.toLowerCase());
    const matchesStatus =
      !statusFilter || s.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h1 className="text-2xl font-semibold">States</h1>
        <div className="flex gap-2">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search by state name..."
            />
          </span>
          <Dropdown
            value={statusFilter}
            options={statusOptions}
            onChange={(e) => setStatusFilter(e.value)}
            placeholder="Filter by Status"
            showClear
          />
          <Button
            label="Add State"
            icon="pi pi-plus"
            className="p-button-success"
            onClick={openAdd}
          />
        </div>
      </div>

      {/* States Table */}
      <DataTable
        value={filteredStates}
        paginator
        rows={5}
        className="rounded-2xl shadow-1"
        tableStyle={{ minWidth: "40rem" }}
        emptyMessage="No states found."
      >
        <Column field="name" header="State" sortable />
        <Column field="status" header="Status" body={statusBody} sortable />
        <Column header="Action" body={actionBody} style={{ width: "120px" }} />
      </DataTable>

      {/* Add/Edit Sidebar */}
      <Sidebar
        visible={editVisible}
        position="right"
        onHide={() => setEditVisible(false)}
      >
        <h2 className="mb-4">{editing ? "Edit State" : "Add State"}</h2>
        <div className="p-fluid flex flex-col gap-3">
          <span className="p-float-label">
            <InputText
              id="edit-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <label htmlFor="edit-name">State Name</label>
          </span>

          <span className="p-float-label">
            <Dropdown
              id="edit-status"
              value={editStatus}
              options={statusOptions}
              onChange={(e) => setEditStatus(e.value)}
              placeholder="Select Status"
            />
            <label htmlFor="edit-status">Status</label>
          </span>

          <div className="flex gap-2 mt-3">
            <Button
              label="Cancel"
              className="p-button-secondary"
              onClick={() => setEditVisible(false)}
            />
            <Button
              label={editing ? "Save Changes" : "Add State"}
              className="p-button-success"
              onClick={saveEdit}
            />
          </div>
        </div>
      </Sidebar>
    </div>
  );
}