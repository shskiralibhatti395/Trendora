import { useState, useEffect } from "react";
import { apiFetch, setToken, getToken, clearToken } from "./api.js";

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (data.token) {
        setToken(data.token);
      }

      if (data.user && data.user.role === "admin") {
        onLogin(data.user);
      } else {
        setError("This account is not an admin");
      }
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f5f5f5",
      fontFamily: "Arial, sans-serif",
    }}>
      <form onSubmit={handleSubmit} style={{
        background: "white",
        padding: "40px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        width: "350px",
      }}>
        <h1 style={{ textAlign: "center", marginBottom: "24px", fontSize: "24px" }}>
          Admin Login
        </h1>

        {error && (
          <p style={{ color: "red", fontSize: "14px", marginBottom: "12px" }}>{error}</p>
        )}

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "bold" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "bold" }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            background: "#000",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

function Dashboard({ user, onLogout }) {
  const [tab, setTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tab === "products") fetchProducts();
    else if (tab === "orders") fetchOrders();
    else if (tab === "users") fetchUsers();
  }, [tab]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/admin/products");
      setProducts(data.products || []);
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/admin/orders");
      setOrders(data.orders || []);
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/admin/users");
      setUsers(data.users || []);
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  const deleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await apiFetch("/admin/products/" + id, { method: "DELETE" });
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await apiFetch("/admin/orders/" + id, {
        method: "PUT",
        body: JSON.stringify({ orderStatus: status }),
      });
      fetchOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleBlockUser = async (id, isBlocked) => {
    try {
      await apiFetch("/admin/users/" + id, {
        method: "PUT",
        body: JSON.stringify({ isBlocked: !isBlocked }),
      });
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      background: "#f5f5f5",
      fontFamily: "Arial, sans-serif",
    },
    header: {
      background: "#000",
      color: "white",
      padding: "16px 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    nav: {
      display: "flex",
      gap: "8px",
    },
    tabBtn: {
      padding: "8px 16px",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
    },
    activeTab: {
      background: "white",
      color: "black",
    },
    inactiveTab: {
      background: "rgba(255,255,255,0.2)",
      color: "white",
    },
    content: {
      padding: "24px",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      background: "white",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
    },
    th: {
      background: "#f9f9f9",
      padding: "12px",
      textAlign: "left",
      fontSize: "12px",
      fontWeight: "bold",
      borderBottom: "2px solid #eee",
    },
    td: {
      padding: "12px",
      borderBottom: "1px solid #eee",
      fontSize: "13px",
    },
    btn: {
      padding: "4px 10px",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "12px",
    },
    card: {
      background: "white",
      padding: "24px",
      borderRadius: "8px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
      marginBottom: "16px",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{ margin: 0, fontSize: "18px" }}>Admin Panel</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "13px", opacity: 0.8 }}>{user.name}</span>
          <button onClick={onLogout} style={{ ...styles.btn, background: "#333", color: "white" }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ padding: "12px 24px", background: "white", borderBottom: "1px solid #ddd" }}>
        <div style={styles.nav}>
          {["dashboard", "products", "orders", "users"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                ...styles.tabBtn,
                ...(tab === t ? styles.activeTab : styles.inactiveTab),
                background: tab === t ? "#000" : "#e0e0e0",
                color: tab === t ? "white" : "#333",
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.content}>
        {loading && <p>Loading...</p>}

        {!loading && tab === "dashboard" && (
          <div>
            <div style={styles.card}>
              <h3>Welcome, {user.name}</h3>
              <p>Use the tabs above to manage products, orders, and users.</p>
              <p><strong>Total Products:</strong> {products.length}</p>
              <p><strong>Total Orders:</strong> {orders.length}</p>
              <p><strong>Total Users:</strong> {users.length}</p>
            </div>
          </div>
        )}

        {!loading && tab === "products" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ margin: 0 }}>Products</h3>
              <button onClick={fetchProducts} style={{ ...styles.btn, background: "#000", color: "white" }}>
                Refresh
              </button>
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Stock</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id || p.id}>
                    <td style={styles.td}>{p.name}</td>
                    <td style={styles.td}>${p.price}</td>
                    <td style={styles.td}>{p.category}</td>
                    <td style={styles.td}>{p.stock}</td>
                    <td style={styles.td}>
                      <button
                        onClick={() => deleteProduct(p._id || p.id)}
                        style={{ ...styles.btn, background: "#dc2626", color: "white" }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td style={styles.td} colSpan={5}>No products found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && tab === "orders" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ margin: 0 }}>Orders</h3>
              <button onClick={fetchOrders} style={{ ...styles.btn, background: "#000", color: "white" }}>
                Refresh
              </button>
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Order ID</th>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>Total</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id || o.id}>
                    <td style={styles.td}>{o.id}</td>
                    <td style={styles.td}>{o.customerName}</td>
                    <td style={styles.td}>${o.totalAmount || o.totalPrice}</td>
                    <td style={styles.td}>{o.orderStatus}</td>
                    <td style={styles.td}>
                      <select
                        value={o.orderStatus}
                        onChange={(e) => updateOrderStatus(o._id || o.id, e.target.value)}
                        style={{ padding: "4px 8px", fontSize: "12px" }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td style={styles.td} colSpan={5}>No orders found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && tab === "users" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ margin: 0 }}>Users</h3>
              <button onClick={fetchUsers} style={{ ...styles.btn, background: "#000", color: "white" }}>
                Refresh
              </button>
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id || u.id}>
                    <td style={styles.td}>{u.name}</td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>{u.role}</td>
                    <td style={styles.td}>{u.isBlocked ? "Blocked" : "Active"}</td>
                    <td style={styles.td}>
                      <button
                        onClick={() => toggleBlockUser(u._id || u.id, u.isBlocked)}
                        style={{
                          ...styles.btn,
                          background: u.isBlocked ? "#16a34a" : "#dc2626",
                          color: "white",
                        }}
                      >
                        {u.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td style={styles.td} colSpan={5}>No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const t = getToken();
    if (t) {
      apiFetch("/auth/me")
        .then((user) => {
          if (user.role === "admin") setAdmin(user);
        })
        .catch(() => clearToken());
    }
  }, []);

  const handleLogout = () => {
    clearToken();
    setAdmin(null);
  };

  if (!admin) {
    return <LoginPage onLogin={(u) => setAdmin(u)} />;
  }

  return <Dashboard user={admin} onLogout={handleLogout} />;
}
