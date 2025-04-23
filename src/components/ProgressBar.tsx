// 📁 components/ProgressBar.tsx
import React from 'react';
import './ProgressBar.css';

interface Props {
    value: number;
    max: number;
    label?: string;
    color?: string;
    className?: string;
}

const ProgressBar: React.FC<Props> = ({ value, max, label, color = 'bg-green-500', className }) => {
    const percent = Math.max(0, Math.min(100, (value / max) * 100));

    return (
        <div className={`w-full ${className}`}>
            <div className="flex justify-between mb-1 text-sm font-medium text-gray-700">
                <span>{label}</span>
                <span>{value} / {max}</span> {/* ← вот это ключевая строка */}
            </div>
            <div className="w-full h-5 bg-gray-200 rounded overflow-hidden shadow-inner">
                <div
                    className={`h-full ${color}`}
                    style={{ width: `${percent}%`, transition: 'width 0.4s ease' }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;
