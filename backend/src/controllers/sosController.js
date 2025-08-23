import SOS from "../model/SOS.js";

export async function getAllsos(req, res) {
  // Display user accs
  try {
    const sos = await SOS.find();
    res.status(200).json(sos);
  } catch (error) {
    console.error("Error on getAllsos Controller", error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
}

export async function createSOS(req, res) {
  // Create user acc
  res.status(200).send("You have created an acc");
}

export async function updateSOS(req, res) {
  // Update user acc
  res.status(200).send("You have updated an acc");
}

export async function deleteSOS(req, res) {
  // Delete user acc
  res.status(200).send("You have deleted an acc");
}
