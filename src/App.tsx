/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Printer, Download, Save, Clock, X } from 'lucide-react';
import { motion } from 'motion/react';
import AgreementLetter from './AgreementLetter';
import { load, save, addHistory, getHistory, deleteHistory, HistoryEntry } from './storage';

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
  discountType: 'flat' | 'percent';
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
  const [tab, setTab] = useState<'invoice' | 'agreement'>('invoice');
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(() => getHistory());

  const defaultInvoice = {
    logoUrl: '',
    logoType: 'square' as const,
    invoiceNumber: '000001',
    gstin: '',
    date: new Date().toISOString().split('T')[0],
    currency: '₹',
    discountType: 'flat' as const,
    discount: 0,
    billedTo: { name: '', address: '', email: '' },
    from: { name: 'Guru Editing House', address: '', email: '' },
    items: [{ id: '1', name: '', quantity: 1, price: 0, amount: 0 }],
    paymentMethod: 'Cash' as const,
    upiId: '',
    note: 'Thank you for choosing us!',
  };

  const [data, setData] = useState<InvoiceData>(() =>
    load('invoice_current', load('invoice_default', defaultInvoice))
  );

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js');
    }
    const handler = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Auto-save invoice to localStorage
  useEffect(() => { save('invoice_current', data); }, [data]);

  const handleSaveDefault = () => {
    save('invoice_default', data);
    alert('Saved as default template!');
  };

  const refreshHistory = () => setHistory(getHistory());

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
    const name = data.billedTo.name.replace(/\s+/g, '_') || 'Invoice';
    const date = data.date.replace(/-/g, '-');
    const prev = document.title;
    document.title = `${name}_${date}`;
    addHistory({
      type: 'invoice',
      label: `${data.billedTo.name || 'Invoice'} — ${data.date}`,
      date: new Date().toISOString(),
      data,
    });
    refreshHistory();
    window.print();
    document.title = prev;
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
  const discountAmount = data.discountType === 'percent'
    ? Number(((subtotal * data.discount) / 100).toFixed(2))
    : Number(data.discount.toFixed(2));
  const total = Number((subtotal - discountAmount).toFixed(2));

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
    <>
      {/* Tab Navigation */}
      <div className="no-print fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 flex items-center px-3 gap-1 h-10 print:hidden">
        <button
          onClick={() => setTab('invoice')}
          className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all ${tab === 'invoice' ? 'bg-black text-white' : 'text-gray-500 hover:text-black hover:bg-gray-100'}`}
        >
          Invoice
        </button>
        <button
          onClick={() => setTab('agreement')}
          className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all ${tab === 'agreement' ? 'bg-black text-white' : 'text-gray-500 hover:text-black hover:bg-gray-100'}`}
        >
          Agreement Letter
        </button>
      </div>

      {/* Content */}
      <div className="pt-10 print:pt-0">
        {tab === 'agreement' ? <AgreementLetter /> : (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 print:block print:p-0 print:bg-white print:min-h-0 flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden">
      {/* Editor Panel */}
      <div className="no-print w-full lg:w-[420px] xl:w-[480px] bg-white border-b lg:border-b-0 lg:border-r border-gray-200 shadow-sm flex flex-col lg:h-screen lg:overflow-hidden shrink-0">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold tracking-tight text-black">Invoice Editor</h2>
          <div className="flex gap-2 items-center">
            <button onClick={handleSaveDefault} title="Save as Default" className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-2 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all">
              <Save size={14} />
            </button>
            <button onClick={() => setShowHistory(h => !h)} title="History" className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-2 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all">
              <Clock size={14} />
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-black text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all active:scale-95"
            >
              <Printer size={15} />
              <span>Print</span>
            </button>
            {installPrompt && (
              <button
                onClick={handleInstall}
                className="flex items-center gap-1.5 bg-gray-100 text-black px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-all active:scale-95"
              >
                <Download size={15} />
                <span>Install</span>
              </button>
            )}
          </div>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="border-b border-gray-100 bg-gray-50 max-h-48 overflow-y-auto">
            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">History</span>
              <button onClick={() => setShowHistory(false)}><X size={13} className="text-gray-400" /></button>
            </div>
            {history.filter(h => h.type === 'invoice').length === 0 ? (
              <p className="text-xs text-gray-400 px-4 py-3">No history yet. Print an invoice to save it.</p>
            ) : (
              history.filter(h => h.type === 'invoice').map(entry => (
                <div key={entry.id} className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 border-b border-gray-50">
                  <button className="text-xs text-left text-gray-700 hover:text-black flex-1" onClick={() => { setData(entry.data as InvoiceData); setShowHistory(false); }}>
                    {entry.label}
                  </button>
                  <button onClick={() => { deleteHistory(entry.id); refreshHistory(); }} className="text-red-400 hover:text-red-600 ml-2"><X size={11} /></button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Logo + Invoice details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">Logo Image</label>
              <div className="flex items-center gap-2">
                <div className={`border-2 border-dashed rounded flex items-center justify-center bg-gray-50 overflow-hidden shrink-0 ${data.logoType === 'square' ? 'w-12 h-12' : 'w-24 h-12'}`}>
                  {data.logoUrl ? (
                    <img src={data.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <span className="text-[9px] text-gray-400 text-center px-1">{data.logoType === 'square' ? '1:1' : 'Banner'}</span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" />
                  <label htmlFor="logo-upload" className="cursor-pointer inline-block bg-gray-100 px-2 py-1 rounded text-xs font-medium hover:bg-gray-200">Choose</label>
                  {data.logoUrl && <button onClick={() => setData({ ...data, logoUrl: '' })} className="text-xs text-red-500 hover:underline text-left">Remove</button>}
                </div>
              </div>
              <div className="flex gap-3">
                {(['square', 'banner'] as const).map(t => (
                  <label key={t} className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="logoType" value={t} checked={data.logoType === t} onChange={() => setData({ ...data, logoType: t })} className="w-3 h-3 accent-black" />
                    <span className="text-xs">{t === 'square' ? 'Square' : 'Banner'}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Invoice No.</label>
                <input type="text" value={data.invoiceNumber} onChange={(e) => setData({ ...data, invoiceNumber: e.target.value })} className="w-full p-1.5 border rounded text-xs focus:ring-1 focus:ring-black outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">GSTIN</label>
                <input type="text" placeholder="Optional" value={data.gstin} onChange={(e) => setData({ ...data, gstin: e.target.value })} className="w-full p-1.5 border rounded text-xs focus:ring-1 focus:ring-black outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                <input type="date" value={data.date} onChange={(e) => setData({ ...data, date: e.target.value })} className="w-full p-1.5 border rounded text-xs focus:ring-1 focus:ring-black outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
                <select value={data.currency} onChange={(e) => setData({ ...data, currency: e.target.value })} className="w-full p-1.5 border rounded text-xs focus:ring-1 focus:ring-black outline-none">
                  <option value="₹">INR (₹)</option>
                  <option value="$">USD ($)</option>
                  <option value="€">EUR (€)</option>
                  <option value="£">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Billed To & From */}
          <div className="grid grid-cols-2 gap-3">
            {([['billedTo', 'Billed to'], ['from', 'From']] as const).map(([key, label]) => (
              <div key={key} className="space-y-1.5">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</h3>
                <input placeholder="Name" value={data[key].name} onChange={(e) => setData({ ...data, [key]: { ...data[key], name: e.target.value } })} className="w-full p-1.5 border rounded text-xs" />
                <textarea placeholder="Address" value={data[key].address} onChange={(e) => setData({ ...data, [key]: { ...data[key], address: e.target.value } })} className="w-full p-1.5 border rounded text-xs" rows={2} />
                <input placeholder="Email" value={data[key].email} onChange={(e) => setData({ ...data, [key]: { ...data[key], email: e.target.value } })} className="w-full p-1.5 border rounded text-xs" />
              </div>
            ))}
          </div>

          <hr className="border-gray-100" />

          {/* Items */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Items</h3>
              <button onClick={addItem} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 font-medium">
                <Plus size={11} /> Add Item
              </button>
            </div>
            <div className="grid grid-cols-[1fr_44px_68px_68px_28px] gap-1 text-[10px] text-gray-400 font-medium mb-1 px-0.5">
              <span>Item</span><span className="text-center">Qty</span><span className="text-center">Price</span><span className="text-center">Amt</span><span></span>
            </div>
            <div className="space-y-1.5">
              {data.items.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_44px_68px_68px_28px] gap-1 items-center">
                  <input placeholder="Name" value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} className="p-1.5 border rounded text-xs w-full" />
                  <input type="number" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} className="p-1.5 border rounded text-xs w-full text-center" />
                  <input type="number" value={item.price} onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)} className="p-1.5 border rounded text-xs w-full text-right" />
                  <div className="p-1.5 border rounded text-xs bg-gray-50 text-right">{item.amount}</div>
                  <button onClick={() => removeItem(item.id)} className="p-1 text-red-400 hover:bg-red-50 rounded flex items-center justify-center"><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Discount, Payment, Note */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Discount</label>
                <div className="flex gap-1">
                  <select value={data.discountType} onChange={(e) => setData({ ...data, discountType: e.target.value as 'flat' | 'percent' })} className="p-1.5 border rounded text-xs focus:ring-1 focus:ring-black outline-none bg-white">
                    <option value="flat">{data.currency}</option>
                    <option value="percent">%</option>
                  </select>
                  <input type="number" value={data.discount} onChange={(e) => setData({ ...data, discount: parseFloat(e.target.value) || 0 })} className="flex-1 p-1.5 border rounded text-xs focus:ring-1 focus:ring-black outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Payment</label>
                <div className="flex gap-3">
                  {(['Cash', 'UPI'] as const).map(m => (
                    <label key={m} className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name="paymentMethod" value={m} checked={data.paymentMethod === m} onChange={() => setData({ ...data, paymentMethod: m })} className="w-3 h-3 accent-black" />
                      <span className="text-xs font-medium">{m}</span>
                    </label>
                  ))}
                </div>
              </div>
              {data.paymentMethod === 'UPI' && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">UPI ID</label>
                  <input type="text" placeholder="yourname@upi" value={data.upiId} onChange={(e) => setData({ ...data, upiId: e.target.value })} className="w-full p-1.5 border rounded text-xs focus:ring-1 focus:ring-black outline-none" />
                </motion.div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Note</label>
              <textarea value={data.note} onChange={(e) => setData({ ...data, note: e.target.value })} className="w-full p-1.5 border rounded text-xs h-20 resize-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="print-wrapper flex-1 bg-gray-100 flex justify-center items-start overflow-auto py-4 px-2 sm:py-6 sm:px-4">
        <div className="invoice-scale-wrapper">
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
            <div className="flex justify-between items-start mb-4">
              <div className="w-20 h-20 flex items-center justify-start overflow-hidden">
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
          <div className="text-center mb-4">
            <h1 className="text-4xl font-bold tracking-[0.2em] text-black mb-1">INVOICE</h1>
            <div className="flex flex-col items-center gap-1 text-sm text-gray-500 uppercase tracking-widest">
              <div><span className="font-bold text-gray-900">Date:</span> {formatDate(data.date)}</div>
              {data.gstin && (
                <div><span className="font-bold text-gray-900">GSTIN:</span> <span className="font-poppins">{data.gstin}</span></div>
              )}
            </div>
          </div>

          {/* Billed To / From Section */}
          <div className="grid grid-cols-2 gap-8 mb-4">
            <div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Billed to</h3>
              <div className="text-base font-bold text-gray-900 mb-0.5">{data.billedTo.name}</div>
              <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-line mb-0.5">{data.billedTo.address}</div>
              <div className="text-xs text-gray-500">{data.billedTo.email}</div>
            </div>
            <div className="text-right">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">From</h3>
              <div className="text-base font-bold text-gray-900 mb-0.5">{data.from.name}</div>
              <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-line mb-0.5">{data.from.address}</div>
              <div className="text-xs text-gray-500">{data.from.email}</div>
            </div>
          </div>

          {/* Table Section */}
          <table className="w-full mb-4 border-collapse rounded-lg overflow-hidden">
            <thead>
              <tr className="text-white" style={{backgroundColor: '#333333', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact'}}>
                <th className="text-left py-2 px-4 text-[10px] font-medium uppercase tracking-wider rounded-l-lg" style={{backgroundColor: '#333333'}}>No.</th>
                <th className="text-left py-2 px-4 text-[10px] font-medium uppercase tracking-wider" style={{backgroundColor: '#333333'}}>Item</th>
                <th className="text-right py-2 px-4 text-[10px] font-medium uppercase tracking-wider" style={{backgroundColor: '#333333'}}>Quantity</th>
                <th className="text-right py-2 px-4 text-[10px] font-medium uppercase tracking-wider" style={{backgroundColor: '#333333'}}>Rate</th>
                <th className="text-right py-2 px-4 text-[10px] font-medium uppercase tracking-wider rounded-r-lg" style={{backgroundColor: '#333333'}}>Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.items.map((item, index) => (
                <tr key={item.id}>
                  <td className="text-left py-2 px-4 text-sm text-gray-500">{index + 1}</td>
                  <td className="text-left py-2 px-4 text-sm">{item.name}</td>
                  <td className="text-right py-2 px-4 text-sm font-poppins">{item.quantity}</td>
                  <td className="text-right py-2 px-4 text-sm">
                    <span className="mr-0.5">{data.currency}</span>
                    <span className="font-poppins">{item.price}</span>
                  </td>
                  <td className="text-right py-2 px-4 text-sm">
                    <span className="mr-0.5">{data.currency}</span>
                    <span className="font-poppins">{item.amount}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total Section */}
          <div className="border-t-2 border-black pt-2 mb-4">
            <div className="flex flex-col items-end space-y-1">
              <div className="w-[40%] flex justify-between items-center text-xs text-gray-600">
                <span>Subtotal</span>
                <span><span className="mr-1">{data.currency}</span><span className="font-poppins">{subtotal}</span></span>
              </div>
              {discountAmount > 0 && (
                <div className="w-[40%] flex justify-between items-center text-xs text-red-600">
                  <span>Discount{data.discountType === 'percent' ? ` (${data.discount}%)` : ''}</span>
                  <span><span className="mr-1">- {data.currency}</span><span className="font-poppins">{discountAmount}</span></span>
                </div>
              )}
              <div className="w-[40%] flex justify-between items-center border-t border-gray-200 pt-2">
                <span className="font-bold text-base text-black uppercase tracking-wider">Total</span>
                <span className="font-bold text-base text-black">
                  <span className="mr-1">{data.currency}</span>
                  <span className="font-poppins">{total}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-2 gap-8 border-t border-gray-100 pt-4">
            <div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Payment Information</h3>
              <div className="text-xs">
                <span className="font-semibold text-gray-900">Method:</span> {data.paymentMethod}
              </div>
              {data.paymentMethod === 'UPI' && data.upiId && (
                <div className="text-xs mt-0.5">
                  <span className="font-semibold text-gray-900">UPI ID:</span> <span className="font-poppins text-gray-600">{data.upiId}</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Note</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {data.note}
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
        )}
      </div>
    </>
  );
}
