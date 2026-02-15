import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import { resendVerificationOtp } from "@/lib/auth";

export default function OTPVerification() {
    const [otp, setOtp] = useState("");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();
    const { verifyEmail } = useAuth();

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        }
    }, [location.state]);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return toast.error("Please enter your email");
        if (otp.length !== 6) return toast.error("Please enter a 6-digit code");

        setIsLoading(true);
        try {
            await verifyEmail(email, otp);
            toast.success("Email verified successfully!");
            navigate("/");
        } catch (error: any) {
            toast.error(error.message || "Verification failed");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!email || isResending || cooldown > 0) return;
        setIsResending(true);
        try {
            await resendVerificationOtp(email);
            toast.success("Verification code resent!");
            setCooldown(30);
        } catch (error: any) {
            toast.error(error.message || "Failed to resend code");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>Verify Your Email</CardTitle>
                    <CardDescription>
                        {email ? (
                            <>We sent a 6-digit code to <strong>{email}</strong></>
                        ) : (
                            "Enter your email and the code sent to it."
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!location.state?.email && (
                            <div className="space-y-2">
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Input
                                type="text"
                                placeholder="Enter 6-digit code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                className="text-center text-2xl tracking-widest"
                                maxLength={6}
                                autoFocus={!!location.state?.email}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6 || !email}>
                            {isLoading ? <Loader2 className="animate-spin mr-2" /> : "Verify Email"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={handleResendOtp}
                            disabled={isResending || cooldown > 0 || !email}
                        >
                            {isResending
                                ? <><Loader2 className="animate-spin mr-2" />Resending...</>
                                : cooldown > 0
                                    ? `Resend OTP in ${cooldown}s`
                                    : "Resend OTP"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
