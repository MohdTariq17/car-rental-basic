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
 * Cities Page (Admin Panel)
 * Features: Add, Edit, Delete, Search, Filter with API Integration
 */
export default function CitiesPage() {
  const toast = React.useRef(null);
  
  const statusOptions = [
    { label: "Active", value: true },
    { label: "Inactive", value: false },
  ];

  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editVisible, setEditVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editStateId, setEditStateId] = useState(null);
  const [editStatus, setEditStatus] = useState(true);

  // Search & Filter
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [stateFilter, setStateFilter] = useState(null);

  // Pagination
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch states for dropdown
  const fetchStates = async () => {
    try {
      const response = await fetch('/api/v1/states?limit=1000');
      const result = await response.json();
      
      if (result.success) {
        const stateOptions = result.data.states.map(state => ({
          label: state.name,
          value: state.id
        }));
        setStates(stateOptions);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  // Fetch cities from API
  const fetchCities = async (page = 1, limit = 10, search = "", status = null, stateId = null) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(status !== null && { status: status.toString() }),
        ...(stateId && { stateId: stateId.toString() })
      });

      const response = await fetch(`/api/v1/Cities?${params}`);
      const result = await response.json();

      if (result.success) {
        setCities(result.data.cities);
        setTotalRecords(result.data.pagination.total);
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: result.error || 'Failed to fetch cities'
        });
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to fetch cities'
      });
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchStates();
    fetchCities();
  }, []);

  // Handle search and filters
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCities(1, rows, globalFilter, statusFilter, stateFilter);
      setFirst(0);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [globalFilter, statusFilter, stateFilter, rows]);

  // Handle pagination
  const onPage = (event) => {
    const page = Math.floor(event.first / event.rows) + 1;
    setFirst(event.first);
    setRows(event.rows);
    fetchCities(page, event.rows, globalFilter, statusFilter, stateFilter);
  };

  // Open sidebar for Edit
  const openEdit = (row) => {
    setEditing(row);
    setEditName(row.name);
    setEditCode(row.code || "");
    setEditStateId(row.stateId);
    setEditStatus(row.active);
    setEditVisible(true);
  };

  // Open sidebar for Add
  const openAdd = () => {
    setEditing(null);
    setEditName("");
    setEditCode("");
    setEditStateId(null);
    setEditStatus(true);
    setEditVisible(true);
  };

  // Save Edit or Add
  const saveEdit = async () => {
    if (!editName.trim() || !editStateId) {
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

      const payload = {
        name: editName.trim(),
        stateId: editStateId,
        active: editStatus,
        ...(editCode.trim() && { code: editCode.trim().toUpperCase() })
      };

      if (editing) {
        // Update existing city
        response = await fetch(`/api/v1/Cities/${editing.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Add new city
        response = await fetch('/api/v1/Cities', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();

      if (result.success) {
        toast.current?.show({
          severity: 'success',
          summary: 'Success',
          detail: editing ? 'City updated successfully' : 'City created successfully'
        });
        setEditVisible(false);
        setEditing(null);
        fetchCities(Math.floor(first / rows) + 1, rows, globalFilter, statusFilter, stateFilter);
      } else {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: result.error || 'Failed to save city'
        });
      }
    } catch (error) {
      console.error('Error saving city:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save city'
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete city
  const removeCity = async (row) => {
    if (confirm(`Delete city ${row.name}?`)) {
      try {
        const response = await fetch(`/api/v1/Cities/${row.id}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        if (result.success) {
          toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: 'City deleted successfully'
          });
          fetchCities(Math.floor(first / rows) + 1, rows, globalFilter, statusFilter, stateFilter);
        } else {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: result.error || 'Failed to delete city'
          });
        }
      } catch (error) {
        console.error('Error deleting city:', error);
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete city'
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
        onClick={() => removeCity(row)}
      />
    </div>
  );

  return (
    <div className="p-6">
      <Toast ref={toast} />
      
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
            options={states}
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
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <ProgressSpinner />
        </div>
      ) : (
        <DataTable
          value={cities}
          lazy
          paginator
          first={first}
          rows={rows}
          totalRecords={totalRecords}
          onPage={onPage}
          loading={loading}
          className="rounded-2xl shadow-1"
          tableStyle={{ minWidth: "40rem" }}
          emptyMessage="No cities found."
        >
          <Column field="name" header="City" sortable />
          <Column field="code" header="Code" sortable />
          <Column field="state" header="State" sortable />
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
        <h2 className="mb-4">{editing ? "Edit City" : "Add City"}</h2>
        <div className="p-fluid flex flex-col gap-3">
          <span className="p-float-label">
            <InputText
              id="edit-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              disabled={saving}
            />
            <label htmlFor="edit-name">City Name</label>
          </span>

          <span className="p-float-label">
            <InputText
              id="edit-code"
              value={editCode}
              onChange={(e) => setEditCode(e.target.value)}
              disabled={saving}
            />
            <label htmlFor="edit-code">City Code</label>
          </span>

          <span className="p-float-label">
            <Dropdown
              id="edit-state"
              value={editStateId}
              options={states}
              onChange={(e) => setEditStateId(e.value)}
              placeholder="Select State"
              disabled={saving}
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
              label={editing ? "Save Changes" : "Add City"}
              className="p-button-success"
              onClick={saveEdit}
              disabled={saving}
            />
          </div>
        </div>
      </Sidebar>
    </div>
  );
}