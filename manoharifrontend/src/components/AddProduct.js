// src/components/AddProduct.js
import React, { useState } from 'react';
import { addProduct } from '../services/productService';

const AddProduct = () => {
    const [product, setProduct] = useState({ id: '', name: '', price: '' });

    const handleChange = (e) => {
        setProduct({ ...product, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await addProduct(product);
        alert('Product added');
        setProduct({ id: '', name: '', price: '' });
    };

    return (
        <div className="container">
            <h2>Add Product</h2>
            <form onSubmit={handleSubmit}>
                <input type="number" name="id" placeholder="ID" value={product.id} onChange={handleChange} required />
                <input type="text" name="name" placeholder="Name" value={product.name} onChange={handleChange} required />
                <input type="number" name="price" placeholder="Price" value={product.price} onChange={handleChange} required />
                <button type="submit">Add Product</button>
            </form>
        </div>
    );
};

export default AddProduct;
