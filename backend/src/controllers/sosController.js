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
  try {
    const { name, age, number, location } = req.body;
    // console.log(name.age, number, location);
    const sos = new SOS({
      name,
      age,
      number,
      location,
    });

    const savedSOS = await sos.save();
    res.status(201).json(savedSOS);
  } catch (error) {
    console.error("Error on getAllsos Controller", error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
}

export async function updateSOS(req, res) {
  // Update user acc
  res.status(200).send("You have updated an acc");
}

export async function deleteSOS(req, res) {
  // Delete user acc
  res.status(200).send("You have deleted an acc");
}
