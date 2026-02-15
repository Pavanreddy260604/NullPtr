import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Save, Mail, Server, Shield, Send } from 'lucide-react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

const SMTPConfig: React.FC = () => {
    const [config, setConfig] = useState({
        host: '',
        port: 587,
        user: '',
        pass: '',
        secure: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [isTesting, setIsTesting] = useState(false);

    // Fetch config on mount
    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const secret = import.meta.env.VITE_SECOND_SPACE_SECRET || 'nullptr_secret_123';
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/smtp`, {
                headers: { 'x-second-space-secret': secret }
            });
            if (res.data) {
                setConfig(prev => ({ ...prev, ...res.data }));
            }
        } catch (error) {
            console.error('Failed to fetch SMTP config', error);
            // Don't toast on 404/empty, just let user fill it
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (checked: boolean) => {
        setConfig(prev => ({ ...prev, secure: checked }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const secret = import.meta.env.VITE_SECOND_SPACE_SECRET || 'nullptr_secret_123';
            await axios.post(`${import.meta.env.VITE_API_URL}/admin/smtp`, config, {
                headers: { 'x-second-space-secret': secret }
            });
            toast.success('SMTP Configuration saved successfully');
        } catch (error) {
            toast.error('Failed to save configuration');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendTest = async () => {
        if (!testEmail) return toast.error('Please enter an email address');
        setIsTesting(true);
        try {
            const secret = import.meta.env.VITE_SECOND_SPACE_SECRET || 'nullptr_secret_123';
            await axios.post(`${import.meta.env.VITE_API_URL}/admin/test-email`, { email: testEmail }, {
                headers: { 'x-second-space-secret': secret }
            });
            toast.success(`Test email sent to ${testEmail}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send test email');
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto p-6">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Mail className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Email Settings</h1>
                    <p className="text-muted-foreground">Configure SMTP for system emails (OTP, Resets)</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Server className="h-5 w-5" />
                                SMTP Configuration
                            </CardTitle>
                            <CardDescription>
                                Details from your email provider (e.g., Gmail, SendGrid, AWS SES)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="host">SMTP Host</Label>
                                    <Input
                                        id="host"
                                        name="host"
                                        placeholder="smtp.gmail.com"
                                        value={config.host}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="port">Port</Label>
                                        <Input
                                            id="port"
                                            name="port"
                                            placeholder="587"
                                            value={config.port}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="secure" className="mb-2 block">Secure (SSL/TLS)</Label>
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="secure"
                                                checked={config.secure}
                                                onCheckedChange={handleSwitchChange}
                                            />
                                            <Label htmlFor="secure" className="font-normal text-muted-foreground">
                                                {config.secure ? 'Enabled (Port 465)' : 'Disabled (Port 587)'}
                                            </Label>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="user">Username / Email</Label>
                                    <Input
                                        id="user"
                                        name="user"
                                        placeholder="admin@example.com"
                                        value={config.user}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="pass">Password / App Key</Label>
                                    <Input
                                        id="pass"
                                        name="pass"
                                        type="password"
                                        placeholder="••••••••••••"
                                        value={config.pass}
                                        onChange={handleChange}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Leave blank to keep existing password unchanged.
                                    </p>
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? 'Saving...' : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" /> Save Configuration
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="space-y-6"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Test Connection
                            </CardTitle>
                            <CardDescription>
                                Send a test email to verify your settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="test-email">Recipient Email</Label>
                                <Input
                                    id="test-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={testEmail}
                                    onChange={(e) => setTestEmail(e.target.value)}
                                />
                            </div>
                            <Button
                                variant="secondary"
                                className="w-full"
                                onClick={handleSendTest}
                                disabled={isTesting || !testEmail}
                            >
                                {isTesting ? 'Sending...' : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" /> Send Test Email
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-muted/50 border-dashed">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Configuration Tips</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            <p>• For <strong>Gmail</strong>: You MUST use an <strong>App Password</strong> if 2-Step Verification is on. <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Learn how</a>.</p>
                            <p>• For <strong>AWS SES</strong>: Ensure your account is out of sandbox mode.</p>
                            <p>• Port <strong>587</strong> is standard for STARTTLS.</p>
                            <p>• Port <strong>465</strong> is used for SSL.</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default SMTPConfig;
