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
    paymentAmount: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardHolderName: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [adminMode, setAdminMode] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Load donations from API
  const loadDonations = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/donations");
      const data = await res.json();
      if (data.success) {
        setDonations(data.data);
      }
    } catch (error) {
      console.error("Error loading donations:", error);
    }
  };

  // Load resource requests from API
  const loadRequests = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/resources/requests");
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error("Error loading requests:", error);
    }
  };

  useEffect(() => {
    loadDonations();
    loadRequests();
  }, []);

  // Update fundraiser collected amount
  const updateFundraiserAmount = async (requestId, donationAmount) => {
    try {
      const res = await fetch(`http://localhost:3000/api/resources/requests/${requestId}/fundraiser`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collectedAmount: donationAmount
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        console.error("Failed to update fundraiser amount:", data.message);
      } else {
        // Reload requests to get updated amounts
        loadRequests();
      }
    } catch (error) {
      console.error("Error updating fundraiser:", error);
    }
  };

  // Handle admin status update - WITH FUNDRAISER REVERSAL LOGIC
  const handleStatusUpdate = async () => {
    if (!editingId) return;

    try {
      // Get the current donation details
      const currentDonation = donations.find(d => d._id === editingId);
      const currentRequest = requests.find(r => r._id === currentDonation?.resourceRequest?._id);
      
      // Check if this is a fundraiser cancellation that needs amount reversal
      const isReversingFundraiser = 
        currentRequest?.resourceType === "fundraiser" &&
        ['completed', 'approved'].includes(currentDonation?.status) &&
        ['cancelled', 'rejected'].includes(form.status) &&
        currentDonation?.donationDetails?.amount > 0;

      console.log('Frontend status update check:', {
        resourceType: currentRequest?.resourceType,
        currentStatus: currentDonation?.status,
        newStatus: form.status,
        amount: currentDonation?.donationDetails?.amount,
        isReversingFundraiser
      });

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
        // If we reversed a fundraiser donation, reload the requests to get updated amounts
        if (isReversingFundraiser) {
          console.log('Reloading requests after fundraiser reversal...');
          await loadRequests();
        }
        
        alert(data.message || "Status Updated Successfully");
        setEditingId(null);
        resetForm();
        loadDonations();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Status update error:", error);
      alert("Network error occurred");
    }
  };

  // Edit donation
  const handleEdit = (d) => {
    const request = requests.find(r => r._id === d.resourceRequest?._id);
    setSelectedRequest(request);
    
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
      paymentAmount: d.donationDetails?.amount || "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardHolderName: "",
    });
    setEditingId(d._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete donation - WITH FUNDRAISER REVERSAL HANDLING
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this donation?")) return;
    
    try {
      const res = await fetch(`http://localhost:3000/api/donations/${id}`, {
        method: "DELETE",
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        alert(data.message || "Donation deleted successfully");
        
        // If message indicates fundraiser adjustment, reload requests
        if (data.message && data.message.includes('Fundraiser amount adjusted')) {
          await loadRequests();
        }
        
        loadDonations();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Network error occurred");
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

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle resource request selection
    if (name === 'resourceRequest') {
      const selected = requests.find(r => r._id === value);
      setSelectedRequest(selected);
    }

    // Format card number with spaces
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (formatted.replace(/\s/g, '').length <= 16) {
        setForm({ ...form, [name]: formatted });
      }
      return;
    }

    // Format expiry date
    if (name === 'expiryDate') {
      const formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2').slice(0, 5);
      setForm({ ...form, [name]: formatted });
      return;
    }

    // Limit CVV to 3 digits
    if (name === 'cvv') {
      const formatted = value.replace(/\D/g, '').slice(0, 3);
      setForm({ ...form, [name]: formatted });
      return;
    }
    
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
        alert("Admin mode enabled");
      } else {
        alert("Invalid password");
      }
    } else {
      setAdminMode(false);
      setEditingId(null);
      resetForm();
    }
  };

  // Process Payment (Mock payment gateway integration)
  const processPayment = async (paymentData) => {
    setPaymentProcessing(true);
    
    // Mock payment processing - replace with actual payment gateway
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate payment success/failure
        const success = Math.random() > 0.1; // 90% success rate for demo
        
        if (success) {
          const transactionId = `TXN_${Date.now()}`;
          const result = {
            success: true,
            transactionId: transactionId,
            amount: paymentData.amount,
            timestamp: new Date().toISOString(),
            transferId: `${Math.floor(Math.random() * 9000) + 1000}${Math.floor(Math.random() * 900) + 100}`,
            cardLast4: paymentData.cardNumber.replace(/\s/g, '').slice(-4),
            ...paymentData
          };
          resolve(result);
        } else {
          reject(new Error("Payment failed. Please try again."));
        }
        setPaymentProcessing(false);
      }, 3000);
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if this is a fundraiser donation and show payment modal
    const isFundraiser = selectedRequest?.resourceType === "fundraiser";
    
    if (isFundraiser && !editingId) {
      setShowPaymentModal(true);
      return;
    }
    
    // For non-fundraiser or editing, proceed with normal submission
    await submitDonation();
  };

  // Submit donation with or without payment
  const submitDonation = async (paymentResult = null) => {
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
        availability: {
          preferredDate: form.preferredDate,
          preferredTime: form.preferredTime,
          isFlexible: form.isFlexible
        }
      };

      // Check if this is a fundraiser donation
      if (selectedRequest?.resourceType === "fundraiser") {
        submitData.donationDetails = {
          amount: parseFloat(form.paymentAmount) || 0,
          paymentInfo: paymentResult ? {
            transactionId: paymentResult.transactionId,
            transferId: paymentResult.transferId,
            paymentDate: paymentResult.timestamp,
            paymentStatus: 'completed',
            cardLast4: paymentResult.cardLast4
          } : undefined
        };
      } else {
        // Normal donation
        submitData.donationDetails = {
          quantity: parseInt(form.quantity),
          bloodGroup: form.bloodGroup || undefined,
          medicalConditions: form.medicalConditions,
        };
      }

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
        
        
        if (paymentResult) {
          setPaymentSuccess({
            ...paymentResult,
            donorName: form.fullName,
            donorEmail: form.email,
            organizationName: selectedRequest?.organizationName
          });
          setShowSuccessModal(true);
        } else {
          alert(editingId ? "Donation Updated" : "Donation Created Successfully");
        }
        
        setEditingId(null);
        resetForm();
        setShowPaymentModal(false);
        loadDonations(); // Reload donations from API
      } else {
        console.error("Detailed error:", data);
        let errorMsg = data.message || 'Failed to save donation';
        if (data.validationErrors) {
          errorMsg += '\nDetails: ' + JSON.stringify(data.validationErrors, null, 2);
        }
        alert(`Error: ${errorMsg}`);
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Network error occurred");
    }
  };

  // Handle payment and donation submission
  const handlePaymentSubmit = async () => {
    try {
      const amount = parseFloat(form.paymentAmount);
      if (!amount || amount <= 0) {
        alert("Please enter a valid donation amount");
        return;
      }

      // Validate card details
      const cardNumber = form.cardNumber.replace(/\s/g, '');
      if (!cardNumber || cardNumber.length !== 16) {
        alert("Please enter a valid 16-digit card number");
        return;
      }

      if (!form.expiryDate || form.expiryDate.length !== 5) {
        alert("Please enter a valid expiry date (MM/YY)");
        return;
      }

      if (!form.cvv || form.cvv.length !== 3) {
        alert("Please enter a valid 3-digit CVV");
        return;
      }

      if (!form.cardHolderName.trim()) {
        alert("Please enter the cardholder name");
        return;
      }

      const paymentData = {
        amount: amount,
        cardNumber: cardNumber,
        expiryDate: form.expiryDate,
        cvv: form.cvv,
        cardHolderName: form.cardHolderName
      };

      // Process payment
      const paymentResult = await processPayment(paymentData);
      
      // If payment successful, submit donation
      await submitDonation(paymentResult);
      
    } catch (error) {
      alert(`Payment failed: ${error.message}`);
      setPaymentProcessing(false);
    }
  };

  // Download receipt as PDF
  const downloadReceipt = () => {
    if (!paymentSuccess) return;

    const receiptContent = `
SwiftAid - Donation Receipt

Transaction Successful!
Transfer ID: ${paymentSuccess.transferId}

From: ${paymentSuccess.donorName}
To: ${paymentSuccess.organizationName}
Email: ${paymentSuccess.donorEmail}

Amount: $${paymentSuccess.amount.toFixed(2)}
Card: ****${paymentSuccess.cardLast4}
Date: ${new Date(paymentSuccess.timestamp).toLocaleString()}

Thank you for your generous donation!
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SwiftAid_Receipt_${paymentSuccess.transferId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
      paymentAmount: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardHolderName: "",
    });
    setSelectedRequest(null);
  };

  // Check if selected request is fundraiser
  const isFundraiser = selectedRequest?.resourceType === "fundraiser";
  const remainingAmount = selectedRequest?.fundraiser ? 
    (selectedRequest.fundraiser.targetAmount - (selectedRequest.fundraiser.collectedAmount || 0)) : 0;

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
          <h1 style={{ fontSize: "2.5rem", margin: 0 }}>Donations Management</h1>
          
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
              {adminMode ? "Exit Admin" : "Admin Mode"}
            </button>
          </div>
        </div>

        {/* Payment Success Modal */}
        {showSuccessModal && paymentSuccess && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <div style={{
              backgroundColor: "white",
              padding: "40px",
              borderRadius: "20px",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              textAlign: "center"
            }}>
              {/* Success Icon */}
              <div style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "#4CAF50",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                color: "white",
                fontSize: "40px",
                fontWeight: "bold"
              }}>
                ✓
              </div>

              <h2 style={{ 
                color: "#4CAF50", 
                marginBottom: "10px",
                fontSize: "1.8rem"
              }}>
                Transaction Successful!
              </h2>

              <p style={{ 
                color: "#666",
                fontSize: "1rem",
                marginBottom: "25px"
              }}>
                Transfer ID: {paymentSuccess.transferId}
              </p>

              {/* Transaction Details */}
              <div style={{
                backgroundColor: "#f8f9fa",
                padding: "20px",
                borderRadius: "10px",
                marginBottom: "25px",
                textAlign: "left"
              }}>
                <div style={{ marginBottom: "10px" }}>
                  <strong>From:</strong> {paymentSuccess.donorName}
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <strong>To:</strong> {paymentSuccess.organizationName}
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <strong>Card:</strong> ****{paymentSuccess.cardLast4}
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <strong>Date:</strong> {new Date(paymentSuccess.timestamp).toLocaleDateString()}
                </div>
              </div>

              {/* Amount */}
              <div style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "#333",
                marginBottom: "30px"
              }}>
                Rs.{paymentSuccess.amount.toFixed(2)}
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
                <button
                  onClick={downloadReceipt}
                  style={{
                    padding: "12px 30px",
                    backgroundColor: "#2196F3",
                    color: "white",
                    border: "none",
                    borderRadius: "25px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "16px"
                  }}
                >
                  Download Receipt
                </button>
                
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setPaymentSuccess(null);
                  }}
                  style={{
                    padding: "12px 30px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "25px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "16px"
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <div style={{
              backgroundColor: "white",
              padding: "40px",
              borderRadius: "12px",
              maxWidth: "600px",
              width: "90%",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
              maxHeight: "90vh",
              overflowY: "auto"
            }}>
              <h2 style={{ textAlign: "center", color: "#4CAF50", marginBottom: "20px" }}>
                Complete Your Donation Payment
              </h2>
              
              <div style={{ backgroundColor: "#f5f5f5", padding: "20px", borderRadius: "8px", marginBottom: "25px" }}>
                <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>Donation Summary</h3>
                <p style={{ margin: "5px 0" }}><strong>Organization:</strong> {selectedRequest?.organizationName}</p>
                <p style={{ margin: "5px 0" }}><strong>Amount:</strong> Rs.{form.paymentAmount}</p>
                <p style={{ margin: "5px 0" }}><strong>Target:</strong> Rs.{selectedRequest?.fundraiser?.targetAmount}</p>
                <p style={{ margin: "5px 0" }}><strong>Collected:</strong> Rs.{selectedRequest?.fundraiser?.collectedAmount || 0}</p>
                <p style={{ margin: "5px 0" }}><strong>Remaining:</strong> Rs.{remainingAmount}</p>
              </div>

              {/* Card Details Form */}
              <div style={{ backgroundColor: "#fafafa", padding: "25px", borderRadius: "8px", marginBottom: "20px" }}>
                <h3 style={{ margin: "0 0 20px 0", color: "#333" }}>Payment Details</h3>
                
                <div style={{ marginBottom: "15px" }}>
                  <label style={labelStyle}>Cardholder Name *</label>
                  <input 
                    name="cardHolderName"
                    placeholder="Enter name as on card"
                    value={form.cardHolderName}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={labelStyle}>Card Number *</label>
                  <input 
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={form.cardNumber}
                    onChange={handleChange}
                    required
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div>
                    <label style={labelStyle}>Expiry Date *</label>
                    <input 
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={form.expiryDate}
                      onChange={handleChange}
                      required
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>CVV *</label>
                    <input 
                      name="cvv"
                      placeholder="123"
                      value={form.cvv}
                      onChange={handleChange}
                      required
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: "#e8f5e8", padding: "15px", borderRadius: "8px", marginBottom: "25px", textAlign: "center" }}>
                <p style={{ margin: 0, color: "#2e7d32" }}>
                  <strong>🔒 Secure Payment Processing</strong><br/>
                  Your payment information is encrypted and secure.
                </p>
              </div>

              <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
                <button
                  onClick={handlePaymentSubmit}
                  disabled={paymentProcessing}
                  style={{
                    ...submitButton,
                    backgroundColor: paymentProcessing ? "#ccc" : "#4CAF50",
                    cursor: paymentProcessing ? "not-allowed" : "pointer",
                    minWidth: "160px"
                  }}
                >
                  {paymentProcessing ? "Processing..." : `Pay ${form.paymentAmount}`}
                </button>
                
                <button
                  onClick={() => setShowPaymentModal(false)}
                  disabled={paymentProcessing}
                  style={{
                    ...cancelButton,
                    cursor: paymentProcessing ? "not-allowed" : "pointer"
                  }}
                >
                  Cancel
                </button>
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
            <h3 style={{ marginBottom: "20px", color: "#FFA726" }}>Admin Panel: Update Donation Status</h3>
            
            {/* Warning for fundraiser reversals */}
            {(() => {
              const currentDonation = donations.find(d => d._id === editingId);
              const currentRequest = requests.find(r => r._id === currentDonation?.resourceRequest?._id);
              const isReversingFundraiser = 
                currentRequest?.resourceType === "fundraiser" &&
                ['completed', 'approved'].includes(currentDonation?.status) &&
                ['cancelled', 'rejected'].includes(form.status) &&
                currentDonation?.donationDetails?.amount > 0;
              
              return isReversingFundraiser && (
                <div style={{
                  backgroundColor: "#fff3cd",
                  border: "1px solid #ffeaa7",
                  padding: "15px",
                  borderRadius: "8px",
                  marginBottom: "20px"
                }}>
                  <strong style={{ color: "#856404" }}>⚠️ Fundraiser Amount Reversal Warning</strong>
                  <p style={{ margin: "5px 0 0 0", color: "#856404" }}>
                    Changing this donation from "{currentDonation?.status}" to "{form.status}" will subtract 
                    Rs.{currentDonation?.donationDetails?.amount} from the fundraiser's collected amount.
                  </p>
                </div>
              );
            })()}
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={labelStyle}>Status</label>
                <select name="status" value={form.status} onChange={handleChange} style={inputStyle}>
                  <option value="pending">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="contacted">Donor Contacted</option>
                  <option value="completed">Donation Completed</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
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
                type="button"
                onClick={handleStatusUpdate} 
                style={{...submitButton, backgroundColor: "#FF9800"}}
              >
                Update Status
              </button>
              
              <button 
                type="button"
                onClick={() => {setEditingId(null); resetForm();}} 
                style={cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

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
              {editingId ? "Update Donation" : "Submit New Donation Offer"}
            </h2>
            
            <form onSubmit={handleSubmit}>
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
                        {r.resourceType === "fundraiser" && r.fundraiser && (
                          ` - Target: ${r.fundraiser.targetAmount}`
                        )}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Show fundraiser info if selected */}
                {isFundraiser && selectedRequest?.fundraiser && (
                  <div style={{ 
                    gridColumn: "1 / -1", 
                    background: "linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)", 
                    padding: "20px", 
                    borderRadius: "12px", 
                    border: "2px solid #4CAF50",
                    boxShadow: "0 4px 15px rgba(76,175,80,0.2)"
                  }}>
                    <h4 style={{ margin: "0 0 15px 0", color: "#2e7d32", fontSize: "1.2rem" }}>
                      Fundraiser Progress
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px" }}>
                      <div style={{ textAlign: "center", background: "rgba(255,255,255,0.7)", padding: "10px", borderRadius: "8px" }}>
                        <strong style={{ color: "#1976d2" }}>Target</strong><br/>
                        <span style={{ fontSize: "1.3rem", fontWeight: "bold", color: "#333" }}>
                          Rs.{selectedRequest.fundraiser.targetAmount}
                        </span>
                      </div>
                      <div style={{ textAlign: "center", background: "rgba(255,255,255,0.7)", padding: "10px", borderRadius: "8px" }}>
                        <strong style={{ color: "#388e3c" }}>Collected</strong><br/>
                        <span style={{ fontSize: "1.3rem", fontWeight: "bold", color: "#333" }}>
                          Rs.{selectedRequest.fundraiser.collectedAmount || 0}
                        </span>
                      </div>
                      <div style={{ textAlign: "center", background: "rgba(255,255,255,0.7)", padding: "10px", borderRadius: "8px" }}>
                        <strong style={{ color: "#f57c00" }}>Remaining</strong><br/>
                        <span style={{ fontSize: "1.3rem", fontWeight: "bold", color: "#333" }}>
                          Rs.{remainingAmount}
                        </span>
                      </div>
                    </div>
                    <div style={{ marginTop: "15px" }}>
                      <div style={{ 
                        background: "#fff", 
                        height: "20px", 
                        borderRadius: "10px", 
                        overflow: "hidden",
                        border: "1px solid #4CAF50"
                      }}>
                        <div style={{
                          background: "linear-gradient(135deg, #4CAF50 0%, #2e7d32 100%)",
                          height: "100%",
                          width: `${Math.min((selectedRequest.fundraiser.collectedAmount || 0) / selectedRequest.fundraiser.targetAmount * 100, 100)}%`,
                          transition: "width 0.3s ease"
                        }}></div>
                      </div>
                      <p style={{ textAlign: "center", margin: "8px 0 0 0", color: "#555", fontSize: "0.9rem" }}>
                        {Math.round((selectedRequest.fundraiser.collectedAmount || 0) / selectedRequest.fundraiser.targetAmount * 100)}% Complete
                      </p>
                    </div>
                  </div>
                )}

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

                {/* Conditional Donation Details */}
                {isFundraiser ? (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Donation Amount (Rs.) *</label>
                    <input 
                      type="number" 
                      name="paymentAmount" 
                      placeholder="Enter donation amount" 
                      value={form.paymentAmount} 
                      onChange={handleChange} 
                      required 
                      min="1" 
                      max={remainingAmount > 0 ? remainingAmount : undefined}
                      step="0.01"
                      style={inputStyle} 
                    />
                    {remainingAmount > 0 && (
                      <p style={{ margin: "5px 0", color: "#666", fontSize: "0.9rem" }}>
                        Maximum donation amount: Rs.{remainingAmount}
                      </p>
                    )}
                  </div>
                ) : (
                  <>
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

                    {/* Blood Group Dropdown */}
                    <div>
                      <label style={labelStyle}>Blood Group (if applicable)</label>
                      <select 
                        name="bloodGroup" 
                        value={form.bloodGroup} 
                        onChange={handleChange} 
                        style={inputStyle}
                      >
                        <option value="">-- Select Blood Group --</option>
                        {selectedRequest?.resourceType === "blood" && selectedRequest?.resourceDetails?.bloodGroup && (
                          <option value={selectedRequest.resourceDetails.bloodGroup}>
                            {selectedRequest.resourceDetails.bloodGroup}
                          </option>
                        )}
                      </select>
                    </div>

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
                  </>
                )}

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
                    <option value="morning">Morning (8AM - 12PM)</option>
                    <option value="afternoon">Afternoon (12PM - 5PM)</option>
                    <option value="evening">Evening (5PM - 8PM)</option>
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
                  type="submit"
                  style={{...submitButton, gridColumn: "1 / -1", fontSize: "18px", padding: "18px"}}
                >
                  {editingId ? "Update Donation" : isFundraiser ? "Proceed to Payment" : "Submit Donation Offer"}
                </button>

                {editingId && (
                  <button 
                    type="button"
                    onClick={() => {setEditingId(null); resetForm();}}
                    style={{...cancelButton, gridColumn: "1 / -1"}}
                  >
                    Cancel Update
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Donations List */}
        <div style={{ marginTop: "40px" }}>
          <h2 style={{ marginBottom: "25px", fontSize: "2rem", color: "#4CAF50" }}>
            All Donations ({donations.length})
          </h2>
          
          {donations.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: "60px 20px", 
              background: "#ffffff", 
              borderRadius: "12px",
              color: "#666" 
            }}>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "15px" }}>No donations yet</h3>
              <p style={{ fontSize: "1.1rem" }}>Be the first to submit a donation offer and help those in need!</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "25px" }}>
              {donations.map((d) => {
                const donationRequest = requests.find(r => r._id === d.resourceRequest?._id || d.resourceRequest);
                const isFundraiserDonation = donationRequest?.resourceType === "fundraiser";
                
                return (
                  <div key={d._id} style={cardStyle}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                      
                      {/* Left Column - Personal Info */}
                      <div>
                        <h3 style={{ margin: "0 0 15px 0", color: "#4CAF50", fontSize: "1.4rem" }}>
                          {d.donor?.fullName}
                        </h3>
                        <div style={{ lineHeight: "1.6" }}>
                          <p><strong>Phone:</strong> {d.donor?.phone}</p>
                          <p><strong>Email:</strong> {d.donor?.email}</p>
                          <p><strong>NIC:</strong> {d.donor?.nic}</p>
                          <p><strong>Location:</strong> {d.donor?.city}, {d.donor?.district}</p>
                          <p><strong>Address:</strong> {d.donor?.address}</p>
                        </div>
                      </div>
                      
                      {/* Right Column - Donation Details */}
                      <div>
                        <h4 style={{ color: "#FFA726", marginBottom: "15px" }}>Donation Details</h4>
                        <div style={{ lineHeight: "1.6" }}>
                          {isFundraiserDonation ? (
                            <>
                              <p><strong>Donation Amount:</strong> ${d.donationDetails?.amount || 0}</p>
                              {d.donationDetails?.paymentInfo && (
                                <>
                                  <p><strong>Transaction ID:</strong> {d.donationDetails.paymentInfo.transactionId}</p>
                                  {d.donationDetails.paymentInfo.transferId && (
                                    <p><strong>Transfer ID:</strong> {d.donationDetails.paymentInfo.transferId}</p>
                                  )}
                                  {d.donationDetails.paymentInfo.cardLast4 && (
                                    <p><strong>Card:</strong> ****{d.donationDetails.paymentInfo.cardLast4}</p>
                                  )}
                                  <p><strong>Payment Status:</strong> 
                                    <span style={{ 
                                      color: d.donationDetails.paymentInfo.paymentStatus === 'completed' ? '#4CAF50' : '#FFA726',
                                      fontWeight: 'bold',
                                      textTransform: 'capitalize'
                                    }}>
                                      {d.donationDetails.paymentInfo.paymentStatus}
                                    </span>
                                  </p>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <p><strong>Quantity:</strong> {d.donationDetails?.quantity} units</p>
                              {d.donationDetails?.bloodGroup && (
                                <p><strong>Blood Group:</strong> {d.donationDetails?.bloodGroup}</p>
                              )}
                              {d.donationDetails?.medicalConditions && (
                                <p><strong>Medical Notes:</strong> {d.donationDetails.medicalConditions}</p>
                              )}
                            </>
                          )}
                          <p><strong>Preferred:</strong> {d.availability?.preferredDate?.split("T")[0]} ({d.availability?.preferredTime})</p>
                          <p><strong>Flexible:</strong> {d.availability?.isFlexible ? "Yes" : "No"}</p>
                          <p><strong>For Request:</strong> {donationRequest?.organizationName || d.resourceRequest?.organizationName || "N/A"}</p>
                          <p><strong>Request Type:</strong> {donationRequest?.resourceType || "N/A"}</p>
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
                          <p style={{ margin: "0 0 10px 0", color: "#FFA726" }}>
                            <strong>Admin Notes:</strong> {d.adminNotes}
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
                          {adminMode ? "Admin Edit" : "Edit"}
                        </button>
                        
                        {(adminMode || d.status === 'pending') && (
                          <button 
                            onClick={() => handleDelete(d._id)} 
                            style={deleteButton}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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