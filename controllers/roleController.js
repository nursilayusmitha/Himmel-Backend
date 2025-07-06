// companyController.js
require('dotenv').config();

// const createRoleModel = require("../models/roleModels");
// const createUserInternalModel = require("../models/userInternalModels");

// let Role 
// async function getRole() {
//     Role = await createRoleModel();
// }  
// getRole()

// let UserInternal 
// async function getUserInternal() {
//     UserInternal = await createUserInternalModel();
// }  
// getUserInternal()

const Role = require("../models/roleModels");
const UserInternal = require("../models/userInternalModels");

async function getSortedRole(req, res) {
  try {
    const { sortOrder } = req.params;

    // Build the query object
    const query = { isDeleted: false };

    // Determine sort direction: 1 for ascending, -1 for descending
    const sortDirection = sortOrder === 'up' ? 1 : -1;

    // Retrieve and sort roles based on hierarchyCode
    const roles = await Role.find(query).sort({ hierarchyCode: sortDirection });

    res.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
   
async function createRole(req, res) {
  try {
    const { hierarchyCode, roleName, roleType, roleAccess } = req.body;

    // Check for required fields
    if (!hierarchyCode || !roleName || !roleType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create a new role
    const newRole = new Role({
      hierarchyCode,
      roleName,
      roleType,
      roleAccess
    });

    // Try saving the new role to the database
    await newRole.save();

    res.status(201).json(newRole);
  } catch (error) {
    console.error("Error creating role:", error.message); // Log the error message
    res.status(500).json({ message: "Failed to save role", error: error.message });
  }
}



async function getRoleById(req, res) {
  try {
    const { id } = req.params;

    // Find the role by ID
    const role = await Role.findById(id);

    if (!role || role.isDeleted) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.json(role);
  } catch (error) {
    console.error("Error fetching role by ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


// Controller method to get all users
async function getAllRole(req, res) {
  try {
    // Retrieve all users from the database
    const role = await Role.find({ isDeleted: false });
    res.json(role);
  } catch (error) {
    console.error("Error fetching role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
// Controller method to get all roles
async function getAllRoleInternal(req, res) {
  try {
    // Extract hierarchyCode from request parameters
    const { hierarchyCode } = req.params;

    // Build the query object
    let query = { isDeleted: false };

    // Add condition to check hierarchyCode
    if (hierarchyCode && hierarchyCode < '1.0') {
      query.hierarchyCode = { $gte: hierarchyCode, $lt: "2.0" };
    } else if (hierarchyCode) {
      query.hierarchyCode = { $gt: hierarchyCode, $lt: "2.0" };
    } else {
      query.hierarchyCode = { $lt: "2.0" };
    }

    // Retrieve roles from the database based on the query
    const roles = await Role.find(query);

    res.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
// Controller method to get all roles
async function getAllRoleExternal(req, res) {
  try {
    // Extract hierarchyCode from request parameters
    const { hierarchyCode } = req.params;

    // Initialize the query object
    let query = { isDeleted: false };

    // Add condition based on hierarchyCode
    if (hierarchyCode && parseFloat(hierarchyCode) < 1.3) {
      query.hierarchyCode = { $gte: "2.0" };
    } else {
      res.json([]); // Return empty array if hierarchyCode is not provided or >= 1.3
      return;
    }

    // Retrieve roles from the database based on the query
    const roles = await Role.find(query);

    res.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function updateRole(req, res) {
  try {
    const { id } = req.params;
    const { hierarchyCode, roleName, roleType, roleAccess } = req.body;

    // Find the role by ID
    const role = await Role.findById(id);

    if (!role || role.isDeleted) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Update the fields
    if (hierarchyCode) role.hierarchyCode = hierarchyCode;
    if (roleName) role.roleName = roleName;
    if (roleType) role.roleType = roleType;
    if (roleAccess) role.roleAccess = roleAccess;

    // Save the updated role to the database
    await role.save();

    res.json(role);
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function deleteRole(req, res) {
  try {
    const { id } = req.params;

    // Find the role by ID
    const role = await Role.findById(id);

    if (!role || role.isDeleted) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Mark the role as deleted
    role.isDeleted = true;
    await role.save();

    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error("Error deleting role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


// Export the controller methods
module.exports = {
  getAllRole,
  getSortedRole,
  getAllRoleInternal,
  getAllRoleExternal,
  createRole,
  getRoleById,
  updateRole,
  deleteRole
};

