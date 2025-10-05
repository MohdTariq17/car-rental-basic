"use client";

import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Sidebar } from "primereact/sidebar";
import { FloatLabel } from "primereact/floatlabel";
import { Paginator } from "primereact/paginator";
import { BreadCrumb } from "primereact/breadcrumb";

// Restricted roles - ye add nahi kar sakte
const roles = [
  { label: "User", value: "USER" },
  { label: "Admin", value: "ADMIN" },
  { label: "Driver", value: "DRIVER" },
  { label: "Mechanic", value: "MECHANIC" },
  { label: "Manager", value: "MANAGER" },
];

// All roles for filter dropdown
const allRoles = [
  { label: "All Roles", value: null },
  { label: "User", value: "USER" },
  { label: "Admin", value: "ADMIN" },
  { label: "Provider", value: "PROVIDER" },
  { label: "Driver", value: "DRIVER" },
  { label: "Customer", value: "CUSTOMER" },
  { label: "Mechanic", value: "MECHANIC" },
  { label: "Manager", value: "MANAGER" },
];

const breadcrumbItems = [
  { label: "Dashboard", url: "/" },
  { label: "Users" }
];

const isAdmin = () => true; // Temporary - replace with actual auth check

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Search states
  const [nameSearch, setNameSearch] = useState("");
  const [usernameSearch, setUsernameSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState(null);
  const [globalFilter, setGlobalFilter] = useState('');

  const toast = useRef(null);

  const [lazyState, setLazyState] = useState({
    first: 0,
    rows: 10,
    page: 0,
    sortField: 'createdAt',
    sortOrder: -1,
    filters: {
      global: { value: null, matchMode: 'contains' },
      role: { value: null, matchMode: 'equals' }
    }
  });

  const [addForm, setAddForm] = useState({
    username: "",
    email: "",
    name: "",
    password: "",
    role: "",
  });

  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    name: "",
    role: "",
    password: "",
  });

  const fetchUsers = async (state, isInitialLoad = false) => {
    if (isInitialLoad) {
      setPageLoading(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams({
        skip: state.first.toString(),
        limit: state.rows.toString(),
        sortField: state.sortField || "created_at",
        sortOrder: state.sortOrder?.toString() || "-1",
      });

      // Add filters
      const filters = {};
      
      // Combine name and username search into one search term
      const searchTerms = [];
      if (nameSearch.trim()) searchTerms.push(nameSearch.trim());
      if (usernameSearch.trim()) searchTerms.push(usernameSearch.trim());
      
      if (searchTerms.length > 0) {
        filters.search = searchTerms.join(" ");
      }
      
      if (roleFilter) {
        filters.role = roleFilter;
      }

      if (Object.keys(filters).length > 0) {
        params.append('filters', JSON.stringify(filters));
      }

      const response = await fetch(`/api/v1/users?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch users");
      }

      setUsers(data.users || []);
      setTotalRecords(data.totalCount || 0);
    } catch (error) {
      setError(error.message);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.message || "Failed to load users",
        life: 3000,
      });
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(lazyState, true);
  }, []);

  useEffect(() => {
    if (!pageLoading) {
      const timeoutId = setTimeout(() => {
        fetchUsers(lazyState, false);
      }, 500); // Debounce search
      
      return () => clearTimeout(timeoutId);
    }
  }, [lazyState, nameSearch, usernameSearch, roleFilter]);

  const onPageChange = (event) => {
    setLazyState((prev) => ({
      ...prev,
      first: event.first,
      rows: event.rows,
      page: event.page
    }));
  };

  const onSort = (event) => {
    setLazyState((prev) => ({
      ...prev,
      sortField: event.sortField,
      sortOrder: event.sortOrder,
    }));
  };

  const onFilter = (event) => {
    setLazyState((prev) => ({
      ...prev,
      filters: event.filters
    }));
  };

  const statusBodyTemplate = (rowData) => (
    <Tag
      value={rowData.is_active ? "Active" : "Inactive"}
      severity={rowData.is_active ? "success" : "danger"}
      className="text-xs"
    />
  );

  const roleBodyTemplate = (rowData) => {
    const roleObj = allRoles.find(r => r.value === rowData.role);
    const roleLabel = roleObj ? roleObj.label : rowData.role;
    
    const getSeverity = (role) => {
      switch(role) {
        case 'ADMIN': return 'danger';
        case 'MANAGER': return 'warning';
        case 'PROVIDER': return 'info';
        case 'CUSTOMER': return 'success';
        case 'DRIVER': return 'help';
        case 'MECHANIC': return 'secondary';
        case 'USER': return 'info';
        default: return 'secondary';
      }
    };
    
    return (
      <Tag 
        value={roleLabel} 
        severity={getSeverity(rowData.role)}
        rounded 
      />
    );
  };

  const actionBodyTemplate = (rowData) => {
    // Check if user can be edited (not PROVIDER, CUSTOMER)
    const canEdit = !['PROVIDER', 'CUSTOMER'].includes(rowData.role);
    
    return (
      <div className="flex gap-2 justify-center">
        {canEdit && (
          <Button
            icon="pi pi-pencil"
            rounded
            severity="secondary"
            className="p-button-sm w-6 h-6 sm:w-8 sm:h-8"
            onClick={() => openEditSidebar(rowData)}
            tooltip="Edit"
          />
        )}
        {!canEdit && (
          <Button
            icon="pi pi-eye"
            rounded
            severity="info"
            className="p-button-sm w-6 h-6 sm:w-8 sm:h-8"
            onClick={() => viewUser(rowData)}
            tooltip="View Only"
          />
        )}
        {isAdmin() && canEdit && (
          <Button
            icon="pi pi-trash"
            rounded
            severity="danger"
            className="p-button-sm w-6 h-6 sm:w-8 sm:h-8"
            onClick={() => confirmDelete(rowData)}
            tooltip="Delete"
          />
        )}
      </div>
    );
  };

  const viewUser = (user) => {
    toast.current?.show({
      severity: "info",
      summary: "Info",
      detail: `${user.role}s are managed separately. Please use the dedicated ${user.role.toLowerCase()} management page.`,
      life: 4000,
    });
  };

  const confirmDelete = (user) => {
    confirmDialog({
      message: `Are you sure you want to delete ${user.name}?`,
      header: "Confirm Deletion",
      icon: "pi pi-trash",
      acceptClassName: "p-button-danger",
      accept: () => deleteUser(user),
      rejectClassName: "p-button-secondary",
    });
  };

  const openAddSidebar = () => {
    setAddForm({
      username: "",
      email: "",
      name: "",
      password: "",
      role: "",
    });
    setFormErrors({});
    setShowAdd(true);
  };

  const openEditSidebar = (user) => {
    // Check if user role can be edited
    if (['PROVIDER', 'CUSTOMER'].includes(user.role)) {
      toast.current?.show({
        severity: "warn",
        summary: "Warning",
        detail: `${user.role}s cannot be edited from this page. Please use the dedicated ${user.role.toLowerCase()} management page.`,
        life: 4000,
      });
      return;
    }

    setSelectedUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      password: "",
    });
    setFormErrors({});
    setShowEdit(true);
  };

  const validateForm = (form, isEdit = false) => {
    const errors = {};
    if (!form.username.trim()) errors.username = "Username is required";
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = "Email is invalid";
    if (!isEdit && !form.password.trim()) errors.password = "Password is required";
    if (!form.role) errors.role = "Role is required";
    
    // Check if trying to add restricted roles
    if (['PROVIDER', 'CUSTOMER'].includes(form.role)) {
      errors.role = `${form.role}s cannot be added from this page. Please use the dedicated registration process.`;
    }
    
    return errors;
  };

  const addUser = async () => {
    const errors = validateForm(addForm);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await response.json();
      if (response.ok) {
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "User added successfully",
          life: 3000,
        });
        setShowAdd(false);
        setAddForm({
          username: "",
          email: "",
          name: "",
          password: "",
          role: "",
        });
        fetchUsers(lazyState, false);
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: data.message || "Failed to add user",
          life: 3000,
        });
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to add user",
        life: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const updateUser = async () => {
    const errors = validateForm(editForm, true);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`/api/v1/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await response.json();
      if (response.ok) {
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "User updated successfully",
          life: 3000,
        });
        setShowEdit(false);
        setEditForm({
          username: "",
          email: "",
          name: "",
          role: "",
          password: "",
        });
        fetchUsers(lazyState, false);
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: data.message || "Failed to update user",
          life: 3000,
        });
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update user",
        life: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (user) => {
    try {
      const response = await fetch(`/api/v1/users/${user.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.current?.show({
          severity: "success",
          summary: "Success",
          detail: "User deleted successfully",
          life: 3000,
        });
        fetchUsers(lazyState, false);
      } else {
        throw new Error("Failed to delete user");
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to delete user",
        life: 3000,
      });
    }
  };

  const renderHeader = () => (
    <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold text-white m-0">Users Management</h2>
        <Tag value={`${totalRecords} Total`} severity="info" />
      </div>
      <div className="flex gap-2 items-center flex-wrap">
        {/* Global Search */}
        <div className="flex items-center gap-2">
          <InputText
            value={globalFilter}
            onChange={(e) => {
              setGlobalFilter(e.target.value);
              setLazyState(prev => ({
                ...prev,
                filters: {
                  ...prev.filters,
                  global: { value: e.target.value, matchMode: 'contains' }
                }
              }));
            }}
            placeholder="Search users..."
            className="p-2 text-sm"
          />
          <i className="pi pi-search text-white" />
        </div>
        
        {/* Role Filter */}
        <Dropdown
          value={roleFilter}
          options={[
            { label: 'All Roles', value: null },
            ...allRoles
          ]}
          onChange={(e) => {
            setRoleFilter(e.value);
            setLazyState(prev => ({
              ...prev,
              filters: {
                ...prev.filters,
                role: { value: e.value, matchMode: 'equals' }
              }
            }));
          }}
          placeholder="Filter by Role"
          className="p-2 text-sm min-w-40"
        />
        
        <Button
          label="Add User"
          icon="pi pi-plus"
          onClick={openAddSidebar}
          className="bg-gradient-to-r from-blue-600 to-purple-600 border-none font-bold px-4 py-2 text-sm rounded-lg hover:scale-105 transition-transform"
        />
      </div>
    </div>
  );

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-gray-900 via-gray-500 to-gray-600 font-sans flex items-center justify-center">
        <div className="text-white text-xl">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-gray-900 via-gray-500 to-gray-600 font-sans flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 via-gray-500 to-gray-600 font-sans p-6">
      <Toast ref={toast} />
      <ConfirmDialog />
      <BreadCrumb
        model={breadcrumbItems}
        home={{ icon: "pi pi-home", command: () => (window.location.href = "/") }}
        className="mb-6 text-white font-bold"
      />
      {renderHeader()}
      <div className="rounded-lg shadow-lg bg-white p-4">
        <DataTable
          value={users}
          lazy
          sortField={lazyState.sortField}
          sortOrder={lazyState.sortOrder}
          first={lazyState.first}
          rows={lazyState.rows}
          totalRecords={totalRecords}
          onPage={onPageChange}
          onSort={onSort}
          onFilter={onFilter}
          loading={loading}
          paginator
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          rowsPerPageOptions={[5, 10, 25, 50]}
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
          globalFilterFields={['name', 'email', 'username', 'role']}
          emptyMessage="No users found."
          className="p-datatable-gridlines"
          showGridlines
          size="small"
          stripedRows
          responsiveLayout="scroll"
          filters={lazyState.filters}
          globalFilter={globalFilter}
        >
          <Column 
            field="name" 
            header="Name" 
            sortable 
          />
          <Column 
            field="username" 
            header="Username" 
            sortable 
          />
          <Column 
            field="email" 
            header="Email" 
            sortable 
          />
          <Column 
            field="role" 
            header="Role" 
            body={roleBodyTemplate} 
            sortable 
          />
          <Column 
            field="is_active" 
            header="Status" 
            body={statusBodyTemplate} 
            sortable 
          />
          <Column 
            header="Actions" 
            body={actionBodyTemplate} 
          />
        </DataTable>
      </div>

      {/* Add User Sidebar */}
      <Sidebar
        visible={showAdd}
        position="right"
        onHide={() => setShowAdd(false)}
        className="w-full md:w-30rem"
        header="Add User"
      >
        <form className="flex flex-col gap-4 p-1">
          <div className="mt-4">
            <FloatLabel>
              <InputText
                id="add-username"
                name="username"
                value={addForm.username}
                className={`w-full p-3 text-sm sm:text-base rounded-lg border ${
                  formErrors.username ? "border-red-500" : "border-gray-300"
                }`}
                onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
              />
              <label htmlFor="add-username" className="text-sm text-gray-600">
                Username <span className="text-red-600">*</span>
              </label>
            </FloatLabel>
            {formErrors.username && <span className="text-red-500 text-xs mt-1">{formErrors.username}</span>}
          </div>
          <div className="mt-2">
            <FloatLabel>
              <InputText
                id="add-name"
                name="name"
                value={addForm.name}
                className={`w-full p-3 text-sm sm:text-base rounded-lg border ${
                  formErrors.name ? "border-red-500" : "border-gray-300"
                }`}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              />
              <label htmlFor="add-name" className="text-sm text-gray-600">
                Full Name <span className="text-red-600">*</span>
              </label>
            </FloatLabel>
            {formErrors.name && <span className="text-red-500 text-xs mt-1">{formErrors.name}</span>}
          </div>
          <div className="mt-2">
            <FloatLabel>
              <InputText
                id="add-email"
                name="email"
                type="email"
                value={addForm.email}
                className={`w-full p-3 text-sm sm:text-base rounded-lg border ${
                  formErrors.email ? "border-red-500" : "border-gray-300"
                }`}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              />
              <label htmlFor="add-email" className="text-sm text-gray-600">
                Email <span className="text-red-600">*</span>
              </label>
            </FloatLabel>
            {formErrors.email && <span className="text-red-500 text-xs mt-1">{formErrors.email}</span>}
          </div>
          <div className="mt-2">
            <FloatLabel>
              <InputText
                id="add-password"
                name="password"
                type="password"
                value={addForm.password}
                className={`w-full p-3 text-sm sm:text-base rounded-lg border ${
                  formErrors.password ? "border-red-500" : "border-gray-300"
                }`}
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
              />
              <label htmlFor="add-password" className="text-sm text-gray-600">
                Password <span className="text-red-600">*</span>
              </label>
            </FloatLabel>
            {formErrors.password && <span className="text-red-500 text-xs mt-1">{formErrors.password}</span>}
          </div>
          <div className="mt-2">
            <FloatLabel>
              <Dropdown
                id="add-role"
                name="role"
                options={roles}
                className={`w-full rounded-lg border ${
                  formErrors.role ? "border-red-500" : "border-gray-300"
                }`}
                value={addForm.role}
                onChange={(e) => setAddForm({ ...addForm, role: e.value })}
                panelClassName="z-50"
              />
              <label htmlFor="add-role" className="text-sm text-gray-600">
                Role <span className="text-red-600">*</span>
              </label>
            </FloatLabel>
            {formErrors.role && <span className="text-red-500 text-xs mt-1">{formErrors.role}</span>}
          </div>
        </form>
        <div className="flex justify-end gap-3 mt-5">
          <Button
            label={saving ? "Saving..." : "Save"}
            onClick={addUser}
            className="bg-gradient-to-r from-blue-600 to-purple-600 border-none font-extrabold px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg"
            disabled={saving}
          />
          <Button
            label="Cancel"
            onClick={() => setShowAdd(false)}
            className="bg-gray-500 border-none font-extrabold px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg"
          />
        </div>
      </Sidebar>

      {/* Edit User Sidebar */}
      <Sidebar
        visible={showEdit}
        position="right"
        onHide={() => setShowEdit(false)}
        className="w-full md:w-30rem"
        header="Edit User"
      >
        <form className="flex flex-col gap-4 p-1">
          <div className="mt-4">
            <FloatLabel>
              <InputText
                id="edit-username"
                name="username"
                value={editForm.username}
                className={`w-full p-3 text-sm sm:text-base rounded-lg border ${
                  formErrors.username ? "border-red-500" : "border-gray-300"
                }`}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              />
              <label htmlFor="edit-username" className="text-sm text-gray-600">
                Username <span className="text-red-600">*</span>
              </label>
            </FloatLabel>
            {formErrors.username && <span className="text-red-500 text-xs mt-1">{formErrors.username}</span>}
          </div>
          <div className="mt-2">
            <FloatLabel>
              <InputText
                id="edit-name"
                name="name"
                value={editForm.name}
                className={`w-full p-3 text-sm sm:text-base rounded-lg border ${
                  formErrors.name ? "border-red-500" : "border-gray-300"
                }`}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
              <label htmlFor="edit-name" className="text-sm text-gray-600">
                Full Name <span className="text-red-600">*</span>
              </label>
            </FloatLabel>
            {formErrors.name && <span className="text-red-500 text-xs mt-1">{formErrors.name}</span>}
          </div>
          <div className="mt-2">
            <FloatLabel>
              <InputText
                id="edit-email"
                name="email"
                type="email"
                value={editForm.email}
                className={`w-full p-3 text-sm sm:text-base rounded-lg border ${
                  formErrors.email ? "border-red-500" : "border-gray-300"
                }`}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
              <label htmlFor="edit-email" className="text-sm text-gray-600">
                Email <span className="text-red-600">*</span>
              </label>
            </FloatLabel>
            {formErrors.email && <span className="text-red-500 text-xs mt-1">{formErrors.email}</span>}
          </div>
          <div className="mt-2">
            <FloatLabel>
              <Dropdown
                id="edit-role"
                name="role"
                options={roles}
                className={`w-full rounded-lg border ${
                  formErrors.role ? "border-red-500" : "border-gray-300"
                }`}
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.value })}
                panelClassName="z-50"
              />
              <label htmlFor="edit-role" className="text-sm text-gray-600">
                Role <span className="text-red-600">*</span>
              </label>
            </FloatLabel>
            {formErrors.role && <span className="text-red-500 text-xs mt-1">{formErrors.role}</span>}
          </div>
        </form>
        <div className="flex justify-end gap-3 mt-5">
          <Button
            label={saving ? "Saving..." : "Save"}
            onClick={updateUser}
            className="bg-gradient-to-r from-blue-600 to-purple-600 border-none font-extrabold px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg"
            disabled={saving}
          />
          <Button
            label="Cancel"
            onClick={() => setShowEdit(false)}
            className="bg-gray-400 border-none font-extrabold px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg"
          />
        </div>
      </Sidebar>
    </div>
  );
}