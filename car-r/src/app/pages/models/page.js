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
 * Car Models Page (Admin Panel)
 * Features: Add, Edit, Delete, Search, Filter
 */
export default function CarModelsPage() {
  // Example brands to choose from
  const brandOptions = [
    { label: "Toyota", value: "Toyota" },
    { label: "BMW", value: "BMW" },
    { label: "Mercedes-Benz", value: "Mercedes-Benz" },
    { label: "Tesla", value: "Tesla" },
    { label: "Hyundai", value: "Hyundai" },
  ];

  const statusOptions = [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
  ];

  const [models, setModels] = useState([
    { id: 1, name: "Corolla", brand: "Toyota", status: "Active" },
    { id: 2, name: "Camry", brand: "Toyota", status: "Active" },
    { id: 3, name: "X5", brand: "BMW", status: "Inactive" },
    { id: 4, name: "Model S", brand: "Tesla", status: "Active" },
    { id: 5, name: "E-Class", brand: "Mercedes-Benz", status: "Active" },
  ]);

  const [editVisible, setEditVisible] = useState(false);
  const [editing, setEditing] = useState(null);

  const [editName, setEditName] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editStatus, setEditStatus] = useState("Active");

  // Search & Filter
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);

  // Open sidebar for Edit
  const openEdit = (row) => {
    setEditing(row);
    setEditName(row.name);
    setEditBrand(row.brand);
    setEditStatus(row.status);
    setEditVisible(true);
  };

  // Open sidebar for Add
  const openAdd = () => {
    setEditing(null);
    setEditName("");
    setEditBrand("");
    setEditStatus("Active");
    setEditVisible(true);
  };

  // Save Edit or Add
  const saveEdit = () => {
    if (editing) {
      // Update existing model
      setModels((prev) =>
        prev.map((m) =>
          m.id === editing.id
            ? { ...m, name: editName, brand: editBrand, status: editStatus }
            : m
        )
      );
    } else {
      // Add new model
      const newModel = {
        id: models.length + 1,
        name: editName,
        brand: editBrand,
        status: editStatus,
      };
      setModels((prev) => [...prev, newModel]);
    }
    setEditVisible(false);
    setEditing(null);
  };

  // Delete model
  const removeModel = (row) => {
    if (confirm(`Delete model ${row.name}?`)) {
      setModels((prev) => prev.filter((m) => m.id !== row.id));
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
        onClick={() => removeModel(row)}
      />
    </div>
  );

  // Filtered Data
  const filteredModels = models.filter((m) => {
    const matchesSearch = m.name
      .toLowerCase()
      .includes(globalFilter.toLowerCase());
    const matchesStatus =
      !statusFilter || m.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h1 className="text-2xl font-semibold">Car Models</h1>
        <div className="flex gap-2">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search by model name..."
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
            label="Add Model"
            icon="pi pi-plus"
            className="p-button-success"
            onClick={openAdd}
          />
        </div>
      </div>

      {/* Models Table */}
      <DataTable
        value={filteredModels}
        paginator
        rows={5}
        className="rounded-2xl shadow-1"
        tableStyle={{ minWidth: "40rem" }}
        emptyMessage="No models found."
      >
        <Column field="name" header="Model" sortable />
        <Column field="brand" header="Brand" sortable />
        <Column field="status" header="Status" body={statusBody} sortable />
        <Column header="Action" body={actionBody} style={{ width: "120px" }} />
      </DataTable>

      {/* Add/Edit Sidebar */}
      <Sidebar
        visible={editVisible}
        position="right"
        onHide={() => setEditVisible(false)}
      >
        <h2 className="mb-4">{editing ? "Edit Model" : "Add Model"}</h2>
        <div className="p-fluid flex flex-col gap-3">
          <span className="p-float-label">
            <InputText
              id="edit-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <label htmlFor="edit-name">Model Name</label>
          </span>

          <span className="p-float-label">
            <Dropdown
              id="edit-brand"
              value={editBrand}
              options={brandOptions}
              onChange={(e) => setEditBrand(e.value)}
              placeholder="Select Brand"
            />
            <label htmlFor="edit-brand">Brand</label>
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
              label={editing ? "Save Changes" : "Add Model"}
              className="p-button-success"
              onClick={saveEdit}
            />
          </div>
        </div>
      </Sidebar>
    </div>
  );
}