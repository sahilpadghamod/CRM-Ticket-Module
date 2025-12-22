import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = ({ user, setUser }) => {
  const [tickets, setTickets] = useState([]);
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [newTicket, setNewTicket] = useState({ title: "", description: "", assigned_to: "", file: null });
  const [view, setView] = useState("tickets");


  const fetchTickets = async () => {
    try {
      const res = await axios.get(`http://localhost/ticket-api/api.php?action=tickets&user_id=${user.id}&role=${user.role}`);
      if (res.data.status) setTickets(res.data.data);
    } catch (err) {
      console.error("Error fetching tickets", err);
    }
  };

  const fetchAssignableUsers = async () => {
    try {
      const res = await axios.get(`http://localhost/ticket-api/api.php?action=users`);
      if (res.data.status) setAssignableUsers(res.data.data);
    } catch (err) {
      console.error("Error fetching assignable users", err);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`http://localhost/ticket-api/api.php?action=all_users`);
      if (res.data.status) setAllUsers(res.data.data);
    } catch (err) {
      console.error("Error fetching all users", err);
    }
  };

  useEffect(() => {
    fetchTickets();
    if (user.role === 'author') {
      fetchAssignableUsers();
    }
  }, []);

  useEffect(() => {
    if (view === 'users' && user.role === 'author') {
      fetchAllUsers();
    }
  }, [view]);


  const formatDate = (dateString) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", newTicket.title);
    formData.append("description", newTicket.description);
    formData.append("assigned_to", newTicket.assigned_to);
    formData.append("created_by", user.id);
    if (newTicket.file) formData.append("file", newTicket.file);

    await axios.post("http://localhost/ticket-api/api.php?action=create_ticket", formData);
    alert("Ticket Created Successfully");
    fetchTickets(); 
    setNewTicket({ title: "", description: "", assigned_to: "", file: null });
  };

  const handleUpdate = async (id, status, title = null, desc = null) => {
    const payload = { id, status, role: user.role, title, description: desc };
    await axios.post("http://localhost/ticket-api/api.php?action=update_ticket", payload);
    fetchTickets();
  };

  const handleDeleteTicket = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    
    const res = await axios.post("http://localhost/ticket-api/api.php?action=delete_ticket", {
      id: id,
      role: user.role
    });

    if (res.data.status) {
      alert("Ticket deleted");
      fetchTickets();
    } else {
      alert(res.data.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      const res = await axios.post("http://localhost/ticket-api/api.php?action=delete_user", { id: userId });
      
      if (res.data.status) {
        alert("User deleted successfully.");
        fetchAllUsers();
        fetchAssignableUsers();
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("Error deleting user", err);
      alert("Failed to delete user.");
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <div className="container">
      <div className="header" style={{ marginBottom: "20px", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1>Ticket Dashboard</h1>
            <p>Logged in as: <strong>{user.name}</strong> ({user.role})</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {user.role === 'author' && (
              <>
                <button 
                  onClick={() => setView('tickets')} 
                  style={{ background: view === 'tickets' ? '#0078d4' : '#ccc' }}
                >
                  Tickets
                </button>
                <button 
                  onClick={() => setView('users')}
                  style={{ background: view === 'users' ? '#0078d4' : '#ccc' }}
                >
                  User Management
                </button>
              </>
            )}
            <button className="logout-btn" onClick={logout} style={{ background: "#d13438" }}>Logout</button>
          </div>
        </div>
      </div>

      {view === 'users' && user.role === 'author' ? (
        <div>
          <h2>User Management</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
            <thead>
              <tr style={{ background: "#f0f0f0", textAlign: "left" }}>
                <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>ID</th>
                <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>Name</th>
                <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>Email</th>
                <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>Role</th>
                <th style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.length > 0 ? (
                allUsers.map((u) => (
                  <tr key={u.id}>
                    <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{u.id}</td>
                    <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{u.name}</td>
                    <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>{u.email}</td>
                    <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                      <span style={{ 
                        padding: "2px 8px", 
                        borderRadius: "4px", 
                        background: u.role === 'author' ? '#e1dfdd' : '#c7e0f4',
                        fontWeight: "bold",
                        fontSize: "0.9em"
                      }}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>

                      {user.id !== u.id && (
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          style={{ 
                            background: "#d13438", 
                            color: "white", 
                            border: "none", 
                            padding: "5px 10px", 
                            cursor: "pointer",
                            borderRadius: "4px"
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ padding: "20px", textAlign: "center" }}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          {user.role === 'author' && (
            <div style={{ marginBottom: "30px", padding: "20px", background: "#f9f9f9", borderRadius: "8px" }}>
              <h3>Create New Ticket</h3>
              <form onSubmit={handleCreate} style={{ display: "grid", gap: "10px" }}>
                <input placeholder="Ticket Title" onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })} value={newTicket.title} required />
                <input placeholder="Detailed Description" onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })} value={newTicket.description} required />
                <select onChange={(e) => setNewTicket({ ...newTicket, assigned_to: e.target.value })} value={newTicket.assigned_to} required>
                  <option value="">Select Assignee (User)</option>
                  {assignableUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <input type="file" onChange={(e) => setNewTicket({ ...newTicket, file: e.target.files[0] })} />
                <button type="submit">Post Ticket</button>
              </form>
            </div>
          )}

          <h3>Current Tickets</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>File</th>
                <th>Status</th>
                <th>{user.role === 'author' ? 'Assigned To' : 'Created By'}</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket.id}>
                  <td>{ticket.id}</td>
                  <td>
                    <strong>{ticket.title}</strong><br/>
                    <small style={{color: '#666'}}>{ticket.description}</small>
                  </td>
                  <td>
                    {ticket.file_path ? (
                      <a href={`http://localhost/ticket-api/${ticket.file_path}`} target="_blank" rel="noreferrer">View</a>
                    ) : "None"}
                  </td>
                  <td>
                    <span className={`status-${ticket.status}`}>{ticket.status.toUpperCase()}</span>
                  </td>

                    <td>{user.role === 'author' ? ticket.assigned_name : ticket.author_name}</td>


                  <td style={{ fontSize: "12px" }}>
                    {formatDate(ticket.created_at)}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <select 
                        value={ticket.status} 
                        onChange={(e) => handleUpdate(ticket.id, e.target.value, ticket.title, ticket.description)}
                        style={{ width: "auto", margin: 0, padding: "5px" }}
                      >
                        {user.role === 'author' ? (
                          <>
                            <option value="pending">Pending</option>
                            <option value="inprogress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="onhold">On Hold</option>
                          </>
                        ) : (
                          <>
                            <option value="inprogress">In Progress</option>
                            <option value="completed">Completed</option>
                          </>
                        )}
                      </select>

                      {user.role === 'author' && (
                        <button 
                          onClick={() => handleDeleteTicket(ticket.id)} 
                          style={{ width: "auto", margin: 0, padding: "5px 10px", backgroundColor: "#d13438" }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default Dashboard;