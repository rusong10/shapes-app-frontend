import React from 'react';

interface ShapeIconProps {
    shape: string;
    color: string;
    size?: number;
}

const ShapesIcon: React.FC<ShapeIconProps> = ({ shape, color, size = 30 }) => {
    switch (shape) {
        case 'circle':
            return (
                <svg width={size} height={size} className="inline-block">
                    <circle cx={size / 2} cy={size / 2} r={size / 2} fill={color} />
                </svg>
            );
        case 'square':
            return (
                <svg width={size} height={size} className="inline-block">
                    <rect width={size} height={size} fill={color} />
                </svg>
            );
        case 'triangle':
            return (
                <svg width={size} height={size} className="inline-block">
                    <polygon
                        points={`${size / 2},0 0,${size} ${size},${size}`}
                        fill={color}
                    />
                </svg>
            );
        default:
            return null;
    }
};

export default ShapesIcon;
