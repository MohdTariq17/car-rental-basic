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
            label: 'admin',
            icon: 'pi pi-user',
            items: [
                {
                    label: 'Users',
                    icon: 'pi pi-user-plus'
                },
                {
                    label: 'Brands ',
                    icon: 'pi pi-users'
                },
                {
                    label: 'Models',
                    icon: 'pi pi-id-card'
                },
                {
                    label: 'Varients',
                    icon: 'pi pi-car'
                },
                {
                    label: 'States',
                    icon: 'pi pi-palette'
                },
                {
                    label: 'Cities',
                    icon: 'pi pi-fire'
                },
                {
                    label: 'Checklist Categories',
                    icon: 'pi pi-list',
                    
                },
                {
                    label: 'Checklist Items',
                    icon: 'pi pi-list',
                    
                },
                {
                    label: 'Settings',
                    icon: 'pi pi-lock'
                },
                
            ]
        },
        { label: 'Inventory',
            icon: 'pi pi-warehouse',
            items: [
                { label: 'Available Cars', icon: 'pi pi-check' },
                { label: 'Rented Cars', icon: 'pi pi-times' },  
                { label: 'Maintenance', icon: 'pi pi-wrench' },
                { label: 'Add New Car', icon: 'pi pi-plus' },
            ]
        },
        {
            label: 'Bookings',
            icon: 'pi pi-calendar'
        },
        {
            label: 'Customers',
            icon: 'pi pi-users'
        },
        {
            label: 'Reports',
            icon: 'pi pi-chart-bar'
        },
        {
            label: 'Support',
            icon: 'pi pi-question-circle'
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