import React from 'react';
import NavBar from './NavBar';
import Activelistener from './ActiveListener';

const Dashboard = ({ user, onLogout }) => {
    console.log("Dashboard 1: this is user --->", user);
    return (
        <div>
            <NavBar user={user} onLogout={onLogout} />
            <main>
                <h1>Dashboard</h1>
                <Activelistener user={user} />
            </main>
        </div>
    );
};

export default Dashboard;