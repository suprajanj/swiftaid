// routes/resourceRoutes.js
import express from 'express';
import ResourceRequest from '../model/ResourceRequest.js';

const router = express.Router();

/* ================================
   GET all resource requests
================================ */
router.get('/requests', async (req, res) => {
  try {
    const { organizationType, emergencyType, urgencyLevel, resourceType, district, status } = req.query;
    const filter = {};

    if (organizationType) filter.organizationType = organizationType;
    if (emergencyType) filter.emergencyType = emergencyType;
    if (urgencyLevel) filter.urgencyLevel = urgencyLevel;
    if (resourceType) filter.resourceType = resourceType;
    if (district) filter['location.district'] = district;
    if (status) filter.status = status;

    const requests = await ResourceRequest.find(filter).sort({ createdAt: -1, urgencyLevel: 1 });

    res.json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

/* ================================
   GET single request by ID
================================ */
router.get('/requests/:id', async (req, res) => {
  try {
    const request = await ResourceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Resource request not found' });

    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

/* ================================
   POST create new request
================================ */
router.post('/requests', async (req, res) => {
  try {
    const resourceRequest = new ResourceRequest(req.body);
    await resourceRequest.save();
    res.status(201).json({ success: true, message: 'Resource request created successfully', data: resourceRequest });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Validation Error', error: error.message });
  }
});

/* ================================
   PUT update full request (all fields)
================================ */
router.put('/requests/:id', async (req, res) => {
  try {
    const updatedRequest = await ResourceRequest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedRequest) return res.status(404).json({ success: false, message: 'Resource request not found' });

    res.json({ success: true, message: 'Resource request updated successfully', data: updatedRequest });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Update Error', error: error.message });
  }
});

/* ================================
   PATCH update status only
================================ */
router.patch('/requests/:id/status', async (req, res) => {
  try {
    const { status, adminNotes, verifiedBy } = req.body;
    const allowedStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const updateData = { status };
    if (adminNotes) updateData.additionalNotes = adminNotes;
    if (verifiedBy) {
      updateData.isVerified = true;
      updateData.verifiedBy = verifiedBy;
    }

    const request = await ResourceRequest.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    if (!request) return res.status(404).json({ success: false, message: 'Resource request not found' });

    res.json({ success: true, message: 'Status updated successfully', data: request });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Update Error', error: error.message });
  }
});

/* ================================
   DELETE request
================================ */
router.delete('/requests/:id', async (req, res) => {
  try {
    const request = await ResourceRequest.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Resource request not found' });

    res.json({ success: true, message: 'Resource request deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
});

export default router;
 