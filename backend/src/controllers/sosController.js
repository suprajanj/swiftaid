import SOS from "../model/SOS.js";

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
export async function createSOS(req, res) {
  try {
    const { name, age, number, emergency, location } = req.body;

    if (!location || !location.latitude || !location.longitude) {
      return res
        .status(400)
        .json({ message: "Location (lat/lng) is required" });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    const mapLink = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;

    const sos = new SOS({
      user: req.user._id, // Link SOS to the logged-in user
      name,
      age,
      number,
      emergency,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        mapLink,
      },
    });

    const savedSOS = await sos.save();
    res.status(201).json(savedSOS);
  } catch (error) {
    console.error("Error on createSOS Controller", error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
}

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
