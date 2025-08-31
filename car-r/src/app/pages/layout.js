"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import "primereact/resources/themes/lara-light-indigo/theme.css"; // theme
import "primereact/resources/primereact.css"; // core css
import "primeicons/primeicons.css"; // icons
import "primeflex/primeflex.css"; // primeflex
import { Button } from "primereact/button";
import { Menubar } from "primereact/menubar";
import { BreadCrumb } from "primereact/breadcrumb";
import Image from 'next/image';

const Header = () => {
  const router = useRouter();

  const items = [
    {
      label: "Home",
      icon: "pi pi-fw pi-home",
      command: () => router.push("/pages/dashboard"),
    },
    {
      label: "Admin",
      icon: "pi pi-fw pi-user",
      items: [
        {
          label: "Users",
          icon: "pi pi-fw pi-users",
          command: () => router.push("/pages/users"),
        },
        {
          label: "Brands",
          icon: "pi pi-fw pi-car",
          command: () => router.push("/pages/brands"),
        },
        {
          label: "Models",
          icon: "pi pi-fw pi-car",
          command: () => router.push("/pages/models"),
        },
        {
          label: "Variants",
          icon: "pi pi-fw pi-car",
          command: () => router.push("/pages/varients"),
        },
        {
          label: "States",
          icon: "pi pi-fw pi-map-marker",
          command: () => router.push("/pages/states"),
        },
        {
          label: "Cities",
          icon: "pi pi-fw pi-map-marker",
          command: () => router.push("/pages/cities"),
        },
        {
          label: "Checklist Category",
          icon: "pi pi-fw pi-check-square",
          command: () => router.push("/pages/checklistcategories"),
        },
        {
          label: "Checklist Items",
          icon: "pi pi-fw pi-check-square",
          command: () => router.push("/pages/checklistitems"),
        },
        {
          label: "Settings",
          icon: "pi pi-fw pi-cog",
          command: () => router.push("/pages/settings"),
        },
      ],
    },
    {
      label: "Inventory",
      icon: "pi pi-fw pi-warehouse",
      items: [
        {
          label: "Pending Vehicles",
          icon: "pi pi-fw pi-clock",
          command: () => router.push("/pages/inventory/addcars"),
        },
        {
          label: "Available Vehicles",
          icon: "pi pi-fw pi-check",
          command: () => router.push("/pages/inventory/available"),
        },
        {
          label: "Rented Vehicles",
          icon: "pi pi-fw pi-car",
          command: () => router.push("/pages/inventory/rented"),
        },
        {
          label: "Maintenance",
          icon: "pi pi-fw pi-wrench",
          command: () => router.push("/pages/inventory/maintenance"),
        },
        
      ],
    },
    {
      label: "Bookings",
      icon: "pi pi-fw pi-calendar",
      command: () => router.push("/pages/bookings"),
    },
    {
      label: "Hosters",
      icon: "pi pi-fw pi-users",
      command: () => router.push("/pages/hoster"),
    },
    {
      label: "Customers",
      icon: "pi pi-fw pi-users",
      command: () => router.push("/pages/customers"),
    },
    {
      label: "Billing",
      icon: "pi pi-fw pi-dollar",
      command: () => router.push("/pages/billing"),
    },
    {
      label: "Reports",
      icon: "pi pi-fw pi-chart-bar",
      command: () => router.push("/pages/reports"),
    },
  ];

   const start = (
    <div className="flex align-items-center gap-4">
      <Image
        src="https://img.icons8.com/color/64/000000/car--v2.png" // Replace with your logo URL
        alt="Car rental logo"
        width={64}
        height={64}
        priority // Optional: loads image with high priority
      />
    </div>
  );

  const end = (
    <Button
      label="Logout"
      icon="pi pi-power-off"
      severity="danger"
      className="p-button-rounded font-bold px-5 py-1"
      onClick={() => router.push("/")}
      style={{ fontSize: "1rem" }}
    />
  );

  return (
    <header className="surface-0 shadow-5 border-round-bottom-3xl mb-0.5">
      <div className="flex align-items-center justify-content-between px-2 py-3 bg-white">
        <Menubar
          model={items}
          start={start}
          end={end}
          className="border-none w-full bg-transparent"
          style={{
            background: "white",
            color: "#120202ff",
            fontSize: "1.1rem",
            fontWeight: "600",
          }}
        />
      </div>
    </header>
  );
};

const Layout = ({ children }) => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Create breadcrumb items
  const items = segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1),
    url: "/" + segments.slice(0, i + 1).join("/"),
  }));

  const home = { icon: "pi pi-home", url: "/pages/dashboard" };

  return (
    <div className="min-h-screen flex flex-column">
      <Header />

      {/* 🔹 Breadcrumb */}
      <div className="px-3 py-2 bg-gray-50 border-bottom-1 border-gray-200">
        <BreadCrumb
          model={items.map((item, index) => ({
            ...item,
            template: (node, options) => (
              <a
                href={item.url}
                aria-current={index === items.length - 1 ? "page" : undefined}
                className={options.className}
              >
                {item.label}
              </a>
            ),
          }))}
          home={{
            ...home,
            template: (node, options) => (
              <a
                href={home.url}
                aria-current={pathname === home.url ? "page" : undefined}
                className={options.className}
              >
                <i className={home.icon} />
              </a>
            ),
          }}
        />

      </div>

      <main className="flex-grow-1">{children}</main>
    </div>
  );
};

export default Layout;