import Resource from "../models/Resource.js";

// CREATE
export const createResource = async (req, res) => {
  try {
    const resource = await Resource.create(req.body);
    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// READ ALL
export const getResources = async (req, res) => {
  try {
    const resources = await Resource.find();
    res.json({ success: true, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// UPDATE
export const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ success: true, data: resource });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// DELETE
export const deleteResource = async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Resource deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
