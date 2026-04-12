import { Link } from "react-router-dom";
import "../styles/navbar.css";

function Navbar() {
  return (
    <div className="navbar">
      <h2>Student Dashboard</h2>

      <Link to="/dashboard">Dashboard</Link>
      <Link to="/analytics">Analytics</Link>

    </div>
  )
}

export default Navbar;