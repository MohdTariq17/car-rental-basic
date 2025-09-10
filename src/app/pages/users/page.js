"use client";
import React, { useState } from "react";
import { Sidebar } from "primereact/sidebar";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

// Action renderer component
const ActionRenderer = ({ user, userRole, onEdit, onDelete }) => {
  // Define which roles can perform actions
  const canEdit = ["Admin", "Super Admin"].includes(userRole);
  const canDelete = ["Super Admin"].includes(userRole);

  if (!canEdit && !canDelete) return null;

  return (
    <div className="flex gap-2">
      {canEdit && (
        <Button
          label="Edit"
          icon="pi pi-pencil"
          rounded
          text
          severity="info"
          aria-label="Edit"
          onClick={() => onEdit(user)}
          className="p-button-sm"
        />
      )}
      {canDelete && (
        <Button
          label="Delete"
          icon="pi pi-trash"
          rounded
          text
          severity="danger"
          aria-label="Delete"
          onClick={() => onDelete(user)}
          className="p-button-sm"
        />
      )}
    </div>
  );
};

// Main Users Page Component
export default function UsersPage() {
  // User state management - Only users with allowed roles
  const [users, setUsers] = useState([
    { id: 1, name: "John Doe", username: "johnny", role: "Driver", email: "john@example.com" },
    { id: 2, name: "Jane Smith", username: "janes", role: "Admin", email: "jane@example.com" },
    { id: 3, name: "Mike Brown", username: "mikeb", role: "Mechanic", email: "mike@example.com" },
    { id: 4, name: "Mary Hat", username: "marryh", role: "Manager", email: "mary@example.com" },
    { id: 5, name: "Sarah Wilson", username: "sarahw", role: "Super Admin", email: "sarah@example.com" },
  ]);

  // Current user role (this would come from auth context in real app)
  const [currentUserRole] = useState("Super Admin");

  // Sidebar visibility states
  const [addUserVisible, setAddUserVisible] = useState(false);
  const [editUserVisible, setEditUserVisible] = useState(false);

  // Add user form states
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: null
  });

  // Edit user states
  const [editingUser, setEditingUser] = useState(null);
  const [editUserData, setEditUserData] = useState({
    name: "",
    username: "",
    role: null
  });

  // **RESTRICTED ROLE OPTIONS** - Only these 5 roles are allowed
  const allowedRoles = ["Mechanic", "Manager", "Admin", "Super Admin", "Driver"];
  
  const roleOptions = allowedRoles.map(role => ({
    label: role,
    value: role
  }));

  // **ROLE-BASED PERMISSIONS**
  const canAddUsers = ["Admin", "Super Admin"].includes(currentUserRole);
  const canEditUsers = ["Admin", "Super Admin"].includes(currentUserRole);
  const canDeleteUsers = ["Super Admin"].includes(currentUserRole);

  // Add user handlers
  const handleAddUser = () => {
    const { name, email, role } = newUser;
    
    // Validation
    if (!name || !email || !role) {
      alert("Please fill all fields");
      return;
    }

    // **ROLE RESTRICTION CHECK**
    if (!allowedRoles.includes(role)) {
      alert(`Invalid role. Only ${allowedRoles.join(', ')} are allowed.`);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return;
    }

    // Check if email already exists
    if (users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
      alert("A user with this email already exists");
      return;
    }

    const userToAdd = {
      id: Math.max(...users.map(u => u.id), 0) + 1,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      username: email.split("@")[0].toLowerCase(),
      role,
    };

    setUsers(prevUsers => [...prevUsers, userToAdd]);
    resetAddForm();
    alert(`${role} user "${name}" has been added successfully!`);
  };

  const resetAddForm = () => {
    setNewUser({ name: "", email: "", role: null });
    setAddUserVisible(false);
  };

  // Edit user handlers
  const openEditUser = (user) => {
    if (!canEditUsers) {
      alert("You don't have permission to edit users");
      return;
    }

    setEditingUser(user);
    setEditUserData({
      name: user.name,
      username: user.username,
      role: user.role
    });
    setEditUserVisible(true);
  };

  const handleEditUser = () => {
    const { name, username, role } = editUserData;
    
    // Validation
    if (!name || !username || !role) {
      alert("Please fill all fields");
      return;
    }

    // **ROLE RESTRICTION CHECK**
    if (!allowedRoles.includes(role)) {
      alert(`Invalid role. Only ${allowedRoles.join(', ')} are allowed.`);
      return;
    }

    // Check if username already exists (excluding current user)
    if (users.some(user => 
      user.id !== editingUser.id && 
      user.username.toLowerCase() === username.toLowerCase()
    )) {
      alert("A user with this username already exists");
      return;
    }

    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === editingUser.id
          ? { ...user, name: name.trim(), username: username.toLowerCase().trim(), role }
          : user
      )
    );

    resetEditForm();
    alert(`User "${name}" has been updated successfully!`);
  };

  const resetEditForm = () => {
    setEditingUser(null);
    setEditUserData({ name: "", username: "", role: null });
    setEditUserVisible(false);
  };

  // Delete user handler
  const handleDeleteUser = (user) => {
    if (!canDeleteUsers) {
      alert("You don't have permission to delete users");
      return;
    }

    confirmDialog({
      message: `Are you sure you want to delete user "${user.name}" (${user.role})?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptClassName: 'p-button-danger',
      accept: () => {
        setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));
        alert(`${user.role} "${user.name}" has been deleted successfully!`);
      },
      reject: () => {
        // User cancelled - do nothing
      }
    });
  };

  // Action column template for DataTable
  const actionBodyTemplate = (rowData) => {
    return (
      <ActionRenderer
        user={rowData}
        userRole={currentUserRole}
        onEdit={openEditUser}
        onDelete={handleDeleteUser}
      />
    );
  };

  // Filter users to only show allowed roles (extra safety measure)
  const filteredUsers = users.filter(user => allowedRoles.includes(user.role));

  return (
    <div className="p-4">
      <ConfirmDialog />
      
      {/* Header with Add User Button */}
      <div className="flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-gray-600 mt-1">
            Manage {allowedRoles.join(', ')} roles only
          </p>
        </div>
        {canAddUsers && (
          <Button
            label="Add Staff Member"
            icon="pi pi-plus"
            onClick={() => setAddUserVisible(true)}
            className="p-button-success"
          />
        )}
      </div>

      {/* Role Summary Cards */}
      <div className="grid mb-4">
        {allowedRoles.map(role => {
          const count = filteredUsers.filter(user => user.role === role).length;
          return (
            <div key={role} className="col-12 md:col-6 lg:col-2">
              <div className="surface-card p-3 border-round shadow-2 text-center">
                <div className="text-2xl font-bold text-primary">{count}</div>
                <div className="text-sm text-600">{role}{count !== 1 ? 's' : ''}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Users DataTable - Only showing users with allowed roles */}
      <DataTable
        value={filteredUsers}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25]}
        className="p-datatable-striped"
        emptyMessage="No staff members found"
        responsiveLayout="scroll"
        header={`Total Staff: ${filteredUsers.length}`}
      >
        <Column field="id" header="ID" sortable style={{ width: '8%' }} />
        <Column field="name" header="Name" sortable style={{ width: '25%' }} />
        <Column field="username" header="Username" sortable style={{ width: '20%' }} />
        <Column field="email" header="Email" sortable style={{ width: '25%' }} />
        <Column 
          field="role" 
          header="Role" 
          sortable 
          style={{ width: '15%' }}
          body={(rowData) => (
            <span className={`p-tag p-tag-rounded ${
              rowData.role === 'Super Admin' ? 'p-tag-danger' :
              rowData.role === 'Admin' ? 'p-tag-warning' :
              rowData.role === 'Manager' ? 'p-tag-info' :
              rowData.role === 'Mechanic' ? 'p-tag-success' :
              'p-tag-secondary'
            }`}>
              {rowData.role}
            </span>
          )}
        />
        <Column
          header="Actions"
          body={actionBodyTemplate}
          style={{ width: '7%' }}
        />
      </DataTable>

      {/* Add User Sidebar */}
      <Sidebar
        visible={addUserVisible}
        position="right"
        onHide={resetAddForm}
        className="w-full md:w-20rem lg:w-30rem"
        header="Add New Staff Member"
      >
        <div className="mb-3">
          <small className="text-600">
            You can only add users with these roles: <br/>
            <strong>{allowedRoles.join(', ')}</strong>
          </small>
        </div>
        
        <div className="p-fluid flex flex-column gap-4">
          <div className="field">
            <label htmlFor="add-name" className="block mb-2 font-medium">Full Name *</label>
            <InputText
              id="add-name"
              value={newUser.name}
              onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter full name"
              className="w-full"
            />
          </div>

          <div className="field">
            <label htmlFor="add-email" className="block mb-2 font-medium">Email Address *</label>
            <InputText
              id="add-email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
              className="w-full"
            />
            <small className="text-600">Username will be generated from email</small>
          </div>

          <div className="field">
            <label htmlFor="add-role" className="block mb-2 font-medium">Role *</label>
            <Dropdown
              id="add-role"
              value={newUser.role}
              options={roleOptions}
              onChange={(e) => setNewUser(prev => ({ ...prev, role: e.value }))}
              placeholder="Select a staff role"
              className="w-full"
            />
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-secondary flex-1"
              onClick={resetAddForm}
            />
            <Button
              label="Add Staff"
              icon="pi pi-check"
              className="p-button-success flex-1"
              onClick={handleAddUser}
            />
          </div>
        </div>
      </Sidebar>

      {/* Edit User Sidebar */}
      <Sidebar
        visible={editUserVisible}
        position="right"
        onHide={resetEditForm}
        className="w-full md:w-20rem lg:w-30rem"
        header="Edit Staff Member"
      >
        <div className="mb-3">
          <small className="text-600">
            Available roles: <strong>{allowedRoles.join(', ')}</strong>
          </small>
        </div>

        <div className="p-fluid flex flex-column gap-4">
          <div className="field">
            <label htmlFor="edit-name" className="block mb-2 font-medium">Full Name *</label>
            <InputText
              id="edit-name"
              value={editUserData.name}
              onChange={(e) => setEditUserData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter full name"
              className="w-full"
            />
          </div>

          <div className="field">
            <label htmlFor="edit-username" className="block mb-2 font-medium">Username *</label>
            <InputText
              id="edit-username"
              value={editUserData.username}
              onChange={(e) => setEditUserData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Enter username"
              className="w-full"
            />
          </div>

          <div className="field">
            <label htmlFor="edit-role" className="block mb-2 font-medium">Role *</label>
            <Dropdown
              id="edit-role"
              value={editUserData.role}
              options={roleOptions}
              onChange={(e) => setEditUserData(prev => ({ ...prev, role: e.value }))}
              placeholder="Select a staff role"
              className="w-full"
            />
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-secondary flex-1"
              onClick={resetEditForm}
            />
            <Button
              label="Save Changes"
              icon="pi pi-check"
              className="p-button-success flex-1"
              onClick={handleEditUser}
            />
          </div>
        </div>
      </Sidebar>
    </div>
  );
}
