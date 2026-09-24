import pool from "../config/database.js";
import bcrypt from "bcrypt";

async function seed() {
  try {
    console.log("Memulai proses seed...");

    // 1. Kosongkan semua data user (dan tabel terkait jika ada)
    await pool.query("TRUNCATE TABLE users CASCADE;");
    console.log("Data user lama berhasil dihapus.");

    // 2. Hash password untuk Admin
    const rawPassword = "adminpassword123"; // Ubah password admin di sini
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);

    // 3. Insert akun Admin baru
    const insertQuery = `
      INSERT INTO users (id, email, password_hash, role, author_name)
      VALUES (gen_random_uuid(), $1, $2, $3, $4)
      RETURNING id, email, role;
    `;

    const values = [
      "admin@example.com",
      hashedPassword,
      "admin",
      "Super Admin"
    ];

    const result = await pool.query(insertQuery, values);

    console.log("--- SEED BERHASIL ---");
    console.log("Akun Admin dibuat:", result.rows[0]);
    console.log("Password:", rawPassword);

  } catch (error) {
    console.error("Gagal melakukan seed database:", error);
  } finally {
    await pool.end();
  }
}

seed();
