import { TrendingUp, TrendingDown } from 'lucide-react';
import './StatCard.css';

export default function StatCard({ icon, label, value, sub, color = '#3b82f6', trend }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ backgroundColor: `${color}18`, color }}>
        {icon}
      </div>
      <div className="stat-card-body">
        <p className="stat-card-label">{label}</p>
        <p className="stat-card-value">{value}</p>
        {sub && <p className="stat-card-sub">{sub}</p>}
      </div>
      {trend !== undefined && (
        <div className={`stat-card-trend ${trend >= 0 ? 'up' : 'down'}`}>
          {trend >= 0
            ? <TrendingUp size={12} strokeWidth={2} style={{ display: 'inline', marginRight: 3 }} />
            : <TrendingDown size={12} strokeWidth={2} style={{ display: 'inline', marginRight: 3 }} />
          }
          {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
}
