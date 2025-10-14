import SystemSetting from "../model/SystemSetting.js";

export const getAutoAssign = async (req, res) => {
  try {
    const setting = await SystemSetting.findOne({ key: "autoAssign" });
    res.json({ enabled: setting?.value || false });
  } catch (err) {
    res.status(500).json({ message: "Error fetching setting" });
  }
};

export const updateAutoAssign = async (req, res) => {
  try {
    const { enabled } = req.body;
    const setting = await SystemSetting.findOneAndUpdate(
      { key: "autoAssign" },
      { value: enabled },
      { upsert: true, new: true }
    );
    res.json({ message: "Setting updated", enabled: setting.value });
  } catch (err) {
    res.status(500).json({ message: "Error updating setting" });
  }
};
