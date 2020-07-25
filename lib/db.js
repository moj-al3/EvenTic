const mysql = require('serverless-mysql')

const db = mysql({
  config: {
    host: "mysql-10929-0.cloudclusters.net",
    port: "10929",
    user: "mojtaba",
    password: "admin",
    database: "eventtic",
  }
})

exports.query = async (query,arg) => {
  try {
    
    const results = await db.query(query,arg);
    await db.end();
    return results
  } catch (error) {
    return { error }
  }
}