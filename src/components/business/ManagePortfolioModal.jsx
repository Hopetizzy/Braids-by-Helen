import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useBooking } from '../../context/BookingContext';
import { SERVICE_CATEGORIES } from '../../data/servicesData';
import {
  X,
  Upload,
  Image as ImageIcon,
  Film,
  Trash2,
  Check,
  AlertCircle,
  Sparkles,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Play,
  Clock,
} from 'lucide-react';

export const ManagePortfolioModal = ({ isOpen, onClose }) => {
  const {
    media,
    services,
    uploadMediaFile,
    saveMediaItem,
    deleteMediaItem,
    toggleMediaPublished,
  } = useBooking();

  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState('');
  const [fileType, setFileType] = useState('image'); // 'image' or 'video'
  const [fileError, setFileError] = useState('');

  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('braids');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedStyleTag, setSelectedStyleTag] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'images', 'videos'

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Selected service styles variations
  const currentSelectedService = services.find(
    s => s.id === selectedServiceId || s.dbId === selectedServiceId || s.slug === selectedServiceId
  );
  const availableStyleVariations = currentSelectedService?.styles || [];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError('');
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) {
      setFileError('Invalid file type. Please choose an image (JPEG, PNG, WebP) or video (MP4, WebM).');
      return;
    }

    // Size limit verification: 10MB image, 50MB video
    const maxBytes = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      const limit = isVideo ? '50MB' : '10MB';
      setFileError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is ${limit}.`);
      return;
    }

    setSelectedFile(file);
    setFileType(isVideo ? 'video' : 'image');
    setFilePreviewUrl(URL.createObjectURL(file));

    // Auto populate title from file name if blank
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanName);
    }
  };

  const handleClearSelectedFile = () => {
    setSelectedFile(null);
    setFilePreviewUrl('');
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadAndSave = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setFileError('Please select a photo or video to upload.');
      return;
    }

    try {
      setIsUploading(true);
      setFileError('');

      // Step 1: Upload to Supabase Storage
      const uploadResult = await uploadMediaFile(selectedFile);

      // Step 2: Save metadata to PostgreSQL media table
      await saveMediaItem({
        mediaType: uploadResult.mediaType,
        publicUrl: uploadResult.publicUrl,
        storagePath: uploadResult.storagePath,
        title: title.trim() || selectedFile.name,
        caption: caption.trim(),
        category,
        serviceId: selectedServiceId || null,
        styleTag: selectedStyleTag || null,
        isPublished: true,
      });

      setSuccessMessage('Portfolio media uploaded and saved successfully.');
      handleClearSelectedFile();
      setTitle('');
      setCaption('');
      setSelectedStyleTag('');
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err) {
      setFileError(err.message || 'Failed to upload and save media.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (item) => {
    const confirmDelete = window.confirm(`Are you sure you want to remove "${item.title || 'this media'}" from the portfolio?`);
    if (!confirmDelete) return;

    try {
      await deleteMediaItem(item.id, item.storagePath || item.storage_path);
      setSuccessMessage('Media item removed.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setFileError('Could not delete media item.');
    }
  };

  const filteredMedia = media.filter(item => {
    const type = item.mediaType || item.media_type;
    if (activeTab === 'images') return type === 'image';
    if (activeTab === 'videos') return type === 'video';
    return true;
  });

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
        <div className="bg-white w-full max-w-5xl rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] text-left my-6">
        
        {/* Header */}
        <div className="px-5 py-4 sm:px-7 sm:py-5 bg-gradient-to-r from-espresso-900 to-rosewood-900 text-white flex items-center justify-between border-b border-rosewood-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blush-300">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Manage Studio Portfolio</span>
                <span className="text-[10px] font-sans font-semibold bg-white/20 text-blush-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Photos & Videos
                </span>
              </h2>
              <p className="text-xs text-stone-300">
                Upload authentic client transformations, tag hair services, and showcase styling artistry
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="px-5 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}
        {fileError && (
          <div className="px-5 py-2.5 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{fileError}</span>
          </div>
        )}

        {/* Main Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Section 1: Upload Form Area */}
          <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200">
            <h3 className="font-bold text-sm text-stone-900 mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4 text-rosewood-600" />
              <span>Upload New Work</span>
            </h3>

            <form onSubmit={handleUploadAndSave} className="space-y-4">
              
              {/* File Drop / Select Area */}
              {!selectedFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-300 hover:border-rosewood-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-white group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-full bg-rosewood-50 text-rosewood-600 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-stone-800 mb-1">
                    Click or drag photo / video here to upload
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Photos (JPEG, PNG, WebP) up to 10MB • Videos (MP4, WebM) up to 50MB
                  </p>
                </div>
              ) : (
                /* Selected File Preview Box */
                <div className="p-4 bg-white rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-32 h-24 rounded-xl overflow-hidden bg-stone-900 flex-shrink-0 flex items-center justify-center relative">
                    {fileType === 'video' ? (
                      <video
                        src={filePreviewUrl}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        loop
                        autoPlay
                      />
                    ) : (
                      <img
                        src={filePreviewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <span className="absolute bottom-1 right-1 text-[9px] font-bold bg-black/70 text-white px-1.5 py-0.5 rounded uppercase">
                      {fileType}
                    </span>
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-xs font-bold text-stone-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearSelectedFile}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg bg-rose-50"
                  >
                    Change File
                  </button>
                </div>
              )}

              {/* Media Tagging Inputs */}
              {selectedFile && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 animate-fadeIn">
                  
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Title / Style Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="e.g. Bohemian Goddess Braids"
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rosewood-500 bg-white"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rosewood-500 bg-white capitalize"
                    >
                      {SERVICE_CATEGORIES.filter(c => c.id !== 'all').map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Service Association */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Tag to Service (Enables &quot;Book This Style&quot;)
                    </label>
                    <select
                      value={selectedServiceId}
                      onChange={e => {
                        setSelectedServiceId(e.target.value);
                        setSelectedStyleTag('');
                      }}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rosewood-500 bg-white"
                    >
                      <option value="">No linked service (Showcase only)</option>
                      {services.map(s => (
                        <option key={s.id || s.dbId} value={s.id || s.dbId}>
                          {s.name} ({s.priceEstimate || `From ₦${s.startingPrice}`})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Style Variation Tag */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Style Variation (Preselected in Booking Step 1)
                    </label>
                    {availableStyleVariations.length > 0 ? (
                      <select
                        value={selectedStyleTag}
                        onChange={e => setSelectedStyleTag(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rosewood-500 bg-white"
                      >
                        <option value="">Select variation or general...</option>
                        {availableStyleVariations.map((st, idx) => (
                          <option key={idx} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={selectedStyleTag}
                        onChange={e => setSelectedStyleTag(e.target.value)}
                        placeholder="e.g. Waist Length, Small Parting"
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rosewood-500 bg-white"
                      />
                    )}
                  </div>

                  {/* Caption */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Caption / Artistry Description
                    </label>
                    <textarea
                      rows="2"
                      value={caption}
                      onChange={e => setCaption(e.target.value)}
                      placeholder="Brief note on length, texture, time taken, or edge protection..."
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rosewood-500 bg-white"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleClearSelectedFile}
                      className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="px-5 py-2 rounded-xl bg-rosewood-700 hover:bg-rosewood-800 text-white text-xs font-semibold shadow-soft flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isUploading ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Publish to Portfolio</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              )}

            </form>
          </div>

          {/* Section 2: Portfolio Library */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-stone-900">
                  Portfolio Gallery ({media.length})
                </h3>
              </div>

              {/* Media Type Tabs */}
              <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeTab === 'all' ? 'bg-white text-stone-900 shadow-soft' : 'text-stone-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab('images')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeTab === 'images' ? 'bg-white text-stone-900 shadow-soft' : 'text-stone-600'
                  }`}
                >
                  Photos
                </button>
                <button
                  onClick={() => setActiveTab('videos')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeTab === 'videos' ? 'bg-white text-stone-900 shadow-soft' : 'text-stone-600'
                  }`}
                >
                  Videos
                </button>
              </div>
            </div>

            {/* Media Grid or Empty State */}
            {filteredMedia.length === 0 ? (
              <div className="text-center py-12 px-4 border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
                <ImageIcon className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-stone-700">No portfolio media yet</p>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Upload your authentic client photos and styling videos using the form above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredMedia.map(item => {
                const isVideo = (item.mediaType || item.media_type) === 'video';
                const isPublished = item.isPublished !== false && item.is_published !== false;
                const url = item.publicUrl || item.public_url;

                // Lookup linked service name
                const linkedService = services.find(
                  s => s.id === item.serviceId || s.dbId === item.serviceId || s.slug === item.serviceId || s.id === item.service_id
                );

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-soft flex flex-col justify-between group"
                  >
                    {/* Media Preview Thumbnail */}
                    <div className="relative aspect-[4/3] bg-stone-900 overflow-hidden">
                      {isVideo ? (
                        <video
                          src={url}
                          className="w-full h-full object-cover"
                          preload="metadata"
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={url}
                          alt={item.title || 'Portfolio work'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}

                      {/* Type Badge */}
                      <span className="absolute top-2 left-2 text-[10px] font-bold bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                        {isVideo ? <Film className="w-3 h-3 text-rose-300" /> : <ImageIcon className="w-3 h-3 text-rose-300" />}
                        <span className="capitalize">{isVideo ? 'Video' : 'Photo'}</span>
                      </span>

                      {/* Video Center Play Icon */}
                      {isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-md">
                            <Play className="w-4 h-4 ml-0.5" />
                          </div>
                        </div>
                      )}

                      {/* Published State Badge */}
                      <button
                        onClick={() => toggleMediaPublished(item.id)}
                        className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors ${
                          isPublished
                            ? 'bg-emerald-600/90 text-white'
                            : 'bg-stone-800/80 text-stone-300'
                        }`}
                        title="Click to toggle publish status"
                      >
                        {isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{isPublished ? 'Live' : 'Draft'}</span>
                      </button>
                    </div>

                    {/* Metadata Content */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-stone-900 line-clamp-1 mb-1">
                          {item.title}
                        </h4>
                        {item.caption && (
                          <p className="text-[11px] text-stone-500 line-clamp-2 mb-2">
                            {item.caption}
                          </p>
                        )}
                      </div>

                      {/* Service Tagging Pill */}
                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                        {linkedService ? (
                          <span className="inline-flex items-center gap-1 text-rosewood-700 bg-rosewood-50 px-2 py-0.5 rounded-md font-semibold truncate max-w-[170px]">
                            <LinkIcon className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{linkedService.name}</span>
                          </span>
                        ) : (
                          <span className="text-stone-400 italic">No service linked</span>
                        )}

                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete media item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>{filteredMedia.length} item(s) in portfolio</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-semibold shadow-soft"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  </div>
  );

  return createPortal(modalContent, document.body);
};
