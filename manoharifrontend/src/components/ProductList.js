import React, { useEffect, useState } from 'react';
import { getAllProducts } from '../services/productService';
import ProductCard from './ProductCard';

const ProductList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getAllProducts().then(res => setProducts(res.data));
  }, []);

  return (
    <div className="product-grid">
      {products.map(prod => <ProductCard key={prod.id} product={prod} />)}
    </div>
  );
};

export default ProductList;
