import bcrypt from "bcryptjs";

// ------------------ CREATE NEW RESPONDER ------------------
export const createNewResponder = async (req, res) => {
  try {
    const { NIC, name, contactNumber, password, address, position, responderType, email, lastLocation } = req.body;
    const Responder = req.app.locals.db.ResponderModel;

    if (!NIC || !name || !contactNumber || !email || !address || !password || !position || !responderType)
      return res.status(400).json({ message: "Missing required fields" });

    const existing = await Responder.findOne({ $or: [{ email }, { NIC }] });
    if (existing) return res.status(400).json({ message: "Responder already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newResponder = new Responder({
      NIC,
      name,
      contactNumber,
      email,
      password: hashedPassword,
      address,
      position,
      responderType,
      status: "inactive",
      lastLocation: {
        latitude: lastLocation?.latitude || 0,
        longitude: lastLocation?.longitude || 0,
        mapLink: lastLocation?.mapLink || "",
      },
    });

    await newResponder.save();
    res.status(201).json({ message: "Responder created successfully", responder: newResponder });
  } catch (err) {
    console.error("❌ Error creating responder:", err);
    res.status(500).json({ error: err.message });
  }
};

// ------------------ LOGIN RESPONDER ------------------
export const loginResponder = async (req, res) => {
  try {
    const { email, password } = req.body;
    const Responder = req.app.locals.db.ResponderModel;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const responder = await Responder.findOne({ email });
    if (!responder) return res.status(404).json({ message: "Responder not found" });

    const isMatch = await bcrypt.compare(password, responder.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Update status to active on login
    responder.status = "active";
    await responder.save();

    res.status(200).json({
      message: "Login successful",
      responder: {
        _id: responder._id,
        email: responder.email,
        NIC: responder.NIC,
        name: responder.name,
        responderType: responder.responderType,
        status: responder.status,
        lastLocation: responder.lastLocation,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ------------------ LOGOUT RESPONDER ------------------
export const logoutResponder = async (req, res) => {
  try {
    const { id } = req.body;
    const Responder = req.app.locals.db.ResponderModel;

    const responder = await Responder.findById(id);
    if (!responder) return res.status(404).json({ message: "Responder not found" });

    responder.status = "inactive";
    await responder.save();

    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------ UPDATE RESPONDER STATUS ------------------
export const updateResponderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const Responder = req.app.locals.db.ResponderModel;

    const responder = await Responder.findById(id);
    if (!responder) return res.status(404).json({ message: "Responder not found" });

    responder.status = status;
    await responder.save();

    res.status(200).json({ message: "Status updated successfully", responder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------ UPDATE LAST LOCATION ------------------
export const updateResponderLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, mapLink } = req.body;
    const Responder = req.app.locals.db.ResponderModel;

    const responder = await Responder.findById(id);
    if (!responder) return res.status(404).json({ message: "Responder not found" });

    responder.lastLocation = { latitude, longitude, mapLink };
    await responder.save();

    res.status(200).json({ message: "Location updated successfully", lastLocation: responder.lastLocation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------ GET ALL RESPONDERS ------------------
export const getAllResponders = async (req, res) => {
  try {
    const Responder = req.app.locals.db.ResponderModel;
    const responders = await Responder.find();
    res.status(200).json(responders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------ GET SINGLE RESPONDER ------------------
export const getResponderById = async (req, res) => {
  try {
    const Responder = req.app.locals.db.ResponderModel;
    const responder = await Responder.findById(req.params.id);
    if (!responder) return res.status(404).json({ message: "Responder not found" });
    res.status(200).json(responder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------ UPDATE RESPONDER ------------------
export const updateResponder = async (req, res) => {
  try {
    const Responder = req.app.locals.db.ResponderModel;
    const updated = await Responder.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Responder not found" });
    res.status(200).json({ message: "Responder updated successfully", responder: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------ DELETE RESPONDER ------------------
export const deleteResponder = async (req, res) => {
  try {
    const Responder = req.app.locals.db.ResponderModel;
    const deleted = await Responder.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Responder not found" });
    res.status(200).json({ message: "Responder deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------ SEARCH RESPONDERS ------------------
export const searchResponders = async (req, res) => {
  try {
    const { query } = req.query;
    const Responder = req.app.locals.db.ResponderModel;

    const responders = await Responder.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { NIC: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    });

    res.status(200).json(responders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
