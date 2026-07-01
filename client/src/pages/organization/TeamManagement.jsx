import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getTeamMembers, getPendingInvites, inviteUser } from "../../services/orgService";

const TeamManagement = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("LIBRARIAN");

  const [teamMembers, setTeamMembers] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    try {
      const [membersRes, invitesRes] = await Promise.all([
        getTeamMembers(),
        getPendingInvites()
      ]);
      if (membersRes.data.success) setTeamMembers(membersRes.data.members);
      if (invitesRes.data.success) setPendingInvites(invitesRes.data.invites);
    } catch (error) {
      toast.error("Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter an email");
      return;
    }
    
    try {
      const res = await inviteUser({ email, role, organizationId: teamMembers[0]?.libraryId || null }); // Pass org ID if needed, backend infers it if Admin
      if (res.data.success) {
        toast.success(`Invitation sent to ${email}`);
        fetchTeamData();
        setEmail("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send invitation");
    }
  };

  if (loading) return <div className="p-6">Loading Team Management...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Team Management</h1>
          <p className="text-gray-600">Invite users and manage roles for your organization.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Invite Form */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 lg:col-span-1 h-fit">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Invite Team Member</h2>
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="colleague@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="LIBRARY_ADMIN">Library Admin</option>
                <option value="LIBRARIAN">Librarian</option>
                <option value="ASSISTANT">Assistant</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              Send Invitation
            </button>
          </form>
        </div>

        {/* Lists */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Pending Invites */}
          {pendingInvites.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Pending Invitations</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires In</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pendingInvites.map(invite => (
                      <tr key={invite._id}>
                        <td className="px-4 py-3 text-sm">{invite.email}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {invite.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-orange-600">Pending</td>
                        <td className="px-4 py-3 text-sm text-right">
                          <button className="text-red-600 hover:text-red-800 font-medium text-xs">Revoke</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Active Members */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Active Team Members</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {teamMembers.map(member => (
                    <tr key={member._id}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{member.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{member.email}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                          {member.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {member.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;
