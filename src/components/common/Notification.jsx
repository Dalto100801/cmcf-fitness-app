import React from 'react';
import { AlertCircle, Check, Info, X } from 'lucide-react';

const Notification = ({ notification }) => {
    if (!notification) return null;
    const { msg, type } = notification;

    const styles = {
        error: 'bg-red-900 text-white border-red-500',
        success: 'bg-green-900 text-white border-brand-green',
        warning: 'bg-yellow-900 text-yellow-500 border-yellow-500',
        info: 'bg-neutral-900 text-brand-green border-brand-green'
    };

    const icons = {
        error: <X size={20} />,
        success: <Check size={20} />,
        warning: <AlertCircle size={20} />,
        info: <Info size={20} />
    };

    return (
        <div className={`fixed bottom-4 right-4 px-6 py-4 border-l-4 font-display italic shadow-2xl z-50 animate-fade-in flex items-center gap-3 ${styles[type] || styles.info}`}>
            {icons[type]}
            <span>{msg.toUpperCase()}</span>
        </div>
    );
};

export default Notification;
