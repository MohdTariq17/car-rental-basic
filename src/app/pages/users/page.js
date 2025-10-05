"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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

// Restricted roles - cannot be added from this page
const roles = [
  { label: "Admin", value: "ADMIN" },
  { label: "Driver", value: "DRIVER" },
  { label: "Mechanic", value: "MECHANIC" },
  { label: "Manager", value: "MANAGE" },
];

// All roles for filter dropdown
const allRoles = [
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
  
  // Search and filter states
  const [globalFilter, setGlobalFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState(null);
  
  // Form states
  const [addForm, setAddForm] = useState({
    username: "",
    email: "",
    name: "",
    mobile: "",
    password: "",
    role: "",
  });

  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    name: "",
    mobile: "",
    role: "",
    password: "",
  });

  // Lazy loading state
  const [lazyState, setLazyState] = useState({
    first: 0,
    rows: 10,
    page: 0,
    sortField: 'createdAt',
    sortOrder: -1,
    filters: {}
  });

  const toast = useRef(null);

  // Fixed fetchUsers function with proper error handling
  const fetchUsers = useCallback(async (state = lazyState, isInitial = false) => {
    try {
      if (isInitial) {
        setPageLoading(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const params = new URLSearchParams({
        skip: state.first.toString(),
        limit: state.rows.toString(),
        sortField: state.sortField || 'createdAt',
        sortOrder: state.sortOrder.toString(),
        filters: JSON.stringify(state.filters || {})
      });

      const response = await fetch(`/api/v1/users?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Ensure users is always an array
        const usersArray = Array.isArray(data.users) ? data.users : [];
        setUsers(usersArray);
        setTotalRecords(data.totalCount || 0);
      } else {
        throw new Error(data.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message);
      setUsers([]); // Set empty array on error
      setTotalRecords(0);
      
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: `Failed to load users: ${error.message}`,
        life: 5000,
      });
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  }, [lazyState]);

  // Initial load
  useEffect(() => {
    fetchUsers(lazyState, true);
  }, []);

  // Handle lazy loading events
  const onPageChange = (event) => {
    const newState = {
      ...lazyState,
      first: event.first,
      rows: event.rows,
      page: event.page
    };
    setLazyState(newState);
    fetchUsers(newState, false);
  };

  const onSort = (event) => {
    const newState = {
      ...lazyState,
      sortField: event.sortField,
      sortOrder: event.sortOrder,
    };
    setLazyState(newState);
    fetchUsers(newState, false);
  };

  const onFilter = (event) => {
    const newState = {
      ...lazyState,
      first: 0,
      page: 0,
      filters: event.filters
    };
    setLazyState(newState);
    fetchUsers(newState, false);
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
    // Check if user can be edited/deleted (not PROVIDER, CUSTOMER, USER)
    const canEdit = !['PROVIDER', 'CUSTOMER', 'USER'].includes(rowData.role);
    
    return (
      <div className="flex gap-2 justify-center items-center">
        {canEdit ? (
          <>
            <Button
              icon="pi pi-pencil"
              rounded
              severity="secondary"
              className="p-button-sm w-6 h-6 sm:w-8 sm:h-8"
              onClick={() => openEditSidebar(rowData)}
              tooltip="Edit"
            />
            {isAdmin() && (
              <Button
                icon="pi pi-trash"
                rounded
                severity="danger"
                className="p-button-sm w-6 h-6 sm:w-8 sm:h-8"
                onClick={() => confirmDelete(rowData)}
                tooltip="Delete"
              />
            )}
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              icon="pi pi-eye"
              rounded
              severity="info"
              className="p-button-sm w-6 h-6 sm:w-8 sm:h-8"
              onClick={() => viewUser(rowData)}
              tooltip="View Only"
            />
            <span className="text-xs text-gray-500">
              {rowData.role === 'USER' ? 'Basic User' : 'Managed Separately'}
            </span>
          </div>
        )}
      </div>
    );
  };

  const viewUser = (user) => {
    let userType, managementInfo;
    
    switch(user.role) {
      case 'PROVIDER':
        userType = 'Provider/Hoster';
        managementInfo = 'They are managed separately in the providers section.';
        break;
      case 'CUSTOMER':
        userType = 'Customer';
        managementInfo = 'They are managed separately in the customers section.';
        break;
      case 'USER':
        userType = 'Basic User';
        managementInfo = 'Basic users have limited functionality and cannot be modified from this admin panel.';
        break;
      default:
        userType = user.role;
        managementInfo = 'This user type has restricted access.';
    }
    
    toast.current?.show({
      severity: "info",
      summary: "Info",
      detail: `${userType}s cannot be edited or deleted from this page. ${managementInfo}`,
      life: 5000,
    });
  };

  const confirmDelete = (user) => {
    // Prevent deletion of PROVIDER, CUSTOMER, and USER
    if (['PROVIDER', 'CUSTOMER', 'USER'].includes(user.role)) {
      let message;
      switch(user.role) {
        case 'PROVIDER':
          message = 'Providers cannot be deleted from this page. They are managed separately in the providers section.';
          break;
        case 'CUSTOMER':
          message = 'Customers cannot be deleted from this page. They are managed separately in the customers section.';
          break;
        case 'USER':
          message = 'Basic users cannot be deleted from this admin panel for security reasons.';
          break;
      }
      
      toast.current?.show({
        severity: "warn",
        summary: "Warning",
        detail: message,
        life: 4000,
      });
      return;
    }

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
      mobile: "",
      password: "",
      role: "",
    });
    setFormErrors({});
    setShowAdd(true);
  };

  const openEditSidebar = (user) => {
    // Check if user role can be edited
    if (['PROVIDER', 'CUSTOMER', 'USER'].includes(user.role)) {
      let message;
      switch(user.role) {
        case 'PROVIDER':
          message = 'Providers cannot be edited from this page. Please use the dedicated provider management page.';
          break;
        case 'CUSTOMER':
          message = 'Customers cannot be edited from this page. Please use the dedicated customer management page.';
          break;
        case 'USER':
          message = 'Basic users cannot be edited from this admin panel for security reasons.';
          break;
      }
      
      toast.current?.show({
        severity: "warn",
        summary: "Warning",
        detail: message,
        life: 4000,
      });
      return;
    }

    setSelectedUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      name: user.name,
      mobile: user.mobile || "",
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
    if (['PROVIDER', 'CUSTOMER', 'USER'].includes(form.role)) {
      let message;
      switch(form.role) {
        case 'PROVIDER':
          message = 'Providers cannot be added from this page. Please use the dedicated provider registration process.';
          break;
        case 'CUSTOMER':
          message = 'Customers cannot be added from this page. Please use the dedicated customer registration process.';
          break;
        case 'USER':
          message = 'Basic users cannot be created from this admin panel. They are created through the standard registration process.';
          break;
      }
      errors.role = message;
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
          mobile: "",
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
          mobile: "",
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
            field="mobile" 
            header="Mobile" 
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
                id="add-mobile"
                name="mobile"
                value={addForm.mobile}
                className={`w-full p-3 text-sm sm:text-base rounded-lg border ${
                  formErrors.mobile ? "border-red-500" : "border-gray-300"
                }`}
                onChange={(e) => setAddForm({ ...addForm, mobile: e.target.value })}
              />
              <label htmlFor="add-mobile" className="text-sm text-gray-600">
                Mobile Number
              </label>
            </FloatLabel>
            {formErrors.mobile && <span className="text-red-500 text-xs mt-1">{formErrors.mobile}</span>}
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
              <InputText
                id="edit-mobile"
                name="mobile"
                value={editForm.mobile}
                className={`w-full p-3 text-sm sm:text-base rounded-lg border ${
                  formErrors.mobile ? "border-red-500" : "border-gray-300"
                }`}
                onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
              />
              <label htmlFor="edit-mobile" className="text-sm text-gray-600">
                Mobile Number
              </label>
            </FloatLabel>
            {formErrors.mobile && <span className="text-red-500 text-xs mt-1">{formErrors.mobile}</span>}
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