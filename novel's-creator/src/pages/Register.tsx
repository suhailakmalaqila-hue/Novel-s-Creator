import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../contexts/AuthContext";

export default function Register() {
  const navigate =
    useNavigate();

  const {
    register,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [authorName, setAuthorName] =
    useState("");

  const [penName, setPenName] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await register({
        email,
        password,
        authorName,
        penName,
      });

      navigate("/");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Registrasi gagal"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
    >
      <input
        value={authorName}
        onChange={(event) =>
          setAuthorName(
            event.target.value
          )
        }
        placeholder="Nama penulis"
      />

      <input
        value={penName}
        onChange={(event) =>
          setPenName(
            event.target.value
          )
        }
        placeholder="Nama pena"
      />

      <input
        type="email"
        value={email}
        onChange={(event) =>
          setEmail(
            event.target.value
          )
        }
        placeholder="Email"
        required
      />

      <input
        type="password"
        value={password}
        onChange={(event) =>
          setPassword(
            event.target.value
          )
        }
        placeholder="Password"
        minLength={8}
        required
      />

      {error && (
        <p>{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
      >
        {loading
          ? "Membuat akun..."
          : "Daftar"}
      </button>
    </form>
  );
}