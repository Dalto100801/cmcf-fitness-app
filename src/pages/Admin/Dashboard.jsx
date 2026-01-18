import React, { useState, useEffect } from 'react';
import { db, appId } from '../../config/firebase';
import { collection, doc, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore'; // Removed unused imports
import { Check, X, Trash2, Edit2, User } from 'lucide-react';
import StatCard from '../../components/admin/StatCard';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = ({ gymData, setGymData }) => {
    const { showNotification } = useAuth();
    const [tab, setTab] = useState('stats');
    const [users, setUsers] = useState([]);
    const [payments, setPayments] = useState([]);

    // Edit States
    const [editStaff, setEditStaff] = useState(null);
    const [editClass, setEditClass] = useState(null);
    const [editPlan, setEditPlan] = useState(null);
    const [newAdmin, setNewAdmin] = useState({ username: '' });

    useEffect(() => {
        const usersUnsub = onSnapshot(collection(db, 'artifacts', appId, 'users'), (snap) => {
            setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        const paymentsQuery = query(collection(db, 'artifacts', appId, 'public', 'payments', 'list'), orderBy('timestamp', 'desc'));
        const paymentsUnsub = onSnapshot(paymentsQuery, (snap) => {
            setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => {
            usersUnsub();
            paymentsUnsub();
        };
    }, []);

    const updateContent = async (newData) => {
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'content'), newData);
            showNotification("CONTENIDO ACTUALIZADO", "success");
        } catch (e) {
            console.error(e);
            showNotification("ERROR ACTUALIZANDO", "error");
        }
    };

    const saveItem = async (type, item) => {
        const list = gymData[type] || [];
        let newList;
        if (item.id) {
            newList = list.map(i => i.id === item.id ? item : i);
        } else {
            newList = [...list, { ...item, id: Date.now().toString() }];
        }
        await updateContent({ ...gymData, [type]: newList });
        setEditStaff(null); setEditClass(null); setEditPlan(null);
    };

    const deleteItem = async (type, id) => {
        if (!window.confirm("¿Eliminar?")) return;
        const list = gymData[type] || [];
        await updateContent({ ...gymData, [type]: list.filter(i => i.id !== id) });
    };

    const handleVerifyPayment = async (pay, action, reason = '') => {
        try {
            const payRef = doc(db, 'artifacts', appId, 'public', 'payments', 'list', pay.id);
            const userRef = doc(db, 'artifacts', appId, 'users', pay.userId);

            if (action === 'approve') {
                const amount = parseFloat(pay.amount);

                const userDoc = users.find(u => u.id === pay.userId);
                if (!userDoc) throw new Error("User not found");

                let newBalance = (userDoc.balance || 0) - amount;
                if (newBalance < 0) newBalance = 0;

                const updates = { balance: newBalance };

                if (!pay.isPartial && newBalance <= 10) {
                    updates.membershipStatus = 'active';
                    const currentExpiry = userDoc.membershipExpiry?.toDate ? userDoc.membershipExpiry.toDate() : new Date();
                    const now = new Date();
                    const startInfo = currentExpiry > now ? currentExpiry : now;
                    const newExpiry = new Date(startInfo);
                    newExpiry.setDate(newExpiry.getDate() + 30);
                    updates.membershipExpiry = newExpiry;
                }

                await updateDoc(userRef, updates);
                await updateDoc(payRef, { status: 'aprobado' });
            } else {
                await updateDoc(payRef, { status: 'rechazado', rejectionReason: reason });
            }
            showNotification(`PAGO ${action.toUpperCase()}`, "success");
        } catch (e) {
            console.error(e);
            showNotification("ERROR PROCESANDO PAGO", "error");
        }
    };

    const createAdmin = async () => {
        if (!newAdmin.username) return;
        const currentAdmins = gymData.admins || [];
        if (!currentAdmins.includes(newAdmin.username)) {
            await updateContent({ ...gymData, admins: [...currentAdmins, newAdmin.username] });
            setNewAdmin({ username: '' });
        }
    };

    const activeUsers = users.filter(u => u.membershipStatus === 'active');
    const inactiveUsers = users.filter(u => u.membershipStatus !== 'active');
    const dueToday = users.filter(u => {
        if (!u.membershipExpiry) return false;
        const exp = u.membershipExpiry.toDate ? u.membershipExpiry.toDate() : new Date(u.membershipExpiry);
        const diff = Math.ceil((exp - new Date()) / (1000 * 60 * 60 * 24));
        return diff === 0;
    });
    const due3Days = users.filter(u => {
        if (!u.membershipExpiry) return false;
        const exp = u.membershipExpiry.toDate ? u.membershipExpiry.toDate() : new Date(u.membershipExpiry);
        const diff = Math.ceil((exp - new Date()) / (1000 * 60 * 60 * 24));
        return diff > 0 && diff <= 3;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in pb-20">
            <h2 className="text-4xl font-display italic text-white mb-8 border-b border-gray-800 pb-4">COMANDO CENTRAL <span className="text-brand-green text-lg not-italic font-mono align-middle ml-2">v2.0</span></h2>

            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-thin">
                {['stats', 'pagos', 'usuarios', 'equipo', 'clases', 'planes', 'portada', 'config'].map(t => (
                    <button key={t} onClick={() => setTab(t)} className={`px-6 py-2 font-display italic uppercase text-lg border whitespace-nowrap ${tab === t ? 'bg-brand-green text-black border-brand-green' : 'border-gray-700 text-gray-500 hover:text-white'}`}>
                        {t}
                    </button>
                ))}
            </div>

            {tab === 'stats' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
                    <StatCard title="ACTIVOS" val={activeUsers.length} color="text-brand-green" />
                    <StatCard title="INACTIVOS" val={inactiveUsers.length} color="text-red-500" />
                    <StatCard title="VENCEN HOY" val={dueToday.length} color="text-yellow-500" />
                    <StatCard title="VENCEN 3 DÍAS" val={due3Days.length} color="text-orange-500" />
                </div>
            )}

            {tab === 'pagos' && (
                <div className="bg-neutral-900 border border-gray-800 p-6 overflow-x-auto animate-fade-in">
                    <h3 className="text-xl font-display italic text-white mb-4">BANDEJA DE PAGOS</h3>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-gray-500 text-xs border-b border-gray-800 uppercase">
                                <th className="p-4">Usuario</th>
                                <th className="p-4">Método / Ref</th>
                                <th className="p-4">Monto</th>
                                <th className="p-4">Estado</th>
                                <th className="p-4 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-300 text-sm font-mono">
                            {payments.map(pay => (
                                <tr key={pay.id} className="border-b border-gray-800 hover:bg-black/30">
                                    <td className="p-4">
                                        <div className="text-white font-bold">{pay.userEmail}</div>
                                        <div className="text-xs text-gray-500">{new Date(pay.date).toLocaleDateString()}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-brand-green">{pay.method.toUpperCase()}</div>
                                        <div>#{pay.reference}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-xl font-display italic text-white">${pay.amount}</div>
                                        {pay.isPartial ? <span className="text-xs bg-yellow-900 text-yellow-500 px-2 py-0.5 rounded">PARCIAL</span> : <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded">TOTAL</span>}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${pay.status === 'pendiente' ? 'bg-yellow-600 text-black' : pay.status === 'aprobado' ? 'bg-brand-green text-black' : 'bg-red-600 text-white'}`}>{pay.status}</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        {pay.status === 'pendiente' && (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleVerifyPayment(pay, 'approve')} className="p-2 bg-brand-green text-black hover:bg-white rounded" title="Aprobar"><Check size={16} /></button>
                                                <button onClick={() => {
                                                    const reason = prompt("Motivo de rechazo:");
                                                    if (reason) handleVerifyPayment(pay, 'reject', reason);
                                                }} className="p-2 bg-red-600 text-white hover:bg-red-500 rounded" title="Rechazar"><X size={16} /></button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {tab === 'usuarios' && (
                <div className="bg-neutral-900 border border-gray-800 p-6 animate-fade-in">
                    <h3 className="text-xl font-display italic text-white mb-4">LISTA DE USUARIOS</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left max-h-[500px] overflow-y-auto">
                            <thead>
                                <tr className="text-gray-500 text-xs border-b border-gray-800 uppercase">
                                    <th className="p-2">Nombre</th>
                                    <th className="p-2">Cédula</th>
                                    <th className="p-2">Teléfono</th>
                                    <th className="p-2">Vencimiento</th>
                                    <th className="p-2">Deuda</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-300 text-sm font-mono">
                                {users.map(u => (
                                    <tr key={u.id} className="border-b border-gray-800 hover:bg-black/30">
                                        <td className="p-2 text-white font-bold">{u.fullName} <br /><span className="text-[10px] text-gray-500 font-normal">{u.email}</span></td>
                                        <td className="p-2">{u.cedula}</td>
                                        <td className="p-2">{u.phone}</td>
                                        <td className="p-2">{u.membershipExpiry?.toDate ? u.membershipExpiry.toDate().toLocaleDateString() : '-'}</td>
                                        <td className="p-2 text-red-500">${u.balance}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'equipo' && (
                <div className="animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {gymData?.staff?.map(s => (
                            <div key={s.id} className="bg-neutral-900 border border-gray-800 p-4 relative group hover:border-brand-green">
                                <div className="absolute top-2 right-2 hidden group-hover:flex gap-2 z-10">
                                    <button onClick={() => setEditStaff(s)} className="bg-blue-600 p-1 text-white"><Edit2 size={14} /></button>
                                    <button onClick={() => deleteItem('staff', s.id)} className="bg-red-600 p-1 text-white"><Trash2 size={14} /></button>
                                </div>
                                <div className="w-full h-40 bg-gray-800 mx-auto mb-4 overflow-hidden relative">
                                    {s.photoUrl ? <img src={s.photoUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-600"><User /></div>}
                                </div>
                                <h4 className="text-center font-bold text-white font-display italic text-xl">{s.name}</h4>
                                <p className="text-center text-brand-green text-sm font-mono">{s.role}</p>
                                <p className="text-center text-gray-500 text-xs mt-1">{s.specialty}</p>
                            </div>
                        ))}
                        <button onClick={() => setEditStaff({ id: '', name: '', role: '', specialty: '', photoUrl: '' })} className="border-2 border-dashed border-gray-800 flex items-center justify-center text-gray-600 hover:border-brand-green hover:text-brand-green h-60 font-display italic">
                            + AGREGAR MIEMBRO
                        </button>
                    </div>
                    {editStaff && (
                        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                            <div className="bg-neutral-900 border border-brand-green p-6 w-full max-w-md">
                                <h3 className="text-xl font-display italic text-white mb-4">EDITAR STAFF</h3>
                                <div className="space-y-3">
                                    <input placeholder="Nombre" value={editStaff.name} onChange={e => setEditStaff({ ...editStaff, name: e.target.value })} className="w-full bg-black border border-gray-700 p-2 text-white" />
                                    <input placeholder="Rol" value={editStaff.role} onChange={e => setEditStaff({ ...editStaff, role: e.target.value })} className="w-full bg-black border border-gray-700 p-2 text-white" />
                                    <input placeholder="Especialidad" value={editStaff.specialty} onChange={e => setEditStaff({ ...editStaff, specialty: e.target.value })} className="w-full bg-black border border-gray-700 p-2 text-white" />
                                    <input placeholder="URL Foto (https://...)" value={editStaff.photoUrl} onChange={e => setEditStaff({ ...editStaff, photoUrl: e.target.value })} className="w-full bg-black border border-gray-700 p-2 text-white" />
                                    <div className="flex gap-2 mt-4">
                                        <button onClick={() => saveItem('staff', editStaff)} className="flex-1 bg-brand-green text-black font-bold py-2">GUARDAR</button>
                                        <button onClick={() => setEditStaff(null)} className="flex-1 bg-gray-700 text-white font-bold py-2">CANCELAR</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {tab === 'clases' && (
                <div className="animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {gymData?.schedule?.map(c => (
                            <div key={c.id} className="bg-neutral-900 border border-gray-800 p-4 relative group">
                                <div className="absolute top-2 right-2 hidden group-hover:flex gap-2">
                                    <button onClick={() => setEditClass(c)} className="bg-blue-600 p-1 text-white"><Edit2 size={14} /></button>
                                    <button onClick={() => deleteItem('schedule', c.id)} className="bg-red-600 p-1 text-white"><Trash2 size={14} /></button>
                                </div>
                                <div className="text-brand-green font-bold text-xs">{c.day} • {c.time}</div>
                                <div className="font-display italic text-white text-lg">{c.class}</div>
                                <div className="text-gray-500 text-xs">Coach: {c.coach}</div>
                                <div className="text-gray-500 text-xs">Cupos: {c.spots}</div>
                            </div>
                        ))}
                        <button onClick={() => setEditClass({ id: '', day: 'LUNES', time: '', class: '', coach: '', spots: 20, booked: 0 })} className="border-2 border-dashed border-gray-800 flex items-center justify-center text-gray-600 hover:border-brand-green hover:text-brand-green h-24">
                            + AGREGAR CLASE
                        </button>
                    </div>
                    {editClass && (
                        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                            <div className="bg-neutral-900 border border-brand-green p-6 w-full max-w-md">
                                <h3 className="text-xl font-display italic text-white mb-4">EDITAR CLASE</h3>
                                <div className="space-y-3">
                                    <select value={editClass.day} onChange={e => setEditClass({ ...editClass, day: e.target.value })} className="w-full bg-black border border-gray-700 p-2 text-white">
                                        {['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'].map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <input placeholder="Hora (Ej: 07:00 AM)" value={editClass.time} onChange={e => setEditClass({ ...editClass, time: e.target.value })} className="w-full bg-black border border-gray-700 p-2 text-white" />
                                    <input placeholder="Nombre Clase" value={editClass.class} onChange={e => setEditClass({ ...editClass, class: e.target.value })} className="w-full bg-black border border-gray-700 p-2 text-white" />
                                    <input placeholder="Coach" value={editClass.coach} onChange={e => setEditClass({ ...editClass, coach: e.target.value })} className="w-full bg-black border border-gray-700 p-2 text-white" />
                                    <input type="number" placeholder="Cupos" value={editClass.spots} onChange={e => setEditClass({ ...editClass, spots: parseInt(e.target.value) })} className="w-full bg-black border border-gray-700 p-2 text-white" />
                                    <div className="flex gap-2 mt-4">
                                        <button onClick={() => saveItem('schedule', editClass)} className="flex-1 bg-brand-green text-black font-bold py-2">GUARDAR</button>
                                        <button onClick={() => setEditClass(null)} className="flex-1 bg-gray-700 text-white font-bold py-2">CANCELAR</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {tab === 'planes' && (
                <div className="animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {gymData?.plans?.map(p => (
                            <div key={p.id} className="bg-neutral-900 border border-gray-800 p-6 relative group">
                                <div className="absolute top-2 right-2 hidden group-hover:flex gap-2">
                                    <button onClick={() => setEditPlan(p)} className="bg-blue-600 p-1 text-white"><Edit2 size={14} /></button>
                                    <button onClick={() => deleteItem('plans', p.id)} className="bg-red-600 p-1 text-white"><Trash2 size={14} /></button>
                                </div>
                                <h3 className="text-xl font-display italic text-white">{p.title}</h3>
                                <div className="text-2xl font-bold text-brand-green">{p.currency}{p.price}</div>
                                <p className="text-gray-400 text-sm">{p.description}</p>
                                <div className="mt-2 text-xs uppercase text-gray-500">{p.visible ? 'VISIBLE' : 'OCULTO'}</div>
                            </div>
                        ))}
                        <button onClick={() => setEditPlan({ id: '', title: '', price: '', currency: '$', description: '', visible: true })} className="border-2 border-dashed border-gray-800 flex items-center justify-center text-gray-600 hover:border-brand-green hover:text-brand-green h-32">
                            + AGREGAR PLAN
                        </button>
                    </div>

                    {editPlan && (
                        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                            <div className="bg-neutral-900 border border-brand-green p-6 w-full max-w-md">
                                <h3 className="text-xl font-display italic text-white mb-4">EDITAR PLAN</h3>
                                <div className="space-y-3">
                                    <input placeholder="Nombre Plan" value={editPlan.title} onChange={e => setEditPlan({ ...editPlan, title: e.target.value })} className="w-full bg-black border border-gray-700 p-2 text-white" />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input type="number" placeholder="Precio" value={editPlan.price} onChange={e => setEditPlan({ ...editPlan, price: e.target.value })} className="bg-black border border-gray-700 p-2 text-white" />
                                        <input placeholder="Moneda ($)" value={editPlan.currency} onChange={e => setEditPlan({ ...editPlan, currency: e.target.value })} className="bg-black border border-gray-700 p-2 text-white" />
                                    </div>
                                    <textarea placeholder="Descripción" value={editPlan.description} onChange={e => setEditPlan({ ...editPlan, description: e.target.value })} className="w-full bg-black border border-gray-700 p-2 text-white h-24" />
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" checked={editPlan.visible} onChange={e => setEditPlan({ ...editPlan, visible: e.target.checked })} />
                                        <label className="text-white text-sm">Visible al público</label>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <button onClick={() => saveItem('plans', editPlan)} className="flex-1 bg-brand-green text-black font-bold py-2">GUARDAR</button>
                                        <button onClick={() => setEditPlan(null)} className="flex-1 bg-gray-700 text-white font-bold py-2">CANCELAR</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {tab === 'portada' && (
                <div className="bg-neutral-900 border border-gray-800 p-6 animate-fade-in max-w-2xl">
                    <h3 className="text-xl font-display italic text-white mb-6">EDITAR PORTADA (HERO)</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-mono text-gray-500 block mb-1">TÍTULO PRINCIPAL (LÍNEA 1)</label>
                            <input value={gymData?.hero?.title1 || ''} onChange={e => updateContent({ ...gymData, hero: { ...gymData.hero, title1: e.target.value } })} className="w-full bg-black border border-gray-700 p-3 text-white focus:border-brand-green outline-none" placeholder="EJ: ROMPE TUS" />
                        </div>
                        <div>
                            <label className="text-xs font-mono text-gray-500 block mb-1">TÍTULO DESTACADO (LÍNEA 2)</label>
                            <input value={gymData?.hero?.title2 || ''} onChange={e => updateContent({ ...gymData, hero: { ...gymData.hero, title2: e.target.value } })} className="w-full bg-black border border-gray-700 p-3 text-brand-green font-bold focus:border-brand-green outline-none" placeholder="EJ: LÍMITES" />
                        </div>
                        <div>
                            <label className="text-xs font-mono text-gray-500 block mb-1">IMAGEN DE FONDO (URL)</label>
                            <input value={gymData?.hero?.bgImage || ''} onChange={e => updateContent({ ...gymData, hero: { ...gymData.hero, bgImage: e.target.value } })} className="w-full bg-black border border-gray-700 p-3 text-white focus:border-brand-green outline-none text-xs" placeholder="https://..." />
                        </div>
                        <div>
                            <label className="text-xs font-mono text-gray-500 block mb-1">TEXTO BOTÓN</label>
                            <input value={gymData?.hero?.cta || ''} onChange={e => updateContent({ ...gymData, hero: { ...gymData.hero, cta: e.target.value } })} className="w-full bg-black border border-gray-700 p-3 text-white focus:border-brand-green outline-none" placeholder="EJ: INICIAR SESIÓN" />
                        </div>
                    </div>
                </div>
            )}

            {tab === 'config' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="bg-neutral-900 border border-gray-800 p-6">
                        <h3 className="text-xl font-display italic text-white mb-4">MÉTODOS DE PAGO</h3>
                        <div className="space-y-4">
                            {Object.keys(gymData.paymentMethods || {}).map(key => (
                                <div key={key}>
                                    <label className="text-xs text-brand-green uppercase font-bold">{key}</label>
                                    <textarea
                                        value={gymData.paymentMethods[key]}
                                        onChange={(e) => updateContent({ ...gymData, paymentMethods: { ...gymData.paymentMethods, [key]: e.target.value } })}
                                        className="w-full bg-black border border-gray-700 p-2 text-white font-mono text-sm h-20"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
