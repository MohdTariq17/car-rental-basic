"use client";
import React, { useState } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputSwitch } from "primereact/inputswitch";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: "My Car Rental",
    currency: "USD",
    timezone: "GMT+5:30",
    minRentalDays: 1,
    maxRentalDays: 30,
    tax: 18,
    autoApproveBooking: true,
    paymentGateway: "Stripe",
    emailNotifications: true,
  });

  const currencies = [
    { label: "USD ($)", value: "USD" },
    { label: "INR (₹)", value: "INR" },
    { label: "EUR (€)", value: "EUR" },
  ];

  const gateways = [
    { label: "Stripe", value: "Stripe" },
    { label: "PayPal", value: "PayPal" },
    { label: "Razorpay", value: "Razorpay" },
  ];

  const saveSettings = () => {
    console.log("Saved Settings:", settings);
    alert("Settings saved successfully ✅");
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">⚙️ Car Rental Settings</h2>
      <TabView>
        {/* General Settings */}
        <TabPanel header="General">
          <div className="p-fluid grid gap-3">
            <div className="col-12 md:col-6">
              <label>Company Name</label>
              <InputText
                value={settings.companyName}
                onChange={(e) =>
                  setSettings({ ...settings, companyName: e.target.value })
                }
              />
            </div>
            <div className="col-12 md:col-6">
              <label>Currency</label>
              <Dropdown
                value={settings.currency}
                options={currencies}
                onChange={(e) =>
                  setSettings({ ...settings, currency: e.value })
                }
                placeholder="Select Currency"
              />
            </div>
            <div className="col-12 md:col-6">
              <label>Timezone</label>
              <InputText
                value={settings.timezone}
                onChange={(e) =>
                  setSettings({ ...settings, timezone: e.target.value })
                }
              />
            </div>
          </div>
          <Divider />
          <Button label="Save General Settings" onClick={saveSettings} />
        </TabPanel>

        {/* Car Settings */}
        <TabPanel header="Car Settings">
          <div className="p-fluid grid gap-3">
            <div className="col-12 md:col-6">
              <label>Min Rental Days</label>
              <InputNumber
                value={settings.minRentalDays}
                onValueChange={(e) =>
                  setSettings({ ...settings, minRentalDays: e.value })
                }
                min={1}
              />
            </div>
            <div className="col-12 md:col-6">
              <label>Max Rental Days</label>
              <InputNumber
                value={settings.maxRentalDays}
                onValueChange={(e) =>
                  setSettings({ ...settings, maxRentalDays: e.value })
                }
                min={1}
              />
            </div>
          </div>
          <Divider />
          <Button label="Save Car Settings" onClick={saveSettings} />
        </TabPanel>

        {/* Booking Settings */}
        <TabPanel header="Booking">
          <div className="p-fluid grid gap-3">
            <div className="col-12">
              <label>Auto Approve Bookings</label>
              <InputSwitch
                checked={settings.autoApproveBooking}
                onChange={(e) =>
                  setSettings({ ...settings, autoApproveBooking: e.value })
                }
              />
            </div>
          </div>
          <Divider />
          <Button label="Save Booking Settings" onClick={saveSettings} />
        </TabPanel>

        {/* Payment Settings */}
        <TabPanel header="Payment">
          <div className="p-fluid grid gap-3">
            <div className="col-12 md:col-6">
              <label>Default Tax (%)</label>
              <InputNumber
                value={settings.tax}
                onValueChange={(e) =>
                  setSettings({ ...settings, tax: e.value })
                }
                suffix="%"
              />
            </div>
            <div className="col-12 md:col-6">
              <label>Payment Gateway</label>
              <Dropdown
                value={settings.paymentGateway}
                options={gateways}
                onChange={(e) =>
                  setSettings({ ...settings, paymentGateway: e.value })
                }
              />
            </div>
          </div>
          <Divider />
          <Button label="Save Payment Settings" onClick={saveSettings} />
        </TabPanel>

        {/* Notification Settings */}
        <TabPanel header="Notifications">
          <div className="p-fluid grid gap-3">
            <div className="col-12">
              <label>Email Notifications</label>
              <InputSwitch
                checked={settings.emailNotifications}
                onChange={(e) =>
                  setSettings({ ...settings, emailNotifications: e.value })
                }
              />
            </div>
          </div>
          <Divider />
          <Button label="Save Notification Settings" onClick={saveSettings} />
        </TabPanel>
      </TabView>
    </div>
  );
}