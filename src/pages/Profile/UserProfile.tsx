import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Mail, Phone, User, Shield } from 'lucide-react';

interface UserRecord {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone1?: string | null;
  phone2?: string | null;
  company_id?: string | null;
}

const UserProfile: React.FC = () => {
  const raw = typeof window !== 'undefined' ? localStorage.getItem('authUser') : null;
  const auth = raw ? JSON.parse(raw) : null;
  const authHeader = auth?.token ? { Authorization: `Bearer ${auth.token}` } : ({} as any);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserRecord | null>(null);
  const [form, setForm] = useState({ firstname: '', lastname: '', email: '', phone1: '', phone2: '' });

  const initials = useMemo(() => {
    const f = (user?.firstname || '').charAt(0).toUpperCase();
    const l = (user?.lastname || '').charAt(0).toUpperCase();
    return (f + l) || 'U';
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        if (!auth?.id) {
          setLoading(false);
          return;
        }
        const res = await fetch(`http://localhost:5000/users/${auth.id}`, { headers: { 'Content-Type': 'application/json', ...authHeader } });
        if (res.ok) {
          const data = await res.json();
          const rec: UserRecord = data;
          setUser(rec);
          setForm({
            firstname: rec.firstname || '',
            lastname: rec.lastname || '',
            email: rec.email || '',
            phone1: rec.phone1 || '',
            phone2: rec.phone2 || '',
          });
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.id]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({
          firstname: form.firstname.trim(),
          lastname: form.lastname.trim(),
          email: form.email.trim(),
          phone1: form.phone1 || null,
          phone2: form.phone2 || null,
        }),
      });
      if (res.ok) {
        toast.success('Profile updated');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to update profile');
      }
    } catch (e) {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwd, setPwd] = useState({ newPassword: '', confirm: '' });
  const [pwdSaving, setPwdSaving] = useState(false);

  const savePassword = async () => {
    if (!user) return;
    if (!pwd.newPassword || pwd.newPassword.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }
    if (pwd.newPassword !== pwd.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setPwdSaving(true);
    try {
      const res = await fetch(`http://localhost:5000/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ password: pwd.newPassword }),
      });
      if (res.ok) {
        toast.success('Password updated');
        setPwdOpen(false);
        setPwd({ newPassword: '', confirm: '' });
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to update password');
      }
    } catch (e) {
      toast.error('Network error');
    } finally {
      setPwdSaving(false);
    }
  };

  if (!auth?.id) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-600">Please log in.</div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">Loading...</div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="relative rounded-xl overflow-hidden">
        <div className="h-32 w-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />
        <div className="absolute -bottom-10 left-6">
          <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
            <AvatarImage src="" alt={initials} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <Card className="mt-12">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">My Profile</CardTitle>
            <p className="text-sm text-muted-foreground">Update your personal information</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={pwdOpen} onOpenChange={setPwdOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><Shield className="h-4 w-4 mr-2" />Change password</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change password</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label>New password</Label>
                    <Input type="password" value={pwd.newPassword} onChange={(e) => setPwd(p => ({ ...p, newPassword: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm password</Label>
                    <Input type="password" value={pwd.confirm} onChange={(e) => setPwd(p => ({ ...p, confirm: e.target.value }))} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPwdOpen(false)}>Cancel</Button>
                  <Button onClick={savePassword} disabled={pwdSaving}>{pwdSaving ? 'Saving...' : 'Save'}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>First name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input className="pl-9" value={form.firstname} onChange={(e) => setForm({ ...form, firstname: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Last name</Label>
                <Input value={form.lastname} onChange={(e) => setForm({ ...form, lastname: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input className="pl-9" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input className="pl-9" value={form.phone1} onChange={(e) => setForm({ ...form, phone1: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone (secondary)</Label>
                <Input value={form.phone2} onChange={(e) => setForm({ ...form, phone2: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input value={user?.company_id || ''} disabled />
              </div>
            </div>
          </div>
          <Separator className="my-6" />
          <div className="text-xs text-muted-foreground">Your email may be used for login and notifications.</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile; 