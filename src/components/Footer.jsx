import React from 'react';
import { Heart } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const footerStyle = {
        padding: '1rem 2rem',
        marginTop: 'auto',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
    };

    const creditsStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem'
    };

    return (
        <footer style={footerStyle}>
            <p>&copy; {currentYear} TaskMaster. All Rights Reserved.</p>
            <p style={creditsStyle}>
                Made by OUISSI
            </p>
        </footer>
    );
}