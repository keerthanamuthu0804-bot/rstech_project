// EmployeeList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import EmployeeModal from './EmployeeModal'; 

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null); // for edit mode

  // load all employees
  const fetchAllEmployees = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/employees');
      setEmployees(res.data);
    } catch (err) {
      console.error('fetch all error', err);
      setEmployees([]);
    }
  };

  useEffect(() => {
    fetchAllEmployees();
  }, []);

  // search handler — pass reference (NOT call)
  const handleSearch = async (id) => {
    if (!id) return;
    try {
      const res = await axios.get(`http://localhost:4000/api/employees/${encodeURIComponent(id)}`);
      // if found, show only that employee
      setEmployees([res.data]);
    } catch (err) {
      // not found -> show message and reload all
      alert('Employee not found');
      fetchAllEmployees();
    }
  };

  // open add modal
  const handleAddOpen = () => {
    setSelected(null);
    setModalOpen(true);
  };

  // open edit modal when clicking an employee (optional)
  const handleEdit = (emp) => {
    setSelected(emp);
    setModalOpen(true);
  };

  // called after save in modal
  const handleSaved = () => {
    fetchAllEmployees();
  };

  return (
    <div>
      <Header onAdd={handleAddOpen} onSearch={handleSearch} />

      <ul>
        {employees.map(emp => (
          <li
            key={emp.id}
            style={{ cursor: 'pointer', padding: 8, borderBottom: '1px solid #eee' }}
            onClick={() => handleEdit(emp)}
          >
            <strong>{emp.id}</strong> — {emp.name} ({emp.department || '—'})
          </li>
        ))}
      </ul>

      <EmployeeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          handleSaved();
          setModalOpen(false);
        }}
        initial={selected}
      />
    </div>
  );
}
