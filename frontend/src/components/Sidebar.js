import React from 'react';
export default function Sidebar(){
  return (
    <aside className="sidebar">
      <div className="logo">RS-TECH</div>
      <nav>
        <ul>
          <li>Dashboard</li>
          <li className="active-employee">Employee</li>
          <li>Calendar</li>
          <li>Messages</li>
        </ul>
      </nav>
    </aside>
  );
}
