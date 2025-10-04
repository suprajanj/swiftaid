import getResponderModel from "../model/getResponderModel.js";

// Create new responder
export const createNewResponder = async (req, res) => {
  try {
    const Responder = getResponderModel(); // ✅ call here, after DB connected

    const { NIC, name, contactNumber, email, address, password, position, responderType } = req.body;

    if (!/^([0-9]{9}[vVxX]|[0-9]{12})$/.test(NIC)) {
      return res.status(400).json({ error: "Invalid NIC format" });
    }

    const existing = await Responder.findOne({ NIC });
    if (existing) return res.status(400).json({ error: "NIC already exists" });

    const newResponder = new Responder({
      NIC,
      name,
      contactNumber,
      email,
      address,
      position,
      responderType,
    });

    await newResponder.save();
    return res.status(201).json({ message: "Responder created successfully", responder: newResponder });
  } catch (error) {
    console.error("Create responder error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const loginResponder = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find responder by email
    const responder = await Responder.findOne({ email });
    if (!responder) {
      return res.status(400).json({ error: "Responder not found" });
    }

    // Simple password check (use bcrypt for real projects)
    if (responder.password !== password) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Success
    return res.status(200).json({
      message: "Login successful",
      responder: {
        id: responder._id,
        name: responder.name,
        email: responder.email,
        responderType: responder.responderType,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getAllResponders = async (req, res) => {
  try {
    const Responder = getResponderModel(); // ✅ call here too
    const responders = await Responder.find();
    return res.status(200).json(responders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};
