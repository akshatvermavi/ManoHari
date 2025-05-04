import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <img src={`https://via.placeholder.com/150?text=${product.name}`} alt={product.name} />
      <h3>{product.name}</h3>
      <p>₹{product.price}</p>
      <div className="buttons">
        <Link to={`/product/${product.id}`} className="btn">View</Link>
      </div>
    </div>
  );
};

export default ProductCard;
