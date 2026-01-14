'use client'

import { Setting, DefaultSetting } from '@/types/data';
import { useEffect, useContext, useState } from 'react';
import { FiSettings, FiPackage, FiPlay, FiRefreshCw } from 'react-icons/fi';
import PluginManager from '@/components/settings/PluginManager';
import { PluginProvider } from '@/context/PluginContext';

type TabType = 'general' | 'plugins';

interface SettingsProps {
  setIsOpen: (isOpen: boolean) => void;
  setting: Setting;
  setSetting: React.Dispatch<React.SetStateAction<Setting>>;
}

export default function Settings({ setIsOpen, setting, setSetting }: SettingsProps) {
    const [models, setModels] = useState<string[] | null>();
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('general');

    useEffect(() => {
        changeAvailableModels()
    }, [])

    async function changeAvailableModels() {
        const response = await fetch("/api/models", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ key: setting.apiKey })
        })

        if (!response.ok) {
            setError("Invalid API Key")
            setModels(null)
            return;
        } else {
            setError(null)
        }
        setModels(await response.json())
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setSetting((setting) => ({
            ...setting,
            [e.target.name]: e.target.value
        }))
    }

    const onSave = (e: React.MouseEvent) => {
        localStorage.setItem("settings", JSON.stringify(setting))
        console.log("Saved Settings")
        setIsOpen(false)
    };

    const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
        { id: 'general', label: 'General', icon: <FiSettings className="w-4 h-4" /> },
        { id: 'plugins', label: 'Plugins', icon: <FiPackage className="w-4 h-4" /> },
    ];

    return (
        <div className="min-h-[400px]">
            {/* Tabs */}
            <div className="flex gap-1 mb-6 p-1 bg-primary-800/50 rounded-xl">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                            ${activeTab === tab.id
                                ? 'bg-accent-700/30 text-white'
                                : 'text-neutral-400 hover:text-white hover:bg-primary-700/50'
                            }
                        `}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {activeTab === 'general' && (
                <div>
                    <div className="flex flex-col">
                        <label htmlFor="apiKey" className="text-left text-neutral-300 text-sm font-medium mb-1.5">OpenAI API Key</label>
                        <input
                            id="apiKey"
                            name="apiKey"
                            className="w-full px-4 py-2 rounded-xl bg-primary-800 border border-primary-700/30 text-white placeholder-neutral-500 outline-none focus:border-accent-600/50 transition-colors"
                            type='password'
                            value={setting.apiKey}
                            onChange={handleChange}
                            onBlur={changeAvailableModels}
                            placeholder='Leave empty to use environment variable'
                        />
                        <span className='text-xs text-neutral-500 mt-1'>
                            If you don&apos;t have one, you can create it at <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noreferrer" className="text-accent-400 hover:text-accent-300">openai.com</a>
                        </span>
                    </div>

                    {error && <div className='text-red-400 py-4 text-sm'>{error}</div>}

                    {models && (
                        <div className="flex flex-col mt-4">
                            <label htmlFor="modelId" className="text-neutral-300 text-sm font-medium mb-1.5">Model</label>
                            <div className="w-full rounded-xl border border-primary-700/30 bg-primary-800 text-white">
                                <select
                                    id="modelId"
                                    name="modelId"
                                    className="w-full bg-transparent p-2 outline-none"
                                    placeholder="Select a model"
                                    value={setting.modelId}
                                    onChange={handleChange}
                                >
                                    {models.map((m) => (<option key={m} value={m}>{m}</option>))}
                                </select>
                            </div>
                            <div className="mt-2 text-left text-xs">
                                <a href="https://platform.openai.com/account/usage" target="_blank" className="text-accent-400 hover:text-accent-300">View Account Usage</a>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col mt-6">
                        <label htmlFor="temperature" className="text-neutral-300 text-sm font-medium mb-1.5">Temperature</label>
                        <span className="text-xs text-neutral-500 mb-3">
                            Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.
                        </span>
                        <span className="text-center text-white font-medium mb-2">{setting.temperature}</span>
                        <input
                            id="temperature"
                            name="temperature"
                            className="cursor-pointer accent-accent-600"
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={setting.temperature}
                            onChange={handleChange}
                        />
                        <ul className="flex justify-between mt-2 text-xs text-neutral-500">
                            <li>Precise</li>
                            <li>Neutral</li>
                            <li>Creative</li>
                        </ul>
                    </div>

                    <button
                        onClick={onSave}
                        className="mt-8 w-full inline-flex justify-center rounded-xl bg-accent-600 hover:bg-accent-500 px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={error != null}
                    >
                        Save Settings
                    </button>

                    {/* Onboarding section */}
                    <div className="mt-8 pt-6 border-t border-primary-700/30">
                        <h4 className="text-sm font-medium text-neutral-300 mb-3">Onboarding</h4>
                        <button
                            onClick={() => {
                                localStorage.removeItem('narrativenest-onboarding');
                                setIsOpen(false);
                                window.location.reload();
                            }}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-800 hover:bg-primary-700 text-neutral-300 hover:text-white text-sm transition-colors"
                        >
                            <FiRefreshCw className="w-4 h-4" />
                            Restart Welcome Tour
                        </button>
                        <p className="text-xs text-neutral-500 mt-2 text-center">
                            This will show the welcome modal and tour again on next page load.
                        </p>
                    </div>
                </div>
            )}

            {activeTab === 'plugins' && (
                <PluginProvider>
                    <PluginManager />
                </PluginProvider>
            )}
        </div>
    )
}
