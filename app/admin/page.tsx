'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FileText, Download, Users, BarChart3, Search, Plus, Pencil, Trash2, ExternalLink, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

interface Stats {
  overview: {
    total_manuals: number;
    total_downloads: number;
    total_leads: number;
    downloads_today: number;
    leads_this_week: number;
  };
  categories: { category: string; count: number }[];
  recent_leads: { id: number; type: string; name: string; email: string; phone: string; company: string; manual_title: string; message: string; created_at: string }[];
  top_downloads: { title: string; slug: string; manufacturer: string; downloads: number }[];
}

interface Manual {
  id: number;
  slug: string;
  title: string;
  manual_number: string | null;
  category: string;
  manufacturer: string;
  subcategory: string | null;
  description: string | null;
  pdf_url: string;
  page_count: number | null;
  file_size_bytes: number | null;
  keywords: string | null;
}

type Tab = 'dashboard' | 'manuals' | 'leads';

export default function AdminPage() {
  const [apiKey, setApiKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [manuals, setManuals] = useState<Manual[]>([]);
  const [totalManuals, setTotalManuals] = useState(0);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [editManual, setEditManual] = useState<Manual | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const headers = { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' };

  const fetchStats = useCallback(async () => {
    const res = await fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${apiKey}` } });
    if (res.ok) setStats(await res.json());
  }, [apiKey]);

  const fetchManuals = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '25' });
    if (searchQuery) params.set('q', searchQuery);
    const res = await fetch(`/api/admin/manuals?${params}`, { headers: { 'Authorization': `Bearer ${apiKey}` } });
    if (res.ok) {
      const data = await res.json();
      setManuals(data.manuals);
      setTotalManuals(data.total);
    }
    setLoading(false);
  }, [apiKey, page, searchQuery]);

  useEffect(() => {
    if (!authenticated) return;
    if (tab === 'dashboard') fetchStats();
    if (tab === 'manuals') fetchManuals();
  }, [authenticated, tab, fetchStats, fetchManuals]);

  const handleLogin = async () => {
    const res = await fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${apiKey}` } });
    if (res.ok) {
      setAuthenticated(true);
      setStats(await res.json());
    } else {
      alert('Invalid API key');
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/manuals/${id}`, { method: 'DELETE', headers });
    fetchManuals();
  };

  const handleSave = async (manual: Partial<Manual>, isNew: boolean) => {
    const url = isNew ? '/api/admin/manuals' : `/api/admin/manuals/${manual.id}`;
    const method = isNew ? 'POST' : 'PUT';
    const res = await fetch(url, { method, headers, body: JSON.stringify(manual) });
    if (res.ok) {
      setEditManual(null);
      setShowCreate(false);
      fetchManuals();
    } else {
      alert('Failed to save');
    }
  };

  // Login screen
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
          <h1 className="text-xl font-bold text-slate-900 mb-1">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mb-6">Voyten Manuals</p>
          <input
            type="password"
            placeholder="API Key"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-[#1a3a5c] text-white py-3 rounded-lg font-bold hover:bg-[#0f2840] transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(totalManuals / 25);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-[#1a3a5c] text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-bold">Voyten Admin</h1>
            <nav className="flex gap-1">
              {(['dashboard', 'manuals', 'leads'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tab === t ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-white/70 hover:text-white flex items-center gap-1">
              <ExternalLink size={14} /> View Site
            </Link>
            <button onClick={() => { setAuthenticated(false); setApiKey(''); }} className="text-white/70 hover:text-white">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Tab */}
        {tab === 'dashboard' && stats && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: 'Total Manuals', value: stats.overview.total_manuals, icon: FileText, color: 'text-blue-600' },
                { label: 'Total Downloads', value: stats.overview.total_downloads, icon: Download, color: 'text-green-600' },
                { label: 'Total Leads', value: stats.overview.total_leads, icon: Users, color: 'text-amber-600' },
                { label: 'Downloads Today', value: stats.overview.downloads_today, icon: BarChart3, color: 'text-purple-600' },
                { label: 'Leads This Week', value: stats.overview.leads_this_week, icon: Users, color: 'text-rose-600' },
              ].map(kpi => (
                <div key={kpi.label} className="bg-white rounded-xl p-5 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <kpi.icon size={16} className={kpi.color} />
                    <span className="text-xs text-slate-500 uppercase font-medium">{kpi.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{kpi.value.toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Top Downloads */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="font-bold text-slate-900 mb-4">Top Downloaded Manuals</h2>
                {stats.top_downloads.length === 0 ? (
                  <p className="text-slate-500 text-sm">No downloads yet</p>
                ) : (
                  <div className="space-y-3">
                    {stats.top_downloads.map((m, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{m.title}</p>
                          <p className="text-slate-500 text-xs">{m.manufacturer}</p>
                        </div>
                        <span className="font-bold text-slate-700 ml-4">{m.downloads}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Leads */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="font-bold text-slate-900 mb-4">Recent Leads</h2>
                {stats.recent_leads.length === 0 ? (
                  <p className="text-slate-500 text-sm">No leads yet</p>
                ) : (
                  <div className="space-y-3">
                    {stats.recent_leads.map(lead => (
                      <div key={lead.id} className="text-sm border-b border-slate-100 pb-3 last:border-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-900">{lead.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            lead.type === 'quote' ? 'bg-amber-100 text-amber-700' :
                            lead.type === 'manual-request' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>{lead.type}</span>
                        </div>
                        <p className="text-slate-500 text-xs mt-1">
                          {lead.email} {lead.phone ? `· ${lead.phone}` : ''}
                          {lead.manual_title ? ` · Re: ${lead.manual_title}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 mb-4">Manuals by Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {stats.categories.map(cat => (
                  <div key={cat.category} className="bg-slate-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-slate-900">{cat.category}</p>
                    <p className="text-lg font-bold text-[#1a3a5c]">{cat.count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Manuals Tab */}
        {tab === 'manuals' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search manuals..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
                />
              </div>
              <button
                onClick={() => { setShowCreate(true); setEditManual(null); }}
                className="flex items-center gap-2 bg-[#1a3a5c] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-[#0f2840]"
              >
                <Plus size={16} /> Add Manual
              </button>
            </div>

            {/* Manuals Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Title</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Manufacturer</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Category</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Manual #</th>
                      <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Loading...</td></tr>
                    ) : manuals.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No manuals found</td></tr>
                    ) : manuals.map(m => (
                      <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <Link href={`/manual/${m.slug}`} className="text-[#1a3a5c] hover:underline font-medium" target="_blank">
                            {m.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{m.manufacturer}</td>
                        <td className="px-4 py-3 text-slate-600">{m.category}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">{m.manual_number || '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => { setEditManual(m); setShowCreate(false); }} className="text-slate-400 hover:text-[#1a3a5c]">
                              <Pencil size={14} />
                            </button>
                            <a href={m.pdf_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-green-600">
                              <ExternalLink size={14} />
                            </a>
                            <button onClick={() => handleDelete(m.id, m.title)} className="text-slate-400 hover:text-red-600">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200">
                  <p className="text-sm text-slate-500">{totalManuals} manuals total</p>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                      className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage(p => p + 1)}
                      className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Edit/Create Modal */}
            {(editManual || showCreate) && (
              <ManualForm
                manual={editManual}
                onSave={handleSave}
                onClose={() => { setEditManual(null); setShowCreate(false); }}
              />
            )}
          </div>
        )}

        {/* Leads Tab */}
        {tab === 'leads' && stats && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="font-bold text-slate-900">All Leads ({stats.overview.total_leads})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Contact</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Company</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Related Manual</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_leads.map(lead => (
                    <tr key={lead.id} className="border-b border-slate-100">
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          lead.type === 'quote' ? 'bg-amber-100 text-amber-700' :
                          lead.type === 'manual-request' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>{lead.type}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">{lead.name}</td>
                      <td className="px-4 py-3 text-slate-600">
                        <div>{lead.email}</div>
                        {lead.phone && <div className="text-xs text-slate-400">{lead.phone}</div>}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{lead.company || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs max-w-[200px] truncate">{lead.manual_title || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs max-w-[200px] truncate">{lead.message || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Manual edit/create form
function ManualForm({ manual, onSave, onClose }: {
  manual: Manual | null;
  onSave: (data: Partial<Manual>, isNew: boolean) => void;
  onClose: () => void;
}) {
  const isNew = !manual;
  const [form, setForm] = useState({
    title: manual?.title || '',
    manual_number: manual?.manual_number || '',
    category: manual?.category || '',
    manufacturer: manual?.manufacturer || '',
    subcategory: manual?.subcategory || '',
    description: manual?.description || '',
    pdf_url: manual?.pdf_url || '',
    page_count: manual?.page_count?.toString() || '',
    file_size_bytes: manual?.file_size_bytes?.toString() || '',
    keywords: manual?.keywords || '',
  });

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(manual?.id ? { id: manual.id } : {}),
      title: form.title,
      manual_number: form.manual_number || null,
      category: form.category,
      manufacturer: form.manufacturer,
      subcategory: form.subcategory || null,
      description: form.description || null,
      pdf_url: form.pdf_url,
      page_count: form.page_count ? parseInt(form.page_count) : null,
      file_size_bytes: form.file_size_bytes ? parseInt(form.file_size_bytes) : null,
      keywords: form.keywords || null,
    }, isNew);
  };

  const categories = ['Circuit Breakers', 'Relays and Meters', 'Motor Controls', 'Switches', 'Fuses', 'Transformers', 'Bus Products', 'Miscellaneous'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-lg text-slate-900">{isNew ? 'Add Manual' : 'Edit Manual'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <input required value={form.title} onChange={e => update('title', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
              <select required value={form.category} onChange={e => update('category', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]">
                <option value="">Select...</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Manufacturer *</label>
              <input required value={form.manufacturer} onChange={e => update('manufacturer', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subcategory</label>
              <input value={form.subcategory} onChange={e => update('subcategory', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Manual Number</label>
              <input value={form.manual_number} onChange={e => update('manual_number', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">PDF URL *</label>
            <input required type="url" value={form.pdf_url} onChange={e => update('pdf_url', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c] font-mono text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={e => update('description', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Page Count</label>
              <input type="number" value={form.page_count} onChange={e => update('page_count', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">File Size (bytes)</label>
              <input type="number" value={form.file_size_bytes} onChange={e => update('file_size_bytes', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Keywords</label>
              <input value={form.keywords} onChange={e => update('keywords', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-6 py-2.5 bg-[#1a3a5c] text-white rounded-lg font-medium hover:bg-[#0f2840]">
              {isNew ? 'Create Manual' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
