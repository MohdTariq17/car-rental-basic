"use client";
import React from "react";
import { Card } from "primereact/card";
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  const styles = {
    dashboardContent: {
      backgroundColor: '#f8f9fa',
      minHeight: 'calc(100vh - 80px)',
      padding: '2rem'
    },
    dashboardHeader: {
      textAlign: 'center',
      marginBottom: '3rem'
    },
    dashboardTitle: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#374151',
      marginBottom: '1rem'
    },
    dashboardSubtitle: {
      fontSize: '1.125rem',
      color: '#6b7280',
      lineHeight: '1.6'
    },
    cardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    dashboardCard: {
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    cardContent: {
      textAlign: 'center',
      padding: '2rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    },
    iconContainer: {
      width: '80px',
      height: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      marginBottom: '1.5rem'
    },
    icon: {
      fontSize: '3rem'
    },
    usersIcon: {
      color: '#3b82f6'
    },
    carsIcon: {
      color: '#10b981'
    },
    bookingsIcon: {
      color: '#f59e0b'
    },
    cardTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    cardDescription: {
      color: '#6b7280',
      fontSize: '1rem'
    }
  };

  const handleCardHover = (e, isHover) => {
    if (isHover) {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
    } else {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '';
    }
  };

  // Navigation handlers
  const navigateToUsers = () => {
    router.push('/pages/users');
  };

  const navigateToCars = () => {
    router.push('/pages/cars');
  };

  const navigateToBookings = () => {
    router.push('/pages/bookings');
  };

  return (
    <div style={styles.dashboardContent}>
      {/* Dashboard Header */}
      <div style={styles.dashboardHeader}>
        <h1 style={styles.dashboardTitle}>Dashboard</h1>
        <p style={styles.dashboardSubtitle}>
          Welcome! Here&apos;s a quick overview of your car rental system.
        </p>
      </div>

      {/* Dashboard Cards */}
      <div style={styles.cardGrid}>
        {/* Users Card */}
        <div 
          style={styles.dashboardCard}
          onMouseEnter={(e) => handleCardHover(e, true)}
          onMouseLeave={(e) => handleCardHover(e, false)}
          onClick={navigateToUsers}
        >
          <Card>
            <div style={styles.cardContent}>
              <div style={styles.iconContainer}>
                <i 
                  className="pi pi-users"
                  style={{...styles.icon, ...styles.usersIcon}}
                ></i>
              </div>
              <h2 style={styles.cardTitle}>Users</h2>
              <p style={styles.cardDescription}>
                Manage all users
              </p>
            </div>
          </Card>
        </div>

        {/* Cars Card */}
        <div 
          style={styles.dashboardCard}
          onMouseEnter={(e) => handleCardHover(e, true)}
          onMouseLeave={(e) => handleCardHover(e, false)}
          onClick={navigateToCars}
        >
          <Card>
            <div style={styles.cardContent}>
              <div style={styles.iconContainer}>
                <i 
                  className="pi pi-car"
                  style={{...styles.icon, ...styles.carsIcon}}
                ></i>
              </div>
              <h2 style={styles.cardTitle}>Cars</h2>
              <p style={styles.cardDescription}>
                View and add cars
              </p>
            </div>
          </Card>
        </div>

        {/* Bookings Card */}
        <div 
          style={styles.dashboardCard}
          onMouseEnter={(e) => handleCardHover(e, true)}
          onMouseLeave={(e) => handleCardHover(e, false)}
          onClick={navigateToBookings}
        >
          <Card>
            <div style={styles.cardContent}>
              <div style={styles.iconContainer}>
                <i 
                  className="pi pi-calendar"
                  style={{...styles.icon, ...styles.bookingsIcon}}
                ></i>
              </div>
              <h2 style={styles.cardTitle}>Bookings</h2>
              <p style={styles.cardDescription}>
                Track reservations
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
