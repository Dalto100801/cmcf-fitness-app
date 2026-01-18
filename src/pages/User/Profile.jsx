import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, appId } from '../../config/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { safeDate, safeStr } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
    const { user, userData, logout } = useAuth();
    const [profileTab, setProfileTab] = useState('info');
    const [userHistory, setUserHistory] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, 'artifacts', appId, 'public', 'payments', 'list'),
            where('userId', '==', user.uid),
            orderBy('timestamp', 'desc')
        );
        const unsub = onSnapshot(q, (snap) => {
            setUserHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsub();
    }, [user]);

    if (!userData) return <div className="min-h-screen flex items-center justify-center text-white font-display italic">CARGANDO PERFIL...</div>;

    const now = new Date();
    const expiryDate = safeDate(userData.membershipExpiry);
    const daysLeft = expiryDate ? Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)) : 0;
    const isExpired = !expiryDate || daysLeft <= 0;
    const initial = (userData.username && userData.username.length > 0) ? userData.username[0].toUpperCase() : 'U';

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in pb-20">
            <div className="bg-neutral-900 border border-gray-800 p-6 mb-8 relative overflow-hidden">
                <div className={`absolute top-0 right-0 p-2 text-xs font-bold uppercase ${!isExpired ? 'bg-brand-green text-black' : 'bg-red-600 text-white'}`}>
                    {isExpired ? 'MEMBRESÍA VENCIDA' : 'MEMBRESÍA ACTIVA'}
                </div>
                <div className="flex flex-col md:flex-row items-center gap-6 mb-6 relative z-10">
                    <div className="w-24 h-24 bg-black border-2 border-brand-green flex items-center justify-center text-4xl font-display text-white">
                        {initial}
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-display italic text-white uppercase">{safeStr(userData.fullName)}</h2>
                        <p className="text-brand-green font-mono text-sm">@{safeStr(userData.instagram) || 'usuario'} | {safeStr(userData.cedula)}</p>
                        <p className="text-gray-500 text-xs mt-1">{safeStr(userData.email)}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 relative z-10">
                    <div className="bg-black p-3 border-l-2 border-gray-700">
                        <p className="text-xs text-gray-500">DÍAS RESTANTES</p>
                        <p className={`text-2xl font-display ${daysLeft < 3 ? 'text-red-500' : 'text-white'}`}>{daysLeft > 0 ? daysLeft : 0}</p>
                    </div>
                    <div className="bg-black p-3 border-l-2 border-gray-700">
                        <p className="text-xs text-gray-500">VENCE EL</p>
                        <p className="text-lg font-mono text-white">{expiryDate ? expiryDate.toLocaleDateString() : '-'}</p>
                    </div>
                    <div className="bg-black p-3 border-l-2 border-gray-700">
                        <p className="text-xs text-gray-500">DEUDA</p>
                        <p className="text-lg font-mono text-red-500">${userData.balance || 0}</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button onClick={() => navigate('/payment')} className="flex-1 bg-brand-green text-black py-3 font-display font-bold italic text-lg hover:bg-white transition">
                        REPORTAR PAGO / RENOVAR
                    </button>
                    <button onClick={logout} className="px-6 py-3 border border-gray-700 text-gray-500 hover:text-white">
                        SALIR
                    </button>
                </div>
            </div>

            <div className="flex border-b border-gray-800 mb-6">
                <button onClick={() => setProfileTab('info')} className={`px-6 py-3 font-display italic transition ${profileTab === 'info' ? 'text-brand-green border-b-2 border-brand-green' : 'text-gray-500'}`}>INFO</button>
                <button onClick={() => setProfileTab('history')} className={`px-6 py-3 font-display italic transition ${profileTab === 'history' ? 'text-brand-green border-b-2 border-brand-green' : 'text-gray-500'}`}>HISTORIAL</button>
                <button onClick={() => setProfileTab('qr')} className={`px-6 py-3 font-display italic transition ${profileTab === 'qr' ? 'text-brand-green border-b-2 border-brand-green' : 'text-gray-500'}`}>MI QR</button>
            </div>

            {profileTab === 'info' && (
                <div className="bg-neutral-900 p-6 border border-gray-800 animate-fade-in">
                    <h3 className="text-white font-display italic mb-4">DATOS PERSONALES</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono text-gray-400">
                        <div><strong className="text-white">TELÉFONO:</strong> {safeStr(userData.phone)}</div>
                        <div><strong className="text-white">DIRECCIÓN:</strong> {safeStr(userData.address)}</div>
                        <div><strong className="text-white">FECHA NAC:</strong> {safeStr(userData.dob)}</div>
                        <div><strong className="text-white">REGISTRADO:</strong> {safeDate(userData.joinedAt) ? safeDate(userData.joinedAt).toLocaleDateString() : '-'}</div>
                    </div>
                </div>
            )}

            {profileTab === 'history' && (
                <div className="bg-neutral-900 border border-gray-800 animate-fade-in">
                    {userHistory.length === 0 ? <p className="p-6 text-gray-500 text-center">No hay pagos registrados.</p> :
                        userHistory.map(h => (
                            <div key={h.id} className="p-4 border-b border-gray-800 flex justify-between items-center hover:bg-black/30">
                                <div>
                                    <div className="text-white font-bold">{h.method.toUpperCase()} - {h.reference}</div>
                                    <div className="text-xs text-gray-500">{h.date} • {h.isPartial ? 'Abono' : 'Total'}</div>
                                    {h.rejectionReason && <div className="text-xs text-red-500">Rechazado: {h.rejectionReason}</div>}
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-mono">${h.amount}</div>
                                    <div className={`text-[10px] uppercase font-bold ${h.status === 'aprobado' ? 'text-brand-green' : h.status === 'rechazado' ? 'text-red-500' : 'text-yellow-500'}`}>{h.status}</div>
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {profileTab === 'qr' && (
                <div className="bg-neutral-900 border border-gray-800 p-8 text-center animate-fade-in">
                    <div className="bg-white p-4 inline-block mb-4">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${user.uid}`} alt="QR Acceso" />
                    </div>
                    <h3 className="text-white font-display italic text-2xl">ACCESO AL BOX</h3>
                    <p className="text-gray-500 text-sm mt-2 font-mono">Muestra este código en recepción.</p>
                </div>
            )}
        </div>
    );
};

export default Profile;
