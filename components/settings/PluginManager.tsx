'use client';

import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import { usePlugins } from '@/context/PluginContext';
import { UserPlugin, DEFAULT_PLUGIN_ICONS, PluginIconName } from '@/types/plugin';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiDownload,
  FiUpload,
  FiToggleLeft,
  FiToggleRight,
  FiStar,
  FiZap,
  FiFeather,
  FiEdit3,
  FiMessageCircle,
  FiBookOpen,
  FiUsers,
  FiGlobe,
  FiHeart,
  FiBold,
  FiItalic,
  FiList,
  FiCode,
  FiCoffee,
  FiSun,
  FiMoon,
  FiMusic,
  FiCamera,
  FiFilm,
  FiMic,
  FiX,
  FiPackage,
  FiAlertCircle,
  FiCheck,
} from 'react-icons/fi';
import { Button, Card } from '@/components/ui';

// Icon mapping with display names for screen readers
const ICON_MAP: Record<string, { component: React.ComponentType<{ className?: string }>; label: string }> = {
  FiStar: { component: FiStar, label: 'Star' },
  FiZap: { component: FiZap, label: 'Lightning bolt' },
  FiFeather: { component: FiFeather, label: 'Feather' },
  FiEdit3: { component: FiEdit3, label: 'Pen' },
  FiMessageCircle: { component: FiMessageCircle, label: 'Message bubble' },
  FiBookOpen: { component: FiBookOpen, label: 'Open book' },
  FiUsers: { component: FiUsers, label: 'People' },
  FiGlobe: { component: FiGlobe, label: 'Globe' },
  FiHeart: { component: FiHeart, label: 'Heart' },
  FiBold: { component: FiBold, label: 'Bold' },
  FiItalic: { component: FiItalic, label: 'Italic' },
  FiList: { component: FiList, label: 'List' },
  FiCode: { component: FiCode, label: 'Code' },
  FiCoffee: { component: FiCoffee, label: 'Coffee cup' },
  FiSun: { component: FiSun, label: 'Sun' },
  FiMoon: { component: FiMoon, label: 'Moon' },
  FiMusic: { component: FiMusic, label: 'Music note' },
  FiCamera: { component: FiCamera, label: 'Camera' },
  FiFilm: { component: FiFilm, label: 'Film' },
  FiMic: { component: FiMic, label: 'Microphone' },
};

interface PluginEditorProps {
  plugin?: UserPlugin;
  onSave: (plugin: Omit<UserPlugin, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

function PluginEditor({ plugin, onSave, onCancel }: PluginEditorProps) {
  const [name, setName] = useState(plugin?.name || '');
  const [description, setDescription] = useState(plugin?.description || '');
  const [prompt, setPrompt] = useState(plugin?.prompt || '');
  const [icon, setIcon] = useState<string>(plugin?.icon || 'FiStar');
  const [keywords, setKeywords] = useState(plugin?.keywords.join(', ') || '');
  const [enabled, setEnabled] = useState(plugin?.enabled ?? true);
  const [errors, setErrors] = useState<{ name?: string; prompt?: string }>({});

  // Unique IDs for ARIA associations
  const titleId = useId();
  const descriptionId = useId();
  const nameId = useId();
  const nameErrorId = useId();
  const descId = useId();
  const iconGroupId = useId();
  const promptId = useId();
  const promptErrorId = useId();
  const promptHintId = useId();
  const keywordsId = useId();
  const keywordsHintId = useId();
  const enabledId = useId();

  // Refs for focus management
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const iconRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  // Trap focus within modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = dialogRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements?.length) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  // Handle icon selection with keyboard navigation
  const handleIconKeyDown = (e: React.KeyboardEvent, index: number) => {
    const iconCount = DEFAULT_PLUGIN_ICONS.length;
    let newIndex = index;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        newIndex = (index + 1) % iconCount;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = (index - 1 + iconCount) % iconCount;
        break;
      case 'ArrowDown':
        e.preventDefault();
        newIndex = Math.min(index + 5, iconCount - 1); // 5 icons per row approximately
        break;
      case 'ArrowUp':
        e.preventDefault();
        newIndex = Math.max(index - 5, 0);
        break;
      case ' ':
      case 'Enter':
        e.preventDefault();
        setIcon(DEFAULT_PLUGIN_ICONS[index]);
        return;
      default:
        return;
    }

    iconRefs.current[newIndex]?.focus();
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; prompt?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Plugin name is required';
    }
    if (!prompt.trim()) {
      newErrors.prompt = 'Plugin prompt is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Focus first error field
      if (errors.name) {
        firstInputRef.current?.focus();
      }
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      prompt: prompt.trim(),
      icon,
      category: 'custom',
      keywords: keywords.split(',').map((k) => k.trim()).filter((k) => k),
      enabled,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="bg-primary-900 rounded-2xl border border-primary-700/30 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b border-primary-700/30">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-white">
              {plugin ? 'Edit Plugin' : 'Create Plugin'}
            </h2>
            <p id={descriptionId} className="text-sm text-neutral-400">
              {plugin ? 'Modify your custom plugin settings' : 'Create a new custom AI action'}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onCancel}
            className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-primary-800 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-primary-900"
            aria-label="Close dialog"
          >
            <FiX className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4" noValidate>
          {/* Name */}
          <div>
            <label
              htmlFor={nameId}
              className="block text-sm font-medium text-neutral-300 mb-1.5"
            >
              Name <span className="text-red-400" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </label>
            <input
              ref={firstInputRef}
              id={nameId}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="e.g., Add Sensory Details"
              className={`
                w-full px-4 py-2 rounded-xl bg-primary-800 border text-white placeholder-neutral-500
                outline-none transition-colors
                focus:ring-2 focus:ring-accent-500 focus:ring-offset-1 focus:ring-offset-primary-900
                ${errors.name
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-primary-700/30 focus:border-accent-600/50'
                }
              `}
              aria-required="true"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? nameErrorId : undefined}
            />
            {errors.name && (
              <p id={nameErrorId} className="mt-1.5 text-sm text-red-400 flex items-center gap-1" role="alert">
                <FiAlertCircle className="w-4 h-4" aria-hidden="true" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor={descId}
              className="block text-sm font-medium text-neutral-300 mb-1.5"
            >
              Description
              <span className="sr-only">(optional)</span>
            </label>
            <input
              id={descId}
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this plugin does"
              className="w-full px-4 py-2 rounded-xl bg-primary-800 border border-primary-700/30 text-white placeholder-neutral-500 outline-none focus:border-accent-600/50 focus:ring-2 focus:ring-accent-500 focus:ring-offset-1 focus:ring-offset-primary-900 transition-colors"
            />
          </div>

          {/* Icon */}
          <fieldset>
            <legend className="block text-sm font-medium text-neutral-300 mb-1.5">
              Icon
            </legend>
            <div
              id={iconGroupId}
              className="flex flex-wrap gap-2"
              role="radiogroup"
              aria-label="Select an icon for your plugin"
            >
              {DEFAULT_PLUGIN_ICONS.map((iconName, index) => {
                const iconData = ICON_MAP[iconName];
                const IconComponent = iconData.component;
                const isSelected = icon === iconName;

                return (
                  <button
                    key={iconName}
                    ref={(el) => { iconRefs.current[index] = el; }}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={iconData.label}
                    onClick={() => setIcon(iconName)}
                    onKeyDown={(e) => handleIconKeyDown(e, index)}
                    tabIndex={isSelected ? 0 : -1}
                    className={`
                      p-2 rounded-lg border transition-colors
                      focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-1 focus:ring-offset-primary-900
                      ${isSelected
                        ? 'bg-accent-700/30 border-accent-600/50 text-accent-400'
                        : 'bg-primary-800 border-primary-700/30 text-neutral-400 hover:text-white hover:border-primary-600'
                      }
                    `}
                  >
                    <IconComponent className="w-5 h-5" aria-hidden="true" />
                    {isSelected && (
                      <span className="sr-only">(selected)</span>
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Prompt */}
          <div>
            <label
              htmlFor={promptId}
              className="block text-sm font-medium text-neutral-300 mb-1.5"
            >
              Prompt <span className="text-red-400" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </label>
            <textarea
              id={promptId}
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (errors.prompt) setErrors((prev) => ({ ...prev, prompt: undefined }));
              }}
              placeholder="The AI prompt that will be used when this plugin is triggered. The selected text will be appended to this prompt."
              rows={6}
              className={`
                w-full px-4 py-3 rounded-xl bg-primary-800 border text-white placeholder-neutral-500
                outline-none transition-colors resize-none
                focus:ring-2 focus:ring-accent-500 focus:ring-offset-1 focus:ring-offset-primary-900
                ${errors.prompt
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-primary-700/30 focus:border-accent-600/50'
                }
              `}
              aria-required="true"
              aria-invalid={!!errors.prompt}
              aria-describedby={`${promptHintId} ${errors.prompt ? promptErrorId : ''}`}
            />
            {errors.prompt ? (
              <p id={promptErrorId} className="mt-1.5 text-sm text-red-400 flex items-center gap-1" role="alert">
                <FiAlertCircle className="w-4 h-4" aria-hidden="true" />
                {errors.prompt}
              </p>
            ) : (
              <p id={promptHintId} className="mt-1 text-xs text-neutral-500">
                The selected text in the editor will be sent along with this prompt to the AI.
              </p>
            )}
          </div>

          {/* Keywords */}
          <div>
            <label
              htmlFor={keywordsId}
              className="block text-sm font-medium text-neutral-300 mb-1.5"
            >
              Keywords
              <span className="sr-only">(optional, comma-separated)</span>
            </label>
            <input
              id={keywordsId}
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="sensory, describe, vivid (comma-separated)"
              className="w-full px-4 py-2 rounded-xl bg-primary-800 border border-primary-700/30 text-white placeholder-neutral-500 outline-none focus:border-accent-600/50 focus:ring-2 focus:ring-accent-500 focus:ring-offset-1 focus:ring-offset-primary-900 transition-colors"
              aria-describedby={keywordsHintId}
            />
            <p id={keywordsHintId} className="mt-1 text-xs text-neutral-500">
              Keywords help users find this plugin in the slash command menu.
            </p>
          </div>

          {/* Enabled toggle */}
          <div className="flex items-center justify-between py-2">
            <div id={enabledId}>
              <p className="text-sm font-medium text-neutral-300">Enabled</p>
              <p className="text-xs text-neutral-500">Show this plugin in the command menu</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              aria-labelledby={enabledId}
              onClick={() => setEnabled(!enabled)}
              className={`
                p-2 rounded-lg transition-colors
                focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-1 focus:ring-offset-primary-900
                ${enabled ? 'text-accent-400' : 'text-neutral-500'}
              `}
            >
              {enabled ? (
                <FiToggleRight className="w-8 h-8" aria-hidden="true" />
              ) : (
                <FiToggleLeft className="w-8 h-8" aria-hidden="true" />
              )}
              <span className="sr-only">{enabled ? 'Enabled' : 'Disabled'}</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-primary-700/30">
            <Button
              variant="ghost"
              onClick={onCancel}
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {plugin ? 'Update Plugin' : 'Create Plugin'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PluginManager() {
  const { plugins, addPlugin, updatePlugin, deletePlugin, togglePlugin, importPlugins, exportPlugins, loadSamplePlugins } = usePlugins();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPlugin, setEditingPlugin] = useState<UserPlugin | undefined>(undefined);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Ref for focus return after modal closes
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const editButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const lastFocusedPluginId = useRef<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Clear status message after delay
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const handleCreate = () => {
    setEditingPlugin(undefined);
    setIsEditorOpen(true);
  };

  const handleEdit = (plugin: UserPlugin) => {
    lastFocusedPluginId.current = plugin.id;
    setEditingPlugin(plugin);
    setIsEditorOpen(true);
  };

  const handleSave = (pluginData: Omit<UserPlugin, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingPlugin) {
      updatePlugin(editingPlugin.id, pluginData);
      setStatusMessage({ type: 'success', text: `Plugin "${pluginData.name}" updated successfully` });
    } else {
      addPlugin(pluginData);
      setStatusMessage({ type: 'success', text: `Plugin "${pluginData.name}" created successfully` });
    }
    setIsEditorOpen(false);
    setEditingPlugin(undefined);

    // Return focus
    setTimeout(() => {
      if (lastFocusedPluginId.current) {
        editButtonRefs.current.get(lastFocusedPluginId.current)?.focus();
        lastFocusedPluginId.current = null;
      } else {
        createButtonRef.current?.focus();
      }
    }, 100);
  };

  const handleCancel = useCallback(() => {
    setIsEditorOpen(false);
    setEditingPlugin(undefined);

    // Return focus
    setTimeout(() => {
      if (lastFocusedPluginId.current) {
        editButtonRefs.current.get(lastFocusedPluginId.current)?.focus();
        lastFocusedPluginId.current = null;
      } else {
        createButtonRef.current?.focus();
      }
    }, 100);
  }, []);

  const handleDelete = (plugin: UserPlugin) => {
    // Use a more accessible confirmation dialog pattern
    const confirmed = window.confirm(
      `Are you sure you want to delete the plugin "${plugin.name}"? This action cannot be undone.`
    );
    if (confirmed) {
      deletePlugin(plugin.id);
      setStatusMessage({ type: 'success', text: `Plugin "${plugin.name}" deleted` });
    }
  };

  const handleExport = () => {
    const data = exportPlugins();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `narrativenest-plugins-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage({ type: 'success', text: `${data.length} plugin(s) exported` });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string) as UserPlugin[];
        if (!Array.isArray(data)) {
          throw new Error('Invalid format');
        }
        importPlugins(data);
        setStatusMessage({ type: 'success', text: `${data.length} plugin(s) imported successfully` });
      } catch (error) {
        console.error('Failed to import plugins:', error);
        setStatusMessage({ type: 'error', text: 'Failed to import plugins. Please check the file format.' });
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleLoadSamples = () => {
    loadSamplePlugins();
    setStatusMessage({ type: 'success', text: 'Sample plugins loaded' });
  };

  const getIcon = (iconName: string) => {
    const iconData = ICON_MAP[iconName] || ICON_MAP.FiStar;
    const IconComponent = iconData.component;
    return <IconComponent className="w-5 h-5" aria-hidden="true" />;
  };

  return (
    <div className="space-y-6">
      {/* Status message - live region for screen readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {statusMessage?.text}
      </div>

      {/* Visible status message */}
      {statusMessage && (
        <div
          className={`
            flex items-center gap-2 px-4 py-3 rounded-xl text-sm
            ${statusMessage.type === 'success'
              ? 'bg-green-500/10 text-green-400 border border-green-500/30'
              : 'bg-red-500/10 text-red-400 border border-red-500/30'
            }
          `}
          role="alert"
        >
          {statusMessage.type === 'success' ? (
            <FiCheck className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          ) : (
            <FiAlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          )}
          {statusMessage.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white" id="plugins-heading">
            Custom Plugins
          </h3>
          <p className="text-sm text-neutral-400" id="plugins-description">
            Create custom AI actions that appear in the slash command menu
          </p>
        </div>
        <Button
          ref={createButtonRef}
          variant="primary"
          onClick={handleCreate}
          aria-describedby="plugins-description"
        >
          <FiPlus className="mr-2" aria-hidden="true" />
          Create Plugin
        </Button>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3" role="toolbar" aria-label="Plugin actions">
        <button
          onClick={handleLoadSamples}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-neutral-400 hover:text-white hover:bg-primary-800 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-1 focus:ring-offset-primary-900"
        >
          <FiPackage className="w-4 h-4" aria-hidden="true" />
          Load Sample Plugins
        </button>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-neutral-400 hover:text-white hover:bg-primary-800 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-1 focus:ring-offset-primary-900"
          aria-label="Export plugins to JSON file"
        >
          <FiDownload className="w-4 h-4" aria-hidden="true" />
          Export
        </button>
        <label className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-neutral-400 hover:text-white hover:bg-primary-800 transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-accent-500 focus-within:ring-offset-1 focus-within:ring-offset-primary-900">
          <FiUpload className="w-4 h-4" aria-hidden="true" />
          <span>Import</span>
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="sr-only"
            aria-label="Import plugins from JSON file"
          />
        </label>
      </div>

      {/* Plugin list */}
      {plugins.length === 0 ? (
        <div
          className="text-center py-12 border border-dashed border-primary-700/30 rounded-2xl"
          role="region"
          aria-label="No plugins"
        >
          <FiPackage className="w-12 h-12 mx-auto text-neutral-600 mb-4" aria-hidden="true" />
          <h4 className="text-lg font-medium text-neutral-300 mb-2">No plugins yet</h4>
          <p className="text-sm text-neutral-500 mb-4">
            Create your first custom plugin or load the sample plugins to get started.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="ghost" onClick={handleLoadSamples}>
              Load Samples
            </Button>
            <Button variant="primary" onClick={handleCreate}>
              Create Plugin
            </Button>
          </div>
        </div>
      ) : (
        <ul
          className="space-y-3"
          role="list"
          aria-label={`${plugins.length} custom plugin${plugins.length === 1 ? '' : 's'}`}
        >
          {plugins.map((plugin) => (
            <li
              key={plugin.id}
              className={`
                flex items-center gap-4 p-4 rounded-xl border transition-colors
                ${plugin.enabled
                  ? 'bg-primary-800/50 border-primary-700/30'
                  : 'bg-primary-900/50 border-primary-700/20'
                }
              `}
              aria-label={`${plugin.name}${plugin.enabled ? '' : ' (disabled)'}`}
            >
              {/* Icon */}
              <div
                className={`
                  p-3 rounded-xl
                  ${plugin.enabled ? 'bg-accent-700/20 text-accent-400' : 'bg-primary-800 text-neutral-500'}
                `}
                aria-hidden="true"
              >
                {getIcon(plugin.icon)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium truncate ${plugin.enabled ? 'text-white' : 'text-neutral-400'}`}>
                  {plugin.name}
                  {!plugin.enabled && <span className="sr-only"> (disabled)</span>}
                </h4>
                {plugin.description && (
                  <p className={`text-sm truncate ${plugin.enabled ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    {plugin.description}
                  </p>
                )}
                {plugin.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5" aria-label="Keywords">
                    {plugin.keywords.slice(0, 5).map((keyword) => (
                      <span
                        key={keyword}
                        className="px-2 py-0.5 rounded-full text-xs bg-primary-700/50 text-neutral-400"
                      >
                        {keyword}
                      </span>
                    ))}
                    {plugin.keywords.length > 5 && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-primary-700/50 text-neutral-400">
                        +{plugin.keywords.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1" role="group" aria-label={`Actions for ${plugin.name}`}>
                <button
                  onClick={() => togglePlugin(plugin.id)}
                  className={`
                    p-2 rounded-lg transition-colors
                    focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-1 focus:ring-offset-primary-900
                    ${plugin.enabled
                      ? 'text-accent-400 hover:bg-accent-700/20'
                      : 'text-neutral-500 hover:bg-primary-700'
                    }
                  `}
                  role="switch"
                  aria-checked={plugin.enabled}
                  aria-label={`${plugin.enabled ? 'Disable' : 'Enable'} ${plugin.name}`}
                >
                  {plugin.enabled ? (
                    <FiToggleRight className="w-6 h-6" aria-hidden="true" />
                  ) : (
                    <FiToggleLeft className="w-6 h-6" aria-hidden="true" />
                  )}
                </button>
                <button
                  ref={(el) => {
                    if (el) editButtonRefs.current.set(plugin.id, el);
                    else editButtonRefs.current.delete(plugin.id);
                  }}
                  onClick={() => handleEdit(plugin)}
                  className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-1 focus:ring-offset-primary-900"
                  aria-label={`Edit ${plugin.name}`}
                >
                  <FiEdit2 className="w-5 h-5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => handleDelete(plugin)}
                  className="p-2 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 focus:ring-offset-primary-900"
                  aria-label={`Delete ${plugin.name}`}
                >
                  <FiTrash2 className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Editor modal */}
      {isEditorOpen && (
        <PluginEditor
          plugin={editingPlugin}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
