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
      navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js');
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
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 print:block print:p-0 print:bg-white print:min-h-0">
      {/* Editor Panel */}
      <div className="no-print w-full bg-white border-b border-gray-200 shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
          <h2 className="text-xl font-bold tracking-tight text-black">Invoice Editor</h2>
          <div className="flex gap-2 items-center">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all active:scale-95"
            >
              <Printer size={16} />
              <span className="hidden sm:inline">Print Invoice</span>
              <span className="sm:hidden">Print</span>
            </button>
            {installPrompt && (
              <button
                onClick={handleInstall}
                className="flex items-center gap-1.5 bg-gray-100 text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-all active:scale-95"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Install App</span>
                <span className="sm:hidden">Install</span>
              </button>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="p-4 space-y-4 max-w-5xl mx-auto">
          {/* Row 1: Logo + Invoice details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Logo Image</label>
                <div className="flex items-center gap-3">
                  <div className={`border-2 border-dashed rounded flex items-center justify-center bg-gray-50 overflow-hidden shrink-0 ${data.logoType === 'square' ? 'w-14 h-14' : 'w-32 h-14'}`}>
                    {data.logoUrl ? (
                      <img src={data.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="text-[10px] text-gray-400 text-center px-1">{data.logoType === 'square' ? '1:1' : 'Banner'}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" />
                    <label htmlFor="logo-upload" className="cursor-pointer inline-block bg-gray-100 px-3 py-1.5 rounded text-xs font-medium hover:bg-gray-200">Choose File</label>
                    {data.logoUrl && <button onClick={() => setData({ ...data, logoUrl: '' })} className="text-xs text-red-500 hover:underline text-left">Remove</button>}
                  </div>
                </div>
                <div className="flex gap-4 mt-2">
                  {(['square', 'banner'] as const).map(t => (
                    <label key={t} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="logoType" value={t} checked={data.logoType === t} onChange={() => setData({ ...data, logoType: t })} className="w-3.5 h-3.5 accent-black" />
                      <span className="text-xs font-medium">{t === 'square' ? 'Square' : 'Banner'}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Invoice No.</label>
                <input type="text" value={data.invoiceNumber} onChange={(e) => setData({ ...data, invoiceNumber: e.target.value })} className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-black outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">GSTIN</label>
                <input type="text" placeholder="Optional" value={data.gstin} onChange={(e) => setData({ ...data, gstin: e.target.value })} className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-black outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                <input type="date" value={data.date} onChange={(e) => setData({ ...data, date: e.target.value })} className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-black outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
                <select value={data.currency} onChange={(e) => setData({ ...data, currency: e.target.value })} className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-black outline-none">
                  <option value="₹">INR (₹)</option>
                  <option value="$">USD ($)</option>
                  <option value="€">EUR (€)</option>
                  <option value="£">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Row 2: Billed To & From */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Billed to', key: 'billedTo' as const },
              { label: 'From', key: 'from' as const },
            ].map(({ label, key }) => (
              <div key={key} className="space-y-2">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</h3>
                <input placeholder="Name" value={data[key].name} onChange={(e) => setData({ ...data, [key]: { ...data[key], name: e.target.value } })} className="w-full p-2 border rounded text-sm" />
                <textarea placeholder="Address" value={data[key].address} onChange={(e) => setData({ ...data, [key]: { ...data[key], address: e.target.value } })} className="w-full p-2 border rounded text-sm" rows={2} />
                <input placeholder="Email" value={data[key].email} onChange={(e) => setData({ ...data, [key]: { ...data[key], email: e.target.value } })} className="w-full p-2 border rounded text-sm" />
              </div>
            ))}
          </div>

          <hr className="border-gray-100" />

          {/* Row 3: Items */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Items</h3>
              <button onClick={addItem} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1.5 rounded hover:bg-gray-200 font-medium">
                <Plus size={12} /> Add Item
              </button>
            </div>
            <div className="space-y-2">
              {/* Header row */}
              <div className="hidden sm:grid grid-cols-[1fr_60px_80px_80px_36px] gap-2 text-xs text-gray-400 font-medium px-1">
                <span>Item</span><span className="text-center">Qty</span><span className="text-center">Price</span><span className="text-center">Amount</span><span></span>
              </div>
              {data.items.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_60px_80px_80px_36px] gap-2 items-center">
                  <input placeholder="Item name" value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} className="p-2 border rounded text-sm w-full" />
                  <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} className="p-2 border rounded text-sm w-full text-center" />
                  <input type="number" placeholder="Price" value={item.price} onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)} className="p-2 border rounded text-sm w-full text-right" />
                  <div className="p-2 border rounded text-sm bg-gray-50 text-right">{item.amount}</div>
                  <button onClick={() => removeItem(item.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded flex items-center justify-center"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Row 4: Discount, Payment, Note */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Discount ({data.currency})</label>
                <input type="number" value={data.discount} onChange={(e) => setData({ ...data, discount: parseFloat(e.target.value) || 0 })} className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-black outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Payment Method</label>
                <div className="flex gap-4">
                  {(['Cash', 'UPI'] as const).map(m => (
                    <label key={m} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="paymentMethod" value={m} checked={data.paymentMethod === m} onChange={() => setData({ ...data, paymentMethod: m })} className="w-3.5 h-3.5 accent-black" />
                      <span className="text-sm font-medium">{m}</span>
                    </label>
                  ))}
                </div>
              </div>
              {data.paymentMethod === 'UPI' && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">UPI ID</label>
                  <input type="text" placeholder="yourname@upi" value={data.upiId} onChange={(e) => setData({ ...data, upiId: e.target.value })} className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-black outline-none" />
                </motion.div>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Note</label>
              <textarea value={data.note} onChange={(e) => setData({ ...data, note: e.target.value })} className="w-full p-2 border rounded text-sm h-24 resize-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="print-wrapper bg-gray-100 py-6 px-4 flex justify-center items-start overflow-x-auto">
        <div className="invoice-scale-wrapper">
        <div className="invoice-container shadow-2xl" style={{ transformOrigin: 'top center' }}>
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
    </div>
  );
}
