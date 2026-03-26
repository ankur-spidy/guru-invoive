import React, { useState } from 'react';
import { Printer } from 'lucide-react';

interface AgreementData {
  date: string;
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  providerName: string;
  providerAddress: string;
  providerEmail: string;
  projectTitle: string;
  projectDescription: string;
  amount: string;
  currency: string;
  startDate: string;
  endDate: string;
  paymentTerms: string;
  note: string;
}

export default function AgreementLetter() {
  const [data, setData] = useState<AgreementData>({
    date: new Date().toISOString().split('T')[0],
    clientName: 'Michael Brown',
    clientAddress: '9101 Oak Road, Metropolis',
    clientEmail: 'michaelbrown@example.com',
    providerName: 'Emily Johnson',
    providerAddress: '2345 Pine Lane, Villagetown',
    providerEmail: 'emilyjohnson@example.com',
    projectTitle: 'Website Design & Development',
    projectDescription: 'Design and develop a fully responsive website including homepage, about, services, and contact pages.',
    amount: '25000',
    currency: '₹',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    paymentTerms: '50% advance, 50% on delivery',
    note: 'Both parties agree to the terms outlined in this agreement.',
  });

  const u = (f: keyof AgreementData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setData({ ...data, [f]: e.target.value });

  const fmt = (d: string) => {
    if (!d) return '___________';
    try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }); }
    catch { return d; }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 print:block print:p-0 print:bg-white print:min-h-0 flex flex-col lg:flex-row lg:h-screen">
      {/* Editor */}
      <div className="no-print w-full lg:w-[420px] xl:w-[480px] bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col lg:h-screen">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-black">Agreement Editor</h2>
          <button onClick={() => window.print()} className="flex items-center gap-1.5 bg-black text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all">
            <Printer size={15} /> Print
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <input type="date" value={data.date} onChange={u('date')} className="w-full p-1.5 border rounded text-xs focus:ring-1 focus:ring-black outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
              <select value={data.currency} onChange={u('currency')} className="w-full p-1.5 border rounded text-xs focus:ring-1 focus:ring-black outline-none">
                <option value="₹">INR (₹)</option>
                <option value="$">USD ($)</option>
                <option value="€">EUR (€)</option>
                <option value="£">GBP (£)</option>
              </select>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Client</h3>
              <input placeholder="Name" value={data.clientName} onChange={u('clientName')} className="w-full p-1.5 border rounded text-xs" />
              <textarea placeholder="Address" value={data.clientAddress} onChange={u('clientAddress')} className="w-full p-1.5 border rounded text-xs" rows={2} />
              <input placeholder="Email" value={data.clientEmail} onChange={u('clientEmail')} className="w-full p-1.5 border rounded text-xs" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Provider</h3>
              <input placeholder="Name" value={data.providerName} onChange={u('providerName')} className="w-full p-1.5 border rounded text-xs" />
              <textarea placeholder="Address" value={data.providerAddress} onChange={u('providerAddress')} className="w-full p-1.5 border rounded text-xs" rows={2} />
              <input placeholder="Email" value={data.providerEmail} onChange={u('providerEmail')} className="w-full p-1.5 border rounded text-xs" />
            </div>
          </div>

          <hr className="border-gray-100" />

          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Project Title</label>
              <input value={data.projectTitle} onChange={u('projectTitle')} className="w-full p-1.5 border rounded text-xs" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Project Description</label>
              <textarea value={data.projectDescription} onChange={u('projectDescription')} className="w-full p-1.5 border rounded text-xs" rows={3} />
            </div>
          </div>

          <hr className="border-gray-100" />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Amount</label>
              <input type="number" value={data.amount} onChange={u('amount')} className="w-full p-1.5 border rounded text-xs" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Payment Terms</label>
              <input value={data.paymentTerms} onChange={u('paymentTerms')} className="w-full p-1.5 border rounded text-xs" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
              <input type="date" value={data.startDate} onChange={u('startDate')} className="w-full p-1.5 border rounded text-xs" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
              <input type="date" value={data.endDate} onChange={u('endDate')} className="w-full p-1.5 border rounded text-xs" />
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Note / Additional Terms</label>
            <textarea value={data.note} onChange={u('note')} className="w-full p-1.5 border rounded text-xs h-16 resize-none" />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="print-wrapper flex-1 bg-gray-100 flex justify-center items-start overflow-auto py-6 px-4">
        <div className="invoice-scale-wrapper">
          <div className="invoice-container shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold tracking-[0.15em] text-black mb-1">SERVICE AGREEMENT</h1>
              <p className="text-xs text-gray-500 uppercase tracking-widest">This agreement is entered into on {fmt(data.date)}</p>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-2 gap-8 mb-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Client</h3>
                <div className="text-sm font-bold text-gray-900">{data.clientName}</div>
                <div className="text-xs text-gray-600 mt-0.5 whitespace-pre-line">{data.clientAddress}</div>
                <div className="text-xs text-gray-500 mt-0.5">{data.clientEmail}</div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Service Provider</h3>
                <div className="text-sm font-bold text-gray-900">{data.providerName}</div>
                <div className="text-xs text-gray-600 mt-0.5 whitespace-pre-line">{data.providerAddress}</div>
                <div className="text-xs text-gray-500 mt-0.5">{data.providerEmail}</div>
              </div>
            </div>

            {/* Project */}
            <div className="mb-5">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">1. Scope of Work</h3>
              <div className="text-sm font-semibold text-gray-900 mb-1">{data.projectTitle}</div>
              <p className="text-xs text-gray-600 leading-relaxed">{data.projectDescription}</p>
            </div>

            {/* Timeline */}
            <div className="mb-5">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">2. Timeline</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-xs"><span className="font-semibold text-gray-700">Start Date:</span> <span className="text-gray-600">{fmt(data.startDate)}</span></div>
                <div className="text-xs"><span className="font-semibold text-gray-700">End Date:</span> <span className="text-gray-600">{fmt(data.endDate)}</span></div>
              </div>
            </div>

            {/* Payment */}
            <div className="mb-5">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">3. Payment</h3>
              <div className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                <div>
                  <div className="text-xs text-gray-500">Total Amount</div>
                  <div className="text-xl font-bold text-black">{data.currency}{Number(data.amount).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Payment Terms</div>
                  <div className="text-xs font-semibold text-gray-800">{data.paymentTerms}</div>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="mb-6">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">4. Terms & Conditions</h3>
              <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside leading-relaxed">
                <li>The service provider will deliver work as described in the scope above.</li>
                <li>Any changes to the scope must be agreed upon in writing by both parties.</li>
                <li>Payment must be made as per the agreed payment terms.</li>
                <li>Either party may terminate this agreement with 7 days written notice.</li>
              </ul>
              {data.note && <p className="text-xs text-gray-600 mt-2 leading-relaxed">{data.note}</p>}
            </div>

            {/* Signatures */}
            <div className="border-t border-gray-200 pt-6 grid grid-cols-2 gap-12">
              <div>
                <div className="border-b border-gray-400 mb-1 h-8"></div>
                <div className="text-xs font-semibold text-gray-700">{data.clientName}</div>
                <div className="text-[10px] text-gray-400">Client — Date: ___________</div>
              </div>
              <div>
                <div className="border-b border-gray-400 mb-1 h-8"></div>
                <div className="text-xs font-semibold text-gray-700">{data.providerName}</div>
                <div className="text-[10px] text-gray-400">Service Provider — Date: ___________</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
