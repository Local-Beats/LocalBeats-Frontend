import React from 'react';
import './Admin.css';
import ActiveProjects from './ActiveProjects';
import OverviewCards from './OverviewCards';

const Admin = () => {
  return (
    
        <div className="dashboard">
        <OverviewCards />
        <ActiveProjects />
        </div>
    
  );
};

export default Admin;

