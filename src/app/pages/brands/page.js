"use client";
import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import Image from "next/image";
import { useRef } from "react";

/**
 * Car Brands Page (Admin Panel)
 * Shows: Logo, Name, Status (Active/Inactive)
 * Features: Add, Edit, Delete
 */
export default function CarBrandsPage() {
  const toast = useRef(null);

  const [brands, setBrands] = useState([
    { 
      id: 1, 
      name: "Toyota", 
      status: "Active", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Toyota-Toyota.jpg/640px-Toyota-Toyota.jpg"
    },
    { 
      id: 2, 
      name: "BMW", 
      status: "Active", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg" 
    },
    { 
      id: 3, 
      name: "Mercedes-Benz", 
      status: "Inactive", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg" 
    },
    { 
      id: 4, 
      name: "Tesla", 
      status: "Active", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png" 
    },
    { 
      id: 5, 
      name: "Hyundai", 
      status: "Active", 
      logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Hyundai_Motor_Company_logo.svg" 
    },
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
    if (!editName.trim()) {
      toast.current.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Brand name is required',
        life: 3000
      });
      return;
    }

    if (editing) {
      // Update existing brand
      setBrands((prev) =>
        prev.map((b) =>
          b.id === editing.id ? { 
            ...b, 
            name: editName.trim(), 
            status: editStatus, 
            logo: editLogo.trim() || "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Logo_missing.svg/640px-Logo_missing.svg.png" 
          } : b
        )
      );
      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Brand updated successfully',
        life: 3000
      });
    } else {
      // Add new brand
      const newBrand = {
        id: Math.max(...brands.map(b => b.id), 0) + 1,
        name: editName.trim(),
        status: editStatus,
        logo: editLogo.trim() || "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Logo_missing.svg/640px-Logo_missing.svg.png",
      };
      setBrands((prev) => [...prev, newBrand]);
      toast.current.show({
        severity: 'success',
        summary: 'Success',
        detail: 'Brand added successfully',
        life: 3000
      });
    }
    
    setEditVisible(false);
    setEditing(null);
  };

  // Delete brand with confirmation
  const removeBrand = (row) => {
    confirmDialog({
      message: `Are you sure you want to delete ${row.name}?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptClassName: 'p-button-danger',
      accept: () => {
        setBrands((prev) => prev.filter((b) => b.id !== row.id));
        toast.current.show({
          severity: 'info',
          summary: 'Deleted',
          detail: `${row.name} has been deleted`,
          life: 3000
        });
      }
    });
  };

  // Close sidebar
  const closeSidebar = () => {
    setEditVisible(false);
    setEditing(null);
    setEditName("");
    setEditStatus("Active");
    setEditLogo("");
  };

  // Table custom cells
  const logoBody = (row) => (
    <div className="flex justify-content-center">
      <Image
        src={row.logo}
        alt={`${row.name} logo`}
        width={50}
        height={50}
        style={{ objectFit: "contain" }}
        className="border-round"
        onError={(e) => {
          e.target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Logo_missing.svg/640px-Logo_missing.svg.png";
        }}
      />
    </div>
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
        tooltip="Edit brand"
        tooltipOptions={{ position: 'top' }}
      />
      <Button
        icon="pi pi-trash"
        rounded
        text
        severity="danger"
        aria-label="Delete"
        className="p-button-sm"
        onClick={() => removeBrand(row)}
        tooltip="Delete brand"
        tooltipOptions={{ position: 'top' }}
      />
    </div>
  );

  return (
    <div className="p-6">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <div className="flex justify-content-between align-items-center mb-4">
        <h1 className="text-3xl font-bold">Car Brands</h1>
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
        rows={10}
        rowsPerPageOptions={[5, 10, 25]}
        className="p-datatable-striped"
        tableStyle={{ minWidth: "40rem" }}
        emptyMessage="No brands found"
        responsiveLayout="scroll"
      >
        <Column 
          header="Logo" 
          body={logoBody} 
          style={{ width: "100px", textAlign: "center" }} 
        />
        <Column 
          field="name" 
          header="Brand Name" 
          sortable 
          style={{ minWidth: "200px" }}
        />
        <Column 
          field="status" 
          header="Status" 
          body={statusBody} 
          sortable 
          style={{ width: "120px" }}
        />
        <Column 
          header="Actions" 
          body={actionBody} 
          style={{ width: "120px", textAlign: "center" }}
        />
      </DataTable>

      {/* Add/Edit Sidebar */}
      <Sidebar
        visible={editVisible}
        position="right"
        onHide={closeSidebar}
        className="w-full md:w-20rem lg:w-30rem"
        header={editing ? "Edit Brand" : "Add New Brand"}
      >
        <div className="p-fluid flex flex-column gap-4">
          <div className="field">
            <label htmlFor="edit-name" className="block font-medium mb-2">
              Brand Name *
            </label>
            <InputText
              id="edit-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Enter brand name"
              className="w-full"
            />
          </div>

          <div className="field">
            <label htmlFor="edit-status" className="block font-medium mb-2">
              Status *
            </label>
            <Dropdown
              id="edit-status"
              value={editStatus}
              options={statusOptions}
              onChange={(e) => setEditStatus(e.value)}
              placeholder="Select Status"
              className="w-full"
            />
          </div>

          <div className="field">
            <label htmlFor="edit-logo" className="block font-medium mb-2">
              Logo URL
            </label>
            <InputText
              id="edit-logo"
              value={editLogo}
              onChange={(e) => setEditLogo(e.target.value)}
              placeholder="Enter logo URL (optional)"
              className="w-full"
            />
            <small className="text-600">
              Leave empty to use default placeholder
            </small>
          </div>

          {/* Logo Preview */}
          {editLogo && (
            <div className="field">
              <label className="block font-medium mb-2">Logo Preview</label>
              <div className="flex justify-content-center p-3 border-1 border-300 border-round">
                <Image
                  src={editLogo}
                  alt="Logo preview"
                  width={80}
                  height={80}
                  style={{ objectFit: "contain" }}
                  onError={(e) => {
                    e.target.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Logo_missing.svg/640px-Logo_missing.svg.png";
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-secondary flex-1"
              onClick={closeSidebar}
            />
            <Button
              label={editing ? "Update Brand" : "Add Brand"}
              icon="pi pi-check"
              className="p-button-success flex-1"
              onClick={saveEdit}
            />
          </div>
        </div>
      </Sidebar>
    </div>
  );
}
