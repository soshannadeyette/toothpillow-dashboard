'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAuditPatients, upsertAuditPatient, deleteAuditPatient, todayStr } from '@/lib/api';
import type { AuditPatient } from '@/lib/types';
import { AUDIT_STAGES } from '@/lib/types';

const TP = {
  blue:       '#3A6EA4',
  skyBlue:    '#B6CAE3',
  lightBlue:  '#D6E5F7',
  cream:      '#FEF8EE',
  green:      '#8CD1C8',
  yellow:     '#FDBE67',
  peach:      '#FBCCC5',
  red:        '#DD5759',
  darkPurple: '#B26CA6',
  lightPurple:'#DDBBD9',
  bubblegum:  '#F6AACB',
  maroon:     '#D46476',
  text:       '#333333',
  navy:       '#1B2A4A',
};

const STAGE_COLORS: Record<string, string> = {
  'Started':            TP.skyBlue,
  'Info Submitted':     TP.lightBlue,
  'Waiting for Photos': TP.yellow,
  'Photos Uploaded':    TP.green,
  'Under Review':       TP.darkPurple,
  'Sent to Provider':   TP.blue,
  'Enrolled':           '#4CAF50',
};

const STATUS_COLORS: Record<string, string> = {
  open:      TP.red,
  contacted: TP.yellow,
  resolved:  TP.green,
};

function daysSince(dateStr: string): number {
  const start = new Date(dateStr + 'T12:00:00');
  const todayParts = todayStr().split('-');
  const today = new Date(+todayParts[0], +todayParts[1] - 1, +todayParts[2], 12, 0, 0);
  return Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

const EMPTY_FORM: Omit<AuditPatient, 'id' | 'created_at' | 'updated_at'> = {
  name: '',
  email: '',
  phone: '',
  date_started: todayStr(),
  stage: 'Waiting for Photos',
  missing: '',
  assigned_to: '',
  last_action: '',
  notes: '',
  sibling_name: '',
  sibling_status: '',
  status: 'open',
};

export default function AirwayAudit() {
  const [patients, setPatients] = useState<AuditPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('open');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAuditPatients(statusFilter);
      setPatients(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const payload = editingId ? { id: editingId, ...form } : { ...form };
      await upsertAuditPatient(payload as AuditPatient & { name: string });
      setForm(EMPTY_FORM);
      setShowForm(false);
      setEditingId(null);
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p: AuditPatient) => {
    setForm({
      name: p.name,
      email: p.email || '',
      phone: p.phone || '',
      date_started: p.date_started,
      stage: p.stage,
      missing: p.missing || '',
      assigned_to: p.assigned_to || '',
      last_action: p.last_action || '',
      notes: p.notes || '',
      sibling_name: p.sibling_name || '',
      sibling_status: p.sibling_status || '',
      status: p.status,
    });
    setEditingId(p.id ?? null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this patient from the audit?')) return;
    try {
      await deleteAuditPatient(id);
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  const handleQuickStatus = async (p: AuditPatient, newStatus: string) => {
    try {
      await upsertAuditPatient({ id: p.id, name: p.name, status: newStatus } as AuditPatient & { name: string });
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update');
    }
  };

  // Funnel counts (across ALL patients, not filtered)
  const [allPatients, setAllPatients] = useState<AuditPatient[]>([]);
  useEffect(() => {
    fetchAuditPatients('all').then(setAllPatients).catch(() => {});
  }, [patients]);

  const funnelCounts = AUDIT_STAGES.map(stage => ({
    stage,
    total: allPatients.filter(p => p.stage === stage).length,
    open: allPatients.filter(p => p.stage === stage && p.status === 'open').length,
  }));
  const totalOpen = allPatients.filter(p => p.status === 'open').length;
  const totalContacted = allPatients.filter(p => p.status === 'contacted').length;
  const totalResolved = allPatients.filter(p => p.status === 'resolved').length;

  const avgDaysStuck = patients.length > 0
    ? Math.round(patients.reduce((s, p) => s + daysSince(p.date_started), 0) / patients.length)
    : 0;

  return (
    <div>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderLeft: `4px solid ${TP.red}` }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Open Issues</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: TP.red }}>{totalOpen}</div>
          <div style={{ fontSize: 13, color: '#999' }}>Patients needing action</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderLeft: `4px solid ${TP.yellow}` }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Contacted</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: TP.yellow }}>{totalContacted}</div>
          <div style={{ fontSize: 13, color: '#999' }}>Waiting for response</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderLeft: `4px solid ${TP.green}` }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Resolved</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: TP.green }}>{totalResolved}</div>
          <div style={{ fontSize: 13, color: '#999' }}>Completed or moved forward</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderLeft: `4px solid ${TP.navy}` }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>Avg Days Stuck</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: TP.navy }}>{avgDaysStuck}</div>
          <div style={{ fontSize: 13, color: '#999' }}>Current filtered view</div>
        </div>
      </div>

      {/* Funnel */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: TP.navy, marginBottom: 16 }}>Assessment Funnel</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          {funnelCounts.map(({ stage, total, open }) => (
            <div key={stage} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: TP.navy }}>{total}</div>
              {open > 0 && (
                <div style={{ fontSize: 11, color: TP.red, fontWeight: 600 }}>{open} stuck</div>
              )}
              <div style={{
                height: Math.max(8, total * 20),
                maxHeight: 100,
                background: STAGE_COLORS[stage] || TP.skyBlue,
                borderRadius: 6,
                margin: '6px auto',
                width: '80%',
                transition: 'height 0.3s',
              }} />
              <div style={{ fontSize: 11, color: '#666', lineHeight: 1.2 }}>{stage}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['open', 'contacted', 'resolved', 'all'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '6px 16px',
                borderRadius: 6,
                border: statusFilter === s ? `2px solid ${TP.blue}` : '1px solid #ddd',
                background: statusFilter === s ? TP.lightBlue : '#fff',
                color: statusFilter === s ? TP.navy : '#666',
                fontWeight: statusFilter === s ? 600 : 400,
                fontSize: 13,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(!showForm); }}
          style={{
            padding: '8px 20px',
            borderRadius: 8,
            border: 'none',
            background: TP.blue,
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          {showForm ? 'Cancel' : '+ Add Patient'}
        </button>
      </div>

      {error && (
        <div style={{ padding: 12, background: '#FEE', color: TP.red, borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: TP.navy, marginBottom: 16 }}>
            {editingId ? 'Edit Patient' : 'Add Patient'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Name *</label>
              <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Patient name" />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input style={inputStyle} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone" />
            </div>
            <div>
              <label style={labelStyle}>Date Started</label>
              <input style={inputStyle} type="date" value={form.date_started} onChange={e => setForm({ ...form, date_started: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Stage</label>
              <select style={inputStyle} value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })}>
                {AUDIT_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select style={inputStyle} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="open">Open</option>
                <option value="contacted">Contacted</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>What&apos;s Missing</label>
              <input style={inputStyle} value={form.missing} onChange={e => setForm({ ...form, missing: e.target.value })} placeholder="e.g. Photos" />
            </div>
            <div>
              <label style={labelStyle}>Assigned To</label>
              <input style={inputStyle} value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value })} placeholder="e.g. Bree, Tania" />
            </div>
            <div>
              <label style={labelStyle}>Last Action</label>
              <input style={inputStyle} value={form.last_action} onChange={e => setForm({ ...form, last_action: e.target.value })} placeholder="e.g. Sent reminder email" />
            </div>
            <div>
              <label style={labelStyle}>Sibling Name</label>
              <input style={inputStyle} value={form.sibling_name} onChange={e => setForm({ ...form, sibling_name: e.target.value })} placeholder="If applicable" />
            </div>
            <div>
              <label style={labelStyle}>Sibling Status</label>
              <input style={inputStyle} value={form.sibling_status} onChange={e => setForm({ ...form, sibling_status: e.target.value })} placeholder="e.g. Submitted, In Review" />
            </div>
            <div>
              <label style={labelStyle}>Notes</label>
              <input style={inputStyle} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional context" />
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              style={{
                padding: '10px 24px', borderRadius: 8, border: 'none',
                background: saving ? '#ccc' : TP.blue, color: '#fff',
                fontWeight: 600, fontSize: 14, cursor: saving ? 'default' : 'pointer',
              }}
            >
              {saving ? 'Saving...' : editingId ? 'Update Patient' : 'Add Patient'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); }}
              style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', color: '#666', fontSize: 14, cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Patient Table */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Loading...</div>
        ) : patients.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>
            No {statusFilter !== 'all' ? statusFilter : ''} patients found. Click &quot;+ Add Patient&quot; to start tracking.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: TP.navy, color: '#fff' }}>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Stage</th>
                <th style={thStyle}>Missing</th>
                <th style={thStyle}>Days</th>
                <th style={thStyle}>Assigned</th>
                <th style={thStyle}>Sibling</th>
                <th style={thStyle}>Last Action</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => {
                const days = daysSince(p.date_started);
                const urgent = days > 7 && p.status === 'open';
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #eee', background: urgent ? '#FFF5F5' : '#fff' }}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600, color: TP.navy }}>{p.name}</div>
                      {p.email && <div style={{ fontSize: 11, color: '#999' }}>{p.email}</div>}
                      {p.phone && <div style={{ fontSize: 11, color: '#999' }}>{p.phone}</div>}
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: 12,
                        background: STAGE_COLORS[p.stage] || TP.skyBlue,
                        color: ['Under Review', 'Sent to Provider', 'Enrolled'].includes(p.stage) ? '#fff' : TP.navy,
                        fontSize: 12,
                        fontWeight: 600,
                      }}>
                        {p.stage}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {p.missing ? (
                        <span style={{ color: TP.red, fontWeight: 600 }}>{p.missing}</span>
                      ) : (
                        <span style={{ color: '#ccc' }}>--</span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <span style={{
                        fontWeight: 700,
                        color: days > 14 ? TP.red : days > 7 ? TP.yellow : TP.text,
                        fontSize: 15,
                      }}>
                        {days}
                      </span>
                    </td>
                    <td style={tdStyle}>{p.assigned_to || <span style={{ color: '#ccc' }}>--</span>}</td>
                    <td style={tdStyle}>
                      {p.sibling_name ? (
                        <div>
                          <div style={{ fontWeight: 500 }}>{p.sibling_name}</div>
                          {p.sibling_status && <div style={{ fontSize: 11, color: '#888' }}>{p.sibling_status}</div>}
                        </div>
                      ) : (
                        <span style={{ color: '#ccc' }}>--</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      {p.last_action || <span style={{ color: '#ccc' }}>--</span>}
                      {p.notes && <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{p.notes}</div>}
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {p.status === 'open' && (
                          <button onClick={() => handleQuickStatus(p, 'contacted')} style={smallBtnStyle(TP.yellow)} title="Mark as contacted">
                            Contacted
                          </button>
                        )}
                        {p.status !== 'resolved' && (
                          <button onClick={() => handleQuickStatus(p, 'resolved')} style={smallBtnStyle(TP.green)} title="Mark as resolved">
                            Resolve
                          </button>
                        )}
                        {p.status === 'resolved' && (
                          <button onClick={() => handleQuickStatus(p, 'open')} style={smallBtnStyle(TP.red)} title="Re-open">
                            Re-open
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => handleEdit(p)} style={{ ...actionBtnStyle, color: TP.blue }} title="Edit">
                          Edit
                        </button>
                        <button onClick={() => p.id && handleDelete(p.id)} style={{ ...actionBtnStyle, color: TP.red }} title="Delete">
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 4,
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd',
  fontSize: 13, boxSizing: 'border-box',
};
const thStyle: React.CSSProperties = {
  padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, letterSpacing: 0.3,
};
const tdStyle: React.CSSProperties = {
  padding: '10px 12px', verticalAlign: 'top',
};
const smallBtnStyle = (bg: string): React.CSSProperties => ({
  padding: '3px 8px', borderRadius: 4, border: 'none',
  background: bg, color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer',
  whiteSpace: 'nowrap',
});
const actionBtnStyle: React.CSSProperties = {
  padding: '3px 6px', borderRadius: 4, border: '1px solid #eee',
  background: '#fff', fontSize: 11, cursor: 'pointer', fontWeight: 500,
};
