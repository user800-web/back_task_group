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
interface GroupData {
  subject_id: number;
  created_teacher: number;
  creation_date: string;
  gruposConNombresID: Record<string, string>;
}
export const saveGroup = async (req, res) => {
  try {
    const {
      subject_id,
      created_teacher,
      creation_date,
      gruposConNombresID,
    }: GroupData = req.body;

    const groupEntries: { groupId: number; studentIds: string[] }[] = [];
    for (const [groupName, studentIds] of Object.entries(gruposConNombresID)) {
      if (typeof studentIds !== "string") {
        throw new Error("Invalid student IDs format for group" + groupName);
      }
      const result = await pool.query(
        "INSERT INTO groups (subject_id, created_teacher, group_name, creation_date) VALUES ($1, $2, $3, $4) RETURNING group_id",
        [subject_id, created_teacher, groupName, creation_date]
      );
      const groupId = result.rows[0].group_id;

      groupEntries.push({
        groupId,
        studentIds: studentIds.split(",").map((id) => id.trim()),
      });
    }

    for (const { groupId, studentIds } of groupEntries) {
      for (const studentId of studentIds) {
        await pool.query(
          "INSERT INTO group_members (student_id, group_id) VALUES ($1, $2)",
          [studentId, groupId]
        );
      }
    }

    res.json({ mensaje: "Grupos y miembros registrados con éxito" });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Ocurrió un error al procesar la solicitud." });
  }
};
