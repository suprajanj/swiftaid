import SOS from "../model/SOS.js";

export async function getAllsos(req, res) {
  // Display sos
  try {
    const sos = await SOS.find();
    res.status(200).json(sos);
  } catch (error) {
    console.error("Error on getAllsos Controller", error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
}

export async function createSOS(req, res) {
  try {
    const { name, age, number, location } = req.body;
    const sos = new SOS({
      name,
      age,
      number,
      location,
    });

    const savedSOS = await sos.save();
    res.status(201).json(savedSOS);
  } catch (error) {
    console.error("Error on createSOS Controller", error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
}

export async function updateSOS(req, res) {
  try {
    const { name, age, number, location } = req.body;
    const updatedSOS = await SOS.findByIdAndUpdate(
      req.params.id,
      {
        name,
        age,
        number,
        location,
      },
      { new: true }
    );

    if (!updatedSOS) return res.status(404).json({ message: "SOS not found" });

    res.status(200).json(updatedSOS);
    // res.status(200).json({ message: "SOS updated successfully!" });
  } catch (error) {
    console.error("Error on updateSOS Controller", error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
}

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

export async function getSOSByID(req, res) {
  try {
    const sos = await SOS.findById(req.params.id);
    if (!sos) return res.status(404).json({ message: "SOS not found" });
    res.json(sos);
  } catch (error) {
    console.error("Error on getByID Controller", error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
}
