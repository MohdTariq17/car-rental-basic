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
 * Cities Page (Admin Panel)
 * Features: Add, Edit, Delete, Search, Filter
 */
export default function CitiesPage() {
  const statusOptions = [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
  ];

  // Example states list (you can fetch from API later)
  const stateOptions = [
    { label: "California", value: "California" },
    { label: "Texas", value: "Texas" },
    { label: "Florida", value: "Florida" },
    { label: "Maharashtra", value: "Maharashtra" },
    { label: "Kerala", value: "Kerala" },
  ];

  const [cities, setCities] = useState([
    { id: 1, name: "Los Angeles", state: "California", status: "Active" },
    { id: 2, name: "Houston", state: "Texas", status: "Active" },
    { id: 3, name: "Miami", state: "Florida", status: "Inactive" },
    { id: 4, name: "Mumbai", state: "Maharashtra", status: "Active" },
    { id: 5, name: "Kochi", state: "Kerala", status: "Inactive" },
  ]);

  const [editVisible, setEditVisible] = useState(false);
  const [editing, setEditing] = useState(null);

  const [editName, setEditName] = useState("");
  const [editState, setEditState] = useState(null);
  const [editStatus, setEditStatus] = useState("Active");

  // Search & Filter
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [stateFilter, setStateFilter] = useState(null);

  // Open sidebar for Edit
  const openEdit = (row) => {
    setEditing(row);
    setEditName(row.name);
    setEditState(row.state);
    setEditStatus(row.status);
    setEditVisible(true);
  };

  // Open sidebar for Add
  const openAdd = () => {
    setEditing(null);
    setEditName("");
    setEditState(null);
    setEditStatus("Active");
    setEditVisible(true);
  };

  // Save Edit or Add
  const saveEdit = () => {
    if (!editName || !editState) {
      alert("Please fill all required fields.");
      return;
    }

    if (editing) {
      // Update existing city
      setCities((prev) =>
        prev.map((c) =>
          c.id === editing.id
            ? { ...c, name: editName, state: editState, status: editStatus }
            : c
        )
      );
    } else {
      // Add new city
      const newCity = {
        id: cities.length + 1,
        name: editName,
        state: editState,
        status: editStatus,
      };
      setCities((prev) => [...prev, newCity]);
    }
    setEditVisible(false);
    setEditing(null);
  };

  // Delete city
  const removeCity = (row) => {
    if (confirm(`Delete city ${row.name}?`)) {
      setCities((prev) => prev.filter((c) => c.id !== row.id));
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
        onClick={() => removeCity(row)}
      />
    </div>
  );

  // Filtered Data
  const filteredCities = cities.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(globalFilter.toLowerCase());
    const matchesStatus =
      !statusFilter || c.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesState =
      !stateFilter || c.state.toLowerCase() === stateFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesState;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h1 className="text-2xl font-semibold">Cities</h1>
        <div className="flex flex-wrap gap-2">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search by city name..."
            />
          </span>
          <Dropdown
            value={stateFilter}
            options={stateOptions}
            onChange={(e) => setStateFilter(e.value)}
            placeholder="Filter by State"
            showClear
          />
          <Dropdown
            value={statusFilter}
            options={statusOptions}
            onChange={(e) => setStatusFilter(e.value)}
            placeholder="Filter by Status"
            showClear
          />
          <Button
            label="Add City"
            icon="pi pi-plus"
            className="p-button-success"
            onClick={openAdd}
          />
        </div>
      </div>

      {/* Cities Table */}
      <DataTable
        value={filteredCities}
        paginator
        rows={5}
        className="rounded-2xl shadow-1"
        tableStyle={{ minWidth: "40rem" }}
        emptyMessage="No cities found."
      >
        <Column field="name" header="City" sortable />
        <Column field="state" header="State" sortable />
        <Column field="status" header="Status" body={statusBody} sortable />
        <Column header="Action" body={actionBody} style={{ width: "120px" }} />
      </DataTable>

      {/* Add/Edit Sidebar */}
      <Sidebar
        visible={editVisible}
        position="right"
        onHide={() => setEditVisible(false)}
      >
        <h2 className="mb-4">{editing ? "Edit City" : "Add City"}</h2>
        <div className="p-fluid flex flex-col gap-3">
          <span className="p-float-label">
            <InputText
              id="edit-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <label htmlFor="edit-name">City Name</label>
          </span>

          <span className="p-float-label">
            <Dropdown
              id="edit-state"
              value={editState}
              options={stateOptions}
              onChange={(e) => setEditState(e.value)}
              placeholder="Select State"
            />
            <label htmlFor="edit-state">State</label>
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
              label={editing ? "Save Changes" : "Add City"}
              className="p-button-success"
              onClick={saveEdit}
            />
          </div>
        </div>
      </Sidebar>
    </div>
  );
}