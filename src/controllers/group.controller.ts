import { pool } from "../db/db";

export const getGroups = async (req, res) => {
  const response = await pool.query(
    "SELECT g.group_name, COUNT(gm.student_id) AS number_of_members, g.creation_date FROM groups g INNER JOIN group_members gm ON g.group_id = gm.group_id GROUP BY g.group_id, g.group_name, g.creation_date;"
  );
  res.status(200).json(response.rows);
};

export const getListStudents = async (req, res) => {
  const response = await pool.query(
    "SELECT u.names || ' ' || u.last_names AS student_name, u.email, u.user_type AS role, STRING_AGG(g.group_name, ', ') AS groups FROM users u JOIN group_members gm ON u.user_id = gm.student_id JOIN groups g ON gm.group_id = g.group_id WHERE u.user_type = 'estudiante' GROUP BY u.user_id, u.names, u.last_names, u.email, u.user_type;"
  );
  res.status(200).json(response.rows);
};
