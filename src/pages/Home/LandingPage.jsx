import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = ({ data }) => {
    const navigate = useNavigate();

    return (
        <div className="animate-fade-in">
            <div className="relative h-[600px] flex items-center justify-center overflow-hidden border-b border-brand-green/30 bg-black">
                <img src={data?.hero?.bgImage || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"} className="absolute inset-0 w-full h-full object-cover bw-filter opacity-40" />
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-6xl md:text-9xl font-display font-bold italic tracking-tighter text-white mb-2 leading-none">
                        {data?.hero?.title1 || "ROMPE TUS"} <br /> <span className="text-transparent bg-clip-text bg-gradient-to-b from-brand-green to-green-700 neon-text stroke-white">{data?.hero?.title2 || "LÍMITES"}</span>
                    </h1>
                    <button onClick={() => navigate('/auth')} className="mt-8 bg-brand-green text-black px-10 py-4 font-display font-bold italic text-2xl hover:bg-white hover:shadow-[0_0_20px_#39ff14] skew-x-[-10deg]">
                        <span className="skew-x-[10deg] inline-block">{data?.hero?.cta || "INICIAR SESIÓN"}</span>
                    </button>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 py-20">
                <h2 className="text-5xl font-display font-bold italic text-white mb-12 uppercase text-center">PLANES <span className="text-brand-green">.</span></h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data?.plans?.filter(p => p.visible).map(plan => (
                        <div key={plan.id} className="bg-neutral-900 border border-gray-800 p-8 hover:border-brand-green transition group">
                            <h3 className="text-2xl font-display font-bold italic text-white mb-2">{plan.title}</h3>
                            <div className="text-4xl font-display font-bold text-brand-green mb-4">{plan.currency}{plan.price}</div>
                            <p className="text-gray-400 font-mono text-sm mb-6">{plan.description}</p>
                            <button onClick={() => navigate('/auth')} className="w-full py-3 border border-gray-600 text-gray-300 font-display italic hover:bg-brand-green hover:text-black hover:border-brand-green transition">SELECCIONAR</button>
                        </div>
                    ))}
                </div>
            </div>

            {/* STAFF SECTION (CAROUSEL) */}
            <div className="py-20 bg-neutral-900 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-5xl font-display font-bold italic text-white mb-12 uppercase text-right">NUESTRO <span className="text-brand-green">EQUIPO</span></h2>

                    <div className="flex overflow-x-auto gap-6 pb-8 snap-x hide-scrollbar">
                        {data?.staff?.map(s => (
                            <div key={s.id} className="min-w-[280px] md:min-w-[320px] bg-black border border-gray-800 p-4 snap-center hover:border-brand-green transition group">
                                <div className="w-full h-80 bg-gray-800 mb-4 overflow-hidden relative grayscale group-hover:grayscale-0 transition duration-500">
                                    {s.photoUrl ? (
                                        <img src={s.photoUrl} className="w-full h-full object-cover" alt={s.name} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                                            <svg className="w-20 h-20 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 w-full bg-brand-green text-black font-bold font-display italic text-center py-1 opacity-0 group-hover:opacity-100 transition translate-y-2 group-hover:translate-y-0">
                                        RESERVAR CLASE
                                    </div>
                                </div>
                                <h3 className="text-3xl font-display italic text-white uppercase leading-none">{s.name}</h3>
                                <p className="text-brand-green font-mono text-sm mt-1 mb-2 tracking-widest">{s.role}</p>
                                <p className="text-gray-500 text-xs border-t border-gray-800 pt-3">{s.specialty}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
