'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPageBuilder() {
  const router = useRouter();
  const [config, setConfig] = useState({
    // Header Section
    header: {
      logo: null,
      logoUrl: '',
      universityName: '',
      tagline: '',
      backgroundColor: '#ffffff',
      textColor: '#000000'
    },
    
    // Hero Section
    hero: {
      title: 'Verify Your Certificate',
      subtitle: 'Enter your credentials to access and verify your certificate',
      backgroundImage: null,
      backgroundImageUrl: '',
      backgroundColor: '#f8f9fa',
      textColor: '#212529',
      buttonColor: '#007bff',
      buttonText: 'Verify Now'
    },
    
    // Features Section
    features: {
      enabled: true,
      title: 'Why Verify With Us?',
      items: [
        { icon: '🔒', title: 'Secure', description: 'Blockchain-backed verification' },
        { icon: '⚡', title: 'Instant', description: 'Get results in seconds' },
        { icon: '📱', title: 'Mobile', description: 'Access from anywhere' },
        { icon: '🌐', title: 'Public', description: 'Shareable verification' }
      ],
      backgroundColor: '#ffffff',
      textColor: '#000000'
    },
    
    // Verification Form Section
    verification: {
      title: 'Enter Your Details',
      subtitle: 'Use your Roll Number or Registration Number',
      fields: [
        { 
          id: 'rollNo',
          label: 'Roll Number',
          type: 'text',
          placeholder: 'Enter your roll number',
          required: true,
          enabled: true
        },
        { 
          id: 'regNo',
          label: 'Registration Number',
          type: 'text',
          placeholder: 'Enter your registration number',
          required: false,
          enabled: true
        },
        { 
          id: 'dob',
          label: 'Date of Birth',
          type: 'date',
          placeholder: 'Select your date of birth',
          required: false,
          enabled: false
        }
      ],
      backgroundColor: '#f8f9fa',
      formBackgroundColor: '#ffffff',
      textColor: '#212529',
      buttonColor: '#28a745',
      buttonText: 'Verify Certificate'
    },
    
    // Statistics Section
    statistics: {
      enabled: true,
      title: 'Our Impact',
      items: [
        { number: '10,000+', label: 'Certificates Issued' },
        { number: '50+', label: 'Programs' },
        { number: '99.9%', label: 'Uptime' },
        { number: '24/7', label: 'Support' }
      ],
      backgroundColor: '#007bff',
      textColor: '#ffffff'
    },
    
    // Instructions Section
    instructions: {
      enabled: true,
      title: 'How to Verify',
      steps: [
        { number: 1, title: 'Enter Details', description: 'Provide your roll number or registration number' },
        { number: 2, title: 'Verify Identity', description: 'Complete any additional verification if required' },
        { number: 3, title: 'View Certificate', description: 'Access your certificate instantly' },
        { number: 4, title: 'Download & Share', description: 'Download PDF or share verification link' }
      ],
      backgroundColor: '#ffffff',
      textColor: '#000000'
    },
    
    // Footer Section
    footer: {
      universityName: '',
      address: '',
      phone: '',
      email: '',
      socialLinks: {
        facebook: '',
        twitter: '',
        linkedin: '',
        instagram: ''
      },
      backgroundColor: '#212529',
      textColor: '#ffffff',
      copyrightText: '© 2025 All rights reserved'
    },
    
    // Advanced Settings
    advanced: {
      customCSS: '',
      customJS: '',
      enableQRScanner: true,
      enableCaptcha: false,
      enableAnalytics: true,
      googleAnalyticsId: '',
      metaTitle: 'Certificate Verification Portal',
      metaDescription: 'Verify your educational certificates securely',
      metaKeywords: 'certificate, verification, education, university'
    }
  });

  const [activeTab, setActiveTab] = useState('header');
  const [previewMode, setPreviewMode] = useState('desktop');
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'header', label: 'Header', icon: '📋' },
    { id: 'hero', label: 'Hero', icon: '🎯' },
    { id: 'features', label: 'Features', icon: '⭐' },
    { id: 'verification', label: 'Verification', icon: '🔍' },
    { id: 'statistics', label: 'Statistics', icon: '📊' },
    { id: 'instructions', label: 'Instructions', icon: '📝' },
    { id: 'footer', label: 'Footer', icon: '🔻' },
    { id: 'advanced', label: 'Advanced', icon: '⚙️' }
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/landing-page/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        alert('Landing page saved successfully!');
      } else {
        alert('Failed to save landing page');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving landing page');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (confirm('Are you sure you want to publish this landing page? It will be live immediately.')) {
      setSaving(true);
      try {
        const response = await fetch('/api/landing-page/publish', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(config)
        });

        if (response.ok) {
          alert('Landing page published successfully!');
        } else {
          alert('Failed to publish landing page');
        }
      } catch (error) {
        console.error('Error publishing:', error);
        alert('Error publishing landing page');
      } finally {
        setSaving(false);
      }
    }
  };

  const updateConfig = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const renderEditor = () => {
    switch (activeTab) {
      case 'header':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Header Configuration</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Logo URL</label>
              <input
                type="text"
                value={config.header.logoUrl}
                onChange={(e) => updateConfig('header', 'logoUrl', e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">University Name</label>
              <input
                type="text"
                value={config.header.universityName}
                onChange={(e) => updateConfig('header', 'universityName', e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="University Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tagline</label>
              <input
                type="text"
                value={config.header.tagline}
                onChange={(e) => updateConfig('header', 'tagline', e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="Excellence in Education"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Background Color</label>
                <input
                  type="color"
                  value={config.header.backgroundColor}
                  onChange={(e) => updateConfig('header', 'backgroundColor', e.target.value)}
                  className="w-full h-10 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Text Color</label>
                <input
                  type="color"
                  value={config.header.textColor}
                  onChange={(e) => updateConfig('header', 'textColor', e.target.value)}
                  className="w-full h-10 rounded"
                />
              </div>
            </div>
          </div>
        );

      case 'hero':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Hero Section</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Main Title</label>
              <input
                type="text"
                value={config.hero.title}
                onChange={(e) => updateConfig('hero', 'title', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <textarea
                value={config.hero.subtitle}
                onChange={(e) => updateConfig('hero', 'subtitle', e.target.value)}
                className="w-full px-3 py-2 border rounded"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Background Image URL</label>
              <input
                type="text"
                value={config.hero.backgroundImageUrl}
                onChange={(e) => updateConfig('hero', 'backgroundImageUrl', e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="https://example.com/hero-bg.jpg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Background Color</label>
                <input
                  type="color"
                  value={config.hero.backgroundColor}
                  onChange={(e) => updateConfig('hero', 'backgroundColor', e.target.value)}
                  className="w-full h-10 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Button Color</label>
                <input
                  type="color"
                  value={config.hero.buttonColor}
                  onChange={(e) => updateConfig('hero', 'buttonColor', e.target.value)}
                  className="w-full h-10 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Button Text</label>
              <input
                type="text"
                value={config.hero.buttonText}
                onChange={(e) => updateConfig('hero', 'buttonText', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
        );

      case 'verification':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Verification Form</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Form Title</label>
              <input
                type="text"
                value={config.verification.title}
                onChange={(e) => updateConfig('verification', 'title', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Form Subtitle</label>
              <input
                type="text"
                value={config.verification.subtitle}
                onChange={(e) => updateConfig('verification', 'subtitle', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Form Fields</h4>
              {config.verification.fields.map((field, index) => (
                <div key={field.id} className="border p-4 rounded mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{field.label}</span>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={field.enabled}
                        onChange={(e) => {
                          const newFields = [...config.verification.fields];
                          newFields[index].enabled = e.target.checked;
                          updateConfig('verification', 'fields', newFields);
                        }}
                        className="mr-2"
                      />
                      Enabled
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <label className="block text-xs mb-1">Label</label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => {
                          const newFields = [...config.verification.fields];
                          newFields[index].label = e.target.value;
                          updateConfig('verification', 'fields', newFields);
                        }}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Placeholder</label>
                      <input
                        type="text"
                        value={field.placeholder}
                        onChange={(e) => {
                          const newFields = [...config.verification.fields];
                          newFields[index].placeholder = e.target.value;
                          updateConfig('verification', 'fields', newFields);
                        }}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Button Color</label>
                <input
                  type="color"
                  value={config.verification.buttonColor}
                  onChange={(e) => updateConfig('verification', 'buttonColor', e.target.value)}
                  className="w-full h-10 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Button Text</label>
                <input
                  type="text"
                  value={config.verification.buttonText}
                  onChange={(e) => updateConfig('verification', 'buttonText', e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
          </div>
        );

      case 'advanced':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Advanced Settings</h3>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.advanced.enableQRScanner}
                  onChange={(e) => updateConfig('advanced', 'enableQRScanner', e.target.checked)}
                  className="mr-2"
                />
                Enable QR Code Scanner
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.advanced.enableCaptcha}
                  onChange={(e) => updateConfig('advanced', 'enableCaptcha', e.target.checked)}
                  className="mr-2"
                />
                Enable CAPTCHA
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.advanced.enableAnalytics}
                  onChange={(e) => updateConfig('advanced', 'enableAnalytics', e.target.checked)}
                  className="mr-2"
                />
                Enable Analytics
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Meta Title</label>
              <input
                type="text"
                value={config.advanced.metaTitle}
                onChange={(e) => updateConfig('advanced', 'metaTitle', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Meta Description</label>
              <textarea
                value={config.advanced.metaDescription}
                onChange={(e) => updateConfig('advanced', 'metaDescription', e.target.value)}
                className="w-full px-3 py-2 border rounded"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Custom CSS</label>
              <textarea
                value={config.advanced.customCSS}
                onChange={(e) => updateConfig('advanced', 'customCSS', e.target.value)}
                className="w-full px-3 py-2 border rounded font-mono text-sm"
                rows={6}
                placeholder="/* Add custom CSS here */"
              />
            </div>
          </div>
        );

      default:
        return <div>Select a tab to edit</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Editor */}
      <div className="w-80 bg-white border-r overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Landing Page Builder</h2>
          <p className="text-sm text-gray-600">Customize your verification portal</p>
        </div>

        <div className="flex flex-col">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-3 text-left border-b transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-l-blue-600'
                  : 'hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl mr-3">{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 text-white py-2 rounded mb-2 hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : '💾 Save Draft'}
          </button>
          <button
            onClick={handlePublish}
            disabled={saving}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Publishing...' : '🚀 Publish Live'}
          </button>
        </div>
      </div>

      {/* Middle - Configuration Panel */}
      <div className="w-96 bg-white border-r overflow-y-auto">
        <div className="p-6">
          {renderEditor()}
        </div>
      </div>

      {/* Right - Live Preview */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-4 bg-white border-b flex items-center justify-between">
          <h3 className="font-semibold">Live Preview</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`px-3 py-1 rounded ${previewMode === 'desktop' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              🖥️ Desktop
            </button>
            <button
              onClick={() => setPreviewMode('tablet')}
              className={`px-3 py-1 rounded ${previewMode === 'tablet' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              📱 Tablet
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`px-3 py-1 rounded ${previewMode === 'mobile' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              📱 Mobile
            </button>
          </div>
        </div>

        <div className="p-8 flex justify-center">
          <div 
            className={`bg-white shadow-2xl transition-all ${
              previewMode === 'desktop' ? 'w-full max-w-6xl' :
              previewMode === 'tablet' ? 'w-[768px]' :
              'w-[375px]'
            }`}
            style={{ minHeight: '600px' }}
          >
            {/* Preview Content */}
            <div>
              {/* Header */}
              <div 
                style={{
                  backgroundColor: config.header.backgroundColor,
                  color: config.header.textColor
                }}
                className="p-6 flex items-center justify-between"
              >
                <div className="flex items-center">
                  {config.header.logoUrl && (
                    <img src={config.header.logoUrl} alt="Logo" className="h-12 mr-4" />
                  )}
                  <div>
                    <h1 className="text-2xl font-bold">{config.header.universityName || 'University Name'}</h1>
                    <p className="text-sm opacity-80">{config.header.tagline || 'Tagline'}</p>
                  </div>
                </div>
              </div>

              {/* Hero */}
              <div 
                style={{
                  backgroundColor: config.hero.backgroundColor,
                  backgroundImage: config.hero.backgroundImageUrl ? `url(${config.hero.backgroundImageUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  color: config.hero.textColor
                }}
                className="p-12 text-center"
              >
                <h2 className="text-4xl font-bold mb-4">{config.hero.title}</h2>
                <p className="text-lg mb-6 opacity-90">{config.hero.subtitle}</p>
                <button 
                  style={{ backgroundColor: config.hero.buttonColor }}
                  className="px-8 py-3 rounded-lg text-white font-semibold"
                >
                  {config.hero.buttonText}
                </button>
              </div>

              {/* Verification Form */}
              <div 
                style={{ backgroundColor: config.verification.backgroundColor }}
                className="p-12"
              >
                <div 
                  style={{ backgroundColor: config.verification.formBackgroundColor }}
                  className="max-w-md mx-auto p-8 rounded-lg shadow-lg"
                >
                  <h3 className="text-2xl font-bold mb-2">{config.verification.title}</h3>
                  <p className="text-gray-600 mb-6">{config.verification.subtitle}</p>
                  
                  {config.verification.fields.filter(f => f.enabled).map(field => (
                    <div key={field.id} className="mb-4">
                      <label className="block text-sm font-medium mb-2">{field.label}</label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-2 border rounded"
                      />
                    </div>
                  ))}
                  
                  <button 
                    style={{ backgroundColor: config.verification.buttonColor }}
                    className="w-full py-3 rounded-lg text-white font-semibold mt-4"
                  >
                    {config.verification.buttonText}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
