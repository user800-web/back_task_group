import { pool } from "../db/db";

export const loginHandler = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  const response = await pool.query(
    "SELECT * FROM users WHERE email = $1 AND password = $2",
    [email, password]
  );
  if (response.rows.length > 0) {
    const { password, ...userWithoutPassword } = response.rows[0];
    res.json({ message: "Autenticado", user: userWithoutPassword });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};
