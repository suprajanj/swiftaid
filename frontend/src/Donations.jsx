import React, { useState, useEffect } from "react";

export default function Donations() {
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({
    resourceRequest: "",
    fullName: "",
    phone: "",
    email: "",
    nic: "",
    address: "",
    district: "",
    city: "",
    quantity: 1,
    bloodGroup: "",
    medicalConditions: "",
    preferredDate: "",
    preferredTime: "",
    isFlexible: true,
    status: "pending",
    adminNotes: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [adminMode, setAdminMode] = useState(false);

  // Load donations
  const loadDonations = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/donations");
      const data = await res.json();
      if (data.success) setDonations(data.data);
    } catch (error) {
      console.error("Error loading donations:", error);
    }
  };

  // Load resource requests
  const loadRequests = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/resources/requests");
      const data = await res.json();
      if (data.success) setRequests(data.data);
    } catch (error) {
      console.error("Error loading requests:", error);
    }
  };

  useEffect(() => {
    loadDonations();
    loadRequests();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ 
      ...form, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  // Admin authentication
  const toggleAdminMode = () => {
    if (!adminMode) {
      const password = prompt("Enter admin password:");
      if (password === "admin123") {
        setAdminMode(true);
        alert("✅ Admin mode enabled");
      } else {
        alert("❌ Invalid password");
      }
    } else {
      setAdminMode(false);
      setEditingId(null);
      resetForm();
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `http://localhost:3000/api/donations/${editingId}`
        : "http://localhost:3000/api/donations";

      // Structure data according to backend schema
      const submitData = {
        resourceRequest: form.resourceRequest,
        donor: {
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          nic: form.nic,
          address: form.address,
          district: form.district,
          city: form.city
        },
        donationDetails: {
          quantity: parseInt(form.quantity),
          bloodGroup: form.bloodGroup || undefined,
          medicalConditions: form.medicalConditions
        },
        availability: {
          preferredDate: form.preferredDate,
          preferredTime: form.preferredTime,
          isFlexible: form.isFlexible
        }
      };

      // Add admin fields only if in admin mode and editing
      if (adminMode && editingId) {
        submitData.status = form.status;
        submitData.adminNotes = form.adminNotes;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert(editingId ? "✅ Donation Updated" : "✅ Donation Created Successfully");
        setEditingId(null);
        resetForm();
        loadDonations();
      } else {
        alert(`❌ Error: ${data.message || 'Failed to save donation'}`);
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("❌ Network error occurred");
    }
  };

  // Generate CSV as fallback if PDF fails
  const generateCSV = () => {
    try {
      // Create CSV headers
      const headers = [
        'Full Name',
        'Phone',
        'Email',
        'NIC',
        'Address',
        'District',
        'City',
        'Quantity',
        'Blood Group',
        'Medical Conditions',
        'Preferred Date',
        'Preferred Time',
        'Flexible',
        'Status',
        'Admin Notes',
        'Created Date'
      ];

      // Create CSV rows
      const rows = donations.map(d => [
        d.donor?.fullName || '',
        d.donor?.phone || '',
        d.donor?.email || '',
        d.donor?.nic || '',
        d.donor?.address || '',
        d.donor?.district || '',
        d.donor?.city || '',
        d.donationDetails?.quantity || '',
        d.donationDetails?.bloodGroup || '',
        d.donationDetails?.medicalConditions || '',
        d.availability?.preferredDate?.split("T")[0] || '',
        d.availability?.preferredTime || '',
        d.availability?.isFlexible ? 'Yes' : 'No',
        d.status || 'pending',
        d.adminNotes || '',
        new Date(d.createdAt).toLocaleDateString()
      ]);

      // Combine headers and rows
      const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      // Create and download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `SwiftAid_Donations_Report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert("✅ CSV report downloaded successfully!");
      
    } catch (error) {
      console.error("CSV generation error:", error);
      alert("❌ Failed to generate CSV report.");
    }
  };

  // Load jsPDF dynamically and generate PDF
  const generatePDF = async () => {
    try {
      console.log('Starting PDF generation...');
      
      // Show loading state
      const originalButtonText = document.querySelector('button[onclick*="generatePDF"]')?.textContent;
      
      // Check if jsPDF is already loaded
      if (!window.jspdf) {
        console.log('Loading jsPDF libraries...');
        
        // Load jsPDF with timeout
        await Promise.race([
          new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = () => {
              console.log('jsPDF core loaded');
              
              // Load AutoTable plugin
              const autoTableScript = document.createElement('script');
              autoTableScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js';
              autoTableScript.onload = () => {
                console.log('AutoTable plugin loaded');
                resolve();
              };
              autoTableScript.onerror = () => reject(new Error('Failed to load AutoTable'));
              document.head.appendChild(autoTableScript);
            };
            script.onerror = () => reject(new Error('Failed to load jsPDF'));
            document.head.appendChild(script);
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout loading libraries')), 10000))
        ]);
        
        // Wait a bit more to ensure everything is ready
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Verify jsPDF is available
      if (!window.jspdf || !window.jspdf.jsPDF) {
        throw new Error('jsPDF not properly loaded');
      }

      console.log('Creating PDF document...');
      
      // Create PDF using the global jsPDF
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // Title
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text("SwiftAid - Donations Report", 14, 20);

      // Add generation date
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

      // Check if we have donations
      if (donations.length === 0) {
        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100);
        doc.text("No donations found.", 14, 50);
      } else {
        // Prepare table columns
        const tableColumn = [
          "Name",
          "Phone",
          "Email",
          "Location",
          "Qty",
          "Blood",
          "Date",
          "Time",
          "Status"
        ];

        // Prepare table rows
        const tableRows = donations.map((d) => [
          d.donor?.fullName || "N/A",
          d.donor?.phone || "N/A",
          d.donor?.email || "N/A",
          `${d.donor?.district || "N/A"}/${d.donor?.city || "N/A"}`,
          d.donationDetails?.quantity || "N/A",
          d.donationDetails?.bloodGroup || "N/A",
          d.availability?.preferredDate?.split("T")[0] || "N/A",
          d.availability?.preferredTime || "N/A",
          d.status || "Pending",
        ]);

        console.log('Adding table to PDF...');

        // Generate table with improved styling
        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 40,
          styles: { 
            fontSize: 8,
            cellPadding: 2,
            overflow: 'linebreak'
          },
          headStyles: { 
            fillColor: [76, 175, 80],
            textColor: [255, 255, 255],
            fontSize: 9,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          columnStyles: {
            0: { cellWidth: 20 }, // Name
            1: { cellWidth: 22 }, // Phone
            2: { cellWidth: 25 }, // Email
            3: { cellWidth: 22 }, // Location
            4: { cellWidth: 12 }, // Quantity
            5: { cellWidth: 15 }, // Blood Group
            6: { cellWidth: 18 }, // Date
            7: { cellWidth: 18 }, // Time
            8: { cellWidth: 18 }  // Status
          }
        });
      }

      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 30, doc.internal.pageSize.getHeight() - 10);
        doc.text(`Total Donations: ${donations.length}`, 14, doc.internal.pageSize.getHeight() - 10);
      }

      console.log('Saving PDF...');
      
      // Save PDF
      doc.save(`SwiftAid_Donations_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
      alert("✅ PDF downloaded successfully!");

    } catch (error) {
      console.error("PDF generation error:", error);
      
      // Offer CSV as fallback
      if (window.confirm("❌ PDF generation failed. Would you like to download a CSV report instead?")) {
        generateCSV();
      } else {
        alert("❌ Failed to generate PDF. Please check your internet connection and try again.");
      }
    }
  };

  // Handle admin status update only
  const handleStatusUpdate = async () => {
    if (!editingId) return;

    try {
      const res = await fetch(`http://localhost:3000/api/donations/${editingId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: form.status,
          adminNotes: form.adminNotes,
          rejectionReason: form.status === 'rejected' ? 'Admin decision' : undefined
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("✅ Status Updated Successfully");
        setEditingId(null);
        resetForm();
        loadDonations();
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Status update error:", error);
      alert("❌ Network error occurred");
    }
  };

  // Reset form
  const resetForm = () => {
    setForm({
      resourceRequest: "",
      fullName: "",
      phone: "",
      email: "",
      nic: "",
      address: "",
      district: "",
      city: "",
      quantity: 1,
      bloodGroup: "",
      medicalConditions: "",
      preferredDate: "",
      preferredTime: "",
      isFlexible: true,
      status: "pending",
      adminNotes: "",
    });
  };

  // Edit donation
  const handleEdit = (d) => {
    setForm({
      resourceRequest: d.resourceRequest?._id || "",
      fullName: d.donor?.fullName || "",
      phone: d.donor?.phone || "",
      email: d.donor?.email || "",
      nic: d.donor?.nic || "",
      address: d.donor?.address || "",
      district: d.donor?.district || "",
      city: d.donor?.city || "",
      quantity: d.donationDetails?.quantity || 1,
      bloodGroup: d.donationDetails?.bloodGroup || "",
      medicalConditions: d.donationDetails?.medicalConditions || "",
      preferredDate: d.availability?.preferredDate?.split("T")[0] || "",
      preferredTime: d.availability?.preferredTime || "",
      isFlexible: d.availability?.isFlexible ?? true,
      status: d.status || "pending",
      adminNotes: d.adminNotes || "",
    });
    setEditingId(d._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete donation
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this donation?")) return;
    
    try {
      const res = await fetch(`http://localhost:3000/api/donations/${id}`, {
        method: "DELETE",
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        alert("✅ Donation deleted successfully");
        loadDonations();
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("❌ Network error occurred");
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FFA726';
      case 'approved': return '#66BB6A';
      case 'contacted': return '#42A5F5';
      case 'completed': return '#4CAF50';
      case 'rejected': return '#F44336';
      case 'cancelled': return '#9E9E9E';
      default: return '#FFA726';
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "#f9f9f9", 
      color: "#222", 
      padding: "0",
      width: "100vw",
      boxSizing: "border-box",
      overflowX: "hidden"
    }}>
      <div style={{ padding: "50px", maxWidth: "95%", width: "100%" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h1 style={{ fontSize: "2.5rem", margin: 0 }}>💖 Donations Management</h1>
          
          <div style={{ display: "flex", gap: "15px" }}>
            <button
              onClick={toggleAdminMode}
              style={{
                padding: "12px 24px",
                backgroundColor: adminMode ? "#f44336" : "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "16px"
              }}
            >
              {adminMode ? "👤 Exit Admin" : "👨‍💼 Admin Mode"}
            </button>

            {adminMode && (
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={generatePDF}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#2196F3",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  📄 Download PDF
                </button>
                
                <button
                  onClick={generateCSV}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  📊 Download CSV
                </button>
              </div>
            )}
          </div>
        </div>

        {/* User Donation Form */}
        {!adminMode && (
          <div style={{ 
            background: "#f9f9f9", 
            padding: "30px", 
            borderRadius: "12px", 
            marginBottom: "30px", 
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            width: "100%",
            boxSizing: "border-box"
          }}>
            <h2 style={{ marginBottom: "25px", color: "#4CAF50" }}>
              📝 {editingId ? "Update Donation" : "Submit New Donation Offer"}
            </h2>
            
            <div onSubmit={handleSubmit}>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
                gap: "20px",
                width: "100%"
              }}>
                
                {/* Resource Request Selection */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#070707ff" }}>
                    Resource Request *
                  </label>
                  <select 
                    name="resourceRequest" 
                    value={form.resourceRequest} 
                    onChange={handleChange} 
                    required 
                    style={inputStyle}
                  >
                    <option value="">-- Select Resource Request --</option>
                    {requests.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.organizationName} - {r.resourceType} ({r.urgencyLevel})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Personal Information */}
                <div>
                  <label style={labelStyle}>Full Name *</label>
                  <input 
                    name="fullName" 
                    placeholder="Enter your full name" 
                    value={form.fullName} 
                    onChange={handleChange} 
                    required 
                    style={inputStyle} 
                  />
                </div>

                <div>
                  <label style={labelStyle}>Phone Number *</label>
                  <input 
                    name="phone" 
                    placeholder="e.g., +94712345678" 
                    value={form.phone} 
                    onChange={handleChange} 
                    required 
                    style={inputStyle} 
                  />
                </div>

                <div>
                  <label style={labelStyle}>Email Address *</label>
                  <input 
                    name="email" 
                    type="email" 
                    placeholder="your.email@example.com" 
                    value={form.email} 
                    onChange={handleChange} 
                    required 
                    style={inputStyle} 
                  />
                </div>

                <div>
                  <label style={labelStyle}>NIC Number *</label>
                  <input 
                    name="nic" 
                    placeholder="e.g., 199812345678" 
                    value={form.nic} 
                    onChange={handleChange} 
                    required 
                    style={inputStyle} 
                  />
                </div>

                <div>
                  <label style={labelStyle}>District *</label>
                  <input 
                    name="district" 
                    placeholder="e.g., Colombo" 
                    value={form.district} 
                    onChange={handleChange} 
                    required 
                    style={inputStyle} 
                  />
                </div>

                <div>
                  <label style={labelStyle}>City *</label>
                  <input 
                    name="city" 
                    placeholder="e.g., Mount Lavinia" 
                    value={form.city} 
                    onChange={handleChange} 
                    required 
                    style={inputStyle} 
                  />
                </div>

                {/* Address */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Full Address *</label>
                  <input 
                    name="address" 
                    placeholder="Complete address with street, lane, etc." 
                    value={form.address} 
                    onChange={handleChange} 
                    required 
                    style={inputStyle} 
                  />
                </div>

                {/* Donation Details */}
                <div>
                  <label style={labelStyle}>Quantity *</label>
                  <input 
                    type="number" 
                    name="quantity" 
                    placeholder="How many units?" 
                    value={form.quantity} 
                    onChange={handleChange} 
                    required 
                    min="1" 
                    style={inputStyle} 
                  />
                </div>

                <div>
                  <label style={labelStyle}>Blood Group (if applicable)</label>
                  <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} style={inputStyle}>
                    <option value="">-- Select Blood Group --</option>
                    <option value="A+">A+</option><option value="A-">A-</option>
                    <option value="B+">B+</option><option value="B-">B-</option>
                    <option value="AB+">AB+</option><option value="AB-">AB-</option>
                    <option value="O+">O+</option><option value="O-">O-</option>
                  </select>
                </div>

                {/* Medical Conditions */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>Medical Conditions / Allergies (Optional)</label>
                  <textarea 
                    name="medicalConditions" 
                    placeholder="Any medical conditions or allergies we should know about..." 
                    value={form.medicalConditions} 
                    onChange={handleChange} 
                    style={{...inputStyle, minHeight: "100px", resize: "vertical"}} 
                  />
                </div>

                {/* Availability */}
                <div>
                  <label style={labelStyle}>Preferred Date *</label>
                  <input 
                    type="date" 
                    name="preferredDate" 
                    value={form.preferredDate} 
                    onChange={handleChange} 
                    required 
                    style={inputStyle} 
                  />
                </div>

                <div>
                  <label style={labelStyle}>Preferred Time *</label>
                  <select name="preferredTime" value={form.preferredTime} onChange={handleChange} required style={inputStyle}>
                    <option value="">-- Select Time Slot --</option>
                    <option value="morning">🌅 Morning (8AM - 12PM)</option>
                    <option value="afternoon">🌞 Afternoon (12PM - 5PM)</option>
                    <option value="evening">🌙 Evening (5PM - 8PM)</option>
                  </select>
                </div>

                {/* Flexibility */}
                <div style={{ display: "flex", alignItems: "center", gap: "15px", gridColumn: "1 / -1" }}>
                  <input 
                    type="checkbox" 
                    name="isFlexible" 
                    checked={form.isFlexible} 
                    onChange={handleChange} 
                    id="flexible"
                    style={{ transform: "scale(1.2)" }}
                  />
                  <label htmlFor="flexible" style={{ color: "#000000ff", fontSize: "16px" }}>
                    I'm flexible with the timing if needed
                  </label>
                </div>

                {/* Submit Button */}
                <button 
                  onClick={handleSubmit}
                  style={{...submitButton, gridColumn: "1 / -1", fontSize: "18px", padding: "18px"}}
                >
                  {editingId ? "✏️ Update Donation" : "➕ Submit Donation Offer"}
                </button>

                {editingId && (
                  <button 
                    onClick={() => {setEditingId(null); resetForm();}}
                    style={{...cancelButton, gridColumn: "1 / -1"}}
                  >
                    ❌ Cancel Update
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Admin Status Update Section */}
        {adminMode && editingId && (
          <div style={{ 
            background: "linear-gradient(135deg, #f3e2dbff 0%, #c0b9b6ff 100%)", 
            padding: "25px", 
            borderRadius: "12px", 
            marginBottom: "25px", 
            border: "2px solid #FF9800",
            boxShadow: "0 4px 20px rgba(255,152,0,0.2)"
          }}>
            <h3 style={{ marginBottom: "20px", color: "#FFA726" }}>🛠 Admin Panel: Update Donation Status</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={labelStyle}>Status</label>
                <select name="status" value={form.status} onChange={handleChange} style={inputStyle}>
                  <option value="pending">🕐 Pending Review</option>
                  <option value="approved">✅ Approved</option>
                  <option value="contacted">📞 Donor Contacted</option>
                  <option value="completed">🎉 Donation Completed</option>
                  <option value="cancelled">🚫 Cancelled</option>
                </select>
              </div>
              
              <div></div>
              
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Admin Notes</label>
                <textarea 
                  name="adminNotes" 
                  placeholder="Add notes about this donation, contact details, etc..." 
                  value={form.adminNotes} 
                  onChange={handleChange} 
                  style={{...inputStyle, minHeight: "120px"}} 
                />
              </div>
              
              <button 
                onClick={handleStatusUpdate} 
                style={{...submitButton, backgroundColor: "#FF9800"}}
              >
                🔄 Update Status
              </button>
              
              <button 
                onClick={() => {setEditingId(null); resetForm();}} 
                style={cancelButton}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        )}

        {/* Donations List */}
        <div style={{ marginTop: "40px" }}>
          <h2 style={{ marginBottom: "25px", fontSize: "2rem", color: "#4CAF50" }}>
            📌 All Donations ({donations.length})
          </h2>
          
          {donations.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: "60px 20px", 
              background: "#ffffff", 
              borderRadius: "12px",
              color: "#666" 
            }}>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "15px" }}>📭 No donations yet</h3>
              <p style={{ fontSize: "1.1rem" }}>Be the first to submit a donation offer and help those in need!</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "25px" }}>
              {donations.map((d) => (
                <div key={d._id} style={cardStyle}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                    
                    {/* Left Column - Personal Info */}
                    <div>
                      <h3 style={{ margin: "0 0 15px 0", color: "#4CAF50", fontSize: "1.4rem" }}>
                        👤 {d.donor?.fullName}
                      </h3>
                      <div style={{ lineHeight: "1.6" }}>
                        <p><strong>📞 Phone:</strong> {d.donor?.phone}</p>
                        <p><strong>📧 Email:</strong> {d.donor?.email}</p>
                        <p><strong>🆔 NIC:</strong> {d.donor?.nic}</p>
                        <p><strong>📍 Location:</strong> {d.donor?.city}, {d.donor?.district}</p>
                        <p><strong>🏠 Address:</strong> {d.donor?.address}</p>
                      </div>
                    </div>
                    
                    {/* Right Column - Donation Details */}
                    <div>
                      <h4 style={{ color: "#FFA726", marginBottom: "15px" }}>📋 Donation Details</h4>
                      <div style={{ lineHeight: "1.6" }}>
                        <p><strong>📦 Quantity:</strong> {d.donationDetails?.quantity} units</p>
                        {d.donationDetails?.bloodGroup && (
                          <p><strong>🩸 Blood Group:</strong> {d.donationDetails?.bloodGroup}</p>
                        )}
                        <p><strong>⏰ Preferred:</strong> {d.availability?.preferredDate?.split("T")[0]} ({d.availability?.preferredTime})</p>
                        <p><strong>🔄 Flexible:</strong> {d.availability?.isFlexible ? "Yes" : "No"}</p>
                        <p><strong>🏥 For Request:</strong> {d.resourceRequest?.organizationName || "N/A"}</p>
                        {d.donationDetails?.medicalConditions && (
                          <p><strong>⚕️ Medical Notes:</strong> {d.donationDetails.medicalConditions}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Status and Actions */}
                  <div style={{ 
                    paddingTop: "20px", 
                    borderTop: "2px solid #ccc",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "15px"
                  }}>
                    <div>
                      <p style={{ margin: "0 0 10px 0" }}>
                        <strong>Status:</strong>{" "}
                        <span style={{ 
                          color: getStatusColor(d.status),
                          fontWeight: "bold",
                          textTransform: "uppercase",
                          fontSize: "1.1rem",
                          padding: "4px 12px",
                          borderRadius: "20px",
                          background: `${getStatusColor(d.status)}20`
                        }}>
                          {d.status || "pending"}
                        </span>
                      </p>
                      
                      {d.adminNotes && (
                        <p style={{ margin: 0, color: "#FFA726" }}>
                          <strong>📝 Admin Notes:</strong> {d.adminNotes}
                        </p>
                      )}
                      
                      <p style={{ margin: "10px 0 0 0", fontSize: "0.9rem", color: "#888" }}>
                        <strong>Created:</strong> {new Date(d.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button 
                        onClick={() => handleEdit(d)} 
                        style={editButton}
                      >
                        ✏️ {adminMode ? "Admin Edit" : "Edit"}
                      </button>
                      
                      {(adminMode || d.status === 'pending') && (
                        <button 
                          onClick={() => handleDelete(d._id)} 
                          style={deleteButton}
                        >
                          🗑 Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Styles
const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "8px",
  border: "2px solid #444",
  background: "#f9f9f9",
  color: "#000",
  fontSize: "16px",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
  boxSizing: "border-box"
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "600",
  color: "#000000ff",
  fontSize: "14px"
};

const submitButton = {
  padding: "15px 25px",
  background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "16px",
  transition: "transform 0.2s",
  boxShadow: "0 4px 15px rgba(76,175,80,0.3)"
};

const cancelButton = {
  padding: "15px 25px",
  background: "#666",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "16px",
};

const cardStyle = {
  background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
  padding: "30px",
  borderRadius: "15px",
  boxShadow: "0 8px 25px rgba(255, 255, 255, 1)",
  border: "1px solid #ccc",
  transition: "transform 0.2s, box-shadow 0.2s"
};

const editButton = {
  background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
  border: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
  transition: "transform 0.2s"
};

const deleteButton = {
  background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
  border: "none",
  padding: "12px 20px",
  borderRadius: "8px",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
  transition: "transform 0.2s"
};