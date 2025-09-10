"use client";
import React, { useEffect, useState } from "react";

const BookingPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching bookings from an API
    const fetchBookings = async () => {
      setLoading(true);
      // Replace with actual API call
      const data = [
        {
          id: 1,
          car: "Toyota Camry",
          date: "2025-08-25",
          status: "Confirmed",
        },
        {
          id: 2,
          car: "Honda Civic",
          date: "2025-08-28",
          status: "Pending",
        },
      ];
      setBookings(data);
      setLoading(false);
    };
    fetchBookings();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>My Bookings</h1>
      {loading ? (
        <p>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Car</th>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Date</th>
              <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td style={{ padding: "0.5rem 0" }}>{booking.car}</td>
                <td>{booking.date}</td>
                <td>{booking.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BookingPage;