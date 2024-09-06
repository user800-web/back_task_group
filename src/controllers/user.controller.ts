import { pool } from "../db/db";

export const getUsers = async (req, res) => {
  const response = await pool.query("select * from courses");
  //console.log(response.rows);
  //res.send("users");
  res.status(200).json(response.rows);
};

export const createUser = async (req, res) => {
  try {
    const {
      names,
      last_names,
      email,
      username,
      password,
      user_type,
      course_id,
    } = req.body;
    if (user_type === "estudiante") {
      await pool.query(
        "INSERT INTO users(names, last_names, email, username, password, user_type, course_id) VALUES ($1, $2, $3, $4, $5, $6, 1)",
        [names, last_names, email, username, password, user_type]
      );
      res.json({ mensaje: "Estudiante registrado" });
    } else {
      const response = await pool.query(
        "INSERT INTO users(names, last_names, email, username, password, user_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id",
        [names, last_names, email, username, password, user_type]
      );
      const teacher_id = response.rows[0].user_id;
      await pool.query(
        "INSERT INTO teacher_subject_course(teacher_id, subject_id, course_id) VALUES ($1, 1, 1);",
        [teacher_id]
      );
      res.json({ mensaje: "Profesor registrado" });
    }
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Ocurrió un error al procesar la solicitud." });
  }
};

export const getInfoGroups = async (req, res) => {
  const { student_id } = req.body;
  try {
    const response = await pool.query(
      "SELECT COUNT(g.group_id) AS number_of_groups, STRING_AGG(g.group_name, ', ') AS group_names FROM groups g JOIN group_members gm ON g.group_id = gm.group_id WHERE gm.student_id = $1 GROUP BY gm.student_id;",
      [student_id]
    );
    res.status(200).json(response.rows);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Ocurrió un error al procesar la solicitud." });
  }
};
