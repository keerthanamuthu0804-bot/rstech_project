import React, { useEffect, useRef, useState } from 'react';

export default function EmployeeModal({ open, onClose, onSaved, initial }) {
  const [form, setForm] = useState({ id: '', name: '', department: '', designation: '', project: '', type: '', status: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const fileRef = useRef(null);
  const isEdit = !!initial;

  useEffect(() => {
    if (initial) {
      setForm({
        id: initial.id,
        name: initial.name || '',
        department: initial.department || '',
        designation: initial.designation || '',
        project: initial.project || '',
        type: initial.type || '',
        status: initial.status || ''
      });
      setFile(null);
      setRemoveImage(false);

      if (initial.image_path) {
        const url = initial.image_path.startsWith('http')
          ? initial.image_path
          : `http://localhost:4000${initial.image_path}`;
        setPreview(url);
      } else {
        setPreview(null);
      }
    } else {
      setForm({ id: '', name: '', department: '', designation: '', project: '', type: '', status: '' });
      setFile(null);
      setPreview(null);
      setRemoveImage(false);
    }

    return () => {
      if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial, open]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!open) return null;

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setFile(f);
    setRemoveImage(false);
    const objUrl = URL.createObjectURL(f);
    setPreview(objUrl);
  };

  const triggerFileSelect = () => {
    if (fileRef.current) fileRef.current.click();
  };

  const handleRemove = () => {
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setRemoveImage(true);
  };

  const handleKeep = () => {
    if (initial?.image_path) {
      const url = initial.image_path.startsWith('http')
        ? initial.image_path
        : `http://localhost:4000${initial.image_path}`;
      setPreview(url);
    } else {
      setPreview(null);
    }
    setRemoveImage(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('image', file);
    if (removeImage) fd.append('remove_image', '1');

    const url = isEdit ? `/api/employees/${form.id}` : '/api/employees';
    const method = isEdit ? 'PUT' : 'POST';
    try {
      const res = await fetch(`http://localhost:4000${url}`, { method, body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert('Error: ' + (err.error || res.statusText));
        return;
      }
      onSaved();
      onClose();
    } catch (err) {
      alert('Network error');
    } finally {
      if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: 700 }}>
        <h3 style={{ marginBottom: 12 }}>{isEdit ? 'Edit Employee Details' : 'Add New Employee'}</h3>

        <form onSubmit={handleSubmit} className="modal-form" style={{ display: 'flex', gap: 20 }}>
          {/* Left: Picture + controls (placed first) */}
          <div style={{ minWidth: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              ref={fileRef}
              style={{ display: 'none' }}
            />

            <div style={{
              width: 180,
              height: 180,
              border: '1px solid #ddd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              borderRadius: 8,
              background: '#fafafa'
            }}>
              {preview ? (
                <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 13, color: '#888', textAlign: 'center' }}>No photo</span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
              <button type="button" className="btn" onClick={triggerFileSelect}>
                {preview ? 'Replace' : 'Add Photo'}
              </button>

              {preview && (
                <button type="button" className="btn" onClick={handleRemove}>
                  Remove
                </button>
              )}

              {removeImage && (
                <button type="button" className="btn" onClick={handleKeep}>
                  Undo Remove
                </button>
              )}

              {removeImage && <small style={{ color: 'crimson', textAlign: 'center' }}>Image will be removed on save.</small>}
            </div>
          </div>

          {/* Right: Form fields (name/details next) */}
          <div style={{ flex: 1 }}>
            <div className="row" style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block' }}>Name*</label>
                <input name="name" value={form.name} onChange={handleChange} required style={{ width: '100%' }} />
              </div>

              <div style={{ width: 160 }}>
                <label style={{ display: 'block' }}>Employee ID*</label>
                <input name="id" value={form.id} onChange={handleChange} required readOnly={isEdit} style={{ width: '100%' }} />
              </div>
            </div>

            <div className="row" style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block' }}>Department</label>
                <input name="department" value={form.department} onChange={handleChange} style={{ width: '100%' }} />
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block' }}>Designation</label>
                <input name="designation" value={form.designation} onChange={handleChange} style={{ width: '100%' }} />
              </div>
            </div>

            <div className="row" style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block' }}>Project</label>
                <input name="project" value={form.project} onChange={handleChange} style={{ width: '100%' }} />
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block' }}>Type</label>
                <input name="type" value={form.type} onChange={handleChange} style={{ width: '100%' }} />
              </div>
            </div>

            <div className="row" style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block' }}>Status</label>
                <input name="status" value={form.status} onChange={handleChange} style={{ width: '100%' }} />
              </div>

              <div style={{ width: 160, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={onClose} className="btn">Cancel</button>
                  <button type="submit" className="btn primary">{isEdit ? 'Update' : 'Add'}</button>
                </div>
              </div>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
