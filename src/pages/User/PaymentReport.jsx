import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, appId } from '../../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

const PaymentReport = ({ gymData }) => {
    const { user, showNotification } = useAuth();
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [formData, setFormData] = useState({
        amount: '', reference: '', method: 'pagoMovil', isPartial: false, date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.reference) return showNotification("DATOS FALTANTES", "error");

        try {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'payments', 'list'), {
                userId: user.uid,
                userEmail: user.email,
                ...formData,
                status: 'pendiente',
                timestamp: serverTimestamp()
            });
            showNotification("PAGO ENVIADO A REVISIÓN", "success");
            navigate('/profile');
        } catch (e) {
            console.error(e);
            showNotification("ERROR AL ENVIAR", "error");
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in pb-20">
            <button onClick={() => navigate('/profile')} className="mb-6 flex items-center text-gray-500 hover:text-white"><ArrowLeft className="mr-2" /> VOLVER</button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-2xl font-display italic text-white mb-4">1. ELIGE TU MEMBRESÍA</h2>
                    <div className="space-y-4">
                        {gymData?.plans?.filter(p => p.visible).map(plan => (
                            <div key={plan.id} onClick={() => { setSelectedPlan(plan); setFormData({ ...formData, amount: plan.price }) }}
                                className={`p-4 border cursor-pointer transition ${selectedPlan?.id === plan.id ? 'bg-brand-green text-black border-brand-green' : 'bg-neutral-900 border-gray-800 hover:border-brand-green'}`}>
                                <div className="flex justify-between font-bold">
                                    <span>{plan.title}</span>
                                    <span>{plan.currency}{plan.price}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <h2 className="text-2xl font-display italic text-white mt-8 mb-4">2. DATOS DE PAGO</h2>
                    <div className="bg-neutral-900 p-4 border border-gray-800 text-sm font-mono text-gray-400">
                        {Object.keys(gymData?.paymentMethods || {}).map(k => (
                            <div key={k} className="mb-3">
                                <strong className="text-brand-green uppercase">{k}:</strong>
                                <p className="whitespace-pre-wrap">{gymData.paymentMethods[k]}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-black border border-gray-800 p-6 h-fit">
                    <h2 className="text-2xl font-display italic text-white mb-6">3. REPORTE</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-500">MÉTODO</label>
                            <select value={formData.method} onChange={e => setFormData({ ...formData, method: e.target.value })} className="w-full bg-neutral-900 border border-gray-700 p-3 text-white">
                                {Object.keys(gymData?.paymentMethods || {}).map(k => <option key={k} value={k}>{k.toUpperCase()}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500">MONTO ($)</label>
                                <input type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="w-full bg-neutral-900 border border-gray-700 p-3 text-white" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">FECHA</label>
                                <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full bg-neutral-900 border border-gray-700 p-3 text-white" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500">REFERENCIA (#)</label>
                            <input value={formData.reference} onChange={e => setFormData({ ...formData, reference: e.target.value })} className="w-full bg-neutral-900 border border-gray-700 p-3 text-white font-mono" placeholder="123456" />
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-gray-900/50 border border-gray-800">
                            <input type="checkbox" checked={formData.isPartial} onChange={e => setFormData({ ...formData, isPartial: e.target.checked })} className="accent-brand-green w-5 h-5" />
                            <label className="text-sm text-gray-300">¿Es un abono/pago parcial?</label>
                        </div>
                        <button className="w-full bg-brand-green text-black font-display font-bold italic text-xl py-3 hover:bg-white mt-4">ENVIAR REPORTE</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentReport;
