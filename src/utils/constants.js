export const APP_ID = 'cmcf-fitness-v6';

export const SEED_DATA = {
    plans: [
        { id: 'p1', title: 'PLAN BÁSICO', price: 30, currency: '$', description: 'Acceso a Pesas y 1 clase grupal', visible: true },
        { id: 'p2', title: 'PLAN ELITE', price: 50, currency: '$', description: 'Acceso Total + Crossfit Ilimitado', visible: true, recommended: true }
    ],
    staff: [
        { id: 's1', name: 'CARLOS M.', role: 'HEAD COACH', specialty: 'CROSSFIT', photoUrl: '' }
    ],
    schedule: [
        { id: 'c1', day: 'LUNES', time: '07:00 AM', class: 'CROSSFIT', coach: 'Carlos M.', spots: 15, booked: 0 },
        { id: 'c2', day: 'MARTES', time: '05:00 PM', class: 'ZUMBA', coach: 'Ana R.', spots: 20, booked: 5 }
    ],
    paymentMethods: {
        zelle: 'pagos@cmcf.com / Titular: CMCF INC',
        pagoMovil: '0414-0000000 / CI: 12345678 / Banco Mercantil',
        efectivo: 'Pagar directamente en Recepción',
        binance: 'Pay ID: 123456789'
    },
    admins: ['admincmcf'],
    hero: {
        title1: 'ROMPE TUS',
        title2: 'LÍMITES',
        cta: 'INICIAR SESIÓN',
        bgImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'
    }
};

export const ICONS = {
    // Icons will be imported from lucide-react in components usually, 
    // but if we need a mapping we can do it here. 
    // For now, components will import directly.
};
