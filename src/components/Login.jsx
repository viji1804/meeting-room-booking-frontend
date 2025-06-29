import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Player } from "@lottiefiles/react-lottie-player";
import { Typewriter } from "react-simple-typewriter";

const Login = ({ setUser }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isSignup ? "api/users/signup" : "api/users/login";
    const payload = isSignup ? { name, email, password } : { email, password };

    try {
      const res = await fetch(`https://meeting-room-booking-backend-nto9.onrender.com/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const user = await res.json();
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
        navigate("/dashboard");
      } else {
        const err = await res.json();

        // Improved error alert to stringify the error object if needed
        const errorMessage =
          typeof err.error === "string"
            ? err.error
            : JSON.stringify(err, null, 2);

        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Network error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-sky-100 to-cyan-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md space-y-6"
      >
        <Player
          autoplay
          loop
          src="https://assets4.lottiefiles.com/packages/lf20_jcikwtux.json"
          style={{ height: "150px", margin: "0 auto" }}
        />

        <h1 className="text-3xl font-extrabold text-blue-700 mb-1 text-center">
          <Typewriter
            words={[
              "Book a Meeting Room",
              "Seamless Scheduling",
              "Fast. Simple. Smart.",
            ]}
            loop
            cursor
            cursorStyle="_"
            typeSpeed={60}
            deleteSpeed={40}
            delaySpeed={1500}
          />
        </h1>

        <h2 className="text-2xl font-extrabold text-center text-blue-700">
          {isSignup ? "Sign Up" : "Log In"}
        </h2>

        {isSignup && (
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        )}

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
          />
          <span
            className="absolute right-3 top-3 cursor-pointer text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </span>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
        >
          {isSignup ? "Sign Up" : "Log In"}
        </button>

        <p className="text-center text-sm">
          {isSignup ? "Already have an account?" : "New here?"}{" "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? "Log In" : "Sign Up"}
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
