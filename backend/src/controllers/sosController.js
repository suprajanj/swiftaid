import SOS from "../model/SOS.js";
import Responder from "../model/Responder.js";
import SystemSetting from "../model/SystemSetting.js";


// Get all SOS records
export async function getAllsos(req, res) {
  try {
    const sos = await SOS.find().populate(
      "user",
      "firstName lastName email mobile"
    );
    res.status(200).json(sos);
  } catch (error) {
    console.error("Error on getAllsos Controller", error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
}

// Create SOS record (with live location) linked to user
export const createSOS = async (req, res) => {
  try {
    const { name, age, number, emergency, location } = req.body;

    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // Input validation
    if (!name || !age || !number || !emergency || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // 🔄 Check global auto-assign setting with error handling
    let autoAssign = false;
    try {
      const setting = await SystemSetting?.findOne({ key: "autoAssign" });
      autoAssign = setting?.value === true;
    } catch (error) {
      console.error('Error fetching auto-assign setting:', error);
    }

    let assignedResponder = null;

    if (autoAssign) {
      try {
        const responders = await Responder.find({
          responderType: emergency,
          status: "available",
        });

        // find nearest responder
        let minDist = Infinity;
        for (const r of responders) {
          if (r.lastLocation?.latitude && r.lastLocation?.longitude) {
            const d = getDistance(
              location.latitude,
              location.longitude,
              r.lastLocation.latitude,
              r.lastLocation.longitude
            );
            if (d < minDist) {
              minDist = d;
              assignedResponder = r;
            }
          }
        }

        if (assignedResponder) {
          assignedResponder.status = "busy";
          await assignedResponder.save();
        }
      } catch (error) {
        console.error('Error in auto-assign process:', error);
      }
    }

    const sos = new SOS({
      user: req.user._id, // Use the authenticated user's ID
      name,
      age,
      number,
      emergency,
      location,
      assignedResponder: assignedResponder?._id || null,
      status: assignedResponder ? "Assigned" : "Pending",
    });

    await sos.save();

    // Emit socket event for real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('sosCreated', sos);
    }

    res.status(201).json({
      message: 'SOS created successfully',
      data: sos,
      autoAssigned: !!assignedResponder,
      responder: assignedResponder
    });

  } catch (error) {
    console.error('Error in createResSOS:', error);
    res.status(500).json({
      message: 'Error creating SOS',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
// Get SOS by specific user (only logged-in user can fetch their own)
export async function getSOSByUser(req, res) {
  try {
    // only allow logged-in user to access their SOS
    if (!req.user || req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ message: "Forbidden: Not your data" });
    }

    const userSOS = await SOS.find({ user: req.user._id }).populate(
      "user",
      "firstName lastName email mobile"
    );

    res.status(200).json(userSOS);
  } catch (error) {
    console.error("Error on getSOSByUser Controller", error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
}

// Update SOS record
export async function updateSOS(req, res) {
  try {
    const { name, age, number, emergency, location } = req.body;

    let updateData = { name, age, number, emergency };

    if (location && location.latitude && location.longitude) {
      updateData.location = {
        latitude: location.latitude,
        longitude: location.longitude,
        mapLink: `https://www.google.com/maps?q=${location.latitude},${location.longitude}`,
      };
    }

    const updatedSOS = await SOS.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!updatedSOS) return res.status(404).json({ message: "SOS not found" });

    res.status(200).json(updatedSOS);
  } catch (error) {
    console.error("Error on updateSOS Controller", error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
}

// Delete SOS record
export async function deleteSOS(req, res) {
  try {
    const deletedNote = await SOS.findByIdAndDelete(req.params.id);

    if (!deletedNote) return res.status(404).json({ message: "SOS not found" });
    res.status(200).json({ message: "SOS deleted successfully!" });
  } catch (error) {
    console.error("Error on deleteSOS Controller", error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
}

// Get SOS by ID
export async function getSOSByID(req, res) {
  try {
    const sos = await SOS.findById(req.params.id).populate(
      "user",
      "firstName lastName email mobile"
    );
    if (!sos) return res.status(404).json({ message: "SOS not found" });

    res.json(sos);
  } catch (error) {
    console.error("Error on getByID Controller", error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Get all SOS records
export const getResAllSOS = async (req, res) => {
  try {
    const sosList = await SOS.find().populate(
      "assignedResponder",
      "name contactNumber responderType status"
    );
    res.status(200).json(sosList);
  } catch (err) {
    console.error("Error fetching SOS records:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get SOS by ID
export const getResSOSByID = async (req, res) => {
  try {
    const sos = await SOS.findById(req.params.id).populate(
      "assignedResponder",
      "name contactNumber responderType status"
    );
    if (!sos) return res.status(404).json({ message: "SOS not found" });
    res.status(200).json(sos);
  } catch (err) {
    console.error("Error fetching SOS by ID:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Create a new SOS
export const createResSOS = async (req, res) => {
  try {
    const { name, age, number, emergency, location } = req.body;

    // Check if user is authenticated
    // if (!req.user || !req.user._id) {
    //   return res.status(401).json({ message: "Unauthorized: User not found" });
    // }

    // Input validation
    if (!name || !age || !number || !emergency || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // 🔄 Check global auto-assign setting with error handling
    let autoAssign = false;
    try {
      const setting = await SystemSetting?.findOne({ key: "autoAssign" });
      autoAssign = setting?.value === true;
    } catch (error) {
      console.error('Error fetching auto-assign setting:', error);
    }

    let assignedResponder = null;

    if (autoAssign) {
      try {
        const responders = await Responder.find({
          responderType: emergency,
          status: "available",
        });

        // find nearest responder
        let minDist = Infinity;
        for (const r of responders) {
          if (r.lastLocation?.latitude && r.lastLocation?.longitude) {
            const d = getDistance(
              location.latitude,
              location.longitude,
              r.lastLocation.latitude,
              r.lastLocation.longitude
            );
            if (d < minDist) {
              minDist = d;
              assignedResponder = r;
            }
          }
        }

        if (assignedResponder) {
          assignedResponder.status = "busy";
          await assignedResponder.save();
        }
      } catch (error) {
        console.error('Error in auto-assign process:', error);
      }
    }

    const sos = new SOS({
      // user: req.user._id, // Use the authenticated user's ID
      name,
      age,
      number,
      emergency,
      location,
      assignedResponder: assignedResponder?._id || null,
      status: assignedResponder ? "Assigned" : "Pending",
    });

    await sos.save();

    // Emit socket event for real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('sosCreated', sos);
    }

    res.status(201).json({
      message: 'SOS created successfully',
      data: sos,
      autoAssigned: !!assignedResponder,
      responder: assignedResponder
    });

  } catch (error) {
    console.error('Error in createResSOS:', error);
    res.status(500).json({
      message: 'Error creating SOS',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
// Update SOS
export const updateResSOS = async (req, res) => {
  try {
    const { name, age, number, emergency, location, status, comment } =
      req.body;

    const sos = await SOS.findById(req.params.id);
    if (!sos) return res.status(404).json({ message: "SOS not found" });

    // If emergency changes, unassign responder
    if (emergency && sos.emergency !== emergency && sos.assignedResponder) {
      const prevResponder = await Responder.findById(sos.assignedResponder);
      if (prevResponder) {
        prevResponder.status = "available";
        await prevResponder.save();
      }
      sos.assignedResponder = null;
      sos.status = "Pending";
    }

    sos.name = name || sos.name;
    sos.age = age || sos.age;
    sos.number = number || sos.number;
    sos.emergency = emergency || sos.emergency;

    if (location?.latitude && location?.longitude) {
      sos.location = {
        latitude: location.latitude,
        longitude: location.longitude,
        mapLink: `https://www.google.com/maps?q=${location.latitude},${location.longitude}`,
      };
    }

    if (status) sos.status = status;
    if (comment) sos.comment = comment;

    const updatedSOS = await sos.save();
    const populatedSOS = await updatedSOS.populate(
      "assignedResponder",
      "name contactNumber responderType status"
    );
    res.status(200).json(populatedSOS);
  } catch (err) {
    console.error("Error updating SOS:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Delete SOS
export const deleteResSOS = async (req, res) => {
  try {
    const sos = await SOS.findById(req.params.id);
    if (!sos) return res.status(404).json({ message: "SOS not found" });

    if (sos.assignedResponder) {
      const responder = await Responder.findById(sos.assignedResponder);
      if (responder) {
        responder.status = "available";
        await responder.save();
      }
    }

    await SOS.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "SOS deleted successfully" });
  } catch (err) {
    console.error("Error deleting SOS:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Assign a responder to SOS
export const assignResponder = async (req, res) => {
  try {
    const { sosId, responderId } = req.body;

    const sos = await SOS.findById(sosId);
    if (!sos) return res.status(404).json({ message: "SOS not found" });

    const responder = await Responder.findById(responderId);
    if (!responder)
      return res.status(404).json({ message: "Responder not found" });

    sos.assignedResponder = responder._id;
    sos.status = "Assigned";
    await sos.save();

    const message = `🚨 New SOS Assigned: ${sos.emergency} for ${sos.name}. Please respond immediately.`;

    if (responder.email) await sendEmail(responder.email, sos);

    responder.status = "busy";
    await responder.save();

    const populatedSOS = await sos.populate(
      "assignedResponder",
      "name contactNumber responderType status"
    );
    res.status(200).json({ sos: populatedSOS, responder });
  } catch (err) {
    console.error("Error assigning responder:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Mark SOS as completed
export const completeResSOS = async (req, res) => {
  try {
    const sos = await SOS.findByIdAndUpdate(
      req.params.id,
      { status: "Completed", completedAt: new Date() },
      { new: true }
    ).populate("assignedResponder", "name contactNumber responderType status");

    const responder = await Responder.findById(sos.assignedResponder);
    responder.status = "available";
    responder.lastLocation = sos.location;
    await responder.save();

    if (!sos) return res.status(404).json({ message: "SOS not found" });
    res.status(200).json(sos);
  } catch (err) {
    console.error("Error completing SOS:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
