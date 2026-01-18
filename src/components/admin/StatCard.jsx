import React from 'react';

const StatCard = ({ title, val, color }) => (
    <div className="bg-neutral-900 border border-gray-800 p-6 text-center hover:border-brand-green transition group">
        <div className="text-xs text-gray-500 mb-1 font-mono group-hover:text-white transition">{title}</div>
        <div className={`text-5xl font-display font-bold italic ${color}`}>{val}</div>
    </div>
);

export default StatCard;
