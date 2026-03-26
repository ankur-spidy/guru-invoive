import React, { useState, useEffect } from 'react';
import { Printer, Save, Clock, X } from 'lucide-react';
import { load, save, addHistory, getHistory, deleteHistory, HistoryEntry } from './storage';

interface AgreementData {
  clientName: string;
  aadhaar: string;
  pan: string;
  email: string;
  mobile: string;
  date: string;
  projectFee: string;
  deliveryDays: string;
  lateFee: string;
  jurisdiction: string;
  driveLink: string;
}

export default function AgreementLetter() {
  const defaultData: AgreementData = {
    clientName: '', aadhaar: '', pan: '', email: '', mobile: '',
    date: new Date().toISOString().split('T')[0],
    projectFee: '', deliveryDays: '', lateFee: '', jurisdiction: '', driveLink: '',
  };

  const [data, setData] = useState<AgreementData>(() =>
    load('agreement_current', load('agreement_default', defaultData))
  );
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>(() => getHistory());

  useEffect(() => { save('agreement_current', data); }, [data]);

  const refreshHistory = () => setHistory(getHistory());

  const handleSaveDefault = () => {
    save('agreement_default', data);
    alert('Saved as default template!');
  };

  const u = (f: keyof AgreementData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setData({ ...data, [f]: e.target.value });

  const blank = (val: string, fallback = '______________________') =>
    val || fallback;

  const handlePrint = () => {
    const name = data.clientName.replace(/\s+/g, '_') || 'Agreement';
    const date = data.date || new Date().toISOString().split('T')[0];
    const prev = document.title;
    document.title = `${name}_${date}`;
    addHistory({
      type: 'agreement',
      label: `${data.clientName || 'Agreement'} — ${data.date}`,
      date: new Date().toISOString(),
      data,
    });
    refreshHistory();
    window.print();
    document.title = prev;
  };

  const fmt = (d: string) => {
    if (!d) return '______________________';
    try { return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }); }
    catch { return d; }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 print:block print:p-0 print:bg-white print:min-h-0 flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden">
      {/* Editor */}
      <div className="no-print w-full lg:w-[380px] xl:w-[420px] bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col lg:h-screen shrink-0">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-bold text-black">Agreement Editor</h2>
          <div className="flex gap-2 items-center">
            <button onClick={handleSaveDefault} title="Save as Default" className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-2 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all">
              <Save size={14} />
            </button>
            <button onClick={() => setShowHistory(h => !h)} title="History" className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-2 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all">
              <Clock size={14} />
            </button>
            <button onClick={handlePrint} className="flex items-center gap-1.5 bg-black text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all">
              <Printer size={15} /> Print
            </button>
          </div>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="border-b border-gray-100 bg-gray-50 max-h-48 overflow-y-auto">
            <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">History</span>
              <button onClick={() => setShowHistory(false)}><X size={13} className="text-gray-400" /></button>
            </div>
            {history.filter(h => h.type === 'agreement').length === 0 ? (
              <p className="text-xs text-gray-400 px-4 py-3">No history yet. Print an agreement to save it.</p>
            ) : (
              history.filter(h => h.type === 'agreement').map(entry => (
                <div key={entry.id} className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 border-b border-gray-50">
                  <button className="text-xs text-left text-gray-700 hover:text-black flex-1" onClick={() => { setData(entry.data as AgreementData); setShowHistory(false); }}>
                    {entry.label}
                  </button>
                  <button onClick={() => { deleteHistory(entry.id); refreshHistory(); }} className="text-red-400 hover:text-red-600 ml-2"><X size={11} /></button>
                </div>
              ))
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {[
            { label: 'Client Name', key: 'clientName' as const, placeholder: 'Full name' },
            { label: 'Aadhaar No.', key: 'aadhaar' as const, placeholder: 'XXXX XXXX XXXX' },
            { label: 'PAN (Optional)', key: 'pan' as const, placeholder: 'ABCDE1234F' },
            { label: 'Email', key: 'email' as const, placeholder: 'client@email.com' },
            { label: 'Mobile No.', key: 'mobile' as const, placeholder: '+91 XXXXX XXXXX' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input value={data[key]} onChange={u(key)} placeholder={placeholder} className="w-full p-1.5 border rounded text-xs focus:ring-1 focus:ring-black outline-none" />
            </div>
          ))}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
            <input type="date" value={data.date} onChange={u('date')} className="w-full p-1.5 border rounded text-xs focus:ring-1 focus:ring-black outline-none" />
          </div>

          <hr className="border-gray-100" />

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Total Project Fee (₹)</label>
            <input type="number" value={data.projectFee} onChange={u('projectFee')} placeholder="e.g. 5000" className="w-full p-1.5 border rounded text-xs focus:ring-1 focus:ring-black outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Delivery Days</label>
            <input type="number" value={data.deliveryDays} onChange={u('deliveryDays')} placeholder="e.g. 7" className="w-full p-1.5 border rounded text-xs focus:ring-1 focus:ring-black outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Late Fee per Day (₹)</label>
            <input type="number" value={data.lateFee} onChange={u('lateFee')} placeholder="e.g. 100" className="w-full p-1.5 border rounded text-xs focus:ring-1 focus:ring-black outline-none" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Jurisdiction (City/State)</label>
            <input value={data.jurisdiction} onChange={u('jurisdiction')} placeholder="e.g. Mumbai, Maharashtra" className="w-full p-1.5 border rounded text-xs focus:ring-1 focus:ring-black outline-none" />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="print-wrapper flex-1 bg-gray-100 flex justify-center items-start overflow-auto py-4 px-2 sm:py-6 sm:px-4">
        <div className="invoice-scale-wrapper">
          <div className="invoice-container shadow-2xl text-[11px] leading-relaxed">

            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold tracking-wide text-black mb-1">FREELANCE EDITING AGREEMENT</h1>
              <div className="w-16 h-0.5 bg-black mx-auto"></div>
            </div>

            {/* Party Info */}
            <div className="mb-5">
              <div className="flex justify-between mb-1">
                <span><strong>Editor:</strong> Guru Editing House</span>
                <span><strong>Date:</strong> {fmt(data.date)}</span>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 border border-gray-200 rounded p-3 bg-gray-50">
                <div><strong>Client Name:</strong> {blank(data.clientName)}</div>
                <div><strong>Aadhaar No.:</strong> {blank(data.aadhaar)}</div>
                <div><strong>PAN (Optional):</strong> {blank(data.pan)}</div>
                <div><strong>Email:</strong> {blank(data.email)}</div>
                <div><strong>Mobile No.:</strong> {blank(data.mobile)}</div>
              </div>
            </div>

            <hr className="border-gray-300 mb-4" />

            {/* Sections */}
            {[
              {
                num: '1', title: 'Services',
                content: <p>The Editor will provide Video Editing, Graphic Design, and Post-Production services as agreed with the Client.</p>
              },
              {
                num: '2', title: 'Payment Terms',
                content: (
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Total Project Fee: <strong>₹{data.projectFee ? Number(data.projectFee).toLocaleString('en-IN') : '__________'}</strong></li>
                    <li>Advance payment is required before starting the project</li>
                    <li>Full payment must be completed before final delivery</li>
                  </ul>
                )
              },
              {
                num: '3', title: 'Revisions',
                content: (
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Limited revisions are included</li>
                    <li>Additional revisions will be charged separately</li>
                  </ul>
                )
              },
              {
                num: '4', title: 'Delivery Timeline',
                content: (
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Estimated delivery: <strong>{blank(data.deliveryDays, '______')}</strong> days</li>
                    <li>Timeline may vary depending on project complexity and client feedback</li>
                  </ul>
                )
              },
              {
                num: '5', title: 'Ownership & Rights',
                content: (
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Full rights will be transferred after complete payment</li>
                    <li>The Editor retains the right to showcase the work in portfolio or social media</li>
                  </ul>
                )
              },
              {
                num: '6', title: 'Cancellation Policy',
                content: <p>Advance payment is non-refundable once work has started.</p>
              },
              {
                num: '7', title: 'Non-Payment & Copyright Enforcement',
                content: <p>If the Client fails to complete the full payment within 7 days of final delivery, the Editor reserves the right to claim copyright over the content and may take necessary actions, including reporting or issuing a copyright claim/strike on the Client's platform (e.g., YouTube, social media) until payment is cleared.</p>
              },
              {
                num: '8', title: 'Late Payment Charges',
                content: <p>A late fee of <strong>₹{blank(data.lateFee, '_____')}</strong> per day may be charged if payment is delayed beyond 7 days.</p>
              },
              {
                num: '9', title: 'Jurisdiction',
                content: <p>This Agreement shall be governed by the laws of India, and any disputes shall be subject to the jurisdiction of the courts of <strong>{blank(data.jurisdiction, '__________ (City/State)')}</strong>.</p>
              },
            ].map(({ num, title, content }) => (
              <div key={num} className="mb-3">
                <h3 className="font-bold text-[11px] uppercase tracking-wide mb-1 text-gray-800">{num}. {title}</h3>
                <div className="text-gray-700 pl-2">{content}</div>
              </div>
            ))}

            <hr className="border-gray-300 my-5" />

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-12 mt-4">
              <div>
                <div className="border-b border-gray-500 h-8 mb-1"></div>
                <div className="text-xs font-semibold">{blank(data.clientName, 'Client Name')}</div>
                <div className="text-[10px] text-gray-500">Client Signature</div>
              </div>
              <div>
                <div className="border-b border-gray-500 h-8 mb-1"></div>
                <div className="text-xs font-semibold">Guru Editing House</div>
                <div className="text-[10px] text-gray-500">Editor Signature</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
