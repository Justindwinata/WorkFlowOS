'use client';

import { useState } from 'react';
import { User, Bell, Palette, Shield, Save } from 'lucide-react';
import { StatusBadge } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifikasi', icon: Bell },
    { id: 'appearance', label: 'Tampilan', icon: Palette },
    { id: 'security', label: 'Keamanan', icon: Shield },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Pengaturan</h1>
      <div className="flex gap-4 p-4 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {activeTab === 'profile' && <ProfileTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'appearance' && <AppearanceTab />}
        {activeTab === 'security' && <SecurityTab />}
      </div>
    </div>
  );
}

function ProfileTab() {
  return (
    <Card>
      <CardHeader><CardTitle>Profil Pengguna</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-2xl font-medium">
            AU
          </div>
          <div>
            <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Ubah Avatar</button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Nama Depan</label>
            <input className="mt-1 w-full rounded-md border px-3 py-2" defaultValue="Admin" />
          </div>
          <div>
            <label className="block text-sm font-medium">Nama Belakang</label>
            <input className="mt-1 w-full rounded-md border px-3 py-2" defaultValue="User" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium">Email</label>
            <input className="mt-1 w-full rounded-md border px-3 py-2" defaultValue="admin@workflowos.id" type="email" />
          </div>
        </div>
        <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Simpan Perubahan</button>
      </CardContent>
    </Card>
  );
}

function NotificationsTab() {
  const notificationTypes = [
    { id: 'email', label: 'Email Notifications', enabled: true },
    { id: 'push', label: 'Push Notifications', enabled: true },
    { id: 'sms', label: 'SMS Alerts', enabled: false },
    { id: 'daily_digest', label: 'Daily Digest', enabled: true },
  ];

  return (
    <Card>
      <CardHeader><CardTitle>Preferensi Notifikasi</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {notificationTypes.map((n) => (
          <div key={n.id} className="flex items-center justify-between">
            <label className="text-sm">{n.label}</label>
            <input
              type="checkbox"
              defaultChecked={n.enabled}
              className="h-4 w-4 rounded border-gray-300"
            />
          </div>
        ))}
        <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Simpan</button>
      </CardContent>
    </Card>
  );
}

function AppearanceTab() {
  return (
    <Card>
      <CardHeader><CardTitle>Tampilan</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Tema</label>
          <select className="mt-1 w-full max-w-xs rounded-md border px-3 py-2">
            <option>Sistem</option>
            <option>Terang</option>
            <option>Gelap</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Bahasa</label>
          <select className="mt-1 w-full max-w-xs rounded-md border px-3 py-2">
            <option>Indonesia</option>
            <option>English</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );
}

function SecurityTab() {
  return (
    <Card>
      <CardHeader><CardTitle>Keamanan</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Ubah Password</p>
          <input type="password" placeholder="Password saat ini" className="w-full rounded-md border px-3 py-2" />
          <input type="password" placeholder="Password baru" className="w-full rounded-md border px-3 py-2" />
          <input type="password" placeholder="Konfirmasi password baru" className="w-full rounded-md border px-3 py-2" />
          <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Ubah Password</button>
        </div>
        <div className="border-t pt-4 space-y-2">
          <p className="text-sm font-medium">Two-Factor Authentication</p>
          <p className="text-sm text-muted-foreground">Aktifkan 2FA untuk keamanan tambahan</p>
          <button className="rounded-md border px-4 py-2 text-sm">Aktifkan 2FA</button>
        </div>
      </CardContent>
    </Card>
  );
}