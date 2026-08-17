import React, { useState, useRef } from 'react';
import { AvatarCircle } from '../../../components/ui';
import { Icon } from '../../../components/Icon.jsx';
import { InputField, SaveButton } from './SharedUI.jsx';
import { useUploadProfileImageMutation } from '../../../store/apiSlice.js';

/**
 * Canvas Image Compressor.
 * Resizes max dimensions to 800x800 and compresses JPEG quality to 75%.
 * Returns { compressedFile: File, previewUrl: string }
 */
function compressImageToFile(file, maxWidth = 800, maxHeight = 800, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const previewUrl = canvas.toDataURL('image/jpeg', quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({ compressedFile: file, previewUrl });
              return;
            }
            const compressedFile = new File([blob], file.name || 'profile.jpg', {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve({ compressedFile, previewUrl });
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export function EditProfileView({ user, onSave }) {
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    phone: user?.phone?.toString() || '',
    bio: user?.bio || '',
  });
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(user?.profileImage?.url || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const [uploadProfileImage, { isLoading: isUploadingImage }] = useUploadProfileImageMutation();

  function onField(key, val) {
    setForm(f => ({ ...f, [key]: val }));
  }

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { compressedFile, previewUrl } = await imageCompression(file);
      setSelectedFile(compressedFile);
      setPreviewImage(previewUrl);
    } catch (err) {
      console.error('Failed to compress profile image', err);
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  async function handleSave() {
    setLoading(true);
    try {
      const formData = new FormData();
      if (form.firstName) formData.append('firstName', form.firstName);
      if (form.lastName) formData.append('lastName', form.lastName);
      if (form.username) formData.append('username', form.username);
      if (form.phone) formData.append('phone', form.phone.replace(/\D/g, ''));
      if (form.bio) formData.append('bio', form.bio);

      if (selectedFile) {
        // formData.append('image', selectedFile, selectedFile.name);
        formData.append('profileImage', selectedFile);
      } else if (previewImage && !previewImage.startsWith('data:')) {
        formData.append('profileImage', previewImage);
      }

      await onSave(formData);
    } catch (err) {
      console.error('Failed to save profile', err);
    } finally {
      setLoading(false);
    }
  }

  const initial = form.firstName?.charAt(0) || 'U';

  return (
    <div className="animate-in fade-in duration-300">
      <h2 className="font-extrabold text-cx-ink text-2xl mb-6">Edit profile</h2>

      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        className="hidden" 
        onChange={handleImageSelect} 
      />

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        {previewImage ? (
          <img
            src={previewImage}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover mb-3 shadow-md border-4 border-white"
          />
        ) : (
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-extrabold mb-3 shadow-md border-4 border-white"
            style={{ background: 'linear-gradient(135deg, #14b8a6, #7c6cf0)' }}
          >
            {initial}
          </div>
        )}
        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingImage}
          className="text-cx-teal text-sm font-bold border-none bg-transparent cursor-pointer hover:underline transition-all flex items-center gap-1.5"
        >
          {isUploadingImage ? 'Uploading...' : 'Change photo'}
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="First name"
            value={form.firstName}
            onChange={e => onField('firstName', e.target.value)}
          />
          <InputField
            label="Last name"
            value={form.lastName}
            onChange={e => onField('lastName', e.target.value)}
          />
        </div>
        <InputField
          label="Username"
          value={form.username}
          onChange={e => onField('username', e.target.value)}
          placeholder="e.g. amara_o"
        />
        <InputField
          type="tel"
          label="Phone number"
          value={form.phone}
          onChange={e => onField('phone', e.target.value)}
          placeholder="+234 xxx xxx xxxx"
        />

        <div>
          <label className="text-xs font-bold text-cx-ink3 block mb-1.5 px-1">Bio</label>
          <textarea
            value={form.bio}
            onChange={e => onField('bio', e.target.value)}
            rows={3}
            placeholder="Tell the campus about yourself..."
            className="w-full rounded-2xl border border-cx-border bg-slate-50 px-4 py-3.5 text-sm font-medium text-cx-ink outline-none focus:border-cx-teal focus:ring-4 focus:ring-teal-500/10 transition-all resize-none shadow-sm"
            style={{ fontFamily: 'inherit' }}
          />
        </div>

        {/* Email — read-only, shown from API */}
        <div>
          <label className="text-xs font-bold text-cx-ink3 block mb-1.5 px-1">School email</label>
          <div className="flex items-center gap-3 w-full rounded-2xl border border-cx-border bg-slate-100 px-4 py-3.5 shadow-sm">
            <span className="text-sm font-medium text-cx-muted flex-1">{user?.email || '—'}</span>
            {user?.emailVerified ? (
              <div className="flex items-center gap-1 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
                <Icon name="verified" size={14} fill={1} style={{ color: '#14b8a6' }} />
                <span className="text-xs font-bold text-teal-600">Verified</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                <Icon name="warning" size={14} style={{ color: '#d97706' }} />
                <span className="text-xs font-bold text-amber-600">Unverified</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <SaveButton onClick={handleSave} loading={loading} />
    </div>
  );
}
