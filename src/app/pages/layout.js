"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import "primereact/resources/themes/lara-light-indigo/theme.css"; // theme
import "primereact/resources/primereact.css"; // core css
import "primeicons/primeicons.css"; // icons
import "primeflex/primeflex.css"; // primeflex
import { Button } from "primereact/button";
import { Menubar } from "primereact/menubar";
import { BreadCrumb } from "primereact/breadcrumb";
import { Moon, Sun, Car } from 'lucide-react';
import Image from 'next/image';

const Header = () => {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedDarkMode !== null ? savedDarkMode : systemPrefersDark;
    
    setIsDarkMode(shouldUseDark);
    if (shouldUseDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.documentElement.classList.toggle('dark');
  };

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
      {/* Luxury Logo Container */}
      <div
        style={{
          width: "56px",
          height: "56px",
          background: isDarkMode
            ? "linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)"
            : "linear-gradient(135deg, #1f2937 0%, #374151 100%)",
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isDarkMode
            ? "0 8px 25px -3px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)"
            : "0 8px 25px -3px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          transition: "all 0.3s ease"
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
        }}
      >
        <Car 
          style={{ 
            width: "28px", 
            height: "28px", 
            color: isDarkMode ? "#1f2937" : "#f9fafb" 
          }} 
        />
      </div>
      
      {/* Brand Text */}
      <div className="flex flex-column">
        <span
          style={{
            fontSize: "1.25rem",
            fontWeight: "700",
            color: isDarkMode ? "#f9fafb" : "#1f2937",
            letterSpacing: "0.025em",
            lineHeight: "1.2"
          }}
        >
          LuxeRide
        </span>
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: "300",
            color: isDarkMode ? "#9ca3af" : "#6b7280",
            letterSpacing: "0.05em"
          }}
        >
          Premium Rentals
        </span>
      </div>
    </div>
  );

  const end = (
    <div className="flex align-items-center gap-3">
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        style={{
          background: isDarkMode 
            ? "rgba(55, 65, 81, 0.8)" 
            : "rgba(255, 255, 255, 0.8)",
          border: isDarkMode ? "1px solid #4b5563" : "1px solid #d1d5db",
          borderRadius: "12px",
          padding: "0.75rem",
          cursor: "pointer",
          backdropFilter: "blur(10px)",
          transition: "all 0.2s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isDarkMode
            ? "0 4px 14px 0 rgba(0, 0, 0, 0.2)"
            : "0 4px 14px 0 rgba(0, 0, 0, 0.1)"
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.05)";
          e.target.style.boxShadow = isDarkMode
            ? "0 8px 25px 0 rgba(0, 0, 0, 0.3)"
            : "0 8px 25px 0 rgba(0, 0, 0, 0.15)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.boxShadow = isDarkMode
            ? "0 4px 14px 0 rgba(0, 0, 0, 0.2)"
            : "0 4px 14px 0 rgba(0, 0, 0, 0.1)";
        }}
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <Sun style={{ width: "20px", height: "20px", color: "#fbbf24" }} />
        ) : (
          <Moon style={{ width: "20px", height: "20px", color: "#6b7280" }} />
        )}
      </button>

      {/* Logout Button */}
      <Button
        label="Logout"
        icon="pi pi-power-off"
        className="p-button-rounded font-bold px-4 py-2"
        onClick={() => router.push("/")}
        style={{
          fontSize: "0.95rem",
          background: isDarkMode
            ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
            : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          border: "none",
          color: "#ffffff",
          borderRadius: "12px",
          padding: "0.75rem 1.25rem",
          fontWeight: "600",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 14px 0 rgba(239, 68, 68, 0.3)"
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.02)";
          e.target.style.boxShadow = "0 8px 25px 0 rgba(239, 68, 68, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.boxShadow = "0 4px 14px 0 rgba(239, 68, 68, 0.3)";
        }}
      />
    </div>
  );

  return (
    <header
      style={{
        background: isDarkMode
          ? "linear-gradient(135deg, rgba(31, 41, 55, 0.95) 0%, rgba(17, 24, 39, 0.95) 100%)"
          : "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)",
        backdropFilter: "blur(20px)",
        borderBottom: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
        boxShadow: isDarkMode
          ? "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)"
          : "0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.5)",
        position: "relative",
        zIndex: 1000 // High z-index for header
      }}
      className="border-round-bottom-3xl mb-0.5"
    >
      <div className="flex align-items-center justify-content-between px-4 py-3">
        <Menubar
          model={items}
          start={start}
          end={end}
          className="border-none w-full"
          style={{
            background: "transparent",
            color: isDarkMode ? "#f9fafb" : "#1f2937",
            fontSize: "1rem",
            fontWeight: "500",
            border: "none"
          }}
          pt={{
            root: {
              style: {
                background: "transparent",
                border: "none",
                borderRadius: "0",
                position: "relative",
                zIndex: 1001 // Even higher z-index for menubar root
              }
            },
            menu: {
              style: {
                background: isDarkMode
                  ? "rgba(31, 41, 55, 0.98)"
                  : "rgba(255, 255, 255, 0.98)",
                backdropFilter: "blur(20px)",
                border: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                borderRadius: "12px",
                boxShadow: isDarkMode
                  ? "0 25px 50px -12px rgba(0, 0, 0, 0.8)"
                  : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                padding: "0.5rem",
                zIndex: 9999, // Very high z-index for dropdown menus
                position: "absolute"
              }
            },
            menuitem: {
              style: {
                color: isDarkMode ? "#f9fafb" : "#1f2937",
                borderRadius: "8px",
                margin: "0.125rem 0",
                transition: "all 0.2s ease",
                zIndex: 10000 // Highest z-index for menu items
              }
            },
            submenu: {
              style: {
                background: isDarkMode
                  ? "rgba(31, 41, 55, 0.98)"
                  : "rgba(255, 255, 255, 0.98)",
                backdropFilter: "blur(20px)",
                border: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                borderRadius: "12px",
                boxShadow: isDarkMode
                  ? "0 25px 50px -12px rgba(0, 0, 0, 0.8)"
                  : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                padding: "0.5rem",
                zIndex: 10001, // Highest z-index for submenus
                position: "absolute"
              }
            },
            submenuicon: {
              style: {
                color: isDarkMode ? "#9ca3af" : "#6b7280"
              }
            }
          }}
        />
      </div>
    </header>
  );
};

const Layout = ({ children }) => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sync dark mode state
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);
  }, []);

  // Create breadcrumb items
  const items = segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1),
    url: "/" + segments.slice(0, i + 1).join("/"),
  }));

  const home = { icon: "pi pi-home", url: "/pages/dashboard" };

  return (
    <div 
      className="min-h-screen flex flex-column"
      style={{
        background: isDarkMode
          ? "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)"
          : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)",
        minHeight: "100vh"
      }}
    >
      {/* Background Elements */}
      <div style={{ 
        position: "fixed", 
        inset: "0", 
        overflow: "hidden", 
        zIndex: 1, // Low z-index for background
        pointerEvents: "none" 
      }}>
        <div style={{
          position: "absolute",
          top: "-10%",
          right: "-10%",
          width: "300px",
          height: "300px",
          background: isDarkMode 
            ? "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(40px)"
        }}></div>
        <div style={{
          position: "absolute",
          bottom: "-10%",
          left: "-10%",
          width: "300px",
          height: "300px",
          background: isDarkMode
            ? "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(40px)"
        }}></div>
      </div>

      <Header />

      {/* Enhanced Breadcrumb */}
      <div 
        className="px-4 py-3 border-bottom-1"
        style={{
          background: isDarkMode
            ? "rgba(55, 65, 81, 0.3)"
            : "rgba(248, 250, 252, 0.7)",
          backdropFilter: "blur(10px)",
          borderColor: isDarkMode ? "#374151" : "#e5e7eb",
          position: "relative",
          zIndex: 100 // Medium z-index for breadcrumb
        }}
      >
        <BreadCrumb
          model={items.map((item, index) => ({
            ...item,
            template: (node, options) => (
              <a
                href={item.url}
                aria-current={index === items.length - 1 ? "page" : undefined}
                className={options.className}
                style={{
                  color: isDarkMode ? "#d1d5db" : "#4b5563",
                  textDecoration: "none",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "6px",
                  transition: "all 0.2s ease",
                  fontSize: "0.875rem",
                  fontWeight: index === items.length - 1 ? "600" : "400"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = isDarkMode ? "rgba(55, 65, 81, 0.5)" : "rgba(255, 255, 255, 0.8)";
                  e.target.style.color = isDarkMode ? "#f9fafb" : "#1f2937";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                  e.target.style.color = isDarkMode ? "#d1d5db" : "#4b5563";
                }}
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
                style={{
                  color: isDarkMode ? "#d1d5db" : "#4b5563",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "6px",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = isDarkMode ? "rgba(55, 65, 81, 0.5)" : "rgba(255, 255, 255, 0.8)";
                  e.target.style.color = isDarkMode ? "#f9fafb" : "#1f2937";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "transparent";
                  e.target.style.color = isDarkMode ? "#d1d5db" : "#4b5563";
                }}
              >
                <i className={home.icon} />
              </a>
            ),
          }}
          pt={{
            root: {
              style: {
                background: "transparent",
                border: "none",
                padding: "0"
              }
            }
          }}
        />
      </div>

      <main 
        className="flex-grow-1"
        style={{
          background: isDarkMode
            ? "rgba(17, 24, 39, 0.3)"
            : "rgba(255, 255, 255, 0.3)",
          backdropFilter: "blur(10px)",
          margin: "1rem",
          borderRadius: "16px",
          padding: "1.5rem",
          border: isDarkMode ? "1px solid #374151" : "1px solid #e5e7eb",
          position: "relative",
          zIndex: 10 // Lower z-index for main content
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default Layout;
