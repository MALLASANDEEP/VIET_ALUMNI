import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAddAdmin } from "@/hooks/useAddAdmin";

type AdminUser = {
  user_id: string;
  email: string;
  full_name: string | null;
};

const AdminManageAdmins = () => {
  const { addAdmin, deleteAdmin, loading, error, success } = useAddAdmin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [fetching, setFetching] = useState(false);

  // ✅ Fetch existing admins properly (NO JOIN)
  const fetchAdmins = async () => {
    setFetching(true);

    try {
      // 1️⃣ Get admin user IDs
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      if (rolesError) throw rolesError;

      if (!rolesData || rolesData.length === 0) {
        setAdmins([]);
        setFetching(false);
        return;
      }

      const userIds = rolesData.map((r) => r.user_id);

      // 2️⃣ Fetch matching profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, email, full_name")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      setAdmins(profilesData || []);
    } catch (err) {
      console.error("Fetch Admins Error:", err);
    }

    setFetching(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // ✅ Handle Add Admin
  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    await addAdmin(email, password, fullName);
    setEmail("");
    setPassword("");
    setFullName("");
    fetchAdmins();
  };

  // ✅ Handle Delete
  const handleDelete = async (userId: string) => {
    await deleteAdmin(userId);
    fetchAdmins();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-6">Manage Admins</h1>

        {/* Add Admin Form */}
        <form onSubmit={handleAddAdmin} className="space-y-4 mb-8">
          <div>
            <label className="block font-medium">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="block font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="Enter email"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded"
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? "Adding..." : "Add Admin"}
          </button>
        </form>

        {/* Status Messages */}
        {error && (
          <div className="mb-4 text-red-600 font-medium">{error}</div>
        )}
        {success && (
          <div className="mb-4 text-green-600 font-medium">{success}</div>
        )}

        {/* Admin List */}
        <h2 className="text-xl font-semibold mb-4">Existing Admins</h2>

        {fetching ? (
          <p>Loading admins...</p>
        ) : admins.length === 0 ? (
          <p>No admins found.</p>
        ) : (
          <div className="space-y-3">
            {admins.map((admin) => (
              <div
                key={admin.user_id}
                className="flex justify-between items-center border p-3 rounded"
              >
                <div>
                  <p className="font-medium">
                    {admin.full_name || "No Name"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {admin.email}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(admin.user_id)}
                  className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManageAdmins;
