"use client";
import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";

/**
 * States Page (Admin Panel)
 * Features: Add, Edit, Delete, Search, Filter with API Integration
 */
export default function StatesPage() {
  const toast = React.useRef(null);
  
  const statusOptions = [
    { label: "Active", value: true },
    { label: "Inactive", value: false },
  ];

  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editVisible, setEditVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editStatus, setEditStatus] = useState(true);

  // Search & Filter
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);

  // Pagination
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch states from API
  const fetchStates = async (page = 1, limit = 10, search = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      });

      const response = await fetch(`/api/v1/states?${params}`);
      const result = await response.json();

      if (result.success) {
        setStates(result.data.states);
        setTotalRecords(result.data.pagination.total);
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: result.error || 'Failed to fetch states'
        });
      }
    } catch (error) {
      console.error('Error fetching states:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch states'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load states on component mount
  useEffect(() => {
    fetchStates();
  }, []);

  // Handle search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchStates(1, rows, globalFilter);
      setFirst(0);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [globalFilter, rows]);

  // Handle pagination
  const onPage = (event) => {
    const page = Math.floor(event.first / event.rows) + 1;
    setFirst(event.first);
    setRows(event.rows);
    fetchStates(page, event.rows, globalFilter);
  };

  // Open sidebar for Edit
  const openEdit = (row) => {
    setEditing(row);
    setEditName(row.name);
    setEditCode(row.code);
    setEditStatus(row.active);
    setEditVisible(true);
  };

  // Open sidebar for Add
  const openAdd = () => {
    setEditing(null);
    setEditName("");
    setEditCode("");
    setEditStatus(true);
    setEditVisible(true);
  };

  // Save Edit or Add
  const saveEdit = async () => {
    if (!editName.trim() || !editCode.trim()) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill all required fields'
      });
      return;
    }

    try {
      setSaving(true);
      let response;

      if (editing) {
        // Update existing state
        response = await fetch(`/api/v1/states/${editing.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: editName.trim(),
            code: editCode.trim().toUpperCase(),
            active: editStatus
          }),
        });
      } else {
        // Add new state
        response = await fetch('/api/v1/states', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: editName.trim(),
            code: editCode.trim().toUpperCase(),
            active: editStatus
          }),
        });
      }

      const result = await response.json();

      if (result.success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: editing ? 'State updated successfully' : 'State created successfully'
        });
        setEditVisible(false);
        setEditing(null);
        fetchStates(Math.floor(first / rows) + 1, rows, globalFilter);
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: result.error || 'Failed to save state'
        });
      }
    } catch (error) {
      console.error('Error saving state:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save state'
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete state
  const removeState = async (row) => {
    if (confirm(`Delete state ${row.name}?`)) {
      try {
        const response = await fetch(`/api/v1/states/${row.id}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        if (result.success) {
          toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: 'State deleted successfully'
          });
          fetchStates(Math.floor(first / rows) + 1, rows, globalFilter);
        } else {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: result.error || 'Failed to delete state'
          });
        }
      } catch (error) {
        console.error('Error deleting state:', error);
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete state'
        });
      }
    }
  };

  // Table custom cells
  const statusBody = (row) => (
    <Tag
      value={row.active ? "Active" : "Inactive"}
      severity={row.active ? "success" : "danger"}
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

  // Filtered Data for status filter
  const filteredStates = states.filter((s) => {
    if (statusFilter === null) return true;
    return s.active === statusFilter;
  });

  return (
    <div className="p-6">
      <Toast ref={toast} />
      
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
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <ProgressSpinner />
        </div>
      ) : (
        <DataTable
          value={filteredStates}
          lazy
          paginator
          first={first}
          rows={rows}
          totalRecords={totalRecords}
          onPage={onPage}
          loading={loading}
          className="rounded-2xl shadow-1"
          tableStyle={{ minWidth: "40rem" }}
          emptyMessage="No states found."
        >
          <Column field="name" header="State" sortable />
          <Column field="code" header="Code" sortable />
          <Column field="active" header="Status" body={statusBody} sortable />
          <Column header="Action" body={actionBody} style={{ width: "120px" }} />
        </DataTable>
      )}

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
              disabled={saving}
            />
            <label htmlFor="edit-name">State Name *</label>
          </span>

          <span className="p-float-label">
            <InputText
              id="edit-code"
              value={editCode}
              onChange={(e) => setEditCode(e.target.value)}
              disabled={saving}
            />
            <label htmlFor="edit-code">State Code *</label>
          </span>

          <span className="p-float-label">
            <Dropdown
              id="edit-status"
              value={editStatus}
              options={statusOptions}
              onChange={(e) => setEditStatus(e.value)}
              placeholder="Select Status"
              disabled={saving}
            />
            <label htmlFor="edit-status">Status</label>
          </span>

          <div className="flex gap-2 mt-3">
            <Button
              label="Cancel"
              className="p-button-secondary"
              onClick={() => setEditVisible(false)}
              disabled={saving}
            />
            <Button
              label={editing ? "Save Changes" : "Add State"}
              className="p-button-success"
              onClick={saveEdit}
              loading={saving}
            />
          </div>
        </div>
      </Sidebar>
    </div>
  );
}