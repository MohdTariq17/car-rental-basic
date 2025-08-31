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
 * Car Brands Page (Admin Panel)
 * Shows: Logo, Name, Status (Active/Inactive)
 * Features: Add, Edit, Delete
 */
export default function CarBrandsPage() {
  const [brands, setBrands] = useState([
    { id: 1, name: "Toyota", status: "Active", logo: "https://1000logos.net/wp-content/uploads/2018/02/Toyota-Logo.png" },
    { id: 2, name: "BMW", status: "Active", logo: "https://1000logos.net/wp-content/uploads/2018/02/BMW-Logo.png" },
    { id: 3, name: "Mercedes-Benz", status: "Inactive", logo: "https://1000logos.net/wp-content/uploads/2018/02/Mercedes-Benz-Logo.png" },
    { id: 4, name: "Tesla", status: "Active", logo: "https://1000logos.net/wp-content/uploads/2018/02/Tesla-Logo.png" },
    { id: 5, name: "Hyundai", status: "Active", logo: "https://1000logos.net/wp-content/uploads/2018/02/Hyundai-logo.png" },
  ]);

  const [editVisible, setEditVisible] = useState(false);
  const [editing, setEditing] = useState(null);

  const [editName, setEditName] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editLogo, setEditLogo] = useState("");

  const statusOptions = [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
  ];

  // Open sidebar for Edit
  const openEdit = (row) => {
    setEditing(row);
    setEditName(row.name);
    setEditStatus(row.status);
    setEditLogo(row.logo);
    setEditVisible(true);
  };

  // Open sidebar for Add
  const openAdd = () => {
    setEditing(null);
    setEditName("");
    setEditStatus("Active");
    setEditLogo("");
    setEditVisible(true);
  };

  // Save Edit or Add
  const saveEdit = () => {
    if (editing) {
      // Update existing brand
      setBrands((prev) =>
        prev.map((b) =>
          b.id === editing.id ? { ...b, name: editName, status: editStatus, logo: editLogo } : b
        )
      );
    } else {
      // Add new brand
      const newBrand = {
        id: brands.length + 1,
        name: editName,
        status: editStatus,
        logo: editLogo || "https://via.placeholder.com/100x50.png?text=Logo",
      };
      setBrands((prev) => [...prev, newBrand]);
    }
    setEditVisible(false);
    setEditing(null);
  };

  // Delete brand
  const removeBrand = (row) => {
    if (confirm(`Delete ${row.name}?`)) {
      setBrands((prev) => prev.filter((b) => b.id !== row.id));
    }
  };

  // Table custom cells
  const logoBody = (row) => (
    <img
      src={row.logo}
      alt={row.name}
      style={{ width: "50px", height: "50px", objectFit: "contain" }}
    />
  );

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
        onClick={() => removeBrand(row)}
      />
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Car Brands</h1>
        <Button
          label="Add Brand"
          icon="pi pi-plus"
          className="p-button-success"
          onClick={openAdd}
        />
      </div>

      <DataTable
        value={brands}
        paginator
        rows={5}
        className="rounded-2xl shadow-1"
        tableStyle={{ minWidth: "40rem" }}
      >
        <Column header="Logo" body={logoBody} style={{ width: "100px" }} />
        <Column field="name" header="Brand" sortable />
        <Column field="status" header="Status" body={statusBody} sortable />
        <Column header="Action" body={actionBody} style={{ width: "120px" }} />
      </DataTable>

      {/* Add/Edit Sidebar */}
      <Sidebar
        visible={editVisible}
        position="right"
        onHide={() => setEditVisible(false)}
      >
        <h2 className="mb-4">{editing ? "Edit Brand" : "Add Brand"}</h2>
        <div className="p-fluid flex flex-col gap-3">
          <span className="p-float-label">
            <InputText
              id="edit-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <label htmlFor="edit-name">Name</label>
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

          <span className="p-float-label">
            <InputText
              id="edit-logo"
              value={editLogo}
              onChange={(e) => setEditLogo(e.target.value)}
            />
            <label htmlFor="edit-logo">Logo URL</label>
          </span>

          <div className="flex gap-2 mt-3">
            <Button
              label="Cancel"
              className="p-button-secondary"
              onClick={() => setEditVisible(false)}
            />
            <Button
              label={editing ? "Save Changes" : "Add Brand"}
              className="p-button-success"
              onClick={saveEdit}
            />
          </div>
        </div>
      </Sidebar>
    </div>
  );
}