import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Get Responder model from global connection
const getResponderModel = () => global.respondersDB.model("Responder");

// Create new responder
export const createNewResponder = async (req, res) => {
  try {
    const Responder = getResponderModel();
    const { NIC, name, contactNumber, email, address, password, position, responderType } = req.body;

    if (!password) return res.status(400).json({ error: "Password is required" });
    if (!/^([0-9]{9}[vVxX]|[0-9]{12})$/.test(NIC)) return res.status(400).json({ error: "Invalid NIC format" });

    const existing = await Responder.findOne({ NIC });
    if (existing) return res.status(400).json({ error: "NIC already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newResponder = new Responder({
      NIC,
      name,
      contactNumber,
      email,
      address,
      position,
      responderType,
      password: hashedPassword
    });

    await newResponder.save();
    return res.status(201).json({ message: "Responder created successfully", responder: newResponder });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

// Login responder
export const loginResponder = async (req, res) => {
  try {
    const { email, password } = req.body;
    const Responder = getResponderModel();

    const responder = await Responder.findOne({ email });
    if (!responder) return res.status(400).json({ error: "Responder not found" });
    if (!responder.password) return res.status(400).json({ error: "Password not set" });

    const isMatch = await bcrypt.compare(password, responder.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: responder._id, email: responder.email, responderType: responder.responderType },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      responder: {
        id: responder._id,
        name: responder.name,
        email: responder.email,
        responderType: responder.responderType
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

// Get all responders
export const getAllResponders = async (req, res) => {
  try {
    const Responder = getResponderModel();
    const responders = await Responder.find().select("-password");
    return res.status(200).json(responders);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
