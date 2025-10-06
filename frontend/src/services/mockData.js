// Mock data service for testing without backend
// Remove this file once backend is ready

export const mockEmergencyCases = [
  {
    _id: "1",
    caseId: "EC-2025-001",
    title: "Flood Emergency in Colombo District",
    description: "Severe flooding affecting multiple areas in Colombo district. Immediate assistance required for evacuation and relief supplies.",
    incidentType: "Natural Disaster",
    severity: "Critical",
    status: "Verified",
    dateTime: "2025-01-15T08:30:00Z",
    location: {
      address: "Kolonnawa Road",
      district: "Colombo",
      state: "Western Province",
      coordinates: { lat: 6.9271, lng: 79.8612 }
    },
    affectedPeople: {
      injured: 45,
      deceased: 3,
      evacuated: 250
    },
    verificationStatus: {
      isVerified: true,
      verifiedAt: "2025-01-15T09:00:00Z",
      verifiedBy: "Admin User"
    },
    assignedAgencies: [
      {
        agency: "Red Cross Sri Lanka",
        contactPerson: "John Silva",
        phone: "+94771234567",
        status: "Responding"
      }
    ],
    reports: [],
    tags: ["flood", "urgent", "evacuation"],
    createdAt: "2025-01-15T08:00:00Z",
    updatedAt: "2025-01-15T09:00:00Z"
  },
  {
    _id: "2",
    caseId: "EC-2025-002",
    title: "Building Fire in Kandy",
    description: "Commercial building fire in Kandy city center. Multiple people trapped.",
    incidentType: "Fire",
    severity: "High",
    status: "Under Investigation",
    dateTime: "2025-01-16T14:20:00Z",
    location: {
      address: "Peradeniya Road",
      district: "Kandy",
      state: "Central Province",
      coordinates: { lat: 7.2906, lng: 80.6337 }
    },
    affectedPeople: {
      injured: 12,
      deceased: 1,
      evacuated: 50
    },
    verificationStatus: {
      isVerified: true,
      verifiedAt: "2025-01-16T14:30:00Z",
      verifiedBy: "Admin User"
    },
    assignedAgencies: [
      {
        agency: "Fire Department Kandy",
        contactPerson: "Nimal Perera",
        phone: "+94771234568",
        status: "Completed"
      }
    ],
    reports: [],
    tags: ["fire", "building", "rescue"],
    createdAt: "2025-01-16T14:00:00Z",
    updatedAt: "2025-01-16T15:00:00Z"
  },
  {
    _id: "3",
    caseId: "EC-2025-003",
    title: "Traffic Accident on Galle Road",
    description: "Multi-vehicle collision on Galle Road. Medical assistance required.",
    incidentType: "Accident",
    severity: "Medium",
    status: "Resolved",
    dateTime: "2025-01-17T10:15:00Z",
    location: {
      address: "Galle Road, Dehiwala",
      district: "Colombo",
      state: "Western Province",
      coordinates: { lat: 6.8563, lng: 79.8608 }
    },
    affectedPeople: {
      injured: 8,
      deceased: 0,
      evacuated: 0
    },
    verificationStatus: {
      isVerified: true,
      verifiedAt: "2025-01-17T10:30:00Z",
      verifiedBy: "Admin User"
    },
    assignedAgencies: [
      {
        agency: "Ambulance Service",
        contactPerson: "Sunil Fernando",
        phone: "+94771234569",
        status: "Completed"
      }
    ],
    reports: [],
    tags: ["accident", "traffic", "medical"],
    createdAt: "2025-01-17T10:00:00Z",
    updatedAt: "2025-01-17T12:00:00Z"
  }
];

export const mockResources = [
  {
    _id: "r1",
    itemName: "Medical Supplies Kit",
    category: "Medical Supplies",
    quantity: 150,
    expiryDate: "2025-12-31",
    organizationId: "org123",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z"
  },
  {
    _id: "r2",
    itemName: "Bottled Water (500ml)",
    category: "Food & Water",
    quantity: 5000,
    expiryDate: "2025-06-30",
    organizationId: "org123",
    createdAt: "2025-01-02T00:00:00Z",
    updatedAt: "2025-01-02T00:00:00Z"
  },
  {
    _id: "r3",
    itemName: "Emergency Blankets",
    category: "Shelter Materials",
    quantity: 300,
    expiryDate: null,
    organizationId: "org123",
    createdAt: "2025-01-03T00:00:00Z",
    updatedAt: "2025-01-03T00:00:00Z"
  },
  {
    _id: "r4",
    itemName: "First Aid Bandages",
    category: "Medical Supplies",
    quantity: 50,
    expiryDate: "2025-03-15",
    organizationId: "org123",
    createdAt: "2025-01-04T00:00:00Z",
    updatedAt: "2025-01-04T00:00:00Z"
  },
  {
    _id: "r5",
    itemName: "Canned Food",
    category: "Food & Water",
    quantity: 800,
    expiryDate: "2026-01-01",
    organizationId: "org123",
    createdAt: "2025-01-05T00:00:00Z",
    updatedAt: "2025-01-05T00:00:00Z"
  }
];

export const mockStats = {
  total: 15,
  verified: 12,
  pending: 3,
  bySeverity: {
    Critical: 3,
    High: 5,
    Medium: 4,
    Low: 3
  },
  byType: {
    "Natural Disaster": 4,
    Fire: 3,
    Accident: 5,
    "Medical Emergency": 2,
    Other: 1
  }
};

// Mock API delay to simulate network request
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API service
export const mockAPI = {
  // Emergency Cases
  getCases: async (params = {}) => {
    await delay(500);
    let cases = [...mockEmergencyCases];
    
    // Apply filters if provided
    if (params.incidentType) {
      cases = cases.filter(c => c.incidentType === params.incidentType);
    }
    if (params.severity) {
      cases = cases.filter(c => c.severity === params.severity);
    }
    if (params.status) {
      cases = cases.filter(c => c.status === params.status);
    }
    
    return {
      success: true,
      data: cases,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: cases.length,
        itemsPerPage: 10
      }
    };
  },

  getCaseById: async (id) => {
    await delay(300);
    const case_ = mockEmergencyCases.find(c => c._id === id);
    return {
      success: true,
      data: case_ || null
    };
  },

  getStats: async () => {
    await delay(300);
    return {
      success: true,
      data: mockStats
    };
  },

  // Resources
  getResources: async () => {
    await delay(400);
    return {
      success: true,
      data: mockResources
    };
  },

  createResource: async (data) => {
    await delay(500);
    const newResource = {
      _id: `r${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockResources.push(newResource);
    return {
      success: true,
      data: newResource,
      message: "Resource created successfully"
    };
  },

  updateResource: async (id, data) => {
    await delay(500);
    const index = mockResources.findIndex(r => r._id === id);
    if (index !== -1) {
      mockResources[index] = {
        ...mockResources[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      return {
        success: true,
        data: mockResources[index],
        message: "Resource updated successfully"
      };
    }
    return {
      success: false,
      message: "Resource not found"
    };
  },

  deleteResource: async (id) => {
    await delay(400);
    const index = mockResources.findIndex(r => r._id === id);
    if (index !== -1) {
      mockResources.splice(index, 1);
      return {
        success: true,
        message: "Resource deleted successfully"
      };
    }
    return {
      success: false,
      message: "Resource not found"
    };
  },

  // Export
  exportCases: async () => {
    await delay(800);
    // Generate CSV content
    const headers = ["Case ID", "Title", "Type", "Severity", "Status", "Date"];
    const rows = mockEmergencyCases.map(c => [
      c.caseId,
      c.title,
      c.incidentType,
      c.severity,
      c.status,
      new Date(c.dateTime).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    return new Blob([csvContent], { type: "text/csv" });
  }
};

// Toggle between mock and real API
export const USE_MOCK_DATA = false; // Set to true for testing without backend
