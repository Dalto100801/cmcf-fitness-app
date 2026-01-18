import React from 'react';
import { useNavigate } from 'react-router-dom';
import { db, appId } from '../../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { safeDate } from '../../utils/formatters';
import { ArrowLeft } from 'lucide-react';

const ScheduleView = ({ gymData }) => {
    const { user, userData, showNotification } = useAuth();
    const navigate = useNavigate();

    const handleBooking = async (c) => {
        if (!user) return navigate('/auth');
        const now = new Date();
        const expiryDate = safeDate(userData?.membershipExpiry);

        if (!expiryDate || expiryDate <= now) return showNotification("MEMBRESÍA VENCIDA", "error");
        if (c.booked >= c.spots) return showNotification("CLASE LLENA", "error");

        try {
            const newSchedule = gymData.schedule.map(item => item.id === c.id ? { ...item, booked: (item.booked || 0) + 1 } : item);
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'content'), { schedule: newSchedule });
            showNotification("RESERVA EXITOSA", "success");
        } catch (e) {
            console.error(e);
            showNotification("ERROR RESERVANDO", "error");
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in pb-20">
            <button onClick={() => navigate('/')} className="mb-6 flex items-center text-gray-500 hover:text-white"><ArrowLeft className="mr-2" /> INICIO</button>
            <h2 className="text-3xl font-display font-bold italic text-white mb-6 uppercase">HORARIOS DE CLASE</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {gymData?.schedule?.map(c => (
                    <div key={c.id} className="bg-neutral-900 border border-gray-800 p-4 hover:border-brand-green group transition">
                        <div className="flex justify-between items-start mb-2">
                            <span className="bg-brand-green text-black text-xs font-bold px-2 py-1">{c.day}</span>
                            <span className="text-gray-400 text-sm font-mono">{c.time}</span>
                        </div>
                        <h3 className="text-2xl font-display italic text-white mb-1">{c.class}</h3>
                        <p className="text-sm text-gray-500 mb-4">Coach: {c.coach}</p>
                        <div className="flex justify-between items-center text-xs font-mono text-gray-400 border-t border-gray-800 pt-4">
                            <span>CUPOS: <span className="text-white">{c.spots - (c.booked || 0)}</span> / {c.spots}</span>
                            <button onClick={() => handleBooking(c)} className="text-brand-green hover:bg-brand-green hover:text-black px-3 py-1 transition font-bold">RESERVAR</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScheduleView;
