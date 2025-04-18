const Activity = require('../models/activitySchema');
const upload = require('../middlewares/fileUploads'); 
class activityController {
  
  // Create a new activity with file upload for readMore
  static async createActivity(req, res) {
    // Use multer to handle the file upload
    upload.single('readMore')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
  
      try {
        // Extract other fields from the body
        const { type, title, shortDesc, longDesc, rollCall, date, congress, termId } = req.body;
  
        // Get the uploaded file path (null if no file is uploaded)
        const readMore = req.file ? `/uploads/documents/${req.file.filename}` : null;
  
        // Create a new vote document
        const newActivity = new Activity({
          type,
          title,
          shortDesc,
          longDesc,
          rollCall,
          readMore, // Attach the file path if a file is uploaded
          date,
          congress,
          termId
        });
  
        // Save the new vote to the database
        await newActivity.save();
  
        // Send a successful response with the created vote data
        res.status(201).json({ message: "Activity created successfully", info: newActivity });
  
      } catch (error) {
        res.status(500).json({ message: 'Error creating Activity', error: error.message });
      }
    });
  }

  // Get all votes with populated termId
  static async getAllActivity(req, res) {
    try {
      const activity = await Activity.find().populate('termId');
      res.status(200).json(activity);  
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving activity', error });
    }
  }

  // Get a vote by ID with populated termId
  static async getActivityById(req, res) {
    try {
      const activity = await Activity.findById(req.params.id).populate('termId');
      if (!activity) {
        return res.status(404).json({ message: 'activity not found' });
      }
      res.status(200).json(activity);  
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving activity', error });
    }
  }

  // Update a vote by ID
  static async updateActivity(req, res) {
    try {
      // Use multer to handle file upload
      upload.single('readMore')(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ message: err.message });
        }
  
        const activityID = req.params.id;
        let updateData = { ...req.body }; // Capture other fields from the request
  
        // If a new file is uploaded for 'readMore', save the file path
        if (req.file) {
          updateData.readMore = `/uploads/${req.file.filename}`;
        }
  
        // Update the vote in the database
        const updatedActivity = await Activity.findByIdAndUpdate(activityID, updateData, { new: true })
          .populate('termId'); // Populate the referenced term (optional)
  
        if (!updatedActivity) {
          return res.status(404).json({ message: 'Activity not found' });
        }
  
        // Send the updated vote in the response
        res.status(200).json({ message: 'Activity updated successfully', info: updatedActivity });
      });
    } catch (error) {
      res.status(500).json({ message: 'Error updating Activity', error });
    }
  }

  // Delete a vote by ID
  static async deleteActivity(req, res) {
    try {
      const deletedActivity = await Activity.findByIdAndDelete(req.params.id);

      if (!deletedActivity) {
        return res.status(404).json({ message: 'activity not found' });
      }

      res.status(200).json({ message: 'activity deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting activity', error });
    }
  }
}

module.exports = activityController;
