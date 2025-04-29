import { useState, useEffect } from "react";

const UsernameModal = ({ isOpen, onClose, user, onUsernameUpdated }) => {
  const [username, setUsername] = useState(user?.username || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user]);

  const handleUsernameUpdated = async () => {
    if (!username.trim()) {
      setError("Username cannot be empty.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${BASE_URL}/auth/update-username`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, newUsername: username }),
      });

      const data = await response.json();

      if (response.ok) {
        onUsernameUpdated(username, data.token);
        onClose();
      } else {
        setError(data.message || "Failed to update username.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      console.error("Error updating username:", error);
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center gradient
 bg-opacity-50">
      <div className="gradient
 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold text-gray-800">Set Your Username</h2>
        <p className="text-sm text-gray-600">You can proceed with the default username or change it.</p>

        <input
          type="text"
          className="mt-4 w-full p-2 border rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <div className="flex justify-end gap-3 mt-4">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
            Skip
          </button>
          <button
            className="px-4 py-2 gradient
 text-white rounded disabled:opacity-50"
            onClick={handleUsernameUpdated}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsernameModal;
