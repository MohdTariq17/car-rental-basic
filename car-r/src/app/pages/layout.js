"use client"
import React from 'react';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { Avatar } from 'primereact/avatar';
import { useRouter } from 'next/navigation';
import { AvatarGroup } from 'primereact/avatargroup';   //Optional for grouping
import "primereact/resources/themes/lara-light-indigo/theme.css";  // theme
import "primereact/resources/primereact.css";                    // core css
import "primeicons/primeicons.css";                             // icons
import "primeflex/primeflex.css";                              // flex & grid

const Header = () => {
    const router = useRouter();
    const items = [
        {
            label: 'Home',
            icon: 'pi pi-home',
            command: () => { router.push('/pages/dashboard'); }
        },
        {
            label: 'Admin',
            icon: 'pi pi-user',
            items: [
                {
                    label: 'Users',
                    icon: 'pi pi-user-plus',
                    command: () => { router.push('/pages/users'); }
                },
                {
                    label: 'Brands ',
                    icon: 'pi pi-users',
                    command: () => { router.push('/pages/admin/brands'); }
                },
                {
                    label: 'Models',
                    icon: 'pi pi-id-card',
                    command: () => { router.push('/pages/admin/models'); }
                },
                {
                    label: 'Varients',
                    icon: 'pi pi-car',
                    command: () => { router.push('/pages/admin/varients'); }
                },
                {
                    label: 'States',
                    icon: 'pi pi-map-marker',
                    command: () => { router.push('/pages/admin/states'); }
                },
                {
                    label: 'Cities',
                    icon: 'pi pi-map-marker',
                    command: () => { router.push('/pages/admin/cities'); }
                },
                {
                    label: 'Checklist Categories',
                    icon: 'pi pi-list',
                    command: () => { router.push('/pages/admin/checklistcategories'); }

                },
                {
                    label: 'Checklist Items',
                    icon: 'pi pi-list',
                    command: () => { router.push('/pages/admin/checklistitems'); }

                },
              
            ]
        },
        { label: 'Inventory',
            icon: 'pi pi-warehouse',
            items: [
                { label: 'Available Cars', icon: 'pi pi-check', command: () => { router.push('/pages/inventory/available'); } },
                { label: 'Rented Cars', icon: 'pi pi-times', command: () => { router.push('/pages/inventory/rented'); } },
                { label: 'Maintenance', icon: 'pi pi-wrench', command: () => { router.push('/pages/inventory/maintenance'); } },
                { label: 'Add New Car', icon: 'pi pi-plus', command: () => { router.push('/pages/inventory/addcars'); } },
            ]
        },
        {
            label: 'Bookings',
            icon: 'pi pi-calendar',
            command: () => { router.push('/pages/bookings'); }
        },
        {
            label: 'Customers',
            icon: 'pi pi-users',
            command: () => { router.push('/pages/customers'); }
        },
        {
            label: 'Reports',
            icon: 'pi pi-chart-bar',
            command: () => { router.push('/pages/reports'); }
        },
        {
            label: 'Support',
            icon: 'pi pi-question-circle',
            command: () => { router.push('/pages/support'); }
        },
        {
            label: 'Settings',
            icon: 'pi pi-cog',
            command: () => { router.push('/pages/settings'); }
        },
                
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
                label="A" 
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