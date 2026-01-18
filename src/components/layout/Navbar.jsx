import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const { user, userData } = useAuth();
    const navigate = useNavigate();

    return (
        <nav className="sticky top-0 z-40 bg-black/95 border-b border-brand-green/30 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center cursor-pointer group">
                    <Dumbbell className="text-brand-green h-8 w-8 group-hover:rotate-12 transition-transform" />
                    <span className="ml-2 font-display text-2xl tracking-widest text-white italic">CMCF <span className="text-brand-green">BOX</span></span>
                </Link>
                <div className="hidden md:flex items-center space-x-6">
                    <Link to="/" className="font-display italic hover:text-brand-green text-gray-300">INICIO</Link>
                    <Link to="/schedule" className="font-display italic hover:text-brand-green text-gray-300">CLASES</Link>
                    {user ? (
                        <>
                            <Link to="/profile" className="bg-brand-green text-black px-4 py-1 font-display font-bold italic hover:bg-white transform -skew-x-12">
                                <span className="skew-x-12">MI PERFIL</span>
                            </Link>
                            {userData?.role === 'admin' && (
                                <Link to="/admin" className="text-red-500 font-display italic hover:text-red-400 border border-red-500 px-2">ADMIN</Link>
                            )}
                        </>
                    ) : (
                        <Link to="/auth" className="border border-brand-green text-brand-green px-4 py-1 font-display italic hover:bg-brand-green hover:text-black transition">
                            REGÍSTRATE
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
