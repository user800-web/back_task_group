import { pool } from "../db/db";

export const getUsers = async (req, res) => {
  const response = await pool.query("select * from courses");
  //console.log(response.rows);
  //res.send("users");
  res.status(200).json(response.rows);
};
