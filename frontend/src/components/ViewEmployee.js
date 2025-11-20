import React from 'react';

export default function ViewEmployee({ employee, onClose, onEdit }) {
  if (!employee) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>View Employee Details</h3>
        <div style={{display:'flex', gap:20}}>
          <div>
            {employee.image_path ? <img src={`http://localhost:4000${employee.image_path}`} alt={employee.name} style={{width:120,height:120,borderRadius:8}}/> :
              <div style={{width:120,height:120,background:'#eee'}}/>}
          </div>
          <div style={{flex:1}}>
            <div className="view-row"><strong>Name:</strong> {employee.name}</div>
            <div className="view-row"><strong>Employee ID:</strong> {employee.id}</div>
            <div className="view-row"><strong>Department:</strong> {employee.department}</div>
            <div className="view-row"><strong>Designation:</strong> {employee.designation}</div>
            <div className="view-row"><strong>Project:</strong> {employee.project}</div>
            <div className="view-row"><strong>Type:</strong> {employee.type}</div>
            <div className="view-row"><strong>Status:</strong> {employee.status}</div>
          </div>
        </div>

        <div style={{display:'flex', justifyContent:'flex-end', gap:10, marginTop:16}}>
          <button className="btn" onClick={onClose}>Close</button>
          <button className="btn primary" onClick={() => onEdit(employee)}>Edit</button>
        </div>
      </div>
    </div>
  );
}
