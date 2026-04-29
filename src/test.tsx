import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Leaf, Zap, TrendingDown, ShieldCheck } from 'lucide-react';

// Données fictives pour le graphique
const data = [
  { month: 'Jan', conso: 400 },
  { month: 'Fév', conso: 350 },
  { month: 'Mar', conso: 300 },
  { month: 'Avr', conso: 200 },
];

export default function TestStack() {
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* 1. Test Lucide-React (Icônes) */}
      <header style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <Leaf color="#16a34a" size={40} />
        <h1 style={{ fontSize: '28px', color: '#1e293b' }}>GreenBuild Stack Test</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        
        {/* 2. Test Framer Motion (Animations) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={cardStyle}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#16a34a' }}>
            <ShieldCheck size={24} />
            <h3 style={{ margin: 0 }}>Animation OK</h3>
          </div>
          <p style={{ color: '#64748b' }}>Si ce bloc est monté doucement, Framer Motion fonctionne.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={cardStyle}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#3b82f6' }}>
            <Zap size={24} />
            <h3 style={{ margin: 0 }}>Composants OK</h3>
          </div>
          <p style={{ color: '#64748b' }}>Les icônes Lucide s'affichent correctement.</p>
        </motion.div>
      </div>

      {/* 3. Test Recharts (Graphiques) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ ...cardStyle, marginTop: '30px', height: '350px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <TrendingDown color="#16a34a" />
          <h3 style={{ margin: 0 }}>Graphique de Consommation (Recharts)</h3>
        </div>
        
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="conso" 
              stroke="#16a34a" 
              strokeWidth={3} 
              dot={{ r: 6 }} 
              activeDot={{ r: 8 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

    </div>
  );
}

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '25px',
  borderRadius: '16px',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  border: '1px solid #e2e8f0'
};