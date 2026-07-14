import usePageTitle from '../../hooks/usePageTitle';
import React from 'react';

const Integrations = () => {
    usePageTitle("Integrations");
    return (
        <div style={{ padding: '80px 20px', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '20px', color: '#00d4aa', fontWeight: 'bold' }}>Integrations</h1>
            <p style={{ fontSize: '1.2rem', color: '#9ca3af', maxWidth: '600px', lineHeight: '1.6' }}>
                We are currently building this page. Check back soon for exciting updates and new features!
            </p>
        </div>
    );
};

export default Integrations;
