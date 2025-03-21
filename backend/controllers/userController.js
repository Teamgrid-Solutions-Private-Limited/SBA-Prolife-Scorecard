const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userSchema');
const JWT_SECRET = process.env.JWT_SECRET || "jwt-token";

class userController {
 

  // Create a new user
  static async createUser(req, res) {
    try {
      const { fullName, nickName, email, password, role } = req.body;

      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        fullName,
        nickName,
        email,
        password: hashedPassword, // Save the hashed password
        role,
      });

      await newUser.save();
      res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
      res.status(400).json({ message: 'Error creating user', error });
    }
  }

  // Get a user by ID
  static async getUserById(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ message: 'Error fetching user', error });
    }
  }

  // Update user details
  static async updateUser(req, res) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
      res.status(400).json({ message: 'Error updating user', error });
    }
  }

  // Delete a user
  static async deleteUser(req, res) {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.id);
      if (!deletedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(400).json({ message: 'Error deleting user', error });
    }
  }

  // Login a user
  static async loginUser(req, res) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Create JWT token
    //   const token = jwt.sign(
    //     { id: user._id, role: user.role }, // Payload
    //     userController.JWT_SECRET, // Secret key
    //     { expiresIn: '1h' } // Token expiry (1 hour)
    //   );

    const token = jwt.sign(
        {
          id: user._id,
          
          role: user.role,
          
        },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );

      // Respond with the token
      res.status(200).json({
        message: 'Login successful',
        token,
        user: { id: user._id, fullName: user.fullName, nickName: user.nickName, role: user.role }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in', error });
    }
  }
}

module.exports = userController;
