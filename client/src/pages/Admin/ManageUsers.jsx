import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/DataTable/DataTable';
import Modal from '../../components/Model/Model';
import { AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import usersApi from '../../api/users';
import './ManageUsers.css';

function nameToColor(name = '') {
  const palette = ['#325FE8', '#EE582C', '#DCAD26','#A551FF', ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}
function initials(name = '') {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

export default function ManageUsers() {
  const { token, user: currentUser } = useAuth();

  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [toast, setToast] = useState({ msg: '', type: '' });

  // Modal state
  const [roleModal, setRoleModal] = useState(null);   // { user, newRole }
  const [deleteModal, setDeleteModal] = useState(null); // user to delete
  const [selectedRole, setSelectedRole] = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3500);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await usersApi.getAll(token);
    if (res.success) {
      setUserList(res.users);
    } else {
      setError(res.error);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = roleFilter === 'all'
    ? userList
    : userList.filter(u => u.role === roleFilter);

  const counts = {
    all: userList.length,
    student: userList.filter(u => u.role === 'student').length,
    librarian: userList.filter(u => u.role === 'librarian').length,
    admin: userList.filter(u => u.role === 'admin').length,
  };

  const handleRoleChange = async () => {
    if (!roleModal || !selectedRole) return;
    setSaving(true);
    const res = await usersApi.updateRole(roleModal._id, selectedRole, token);
    setSaving(false);
    if (res.success) {
      setUserList(prev => prev.map(u => u._id === roleModal._id ? res.user : u));
      showToast(`${roleModal.name}'s role changed to ${selectedRole}.`);
      setRoleModal(null);
    } else {
      showToast(res.error || 'Failed to update role.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setSaving(true);
    const res = await usersApi.deleteUser(deleteModal._id, token);
    setSaving(false);
    if (res.success) {
      setUserList(prev => prev.filter(u => u._id !== deleteModal._id));
      showToast(`${deleteModal.name} has been deleted.`);
      setDeleteModal(null);
    } else {
      showToast(res.error || 'Failed to delete user.', 'error');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'User',
      sortable: true,
      render: (v, row) => (
        <div className="user-cell">
          <div className="user-avatar" style={{ backgroundColor: row.avatarColor || nameToColor(v) }}>
            {row.avatarInitials || initials(v)}
          </div>
          <div>
            <p className="user-name">{v}</p>
            <p className="user-email">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (v) => <span className={`role-badge role-${v}`}>{v}</span>,
    },
    {
      key: 'createdAt',
      label: 'Joined',
      sortable: true,
      render: (v) => fmtDate(v),
    },
    {
      key: '_id',
      label: 'Actions',
      render: (_, row) => (
        <div className="user-actions-cell">
          <button
            className="action-btn edit"
            onClick={() => { setRoleModal(row); setSelectedRole(row.role); }}
            disabled={String(row._id) === String(currentUser._id)}
            title={String(row._id) === String(currentUser._id) ? "Cannot change your own role" : "Change role"}
          >
            Change Role
          </button>
          <button
            className="action-btn delete"
            onClick={() => setDeleteModal(row)}
            disabled={String(row._id) === String(currentUser._id)}
            title={String(row._id) === String(currentUser._id) ? "Cannot delete your own account" : "Delete user"}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="manage-users">
        <div className="users-loading"><div className="users-spinner" /><p>Loading users…</p></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="manage-users">
        <div className="users-error"><AlertTriangle size={40} /><p>{error}</p>
          <button className="users-retry-btn" onClick={fetchUsers}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-users">
      {toast.msg && (
        <div className={`success-toast ${toast.type === 'error' ? 'error-toast' : ''}`}>
          {toast.type === 'error' ? <AlertTriangle size={16} style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '4px'}}/> : <CheckCircle2 size={16} style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '4px'}}/>} {toast.msg}
        </div>
      )}

      <div className="manage-header">
        <div>
          <h2>Manage Users</h2>
          <p>{userList.length} total users in the system</p>
        </div>
      </div>

      <div className="user-role-tabs">
        {['all', 'student', 'librarian', 'admin'].map(r => (
          <button
            key={r}
            className={`role-tab ${roleFilter === r ? 'active' : ''}`}
            onClick={() => setRoleFilter(r)}
          >
            {r.charAt(0).toUpperCase() + r.slice(1)}
            <span className="role-tab-count">{counts[r]}</span>
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage="No users found"
      />

      {/* Change Role Modal */}
      <Modal
        isOpen={!!roleModal}
        onClose={() => setRoleModal(null)}
        title="Change User Role"
        size="small"
      >
        {roleModal && (
          <div className="role-change-form">
            <div className="role-change-user">
              <div className="user-avatar lg" style={{ backgroundColor: nameToColor(roleModal.name) }}>
                {initials(roleModal.name)}
              </div>
              <div>
                <p className="rcf-name">{roleModal.name}</p>
                <p className="rcf-email">{roleModal.email}</p>
              </div>
            </div>
            <div className="role-select-group">
              <label>New Role</label>
              <select
                className="role-select"
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="librarian">Librarian</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="role-modal-actions">
              <button className="btn-secondary" onClick={() => setRoleModal(null)}>Cancel</button>
              <button
                className="btn-primary"
                onClick={handleRoleChange}
                disabled={saving || selectedRole === roleModal.role}
              >
                {saving ? 'Saving…' : 'Update Role'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete User"
        size="small"
      >
        {deleteModal && (
          <div className="delete-confirm">
            <div className="delete-icon"><Trash2 size={40} /></div>
            <p>Are you sure you want to delete <strong>{deleteModal.name}</strong>?</p>
            <p className="delete-warning">This action cannot be undone. All their data will remain in the system.</p>
            <div className="delete-actions">
              <button className="btn-secondary" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete} disabled={saving}>
                {saving ? 'Deleting…' : 'Delete User'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
