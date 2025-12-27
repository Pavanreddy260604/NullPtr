import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { Lock } from "lucide-react";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const SecondSpaceDialog = ({ open, onOpenChange }: Props) => {
    const [value, setValue] = useState("");

    const handleComplete = (pin: string) => {
        if (pin === "2606") {
            const secret = import.meta.env.VITE_SECOND_SPACE_SECRET || "nullptr_secret_123";
            localStorage.setItem("second_space_secret", secret);
            toast.success("Unlocked Second Space");
            setTimeout(() => window.location.reload(), 1000);
        } else {
            if (pin === "0000") {
                localStorage.removeItem("second_space_secret");
                toast.success("Locked Second Space");
                setTimeout(() => window.location.reload(), 1000);
                return;
            }
            toast.error("Access Denied");
            setValue("");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-slate-950 border-slate-800 text-white">
                <DialogHeader>
                    <div className="mx-auto bg-slate-900 p-3 rounded-full mb-2">
                        <Lock className="w-6 h-6 text-purple-500" />
                    </div>
                    <DialogTitle className="text-center text-xl">Security Check</DialogTitle>
                    <DialogDescription className="text-center text-slate-400">
                        Enter PIN to access restricted materials
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center justify-center py-6">
                    <InputOTP maxLength={4} value={value} onChange={setValue} onComplete={handleComplete}>
                        <InputOTPGroup className="gap-2">
                            <InputOTPSlot index={0} className="border-slate-700 bg-slate-900 text-white" />
                            <InputOTPSlot index={1} className="border-slate-700 bg-slate-900 text-white" />
                            <InputOTPSlot index={2} className="border-slate-700 bg-slate-900 text-white" />
                            <InputOTPSlot index={3} className="border-slate-700 bg-slate-900 text-white" />
                        </InputOTPGroup>
                    </InputOTP>
                </div>
            </DialogContent>
        </Dialog>
    );
};
