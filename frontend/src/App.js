import React, { useEffect, useState } from 'react';
import './styles.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import EmployeeTable from './components/EmployeeTable';
import EmployeeModal from './components/EmployeeModal';
import ConfirmModal from './components/ConfirmModal';
import ViewEmployee from './components/ViewEmployee';

export default function App(){
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [viewing, setViewing] = useState(null);

  const API = 'http://localhost:4000';

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/employees`);
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      setEmployees([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleAdd = () => { setEditing(null); setModalOpen(true); };
  const handleEdit = (emp) => { setEditing(emp); setModalOpen(true); };
  const handleView = (emp) => { setViewing(emp); };
  const handleDelete = (id) => { setToDelete(id); setConfirmOpen(true); };

  const confirmDelete = async (yes) => {
    setConfirmOpen(false);
    if (!yes) return;
    try {
      await fetch(`${API}/api/employees/${toDelete}`, { method: 'DELETE' });
      fetchEmployees();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="app-root">
      <Sidebar />
      <main className="main-area">
        <Header onAdd={handleAdd} />
        <section className="content">
          <h1 className="page-title">Employee</h1>
          <EmployeeTable
            employees={employees}
            loading={loading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </section>
      </main>

      <EmployeeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => { setModalOpen(false); fetchEmployees(); }}
        initial={editing}
      />

      <ConfirmModal
        open={confirmOpen}
        title="Delete employee"
        message="Are you sure you want to delete this employee?"
        onClose={(yes) => confirmDelete(yes)}
      />

      <ViewEmployee
        employee={viewing}
        onClose={() => setViewing(null)}
        onEdit={(e) => { setViewing(null); handleEdit(e); }}
      />
    </div>
  );
}
