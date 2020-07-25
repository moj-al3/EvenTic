import mysql from "../../lib/db";

export default async (req, res) => {
  const arg = [req.query.ID, req.query.address];

  var sql = "select * from tickets where ID=? and address=?;";
  var result = await mysql.query(sql, arg);

  //this means that this is the first time for this ticket
  if (result.length == 0) {
    sql = "INSERT INTO tickets VALUES (?,?);";
    result = await mysql.query(sql, arg);
    res.status(200).json({ id: "-1" });
  }
  //this means that this ticket has been checked to the system before
  else {
    res.status(200).json({ id: "0" });
  }
};
