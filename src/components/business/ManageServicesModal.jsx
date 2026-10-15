import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useBooking } from '../../context/BookingContext';
import { SERVICE_CATEGORIES } from '../../data/servicesData';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Check,
  ToggleLeft,
  ToggleRight,
  Scissors,
  Sparkles,
  DollarSign,
  Clock,
  Tag,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const ManageServicesModal = ({ isOpen, onClose }) => {
  const { services, saveService, createService, toggleServiceActive } = useBooking();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [expandedStylesId, setExpandedStylesId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form state for creating or editing a service
  const [formData, setFormData] = useState({
    name: '',
    category: 'braids',
    subtitle: '',
    description: '',
    startingPrice: 10000,
    durationEstimate: '3 - 4 hrs',
    tag: '',
    popular: false,
    isActive: true,
    styles: ['Standard Length', 'Waist Length'],
  });

  const [newStyleInput, setNewStyleInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredServices = services.filter(service => {
    if (selectedCategory === 'all') return true;
    return service.category === selectedCategory;
  });

  const handleStartCreate = () => {
    setIsCreating(true);
    setEditingServiceId(null);
    setErrorMessage('');
    setSuccessMessage('');
    setFormData({
      name: '',
      category: selectedCategory === 'all' ? 'braids' : selectedCategory,
      subtitle: '',
      description: '',
      startingPrice: 12000,
      durationEstimate: '3 - 4 hrs',
      tag: 'New',
      popular: false,
      isActive: true,
      styles: ['Medium Length', 'Waist Length'],
    });
  };

  const handleStartEdit = (service) => {
    setIsCreating(false);
    setEditingServiceId(service.id || service.dbId);
    setErrorMessage('');
    setSuccessMessage('');
    setFormData({
      id: service.id,
      dbId: service.dbId,
      name: service.name,
      category: service.category || 'braids',
      subtitle: service.subtitle || '',
      description: service.description || '',
      startingPrice: service.startingPrice || parseInt((service.priceEstimate || '').replace(/[^0-9]/g, ''), 10) || 10000,
      durationEstimate: service.durationEstimate || service.duration || '2 - 3 hrs',
      tag: service.tag || '',
      popular: Boolean(service.popular),
      isActive: service.isActive !== false,
      styles: Array.isArray(service.styles) ? [...service.styles] : [],
    });
  };

  const handleCancelForm = () => {
    setIsCreating(false);
    setEditingServiceId(null);
    setErrorMessage('');
  };

  const handleAddStyleVariation = () => {
    if (!newStyleInput.trim()) return;
    if (formData.styles.includes(newStyleInput.trim())) return;
    setFormData(prev => ({
      ...prev,
      styles: [...prev.styles, newStyleInput.trim()],
    }));
    setNewStyleInput('');
  };

  const handleRemoveStyleVariation = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      styles: prev.styles.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('Service name is required.');
      return;
    }
    if (Number(formData.startingPrice) < 0) {
      setErrorMessage('Starting price must be a non-negative number.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage('');

      if (isCreating) {
        await createService(formData);
        setSuccessMessage(`"${formData.name}" created successfully.`);
      } else {
        await saveService(formData);
        setSuccessMessage(`"${formData.name}" updated successfully.`);
      }

      setIsCreating(false);
      setEditingServiceId(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save service.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickPriceChange = async (service, delta) => {
    const currentPrice = service.startingPrice || parseInt((service.priceEstimate || '').replace(/[^0-9]/g, ''), 10) || 10000;
    const newPrice = Math.max(0, currentPrice + delta);

    try {
      await saveService({
        ...service,
        startingPrice: newPrice,
      });
    } catch (err) {
      console.error('Quick price update failed:', err);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
        <div className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] text-left my-6">
        
        {/* Header */}
        <div className="px-5 py-4 sm:px-7 sm:py-5 bg-gradient-to-r from-rosewood-900 to-espresso-900 text-white flex items-center justify-between border-b border-rosewood-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blush-300">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Manage Salon Services</span>
                <span className="text-[10px] font-sans font-semibold bg-white/20 text-blush-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live Menu
                </span>
              </h2>
              <p className="text-xs text-stone-300">
                Adjust starting Naira prices, duration estimates, variations, and active offerings
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
        {errorMessage && (
          <div className="px-5 py-2.5 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Action Bar & Category Filters */}
          {!isCreating && !editingServiceId && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
              
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
                {SERVICE_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-rosewood-700 text-white shadow-soft'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Add New Service Button */}
              <button
                onClick={handleStartCreate}
                className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-soft transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Service</span>
              </button>
            </div>
          )}

          {/* Form View: Create or Edit */}
          {(isCreating || editingServiceId) ? (
            <form onSubmit={handleSaveForm} className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-5 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rosewood-600" />
                  <span>{isCreating ? 'Add New Hair Service' : `Edit: ${formData.name}`}</span>
                </h3>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="text-xs text-stone-500 hover:text-stone-800 font-semibold"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Service Name */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Boho Goddess Braids"
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rosewood-500 bg-white"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rosewood-500 bg-white capitalize"
                  >
                    {SERVICE_CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Starting Price in Naira */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Starting Price (₦) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-stone-400">₦</span>
                    <input
                      type="number"
                      required
                      min="0"
                      step="500"
                      value={formData.startingPrice}
                      onChange={e => setFormData({ ...formData, startingPrice: Number(e.target.value) })}
                      className="w-full text-xs pl-7 pr-3 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rosewood-500 bg-white font-semibold"
                    />
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    Displays as: From ₦{Number(formData.startingPrice || 0).toLocaleString()}
                  </span>
                </div>

                {/* Duration Estimate */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Duration Estimate *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.durationEstimate}
                    onChange={e => setFormData({ ...formData, durationEstimate: e.target.value })}
                    placeholder="e.g. 3.5 - 5 hrs"
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rosewood-500 bg-white"
                  />
                </div>

                {/* Subtitle */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Catchy Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. Seamless, lightweight, tension-free finish"
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rosewood-500 bg-white"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Description & Technique Notes
                  </label>
                  <textarea
                    rows="2"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe hair preparation, edge protection, extensions, and finish..."
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rosewood-500 bg-white"
                  />
                </div>

                {/* Badge Tag & Popular Toggle */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Badge Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.tag}
                    onChange={e => setFormData({ ...formData, tag: e.target.value })}
                    placeholder="e.g. Signature, Popular, Trending"
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rosewood-500 bg-white"
                  />
                </div>

                <div className="flex items-center gap-6 pt-5">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.popular}
                      onChange={e => setFormData({ ...formData, popular: e.target.checked })}
                      className="w-4 h-4 text-rosewood-600 rounded border-stone-300"
                    />
                    <span className="text-xs font-semibold text-stone-700">Mark as Popular</span>
                  </label>

                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded border-stone-300"
                    />
                    <span className="text-xs font-semibold text-stone-700">Service Active</span>
                  </label>
                </div>
              </div>

              {/* Style Variations Editor */}
              <div className="pt-3 border-t border-stone-200">
                <label className="block text-xs font-semibold text-stone-700 mb-2">
                  Style Variations (Options for client selection in Step 1)
                </label>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.styles.map((style, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-xs bg-rosewood-100 text-rosewood-900 px-3 py-1 rounded-full font-medium"
                    >
                      <span>{style}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveStyleVariation(idx)}
                        className="w-3.5 h-3.5 rounded-full hover:bg-rosewood-200 flex items-center justify-center text-rosewood-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {formData.styles.length === 0 && (
                    <span className="text-xs text-stone-400 italic">No variations added yet.</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newStyleInput}
                    onChange={e => setNewStyleInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddStyleVariation();
                      }
                    }}
                    placeholder="Add variation e.g. Waist Length, Jumbo Parting..."
                    className="flex-1 text-xs p-2 rounded-xl border border-stone-300 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddStyleVariation}
                    className="bg-stone-800 text-white text-xs px-3 py-2 rounded-xl font-semibold hover:bg-stone-900"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-rosewood-700 hover:bg-rosewood-800 text-white text-xs font-semibold shadow-soft flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </form>
          ) : (
            /* Service List Cards */
            <div className="space-y-3">
              {filteredServices.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-300 text-stone-500 text-xs">
                  No services found in this category. Click &quot;Add Service&quot; above to create one.
                </div>
              ) : (
                filteredServices.map(service => {
                  const numericPrice = service.startingPrice || parseInt((service.priceEstimate || '').replace(/[^0-9]/g, ''), 10) || 10000;
                  const isExpanded = expandedStylesId === (service.id || service.dbId);

                  return (
                    <div
                      key={service.id || service.dbId}
                      className={`p-4 rounded-2xl border transition-all ${
                        service.isActive !== false
                          ? 'bg-white border-stone-200 shadow-soft hover:border-stone-300'
                          : 'bg-stone-50/70 border-stone-200/60 opacity-75'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        
                        {/* Service Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="font-bold text-sm text-stone-900">
                              {service.name}
                            </h4>
                            <span className="text-[10px] uppercase font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                              {service.category}
                            </span>
                            {service.tag && (
                              <span className="text-[10px] uppercase font-bold text-rosewood-700 bg-rosewood-50 px-2 py-0.5 rounded-full">
                                {service.tag}
                              </span>
                            )}
                            {service.popular && (
                              <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                                Popular
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-stone-600 line-clamp-1 mb-1.5">
                            {service.subtitle || service.description}
                          </p>

                          <div className="flex items-center gap-3 text-xs text-stone-500">
                            <span className="flex items-center gap-1 font-semibold text-rosewood-800">
                              <DollarSign className="w-3.5 h-3.5 text-rosewood-600" />
                              <span>From ₦{numericPrice.toLocaleString()}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{service.durationEstimate || service.duration}</span>
                            </span>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2 flex-wrap">
                          
                          {/* Quick Price Adjuster */}
                          <div className="inline-flex items-center bg-stone-100 rounded-xl p-0.5 border border-stone-200">
                            <button
                              onClick={() => handleQuickPriceChange(service, -1000)}
                              className="px-2 py-1 text-xs font-bold text-stone-600 hover:bg-white rounded-lg transition-colors"
                              title="Decrease price by ₦1,000"
                            >
                              -1k
                            </button>
                            <span className="px-2 text-xs font-bold text-stone-800">
                              ₦{(numericPrice / 1000).toFixed(0)}k
                            </span>
                            <button
                              onClick={() => handleQuickPriceChange(service, 1000)}
                              className="px-2 py-1 text-xs font-bold text-stone-600 hover:bg-white rounded-lg transition-colors"
                              title="Increase price by ₦1,000"
                            >
                              +1k
                            </button>
                          </div>

                          {/* Active Toggle Button */}
                          <button
                            onClick={() => toggleServiceActive(service.id || service.dbId)}
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-colors ${
                              service.isActive !== false
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-stone-200 text-stone-600 border-stone-300 hover:bg-stone-300'
                            }`}
                            title="Toggle active status"
                          >
                            {service.isActive !== false ? (
                              <>
                                <ToggleRight className="w-4 h-4 text-emerald-600" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-4 h-4 text-stone-500" />
                                <span>Hidden</span>
                              </>
                            )}
                          </button>

                          {/* Edit Details Button */}
                          <button
                            onClick={() => handleStartEdit(service)}
                            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                            title="Edit full service details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Variations Toggle Button */}
                          <button
                            onClick={() => setExpandedStylesId(isExpanded ? null : (service.id || service.dbId))}
                            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                            title="Toggle variations"
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Variations View */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap gap-1.5 animate-fadeIn">
                          <span className="text-[11px] font-semibold text-stone-500 mr-2 flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            <span>Variations:</span>
                          </span>
                          {(service.styles || []).map((style, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[11px] bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-md font-medium"
                            >
                              {style}
                            </span>
                          ))}
                          {(service.styles || []).length === 0 && (
                            <span className="text-[11px] text-stone-400 italic">No variations defined</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>{filteredServices.length} service(s) configured</span>
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
