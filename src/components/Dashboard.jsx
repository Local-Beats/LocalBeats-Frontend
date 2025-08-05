import React from 'react';
import Activelistener from './ActiveListener';

const Dashboard = ({ user }) => {
    // console.log("this is user from dashboard---> ", user)
    return (
        <main>
            <h1>Dashboard</h1>
            <Activelistener user={user} />
        </main>
    )
};

export default Dashboard;