/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Printer, Download } from 'lucide-react';
import { motion } from 'motion/react';

interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  amount: number;
}

interface InvoiceData {
  logoUrl: string;
  logoType: 'square' | 'banner';
  invoiceNumber: string;
  gstin?: string;
  date: string;
  currency: string;
  discount: number;
  billedTo: {
    name: string;
    address: string;
    email: string;
  };
  from: {
    name: string;
    address: string;
    email: string;
  };
  items: InvoiceItem[];
  paymentMethod: 'Cash' | 'UPI';
  upiId?: string;
  note: string;
}

export default function App() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [data, setData] = useState<InvoiceData>({
    logoUrl: '',
    logoType: 'square',
    invoiceNumber: '000001',
    gstin: '',
    date: new Date().toISOString().split('T')[0],
    currency: '₹',
    discount: 0,
    billedTo: {
      name: 'Michael Brown',
      address: '9101 Oak Road, Metropolis',
      email: 'michaelbrown@example.com',
    },
    from: {
      name: 'Emily Johnson',
      address: '2345 Pine Lane, Villagetown',
      email: 'emilyjohnson@example.com',
    },
    items: [
      { id: '1', name: 'Logo Design', quantity: 1, price: 900, amount: 900 },
      { id: '2', name: 'Banner Design', quantity: 2, price: 45, amount: 90 },
      { id: '3', name: 'Poster Design', quantity: 3, price: 55, amount: 165 },
    ],
    paymentMethod: 'Cash',
    upiId: '',
    note: 'Thank you for choosing us!',
  });

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/guru-invoive/sw.js');
    }
    const handler = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData({ ...data, logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      price: 0,
      amount: 0,
    };
    setData({ ...data, items: [...data.items, newItem] });
  };

  const removeItem = (id: string) => {
    setData({ ...data, items: data.items.filter((item) => item.id !== id) });
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    const newItems = data.items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Auto-calculate amount if quantity or price changes
        if (field === 'quantity' || field === 'price') {
          updatedItem.amount = Number((updatedItem.quantity * updatedItem.price).toFixed(2));
        }
        return updatedItem;
      }
      return item;
    });
    setData({ ...data, items: newItems });
  };

  const subtotal = Number(data.items.reduce((sum, item) => sum + item.amount, 0).toFixed(2));
  const total = Number((subtotal - data.discount).toFixed(2));

  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex flex-col lg:flex-row gap-8 font-sans text-gray-900">
      {/* Input Form */}
      <div className="flex-1 bg-white p-8 rounded-2xl shadow-sm border border-gray-200 no-print max-w-full lg:max-w-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
          <h2 className="text-3xl font-bold tracking-tight text-black">Invoice Editor</h2>
          <div className="flex gap-2 items-center">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-black/10"
          >
            <Printer size={20} />
            Print Invoice
          </button>
          {installPrompt && (
            <button
              onClick={handleInstall}
              className="flex items-center gap-2 bg-gray-100 text-black px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-all active:scale-95"
            >
              <Download size={18} />
              Install App
            </button>
          )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo Image</label>
                <div className="flex items-center gap-4">
                  <div className={`border-2 border-dashed rounded flex items-center justify-center bg-gray-50 overflow-hidden ${data.logoType === 'square' ? 'w-20 h-20' : 'w-full h-20'}`}>
                    {data.logoUrl ? (
                      <img src={data.logoUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="text-xs text-gray-400">{data.logoType === 'square' ? '1:1 Logo' : 'Banner Logo'}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="cursor-pointer inline-block bg-gray-100 px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-200"
                    >
                      Choose File
                    </label>
                    {data.logoUrl && (
                      <button
                        onClick={() => setData({ ...data, logoUrl: '' })}
                        className="ml-2 text-xs text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo Style</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="logoType"
                      value="square"
                      checked={data.logoType === 'square'}
                      onChange={() => setData({ ...data, logoType: 'square' })}
                      className="w-4 h-4 accent-black"
                    />
                    <span className="text-sm font-medium group-hover:text-black transition-colors">Square (1:1)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="logoType"
                      value="banner"
                      checked={data.logoType === 'banner'}
                      onChange={() => setData({ ...data, logoType: 'banner' })}
                      className="w-4 h-4 accent-black"
                    />
                    <span className="text-sm font-medium group-hover:text-black transition-colors">Banner (Full Width)</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice No.</label>
                  <input
                    type="text"
                    value={data.invoiceNumber}
                    onChange={(e) => setData({ ...data, invoiceNumber: e.target.value })}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-black outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 22AAAAA0000A1Z5"
                    value={data.gstin}
                    onChange={(e) => setData({ ...data, gstin: e.target.value })}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-black outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={data.date}
                    onChange={(e) => setData({ ...data, date: e.target.value })}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-black outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    value={data.currency}
                    onChange={(e) => setData({ ...data, currency: e.target.value })}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-black outline-none"
                  >
                    <option value="₹">INR (₹)</option>
                    <option value="$">USD ($)</option>
                    <option value="€">EUR (€)</option>
                    <option value="£">GBP (£)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <hr />

          {/* Billed To & From */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-bold text-gray-700">Billed to:</h3>
              <input
                placeholder="Name"
                value={data.billedTo.name}
                onChange={(e) => setData({ ...data, billedTo: { ...data.billedTo, name: e.target.value } })}
                className="w-full p-2 border rounded"
              />
              <textarea
                placeholder="Address"
                value={data.billedTo.address}
                onChange={(e) => setData({ ...data, billedTo: { ...data.billedTo, address: e.target.value } })}
                className="w-full p-2 border rounded"
                rows={2}
              />
              <input
                placeholder="Email"
                value={data.billedTo.email}
                onChange={(e) => setData({ ...data, billedTo: { ...data.billedTo, email: e.target.value } })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-gray-700">From:</h3>
              <input
                placeholder="Name"
                value={data.from.name}
                onChange={(e) => setData({ ...data, from: { ...data.from, name: e.target.value } })}
                className="w-full p-2 border rounded"
              />
              <textarea
                placeholder="Address"
                value={data.from.address}
                onChange={(e) => setData({ ...data, from: { ...data.from, address: e.target.value } })}
                className="w-full p-2 border rounded"
                rows={2}
              />
              <input
                placeholder="Email"
                value={data.from.email}
                onChange={(e) => setData({ ...data, from: { ...data.from, email: e.target.value } })}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <hr />

          {/* Items Table */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-gray-700">Items</h3>
              <button
                onClick={addItem}
                className="flex items-center gap-1 text-sm bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
              >
                <Plus size={14} /> Add Item
              </button>
            </div>
            <div className="space-y-2">
              {data.items.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-2 items-start border-b sm:border-none pb-4 sm:pb-0">
                  <input
                    placeholder="Item Name"
                    value={item.name}
                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    className="w-full sm:flex-[3] p-2 border rounded text-sm"
                  />
                  <div className="flex gap-2 w-full sm:w-auto">
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-1/4 sm:w-16 p-2 border rounded text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                      className="w-1/4 sm:w-24 p-2 border rounded text-sm"
                    />
                    <div className="w-1/4 sm:w-24 p-2 border rounded text-sm bg-gray-50 font-poppins text-right flex items-center justify-end">
                      {item.amount}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr />

          {/* Totals & Footer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Amount ({data.currency})</label>
                <input
                  type="number"
                  value={data.discount}
                  onChange={(e) => setData({ ...data, discount: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-black outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash"
                      checked={data.paymentMethod === 'Cash'}
                      onChange={() => setData({ ...data, paymentMethod: 'Cash' })}
                      className="w-4 h-4 accent-black"
                    />
                    <span className="text-sm font-medium group-hover:text-black transition-colors">Cash</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="UPI"
                      checked={data.paymentMethod === 'UPI'}
                      onChange={() => setData({ ...data, paymentMethod: 'UPI' })}
                      className="w-4 h-4 accent-black"
                    />
                    <span className="text-sm font-medium group-hover:text-black transition-colors">UPI</span>
                  </label>
                </div>
              </div>
              {data.paymentMethod === 'UPI' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-2"
                >
                  <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. yourname@upi"
                    value={data.upiId}
                    onChange={(e) => setData({ ...data, upiId: e.target.value })}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-black outline-none text-sm"
                  />
                </motion.div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
              <textarea
                value={data.note}
                onChange={(e) => setData({ ...data, note: e.target.value })}
                className="w-full p-2 border rounded"
                rows={4}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="flex-1 flex justify-center items-start overflow-x-auto">
        <div className="invoice-container shadow-2xl">
          {/* Top Section */}
          {data.logoType === 'banner' ? (
            <div className="mb-4">
              <div className="w-full h-32 flex items-center justify-center overflow-hidden mb-4">
                {data.logoUrl ? (
                  <img src={data.logoUrl} alt="Company Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <div className="text-gray-300 font-bold uppercase tracking-[0.3em] border-2 border-dashed border-gray-200 p-4 w-full h-full flex items-center justify-center text-center text-sm">
                    BANNER LOGO
                  </div>
                )}
              </div>
              <div className="flex justify-end text-sm font-medium text-gray-500">
                NO. <span className="font-poppins text-gray-900 ml-1">{data.invoiceNumber}</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-start mb-8">
              <div className="w-32 h-32 flex items-center justify-start overflow-hidden">
                {data.logoUrl ? (
                  <img src={data.logoUrl} alt="Company Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <div className="text-gray-300 font-bold uppercase tracking-widest leading-tight border-2 border-dashed border-gray-200 p-4 w-full h-full flex items-center justify-center text-center text-[10px]">
                    YOUR LOGO
                  </div>
                )}
              </div>
              <div className="text-right text-sm font-medium">
                NO. <span className="font-poppins">{data.invoiceNumber}</span>
              </div>
            </div>
          )}

          {/* Title Section */}
          <div className="text-center mb-6">
            <h1 className="text-5xl font-bold tracking-[0.2em] text-black mb-2">INVOICE</h1>
            <div className="flex flex-col items-center gap-1 text-sm text-gray-500 uppercase tracking-widest">
              <div><span className="font-bold text-gray-900">Date:</span> {formatDate(data.date)}</div>
              {data.gstin && (
                <div><span className="font-bold text-gray-900">GSTIN:</span> <span className="font-poppins">{data.gstin}</span></div>
              )}
            </div>
          </div>

          {/* Billed To / From Section */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Billed to</h3>
              <div className="text-lg font-bold text-gray-900 mb-1">{data.billedTo.name}</div>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line mb-1">{data.billedTo.address}</div>
              <div className="text-sm text-gray-500">{data.billedTo.email}</div>
            </div>
            <div className="text-right">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">From</h3>
              <div className="text-lg font-bold text-gray-900 mb-1">{data.from.name}</div>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line mb-1">{data.from.address}</div>
              <div className="text-sm text-gray-500">{data.from.email}</div>
            </div>
          </div>

          {/* Table Section */}
          <table className="w-full mb-4 border-collapse">
            <thead>
              <tr className="bg-[#333333] text-white">
                <th className="text-left py-3 px-6 text-[11px] font-medium uppercase tracking-wider rounded-l-lg">Item</th>
                <th className="text-right py-3 px-6 text-[11px] font-medium uppercase tracking-wider">Quantity</th>
                <th className="text-right py-3 px-6 text-[11px] font-medium uppercase tracking-wider">Rate</th>
                <th className="text-right py-3 px-6 text-[11px] font-medium uppercase tracking-wider rounded-r-lg">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.items.map((item) => (
                <tr key={item.id}>
                  <td className="text-left py-4 px-6">{item.name}</td>
                  <td className="text-right py-4 px-6 font-poppins">{item.quantity}</td>
                  <td className="text-right py-4 px-6">
                    <span className="mr-0.5">{data.currency}</span>
                    <span className="font-poppins">{item.price}</span>
                  </td>
                  <td className="text-right py-4 px-6">
                    <span className="mr-0.5">{data.currency}</span>
                    <span className="font-poppins">{item.amount}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total Section */}
          <div className="border-t-2 border-black pt-3 mb-6">
            <div className="flex flex-col items-end space-y-2">
              <div className="w-[40%] flex justify-between items-center text-sm text-gray-600">
                <span>Subtotal</span>
                <span>
                  <span className="mr-1">{data.currency}</span>
                  <span className="font-poppins">{subtotal}</span>
                </span>
              </div>
              {data.discount > 0 && (
                <div className="w-[40%] flex justify-between items-center text-sm text-red-600">
                  <span>Discount</span>
                  <span>
                    <span className="mr-1">- {data.currency}</span>
                    <span className="font-poppins">{data.discount}</span>
                  </span>
                </div>
              )}
              <div className="w-[40%] flex justify-between items-center border-t border-gray-200 pt-4">
                <span className="font-bold text-xl text-black uppercase tracking-wider">Total</span>
                <span className="font-bold text-xl text-black">
                  <span className="mr-1">{data.currency}</span>
                  <span className="font-poppins">{total}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-2 gap-8 border-t border-gray-100 pt-8">
            <div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Payment Info</h3>
              <div className="text-sm">
                <span className="font-semibold text-gray-900">Method:</span> {data.paymentMethod}
              </div>
              {data.paymentMethod === 'UPI' && data.upiId && (
                <div className="text-sm mt-1">
                  <span className="font-semibold text-gray-900">UPI ID:</span> <span className="font-poppins text-gray-600">{data.upiId}</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Note</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {data.note}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
