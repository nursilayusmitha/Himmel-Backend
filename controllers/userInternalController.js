// userInternalController.js
require('dotenv').config();
// const createUserInternalModel = require("../models/userInternalModels");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// let UserInternal
// async function getUserInternal() {
//   UserInternal = await createUserInternalModel();
// }

// getUserInternal()

const UserInternal = require("../models/userInternalModels");

// Controller method to get all users
async function getAllUsers(req, res) {
  try {
    // Retrieve all users from the database
    const users = await UserInternal.find({ isDeleted: "N", userLogin: "Y", userAccStatus:"enable" });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Controller method to get all users
async function getUserByRole(req, res) {
  try {
    const { companyName, userRole } = req.params;
    // Retrieve all users from the database
    const users = await UserInternal.find({ isDeleted: "N", userRole: userRole, companyName: companyName });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Controller method to get all users
async function getUserByRequest(req, res) {
  try {
    const users = await UserInternal.find({ isDeleted: "N", userLogin: "N", userAccStatus:"enable" });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Controller method to get user data by ID
async function getUserById(req, res) {
  try {
    const { userId } = req.params;

    // Find the user by ID
    const user = await UserInternal.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    else if (user.isDeleted === "yes") {
      return res.status(404).json({ message: "User has deleted" });
    }
    else if (user.userAccStatus === "disabled") {
      return res.status(404).json({ message: "User has blocked" });
    }

    res.json(user); // Send the user data in the response
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Controller method to create a new user
async function createUserOne(req, res) {
  try {
    const email = req.body.email
    const user = await UserInternal.findOne({ email });

    // Check if user exists
    if (user) {
      return res.status(401).json({ message: "Email Sudah Digunakan!" });
    }
    // Create a new user based on the request body
    const newUser = await UserInternal.create(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Controller method to update user data
async function updateUserOne(req, res) {
  try {
    const { userId } = req.params; // Assuming userId is passed in the request URL
    const { oldPassword, newPassword, ...newData } = req.body; // Extract oldPassword and newPassword from the request body

    const dataUser = await UserInternal.findById(userId);
    if (!dataUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (dataUser.isDeleted === "yes") {
      return res.status(404).json({ message: "User has been deleted" });
    }
    if (dataUser.userAccStatus === "disabled") {
      return res.status(404).json({ message: "User has been blocked" });
    }

    // If oldPassword and newPassword are provided, handle password update
    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, dataUser.password); // Assuming the password is stored in a field named 'password'
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect old password" });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      newData.password = hashedPassword;
    }

    // Find the user by ID and update their data
    const updatedUser = await UserInternal.findByIdAndUpdate(userId, newData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Increment the __v field by 1
    updatedUser.__v += 1;
    await updatedUser.save();

    res.json(updatedUser); // Send the updated user data in the response
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function createUser(req, res) {
  try {
    const email = req.body.email;
    const user = await UserInternal.findOne({ email });

    // Check if user exists
    if (user) {
      return res.status(401).json({ message: "Email Sudah Digunakan!" });
    }

    let data = req.body;

    // Handle uploaded file (if exists)
    if (req.files && req.files.length > 0) {
      const imageFile = req.files.find(file => file.fieldname === 'userImage');
      if (imageFile) {
        data.imageName = imageFile.filename; // Assign the filename to data.imageName
      }
    } else {
      // If no file is uploaded, set a default value or leave it undefined
      data.imageName = null;
    }

    // Parse JSON fields (if needed)
    if (data.userAccess) {
      data.userAccess = JSON.parse(data.userAccess);
    }

    // Create a new user with the modified data
    const newUser = await UserInternal.create(data);
    res.status(201).json(newUser);
    console.log(newUser)
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
const fs = require('fs'); // Gunakan untuk menghapus file gambar jika disimpan di file system
const path = require('path'); // Untuk mengelola jalur file (file path)
async function updateUser(req, res) {
  try {
    const userId = req.params._id;
    let data = req.body;
    console.log(req.files)

    // Dapatkan user yang ada untuk mengambil data gambar lama
    const existingUser = await UserInternal.findById(userId).select('userImage imageName');
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract the image condition (either "ganti", "ada", or "hapus")
    const imageCondition = data.imageCondition;  // Assuming this field is sent from frontend

    if (imageCondition === 'ganti' && req.files && req.files.length > 0) {
      const imageFile = req.files.find(file => file.fieldname === 'userImage');
      if (imageFile) {
        if (existingUser.imageName) {
          const oldImagePath = path.join('images/user_internal', existingUser.imageName);
          fs.unlinkSync(oldImagePath); // Hapus gambar lama
        }
        data.imageName = imageFile.filename; // Simpan nama file baru
      }
    } else if (imageCondition === 'hapus') {
      if (existingUser.imageName) {
        const oldImagePath = path.join('images/user_internal', existingUser.imageName);
        fs.unlinkSync(oldImagePath); // Hapus gambar
      }
      data.imageName = null;
      data.userImage = null;
    } else if (imageCondition === 'ada') {
      data.imageName = existingUser.imageName; // Pertahankan nama gambar lama
      data.userImage = existingUser.userImage; // Pertahankan data gambar lama
    }
    

    // Check and parse userAccess if needed
    if (data.userAccess && typeof data.userAccess === 'string') {
      try {
        data.userAccess = JSON.parse(data.userAccess);
      } catch (error) {
        return res.status(400).json({ message: 'Invalid JSON format for userAccess' });
      }
    }

    // Check and parse companyCode if needed
    if (data.companyCode && typeof data.companyCode === 'string') {
      try {
        data.companyCode = JSON.parse(data.companyCode);
      } catch (error) {
        return res.status(400).json({ message: 'Invalid JSON format for companyCode' });
      }
    }

    // Check if email is being updated and whether it is already used by another user
    if (data.email) {
      const emailExists = await UserInternal.findOne({ email: data.email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(401).json({ message: "Email already in use by another user" });
      }
    }

    // Lanjutkan dengan update data
    const updatedUserInternal = await UserInternal.findByIdAndUpdate(
      userId,
      data,
      { new: true } // Kembalikan dokumen yang sudah diupdate
    );

    if (!updatedUserInternal) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUserInternal);
    console.log('User berhasil diupdate:', updatedUserInternal);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}










async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await UserInternal.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: "Email belum terdaftar!" });
    }

    // // Generate a bcrypt hash
    // bcrypt.hash(password, 10, (err, hash) => {
    //   if (err) {
    //     console.error('Error hashing password:', err);
    //   } else {
    //     console.log('Generated bcrypt hash:', hash);
    //   }
    // });

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Password salah!" });
    }

    // Create a lightweight payload excluding userImage and other large fields
    const payload = {
      _id: user._id,
      email: user.email,
      userName: user.userName,
      userRole: user.userRole,
      bio: user.bio,
      userPhone: user.userPhone,
      companyCode: user.companyCode,
      companyName: user.companyName,
      companyPage: user.companyPage,
      imageName: user.imageName,
      userAccStatus: user.userAccStatus,
      hierarchyCode: user.hierarchyCode,
      userAccess: user.userAccess,
      userLogin: user.userLogin,
      isDeleted: user.isDeleted
    };

    // Generate a JWT token with the lightweight payload
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Send the token and user data (without userImage) in the response
    res.json({ token, user: payload });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


// Controller method to list companies by companyCode
async function listByCompanyCode(req, res) {
  try {
    const companyCode = req.body.companyCode;

    if (!companyCode || !Array.isArray(companyCode) || companyCode.length === 0) {
      return res.status(400).json({ message: "Invalid companyCode provided" });
    }

    // Initialize query with isDeleted condition
    let query = { isDeleted: false };

    // Check if companyCode equals [[0]]
    if (JSON.stringify(companyCode) !== JSON.stringify([[0]])) {
      // For other companyCode values, filter by the provided companyCode
      query.companyCode = { $eq: companyCode };
    }

    // Retrieve all companies that match the criteria, as plain JavaScript objects
    const userInternal = await UserInternal.find(query).lean();
    // console.log('ini user internal', userInternal);

    // Remove 'userImage' property from each object in the result array
    const finalUser = userInternal.map(({ userImage, ...rest }) => rest);

    res.json(finalUser);
  } catch (error) {
    console.error("Error fetching userInternal:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Controller method to soft delete a user (isDeleted field set to "Y")
async function deleteUser(req, res) {
  try {
    const { userId } = req.params;

    // Find the user by ID
    const user = await UserInternal.findById(userId);

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the isDeleted field to "Y"
    user.isDeleted = "Y";
    user.userAccStatus = "disable";

    // Save the changes
    await user.save();

    res.status(200).json({ message: "User successfully deleted (soft delete)" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


// Controller method to soft delete a user (isDeleted field set to "Y")
async function acceptUser(req, res) {
  try {
    const { userId } = req.params;

    // Find the user by ID
    const user = await UserInternal.findById(userId);

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the isDeleted field to "Y"
    user.userLogin = "Y";

    // Save the changes
    await user.save();

    res.status(200).json({ message: "User successfully Accepted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Controller method to soft delete a user (isDeleted field set to "Y")
async function blockUser(req, res) {
  try {
    const { userId } = req.params;

    // Find the user by ID
    const user = await UserInternal.findById(userId);

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the isDeleted field to "Y"
    user.userAccStatus = "disable";

    // Save the changes
    await user.save();

    res.status(200).json({ message: "User successfully Block" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}





// Export the controller methods
module.exports = {
  createUser,
  getAllUsers,
  createUserOne,
  loginUser,
  updateUser,
  updateUserOne,
  getUserById,
  getUserByRole,
  getUserByRequest,
  deleteUser,
  blockUser,
  acceptUser,

  listByCompanyCode
  // Add more controller methods as needed
};
