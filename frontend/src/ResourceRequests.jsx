import React, { useState, useEffect } from "react";

export default function ResourceRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  // Form matches your desired UI fields (flat),
  // but we will map it to backend nested schema on submit.
  const [form, setForm] = useState({
    // Organization & Contact (flat)
    organizationName: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    address: "",
    district: "",
    city: "",

    // Request attributes
    emergencyType: "medical",
    organizationType: "hospital",
    urgencyLevel: "medium",
    resourceType: "blood",
    bloodGroup: "",

    // Quantities & details
    quantity: 1,
    unit: "",
    description: "",
    requiredBy: "",

    // Backend-valid status enum
    status: "pending", // pending | in_progress | completed | cancelled
    additionalNotes: "",

  });

  // Map emergencyType -> category as backend expects
  const categoryFromEmergencyType = (v) => {
    const map = {
      fire: "fire_emergency",
      medical: "medical_emergency",
      accident: "accident",
      natural_disaster: "natural_disaster",
      crime: "security_incident",
      search_rescue: "search_rescue",
      hazmat: "community_aid",
      other: "other",
      disaster: "natural_disaster"
    };
    return map[v] || "other";
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const API = "http://localhost:3000/api/resources/requests";

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setRequests(data.data);
      } else {
        throw new Error(data.message || "Unexpected response");
      }
    } catch (err) {
      console.error("Load error:", err);
      setError(`Failed to load: ${err.message}`);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      organizationName: "",
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      address: "",
      district: "",
      city: "",

      emergencyType: "medical",
      organizationType: "hospital",
      urgencyLevel: "medium",
      resourceType: "blood",
      bloodGroup: "",

      quantity: 1,
      unit: "",
      description: "",
      requiredBy: "",

      status: "pending",
      additionalNotes: "",

       
    fundraiserTarget: 0,
    fundraiserCollected: 0
    });
    setEditingId(null);
    setError(null);
  };

  const toggleAdmin = () => {
    if (!adminMode) {
      const pwd = prompt("Enter admin password");
      if (pwd === "admin123") {
        setAdminMode(true);
        alert("Admin mode ON");
      } else {
        alert("Invalid password");
      }
    } else {
      setAdminMode(false);
      resetForm();
    }
  };

  // Generate CSV report
  const generateCSV = () => {
    try {
      // Create CSV headers
      const headers = [
        'Request ID',
        'Organization Name',
        'Contact Name',
        'Contact Phone',
        'Contact Email',
        'Address',
        'District',
        'City',
        'Emergency Type',
        'Organization Type',
        'Urgency Level',
        'Resource Type',
        'Blood Group',
        'Quantity',
        'Unit',
        'Description',
        'Required By',
        'Status',
        'Additional Notes',
        'Created Date'
      ];

      // Create CSV rows
      const rows = requests.map(r => [
        r._id || '',
        r.organizationName || '',
        r?.contactPerson?.name || '',
        r?.contactPerson?.phone || '',
        r?.contactPerson?.email || '',
        r?.location?.address || '',
        r?.location?.district || '',
        r?.location?.city || '',
        r.emergencyType || '',
        r.organizationType || '',
        r.urgencyLevel || '',
        r.resourceType || '',
        r?.resourceDetails?.bloodGroup || '',
        r?.resourceDetails?.quantity || '',
        r?.resourceDetails?.unit || '',
        r?.resourceDetails?.description || '',
        r.requiredBy ? new Date(r.requiredBy).toLocaleDateString() : '',
        r.status || '',
        r.additionalNotes || '',
        new Date(r.createdAt).toLocaleDateString()
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
      link.setAttribute('download', `SwiftAid_Resource_Requests_Report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert("CSV report downloaded successfully!");
      
    } catch (error) {
      console.error("CSV generation error:", error);
      alert("Failed to generate CSV report.");
    }
  };

  // Load jsPDF dynamically and generate PDF
  const generatePDF = async () => {
    try {
      console.log('Starting PDF generation...');
      
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

      // If fundraiser, attach fundraiser info
 



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
      doc.text("SwiftAid - Resource Requests Report", 14, 20);

      // Add generation date
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

      // Check if we have requests
      if (requests.length === 0) {
        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100);
        doc.text("No resource requests found.", 14, 50);
      } else {
        // Prepare table columns
        const tableColumn = [
          "Organization",
          "Contact",
          "Phone",
          "Location",
          "Resource",
          "Qty",
          "Urgency",
          "Status",
          "Required By"
        ];

        // Prepare table rows
        const tableRows = requests.map((r) => [
          r.organizationName || "N/A",
          r?.contactPerson?.name || "N/A",
          r?.contactPerson?.phone || "N/A",
          `${r?.location?.city || "N/A"}/${r?.location?.district || "N/A"}`,
          `${r.resourceType || "N/A"}${r?.resourceDetails?.bloodGroup ? ` (${r.resourceDetails.bloodGroup})` : ""}`,
          `${r?.resourceDetails?.quantity || "N/A"} ${r?.resourceDetails?.unit || ""}`,
          r.urgencyLevel || "N/A",
          r.status || "pending",
          r.requiredBy ? new Date(r.requiredBy).toLocaleDateString() : "N/A"
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
            0: { cellWidth: 25 }, // Organization
            1: { cellWidth: 20 }, // Contact
            2: { cellWidth: 22 }, // Phone
            3: { cellWidth: 20 }, // Location
            4: { cellWidth: 25 }, // Resource
            5: { cellWidth: 15 }, // Quantity
            6: { cellWidth: 18 }, // Urgency
            7: { cellWidth: 15 }, // Status
            8: { cellWidth: 20 }  // Required By
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
        doc.text(`Total Requests: ${requests.length}`, 14, doc.internal.pageSize.getHeight() - 10);
      }

      console.log('Saving PDF...');
      




      // Save PDF
      doc.save(`SwiftAid_Resource_Requests_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
      alert("PDF downloaded successfully!");

    } catch (error) {
      console.error("PDF generation error:", error);
      
      // Offer CSV as fallback
      if (window.confirm("PDF generation failed. Would you like to download a CSV report instead?")) {
        generateCSV();
      } else {
        alert("Failed to generate PDF. Please check your internet connection and try again.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Build backend-compliant payload (nested schema)
    const payload = {
      organizationName: form.organizationName,
      urgencyLevel: form.urgencyLevel, // enum: critical | high | medium | low
      emergencyType: normalizeEmergencyType(form.emergencyType),
      organizationType: form.organizationType,
      contactPerson: {
        name: form.contactName,
        phone: form.contactPhone,
        email: form.contactEmail
      },
      location: {
        address: form.address,
        district: form.district,
        city: form.city
      },
      resourceType: form.resourceType,
      resourceDetails: {
        description:
          form.description?.trim() ||
          `${form.resourceType} needed urgently for ${form.emergencyType}`,
        quantity: parseInt(form.quantity) || 1,
        unit: form.unit || "units",
        // only include bloodGroup when resourceType === 'blood'
        ...(form.resourceType === "blood" && form.bloodGroup
          ? { bloodGroup: form.bloodGroup }
          : {})
      },
      category: categoryFromEmergencyType(normalizeEmergencyType(form.emergencyType)),
      status: normalizeStatus(form.status), // pending | in_progress | completed | cancelled
      requiredBy: form.requiredBy ? new Date(form.requiredBy) : new Date(),
      additionalNotes: form.additionalNotes?.trim() || ""
    };

    // If fundraiser, attach fundraiser details
if (form.resourceType === "fundraiser") {
  payload.fundraiser = {
    targetAmount: Number(form.fundraiserTarget),
    collectedAmount: Number(form.fundraiserCollected) || 0
  };
}


    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API}/${editingId}` : API;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(editingId ? "Request updated" : "Request created");
        resetForm();
        loadRequests();
      } else {
        // Show backend validation detail
        let msg = data.message || "Validation Error";
        if (data.validationErrors) {
          msg +=
            "\n" +
            Object.keys(data.validationErrors)
              .map((k) => `• ${k}: ${data.validationErrors[k].message}`)
              .join("\n");
        } else if (data.error) {
          msg += `\n• ${data.error}`;
        }
        throw new Error(msg);
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.message);
      alert(`${err.message}`);
    }
  };

  // Normalize UI enums to backend enums
  function normalizeStatus(s) {
    // UI "active" is invalid — use pending/in_progress/completed/cancelled
    if (s === "active") return "pending";
    return s;
  }

  function normalizeEmergencyType(t) {
    // Map any UI values to model enum
    const valid = [
      "fire",
      "medical",
      "accident",
      "natural_disaster",
      "crime",
      "search_rescue",
      "hazmat",
      "other"
    ];
    if (t === "disaster") return "natural_disaster";
    return valid.includes(t) ? t : "other";
  }

  const handleEdit = (r) => {
    // Bring nested backend data back to flat form fields
    setForm({
      organizationName: r.organizationName || "",
      contactName: r?.contactPerson?.name || "",
      contactPhone: r?.contactPerson?.phone || "",
      contactEmail: r?.contactPerson?.email || "",
      address: r?.location?.address || "",
      district: r?.location?.district || "",
      city: r?.location?.city || "",

      emergencyType: r.emergencyType || "medical",
      organizationType: r.organizationType || "hospital",
      urgencyLevel: r.urgencyLevel || "medium",
      resourceType: r.resourceType || "blood",
      bloodGroup: r?.resourceDetails?.bloodGroup || "",

      quantity: r?.resourceDetails?.quantity || 1,
      unit: r?.resourceDetails?.unit || "units",
      description: r?.resourceDetails?.description || "",
      requiredBy: r?.requiredBy ? r.requiredBy.split("T")[0] : "",

      status: r.status || "pending",
      additionalNotes: r.additionalNotes || ""
    });
    setEditingId(r._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this request?")) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Request deleted");
        loadRequests();
      } else {
        throw new Error(data.message || "Delete failed");
      }
    } catch (err) {
      alert(`${err.message}`); 
    }
  };

  const urgencyColor = (lvl) => {
    const map = {
      low: "#4CAF50",
      medium: "#FFB300",
      high: "#FF5722",
      critical: "#D32F2F"
    };
    return map[lvl] || "#FFB300";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "#fdfafaff",
        color: "#0a0808ff",
        boxSizing: "border-box"
      }}
    >
      <div style={{ padding: "28px", width: "100%", maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: "15px"
          }}
        >
          <h1 style={{ margin: 0, fontSize: "2.4rem" }}>Resource Requests Management</h1>
          
          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
            <button
              onClick={toggleAdmin}
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
              {adminMode ? "Exit Admin" : "Admin Mode"}
            </button>

            {adminMode && (
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
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
                  Download PDF
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
                  Download CSV
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error panel */}
        {error && (
          <div
            style={{
              background: "#4e1818",
              border: "1px solid #cc3d3d",
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
              whiteSpace: "pre-wrap"
            }}
          >
            {error}
          </div>
        )}

        {/* Form Card */}
        <div
          style={{
            background: "linear-gradient(135deg, #fbfafaff 0%, #ece9e9ff 100%)",
            border: "1px solid #333",
            borderRadius: 14,
            boxShadow: "0 8px 26px rgba(238, 231, 231, 0.45)",
            padding: 26,
            marginBottom: 28
          }}
        >
          <h2 style={{ marginTop: 0, color: "#4CAF50" }}>
            {editingId ? "Update Resource Request" : "Create New Resource Request"}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 18 }}>
            <div
              style={{
                display: "grid",
                gap: 16,
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))"
              }}
            >
              <Input label="Organization Name *">
                <input
                  name="organizationName"
                  value={form.organizationName}
                  onChange={onChange}
                  required
                  style={inputStyle}
                  placeholder="e.g., National Hospital"
                />
              </Input>

              <Input label="Contact Name *">
                <input
                  name="contactName"
                  value={form.contactName}
                  onChange={onChange}
                  required
                  style={inputStyle}
                  placeholder="Full name"
                />
              </Input>

              <Input label="Contact Phone *">
                <input
                  name="contactPhone"
                  value={form.contactPhone}
                  onChange={onChange}
                  required
                  style={inputStyle}
                  placeholder="+94xxxxxxxxx"
                />
              </Input>

              <Input label="Contact Email *">
                <input
                  name="contactEmail"
                  type="email"
                  value={form.contactEmail}
                  onChange={onChange}
                  required
                  style={inputStyle}
                  placeholder="contact@org.lk"
                />
              </Input>

              <Input label="District *">
                <input
                  name="district"
                  value={form.district}
                  onChange={onChange}
                  required
                  style={inputStyle}
                  placeholder="Colombo"
                />
              </Input>

              <Input label="City *">
                <input
                  name="city"
                  value={form.city}
                  onChange={onChange}
                  required
                  style={inputStyle}
                  placeholder="Borella"
                />
              </Input>

              <Input label="Full Address *" full>
                <input
                  name="address"
                  value={form.address}
                  onChange={onChange}
                  required
                  style={inputStyle}
                  placeholder="Street, Zone, Landmark"
                />
              </Input>

              <Input label="Emergency Type">
                <select
                  name="emergencyType"
                  value={form.emergencyType}
                  onChange={onChange}
                  style={inputStyle}
                >
                  <option value="medical">Medical</option>
                  <option value="fire">Fire</option>
                  <option value="accident">Accident</option>
                  <option value="natural_disaster">Disaster</option>
                  <option value="crime">Crime</option>
                  <option value="search_rescue">Search & Rescue</option>
                  <option value="hazmat">Hazmat</option>
                  <option value="other">Other</option>
                </select>
              </Input>

              <Input label="Organization Type">
                <select
                  name="organizationType"
                  value={form.organizationType}
                  onChange={onChange}
                  style={inputStyle}
                >
                  <option value="hospital">Hospital</option>
                  <option value="fire_department">Fire Dept</option>
                  <option value="police_station">Police</option>
                  <option value="ngo">NGO</option>
                  <option value="disaster_relief">Disaster Relief</option>
                  <option value="emergency_service">Emergency Service</option>
                  <option value="government_agency">Govt Agency</option>
                  <option value="other">Other</option>
                </select>
              </Input>

              <Input label="Urgency Level *">
                <select
                  name="urgencyLevel"
                  value={form.urgencyLevel}
                  onChange={onChange}
                  required
                  style={inputStyle}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </Input>

              <Input label="Resource Type *">
                <select
                  name="resourceType"
                  value={form.resourceType}
                  onChange={onChange}
                  required
                  style={inputStyle}
                >
                  <option value="blood">Blood</option>
                  <option value="medical_supplies">Medical supplies</option>
                  <option value="medicine">Medicine</option>
                  <option value="fundraiser">Fundraiser</option>
                  <option value="oxygen">Oxygen</option>
                  <option value="medical_equipment">Medical Equipment</option>
                  <option value="firefighting_equipment">Firefighting Eq.</option>
                  <option value="rescue_tools">Rescue Tools</option>
                  <option value="protective_gear">Protective Gear</option>
                  <option value="food">Food</option>
                  <option value="water">Water</option>
                  <option value="clothing">Clothing</option>
                  <option value="shelter_materials">Shelter Materials</option>
                  <option value="volunteers">Volunteers</option>
                  <option value="transport_vehicles">Transport Vehicles</option>
                  <option value="lighting_equipment">Lighting</option>
                  <option value="other">Other</option>
                </select>
              </Input>

              {form.resourceType === "fundraiser" && (
  <>
    <label>🎯 Target Amount (USD) *</label>
    <input
      type="number"
      name="fundraiserTarget"
      value={form.fundraiserTarget}
      onChange={onChange}
      required
      style={inputStyle}
    />

{/* <label>💰 Collected Amount</label>
    <input
      type="number"
      name="fundraiserCollected"
      value={form.fundraiserCollected}
      onChange={onChange}
      style={inputStyle}
      disabled
    /> */}
    
  </>
)}
              {form.resourceType === "blood" && (
                <Input label="Blood Group *">
                  <select
                    name="bloodGroup"
                    value={form.bloodGroup}
                    onChange={onChange}
                    required
                    style={inputStyle}
                  >
                    <option value="">-- Select --</option>
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-","any"].map(bg => (
                      <option value={bg} key={bg}>{bg}</option>
                    ))}
                  </select>
                </Input>
              )}

              <Input label="Quantity *">
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={onChange}
                  min={1}
                  required
                  style={inputStyle}
                  placeholder="Units/Items"
                />
              </Input>

              <Input label="Unit *">
                <input
                  name="unit"
                  value={form.unit}
                  onChange={onChange}
                  required
                  style={inputStyle}
                  placeholder="units / liters / kg / pieces"
                />
              </Input>

              <Input label="Required By">
                <input
                  type="date"
                  name="requiredBy"
                  value={form.requiredBy}
                  onChange={onChange}
                  style={inputStyle}
                />
              </Input>

              {adminMode && (
                <Input label="Status (Admin)">
                  <select
                    name="status"
                    value={form.status}
                    onChange={onChange}
                    style={inputStyle}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </Input>
              )}

              <Input label="Additional Notes" full>
                <textarea
                  name="additionalNotes"
                  value={form.additionalNotes}
                  onChange={onChange}
                  style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                  placeholder="Optional admin notes / public notes"
                />
              </Input>

              <Input label="Description" full>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
                  placeholder="Describe specific requirements, context, urgency, etc."
                />
              </Input>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button type="submit" style={primaryBtn}>
                {editingId ? "Update Request" : "Create Request"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} style={secondaryBtn}>
                  Cancel Update
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <h2 style={{ color: "#4CAF50", margin: "8px 0 16px" }}>
          Active Resource Requests ({requests.length})
        </h2>

        {loading ? (
          <div style={cardMuted}>Loading requests...</div>
        ) : requests.length === 0 ? (
          <div style={cardMuted}>
            <h3 style={{ marginTop: 0 }}>No resource requests found</h3>
            <p>Create the first one using the form above.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 18 }}>
            {requests.map((r) => (
              <div key={r._id} style={listCard}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 1fr",
                    gap: 16,
                    alignItems: "start"
                  }}
                >
                  {/* Left */}
                  <div>
                    <h3 style={{ margin: "0 0 8px 0", color: "#4CAF50" }}>
                      {r.organizationName}
                    </h3>
                    <p style={{ margin: "4px 0" }}>
                      <strong>Request ID:</strong> {r._id}
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      <strong>Contact:</strong> {r?.contactPerson?.name} | {r?.contactPerson?.phone}
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      <strong>Email:</strong> {r?.contactPerson?.email}
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      <strong>Location:</strong> {r?.location?.city}, {r?.location?.district}
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      <strong>Type:</strong> {r.organizationType}
                    </p>
                  </div>

                  {/* Right */}
                  <div>
                    <h4 style={{ margin: "0 0 10px 0", color: "#FFA726" }}>Request Details</h4>
                    <p style={{ margin: "4px 0" }}>
                      <strong>Emergency:</strong> {r.emergencyType}
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      <strong>Resource:</strong> {r.resourceType}
                      {r?.resourceDetails?.bloodGroup ? ` (${r.resourceDetails.bloodGroup})` : ""}
                    </p>
                    <p style={{ margin: "4px 0" }}>
                      <strong>Quantity:</strong> {r?.resourceDetails?.quantity}{" "}
                      {r?.resourceDetails?.unit}
                    </p>
                    {r.requiredBy && (
                      <p style={{ margin: "4px 0" }}>
                        <strong>Required By:</strong>{" "}
                        {new Date(r.requiredBy).toLocaleDateString()}
                      </p>
                    )}
                    <p style={{ margin: "4px 0" }}>
                      <strong>Created:</strong> {new Date(r.createdAt).toLocaleDateString()}
                    </p>

                    {r.resourceType === "fundraiser" && (
  <p style={{ margin: "4px 0", color: "#4CAF50", fontWeight: "bold" }}>
    🎯 Target: ${r.fundraiser?.targetAmount || 0} | 💰 Collected: ${r.fundraiser?.collectedAmount || 0}
  </p>
)}

                  </div>
                </div>

                {/* Description */}
                {r?.resourceDetails?.description && (
                  <div
                    style={{
                      marginTop: 12,
                      background: "#dfeee6",
                      padding: 12,
                      borderRadius: 8,
                      border: "1px solid #c7c2c2ff"
                    }}
                  >
                    <strong style={{ color: "#FFA726" }}>Description:</strong>
                    <div style={{ marginTop: 6 }}>{r.resourceDetails.description}</div>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: "1px solid #333",
                    gap: 12,
                    flexWrap: "wrap"
                  }}
                >
                  <div>
                    <span style={{ marginRight: 10 }}>
                      <strong>Urgency:</strong>{" "}
                      <span
                        style={{
                          color: urgencyColor(r.urgencyLevel),
                          background: `${urgencyColor(r.urgencyLevel)}22`,
                          padding: "4px 10px",
                          borderRadius: 20,
                          fontWeight: 700,
                          textTransform: "uppercase"
                        }}
                      >
                        {r.urgencyLevel}
                      </span>
                    </span>
                    <span>
                      <strong>Status:</strong> {r.status}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => handleEdit(r)} style={editBtn}>
                      Edit
                    </button>
                    {adminMode && (
                      <button onClick={() => handleDelete(r._id)} style={delBtn}>
                        Delete
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
  );
}

/* ---------- Reusable UI ---------- */

function Input({ label, children, full }) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : "auto" }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}


/* ---------- Styles ---------- */

const inputStyle = {
  width: "90%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #444",
  background: "#fff",
  color: "#080808ff",
  outline: "none",
  fontSize: 15
};

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontWeight: 700,
  color: "#000000ff",
  fontSize: 13
};

const primaryBtn = {
  background:
    "linear-gradient(135deg, rgba(76,175,80,1) 0%, rgba(69,160,73,1) 100%)",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "12px 18px",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 6px 20px rgba(76,175,80,0.25)"
};

const secondaryBtn = {
  background: "#666",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "12px 18px",
  fontWeight: 700,
  cursor: "pointer"
};

const listCard = {
  background: "linear-gradient(135deg, #fffbfbff 0%, #efebebff 100%)",
  border: "1px solid #343434",
  borderRadius: 14,
  padding: 20,
  boxShadow: "0 10px 32px rgba(255, 255, 255, 0.64)"
};

const cardMuted = {
  background: "#1f1f1f",
  border: "1px solid #333",
  color: "#c9b5b5ff",
  borderRadius: 14,
  padding: 26,
  textAlign: "center"
};

const editBtn = {
  background: "linear-gradient(135deg, #FF9800 0%, #F57C00 100%)",
  border: "none",
  padding: "10px 16px",
  borderRadius: 10,
  color: "white",
  cursor: "pointer",
  fontWeight: 800
};

const delBtn = {
  background: "linear-gradient(135deg, #f44336 0%, #d32f2f 100%)",
  border: "none",
  padding: "10px 16px",
  borderRadius: 10,
  color: "white",
  cursor: "pointer",
  fontWeight: 800
};
