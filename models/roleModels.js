const mongoose = require("mongoose");
// const { ObjectId } = require("mongodb");

// Define your schema
const roleSchema = new mongoose.Schema({
  // Define your schema fields
  // For example:
  hierarchyCode: {
    type: String,
    required: [true, "Please enter company Code"],
  },
  roleName: {
    type: String,
    required: [true, "Please enter company Code"],
  },
  roleType: {
    type: String,
    required: [true, "Please enter roleType"],
  },
  roleAccess: {
    type: Array,
  },
  isDeleted: {
    type: Boolean,
    enum: [true, false],
    default: false // true dan false
  }
}, {
  timestamps: true,
});

// // Access the desired connection from dbList and create the model
// async function createAndExportCompanyModel() {
//   try {
//     // Wait for dbList to resolve
//     const dbList = await dbListPromise;
    
//     // Access the desired connection from dbList
//     const testERP_core_connection = dbList["testERP_core"];

//     // If the connection is available, create and export the model
//     if (testERP_core_connection) {
//       const Company = testERP_core_connection.model("role", roleSchema, "role");
//       return Company;
//     } else {
//       throw new Error("testERP_core database connection not found");
//     }
//   } catch (error) {
//     console.error("Error creating Role model:", error);
//     throw error;
//   }
// }

// Export the function to create and get the Company model
// module.exports = createAndExportCompanyModel;

const Role = mongoose.model("role", roleSchema);

module.exports = Role;
