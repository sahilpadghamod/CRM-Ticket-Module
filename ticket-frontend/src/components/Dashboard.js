import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = ({ user, setUser }) => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]); 
  const [newTicket, setNewTicket] = useState({ title: "", description: "", assigned_to: "", file: null });

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`http://localhost/ticket-api/api.php?action=tickets&user_id=${user.id}&role=${user.role}`);
      if (res.data.status) setTickets(res.data.data);
    } catch (err) {
      console.error("Error fetching tickets", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`http://localhost/ticket-api/api.php?action=users`);
      if (res.data.status) setUsers(res.data.data);
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  useEffect(() => {
    fetchTickets();
    if (user.role === 'author') fetchUsers();
  }, []);

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
  };

  const handleUpdate = async (id, status, title = null, desc = null) => {
    const payload = { id, status, role: user.role, title, description: desc };
    await axios.post("http://localhost/ticket-api/api.php?action=update_ticket", payload);
    fetchTickets();
  };

  const handleDelete = async (id) => {
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

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>Ticket Dashboard</h1>
          <p>Logged in as: <strong>{user.name}</strong> ({user.role})</p>
        </div>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>

      {/* CREATE SECTION - ONLY FOR AUTHOR */}
      {user.role === 'author' && (
        <div style={{ marginBottom: "30px", padding: "20px", background: "#f9f9f9", borderRadius: "8px" }}>
          <h3>Create New Ticket</h3>
          <form onSubmit={handleCreate} style={{ display: "grid", gap: "10px" }}>
            <input placeholder="Ticket Title" onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })} required />
            <input placeholder="Detailed Description" onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })} required />
            <select onChange={(e) => setNewTicket({ ...newTicket, assigned_to: e.target.value })} required>
              <option value="">Select Assignee (User)</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <input type="file" onChange={(e) => setNewTicket({ ...newTicket, file: e.target.files[0] })} />
            <button type="submit">Post Ticket</button>
          </form>
        </div>
      )}

      {/* TICKETS TABLE */}
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
                      onClick={() => handleDelete(ticket.id)} 
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
    </div>
  );
};

export default Dashboard;