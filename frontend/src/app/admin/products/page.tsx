'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api'
import Image from 'next/image'
import { Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight, X, Upload, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['men', 'women', 'kids', 'beauty', 'home & kitchen', 'footwear', 'accessories']

export default function AdminProductsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<any>(null)
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: '', description: '', price: '', discountedPrice: '',
    discountPercent: '', category: '', subCategory: '', brand: '',
    stock: '', sku: '', featured: false,
    specifications: {} as Record<string, string>,
    tags: '',
  })
  const [specKey, setSpecKey] = useState('')
  const [specVal, setSpecVal] = useState('')
  const [saving, setSaving] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-products', search, page],
    queryFn: () => adminApi.getProducts({ search, page, size: 20 }).then((r) => r.data.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product deleted') },
  })

  const toggleMutation = useMutation({
    mutationFn: (id: string) => adminApi.toggleProduct(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Status updated') },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setImages(files)
    setImagePreviews(files.map((f) => URL.createObjectURL(f)))
  }

  const setField = (k: string, v: any) => setFormData((f) => ({ ...f, [k]: v }))

  const openEdit = (product: any) => {
    setEditProduct(product)
    setFormData({
      title: product.title, description: product.description,
      price: product.price, discountedPrice: product.discountedPrice || '',
      discountPercent: product.discountPercent || '', category: product.category,
      subCategory: product.subCategory || '', brand: product.brand || '',
      stock: product.stock, sku: product.sku || '', featured: product.featured,
      specifications: product.specifications || {}, tags: (product.tags || []).join(', '),
    })
    setImagePreviews(product.images || [])
    setImages([])
    setShowForm(true)
  }

  const resetForm = () => {
    setEditProduct(null)
    setImages([])
    setImagePreviews([])
    setFormData({ title: '', description: '', price: '', discountedPrice: '', discountPercent: '', category: '', subCategory: '', brand: '', stock: '', sku: '', featured: false, specifications: {}, tags: '' })
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      const productBlob = new Blob([JSON.stringify({
        ...formData,
        price: parseFloat(formData.price),
        discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : null,
        discountPercent: formData.discountPercent ? parseInt(formData.discountPercent) : null,
        stock: parseInt(formData.stock),
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        existingImages: editProduct ? (imagePreviews.filter((p) => p.startsWith('http'))) : [],
      })], { type: 'application/json' })
      fd.append('product', productBlob)
      images.forEach((img) => fd.append('images', img))

      if (editProduct) {
        await adminApi.updateProduct(editProduct.id, fd)
        toast.success('Product updated!')
      } else {
        await adminApi.createProduct(fd)
        toast.success('Product created!')
      }
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      resetForm()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save product')
    } finally { setSaving(false) }
  }

  const products = data?.content || []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.totalElements || 0} total products</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }}
          className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          className="input-field pl-9" placeholder="Search products..." />
      </div>

      {/* Product form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-start justify-center p-4 py-8">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="font-bold text-lg text-primary">{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={resetForm}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Images */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Product Images</label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-gold transition-colors">
                    <Upload size={24} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Click to upload images</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB each</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                  {imagePreviews.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {imagePreviews.map((src, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden">
                          <Image src={src} alt="" fill className="object-cover" />
                          <button type="button" onClick={() => { setImagePreviews(p => p.filter((_, j) => j !== i)); setImages(imgs => imgs.filter((_, j) => j !== i)) }}
                            className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full text-white flex items-center justify-center text-xs">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Title *</label>
                  <input value={formData.title} onChange={(e) => setField('title', e.target.value)} required className="input-field" placeholder="Product title" />
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Description *</label>
                  <textarea value={formData.description} onChange={(e) => setField('description', e.target.value)} required rows={3} className="input-field resize-none" placeholder="Product description" />
                </div>

                {/* Price row */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Price (₹) *</label>
                    <input type="number" value={formData.price} onChange={(e) => setField('price', e.target.value)} required className="input-field" placeholder="999" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Discounted (₹)</label>
                    <input type="number" value={formData.discountedPrice} onChange={(e) => setField('discountedPrice', e.target.value)} className="input-field" placeholder="799" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Discount %</label>
                    <input type="number" value={formData.discountPercent} onChange={(e) => setField('discountPercent', e.target.value)} className="input-field" placeholder="20" />
                  </div>
                </div>

                {/* Category, Brand */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Category *</label>
                    <select value={formData.category} onChange={(e) => setField('category', e.target.value)} required className="input-field">
                      <option value="">Select category</option>
                      {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Brand</label>
                    <input value={formData.brand} onChange={(e) => setField('brand', e.target.value)} className="input-field" placeholder="Nike, Puma..." />
                  </div>
                </div>

                {/* Stock, SKU */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Stock *</label>
                    <input type="number" value={formData.stock} onChange={(e) => setField('stock', e.target.value)} required className="input-field" placeholder="100" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">SKU</label>
                    <input value={formData.sku} onChange={(e) => setField('sku', e.target.value)} className="input-field" placeholder="MH-001" />
                  </div>
                </div>

                {/* Specifications */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Specifications (Color, Size, Material…)</label>
                  <div className="flex gap-2 mb-2">
                    <input value={specKey} onChange={(e) => setSpecKey(e.target.value)} className="input-field text-sm" placeholder="Key (e.g. Color)" />
                    <input value={specVal} onChange={(e) => setSpecVal(e.target.value)} className="input-field text-sm" placeholder="Value (e.g. Red)" />
                    <button type="button"
                      onClick={() => { if (specKey && specVal) { setField('specifications', { ...formData.specifications, [specKey]: specVal }); setSpecKey(''); setSpecVal('') } }}
                      className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium whitespace-nowrap">+ Add</button>
                  </div>
                  {Object.entries(formData.specifications).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(formData.specifications).map(([k, v]) => (
                        <span key={k} className="flex items-center gap-1.5 bg-gray-100 text-sm px-3 py-1 rounded-full">
                          <span className="font-medium">{k}:</span> {v}
                          <button type="button" onClick={() => { const s = { ...formData.specifications }; delete s[k]; setField('specifications', s) }} className="text-gray-400 hover:text-red-500">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Tags (comma-separated)</label>
                  <input value={formData.tags} onChange={(e) => setField('tags', e.target.value)} className="input-field" placeholder="summer, casual, trendy" />
                </div>

                {/* Featured */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.featured} onChange={(e) => setField('featured', e.target.checked)} className="rounded w-4 h-4" />
                  <span className="text-sm font-medium text-gray-700">Mark as Featured Product</span>
                </label>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2">
                    {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : (editProduct ? 'Update Product' : 'Create Product')}
                  </button>
                  <button type="button" onClick={resetForm} className="btn-outline px-6">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Products table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p: any) => (
                  <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {p.images?.[0] && <Image src={p.images[0]} alt={p.title} fill className="object-cover" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 max-w-[200px] truncate">{p.title}</p>
                          {p.brand && <p className="text-xs text-gray-400">{p.brand}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3"><span className="badge bg-gray-100 text-gray-600 capitalize">{p.category}</span></td>
                    <td className="px-5 py-3">
                      <div>
                        <span className="font-semibold">₹{(p.discountedPrice || p.price).toLocaleString('en-IN')}</span>
                        {p.discountedPrice && <span className="text-xs text-gray-400 line-through ml-1">₹{p.price}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`font-medium ${p.stock <= 5 ? 'text-red-600' : p.stock <= 20 ? 'text-yellow-600' : 'text-green-600'}`}>{p.stock}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`badge ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.active ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-primary transition-colors p-1.5 hover:bg-gray-100 rounded-lg">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => toggleMutation.mutate(p.id)} className="text-gray-400 hover:text-gold transition-colors p-1.5 hover:bg-gray-100 rounded-lg">
                          {p.active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                        </button>
                        <button onClick={() => { if (confirm('Delete this product?')) deleteMutation.mutate(p.id) }}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1.5 hover:bg-gray-100 rounded-lg">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">No products found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {data?.totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40">Prev</button>
            <span className="px-3 py-1.5 text-sm text-gray-500">Page {page + 1} of {data.totalPages}</span>
            <button onClick={() => setPage(Math.min(data.totalPages - 1, page + 1))} disabled={page >= data.totalPages - 1} className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-40">Next</button>
          </div>
        )}
      </div>
    </div>
  )
}
