import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../contexts/AuthContext";

export default function Login() {
  const navigate =
    useNavigate();

  const {
    login,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
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
      await login({
        email,
        password,
      });

      navigate("/");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Login gagal"
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
        type="email"
        value={email}
        onChange={(event) =>
          setEmail(event.target.value)
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
          ? "Memproses..."
          : "Login"}
      </button>
    </form>
  );
}