const mysql = require('serverless-mysql')

const db = mysql({
  config: {
    host: "mysql-11907-0.cloudclusters.net",
    port: "11907",
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
