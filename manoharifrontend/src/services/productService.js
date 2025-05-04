import axios from 'axios';

const BASE_URL = "http://localhost:8080/api/products";

export const getAllProducts = () => axios.get(BASE_URL);
export const getProductById = (id) => axios.get(`${BASE_URL}/${id}`);
export const addProduct = (product) => axios.post(BASE_URL, product);
export const updateProduct = (product) => axios.put(BASE_URL, product);
export const deleteProduct = (id) => axios.delete(`${BASE_URL}/${id}`);
