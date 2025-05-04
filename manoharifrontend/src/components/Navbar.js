import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav className="navbar">
    <h1>🛒 Manohari</h1>
    <ul>
      <li><Link to="/">Home</Link></li>
      <li><Link to="/cart">Cart</Link></li>
      <li><Link to="/add">Add Product</Link></li>
    </ul>
  </nav>
);

export default Navbar;
