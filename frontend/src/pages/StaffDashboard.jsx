import React, { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';
import { Plus, Edit, Trash2, X, Barcode as BarcodeIcon, Camera, Search, Filter } from 'lucide-react';
import Scanner from '../components/Scanner';

const StaffDashboard = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', stock: '', barcode: '', weightValue: '', weightUnit: 'kg' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Search/Filter/Sort States
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterStock, setFilterStock] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.barcode.includes(searchTerm)
    );

    if (filterStock === 'low') {
      result = result.filter(p => p.stock < 10);
    } else if (filterStock === 'out') {
      result = result.filter(p => p.stock === 0);
    }

    result.sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'stock') return a.stock - b.stock;
      return a.name.localeCompare(b.name);
    });

    setFilteredProducts(result);
  }, [searchTerm, sortBy, filterStock, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, formData);
      } else {
        await createProduct(formData);
      }
      setShowModal(false);
      setEditingProduct(null);
      setFormData({ name: '', price: '', stock: '', barcode: '', weight: '' });
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({ 
      name: product.name, 
      price: product.price, 
      stock: product.stock, 
      barcode: product.barcode,
      weightValue: product.weightValue || 0,
      weightUnit: product.weightUnit || 'kg'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product? It will still exist in the database for order history but will be removed from future cart additions if active status is added. For now, this is a permanent delete.')) {
      try {
        await deleteProduct(id);
        fetchProducts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleScan = (code) => {
    console.log("Scanned Barcode (Staff):", code);
    setFormData({ ...formData, barcode: code });
    setShowScanner(false);
  };

  return (
    <div className="container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1>Centralized Inventory</h1>
          <p style={{ color: 'var(--text-muted)' }}>Managing products for the entire supermarket</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setEditingProduct(null); setFormData({ name: '', price: '', stock: '', barcode: '', weight: '' }); }}>
          <Plus size={18} /> Add New Product
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div className="grid grid-3" style={{ gap: '1rem', alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label">Search Products</label>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Name or barcode..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label">Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Name (A-Z)</option>
              <option value="price">Price (Low to High)</option>
              <option value="stock">Stock (Low to High)</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="label">Stock Filter</label>
            <select value={filterStock} onChange={(e) => setFilterStock(e.target.value)}>
              <option value="all">All Products</option>
              <option value="low">Low Stock ({"<"}10)</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? <p>Loading inventory...</p> : (
          <table>
            <thead>
              <tr>
                <th>Barcode</th>
                <th>Name</th>
                <th>Price</th>
                <th>Weight</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product._id} className={product.stock === 0 ? 'bg-muted' : ''}>
                  <td><code>{product.barcode}</code></td>
                  <td>{product.name}</td>
                  <td>${product.price ? product.price.toFixed(2) : '0.00'}</td>
                  <td>{product.weightValue}{product.weightUnit}</td>
                  <td>
                    <span className={`badge ${product.stock < 10 ? 'badge-danger' : 'badge-success'}`}>
                      {product.stock} units
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-outline" style={{ padding: '0.4rem', marginRight: '0.5rem' }} onClick={() => handleEdit(product)}>
                      <Edit size={16} />
                    </button>
                    <button className="btn btn-outline" style={{ padding: '0.4rem', color: 'var(--danger)' }} onClick={() => handleDelete(product._id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', animation: 'fadeIn 0.3s ease', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button className="btn btn-outline" style={{ padding: '0.2rem' }} onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            {error && <div className="badge badge-danger" style={{ width: '100%', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}
            
            {showScanner ? (
              <Scanner onScan={handleScan} onClose={() => setShowScanner(false)} />
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="label">Barcode</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      placeholder="Scan or enter barcode" 
                      required 
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })} 
                    />
                    <button 
                      type="button" 
                      className="btn btn-outline" 
                      onClick={() => setShowScanner(true)}
                      title="Open Barcode Scanner"
                      style={{ height: '45px' }}
                    >
                      <Camera size={18} />
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">Product Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter product name" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  />
                </div>
                <div className="grid grid-3">
                  <div className="form-group">
                    <label className="label">Price ($)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      required 
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Stock</label>
                    <input 
                      type="number" 
                      placeholder="0" 
                      required 
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })} 
                    />
                  </div>
                  <div className="form-group" style={{ display: 'flex', gap: '0.5rem', marginBottom: 0 }}>
                    <div style={{ flex: 2 }}>
                      <label className="label">Weight</label>
                      <input 
                        type="number" 
                        step="0.1"
                        placeholder="0.0" 
                        value={formData.weightValue}
                        onChange={(e) => setFormData({ ...formData, weightValue: e.target.value })} 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="label">Unit</label>
                      <select 
                        value={formData.weightUnit}
                        onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })}
                        style={{ height: '45px' }}
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  {editingProduct ? 'Update Product' : 'Save Product'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
