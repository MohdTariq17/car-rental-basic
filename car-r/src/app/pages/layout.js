"use client"
import React from 'react';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import "primereact/resources/themes/lara-light-indigo/theme.css";  // theme
import "primereact/resources/primereact.css";                    // core css
import "primeicons/primeicons.css";                             // icons
import "primeflex/primeflex.css";                              // flex & grid

const Header = () => {
    const items = [
        {
            label: 'Home',
            icon: 'pi pi-home'
        },
        {
            label: 'Cars',
            icon: 'pi pi-car'
        },
        {
            label: 'Bookings',
            icon: 'pi pi-calendar'
        }
    ];

    const menubarStyles = {
        padding: '1rem',
        backgroundColor: 'var(--surface-0)',
        borderBottom: '1px solid var(--surface-200)'
    };

    const start = (
        <div className="flex align-items-center gap-2">
            <Avatar 
                icon="pi pi-car" 
                size="large" 
                shape="circle" 
                className="bg-primary"
                style={{ backgroundColor: 'var(--primary-color)' }}
            />
            <span className="font-bold text-xl text-primary">Car Rental</span>
        </div>
    );

    const end = (
        <div className="flex align-items-center gap-3">
            <Avatar 
                label="U" 
                shape="circle" 
                className="bg-primary"
                style={{ backgroundColor: 'var(--primary-color)' }}
            />
            <Button 
                label="Logout" 
                icon="pi pi-sign-out" 
                severity="danger" 
                outlined
                className="p-button-rounded"
            />
        </div>
    );

    return (
        <header className="shadow-2 sticky top-0 z-5">
            <Menubar 
                model={items} 
                start={start} 
                end={end}
                className="border-none"
                style={menubarStyles}
            />
        </header>
    );
}

export default Header;