const mongoose = require("mongoose");
// const dbListPromise = require("../functions/connectToDatabases");

// Define your schema
const utilitiesSchema = new mongoose.Schema({
  // Define your schema fields
  // For example:
  utilName: {
    type: String,
    required: [true, "Please enter your name"],
  },
  utilCode: {
    type: Number,
    required: [true, "Please enter your name"],
  },
  utilData: {
    type: Array
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
// async function createAndExportUtilitiesModel() {
//   try {
//     // Wait for dbList to resolve
//     const dbList = await dbListPromise;
    
//     // Access the desired connection from dbList
//     const testERP_utils_connection = dbList["testERP_utils"];

//     // If the connection is available, create and export the model
//     if (testERP_utils_connection) {
//       const Utilities = testERP_utils_connection.model("utilities", utilitiesSchema, "utilities");
//       return Utilities;
//     } else {
//       throw new Error("testERP_utils database connection not found");
//     }
//   } catch (error) {
//     console.error("Error creating Utilities model:", error);
//     throw error;
//   }
// }

// // Export the function to create and get the Utilities model
// module.exports = createAndExportUtilitiesModel;

const Utilities = mongoose.model("utilities", utilitiesSchema);

module.exports = Utilities;