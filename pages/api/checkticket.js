import mysql from "../../lib/db";
export default async (req, res) => {
  var sql = "select * from tickets where ID=? and address=?;";
  var arg = [req.query.ID,req.query.address];
  const result = await mysql.query(sql,arg);
  //this means that the ticket is valid from the DB point of view
  if (result.length == 0) {
    res.status(200).json({ id: 1 });
  }
   //this means that the ticket is Invalid from the DB point of view
  else {
    res.status(200).json({ id: 0 });
  }
};
