const { query } = require("../Config/database.config");
const {
  createTablesQueries,
  insertAdminUser,
  insertAdminIntoAdminsTable,
} = require("./sql/DataBase.schema");


const installation = async () => {
  try {
    // Execute table creation queries
    for (const [index, queryText] of createTablesQueries.entries()) {
      await query(queryText); 
      console.log(`Query ${index + 1} executed successfully.`);
    }

    // Insert admin user with hashed password
    const { query: adminInsertQuery, values } = await insertAdminUser();
    await query(adminInsertQuery, values); // Insert admin user
    console.log("Admin user inserted successfully.");

    // Insert admin role in the admins table
    await query(insertAdminIntoAdminsTable);
    console.log("Admin role assigned successfully.");

    return {
      success: true,
      message: "All queries executed successfully and admin user inserted.",
    };
  } catch (error) {
    console.error(`Error executing query:`, error.message);
    return { success: false, message: error.message };
  }
};

module.exports = { installation };
