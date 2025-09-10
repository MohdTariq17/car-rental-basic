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
 * Car Variants Page (Admin Panel)
 * Features: Add, Edit, Delete, Search, Filter
 */
export default function CarVariantsPage() {
  // Example models to choose from (ideally this should come from your Models Page/DB)
  const modelOptions = [
    { label: "Corolla", value: "Corolla" },
    { label: "Camry", value: "Camry" },
    { label: "X5", value: "X5" },
    { label: "Model S", value: "Model S" },
    { label: "E-Class", value: "E-Class" },
  ];

  const statusOptions = [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
  ];

  const [variants, setVariants] = useState([
    { id: 1, name: "Corolla Petrol", model: "Corolla", status: "Active" },
    { id: 2, name: "Corolla Hybrid", model: "Corolla", status: "Active" },
    { id: 3, name: "Camry Diesel", model: "Camry", status: "Inactive" },
    { id: 4, name: "Model S Plaid", model: "Model S", status: "Active" },
    { id: 5, name: "E-Class Turbo", model: "E-Class", status: "Active" },
  ]);

  const [editVisible, setEditVisible] = useState(false);
  const [editing, setEditing] = useState(null);

  const [editName, setEditName] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editStatus, setEditStatus] = useState("Active");

  // Search & Filter
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);

  // Open sidebar for Edit
  const openEdit = (row) => {
    setEditing(row);
    setEditName(row.name);
    setEditModel(row.model);
    setEditStatus(row.status);
    setEditVisible(true);
  };

  // Open sidebar for Add
  const openAdd = () => {
    setEditing(null);
    setEditName("");
    setEditModel("");
    setEditStatus("Active");
    setEditVisible(true);
  };

  // Save Edit or Add
  const saveEdit = () => {
    if (editing) {
      // Update existing variant
      setVariants((prev) =>
        prev.map((v) =>
          v.id === editing.id
            ? { ...v, name: editName, model: editModel, status: editStatus }
            : v
        )
      );
    } else {
      // Add new variant
      const newVariant = {
        id: variants.length + 1,
        name: editName,
        model: editModel,
        status: editStatus,
      };
      setVariants((prev) => [...prev, newVariant]);
    }
    setEditVisible(false);
    setEditing(null);
  };

  // Delete variant
  const removeVariant = (row) => {
    if (confirm(`Delete variant ${row.name}?`)) {
      setVariants((prev) => prev.filter((v) => v.id !== row.id));
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
        onClick={() => removeVariant(row)}
      />
    </div>
  );

  // Filtered Data
  const filteredVariants = variants.filter((v) => {
    const matchesSearch = v.name
      .toLowerCase()
      .includes(globalFilter.toLowerCase());
    const matchesStatus =
      !statusFilter || v.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h1 className="text-2xl font-semibold">Car Variants</h1>
        <div className="flex gap-2">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search by variant name..."
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
            label="Add Variant"
            icon="pi pi-plus"
            className="p-button-success"
            onClick={openAdd}
          />
        </div>
      </div>

      {/* Variants Table */}
      <DataTable
        value={filteredVariants}
        paginator
        rows={5}
        className="rounded-2xl shadow-1"
        tableStyle={{ minWidth: "40rem" }}
        emptyMessage="No variants found."
      >
        <Column field="name" header="Variant" sortable />
        <Column field="model" header="Model" sortable />
        <Column field="status" header="Status" body={statusBody} sortable />
        <Column header="Action" body={actionBody} style={{ width: "120px" }} />
      </DataTable>

      {/* Add/Edit Sidebar */}
      <Sidebar
        visible={editVisible}
        position="right"
        onHide={() => setEditVisible(false)}
      >
        <h2 className="mb-4">{editing ? "Edit Variant" : "Add Variant"}</h2>
        <div className="p-fluid flex flex-col gap-3">
          <span className="p-float-label">
            <InputText
              id="edit-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <label htmlFor="edit-name">Variant Name</label>
          </span>

          <span className="p-float-label">
            <Dropdown
              id="edit-model"
              value={editModel}
              options={modelOptions}
              onChange={(e) => setEditModel(e.value)}
              placeholder="Select Model"
            />
            <label htmlFor="edit-model">Model</label>
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
              label={editing ? "Save Changes" : "Add Variant"}
              className="p-button-success"
              onClick={saveEdit}
            />
          </div>
        </div>
      </Sidebar>
    </div>
  );
}