import React from 'react';

interface ShapeIconProps {
    shape: string;
    color: string;
    size?: number;
}

const ShapesIcon: React.FC<ShapeIconProps> = ({ shape, color, size = 35 }) => {
    const renderShape = () => {
        switch (shape) {
            case 'circle':
                return (
                    <div
                        style={{
                            width: size,
                            height: size,
                            borderRadius: '50%',
                            backgroundColor: color,
                        }}
                    />
                );
            case 'square':
                return (
                    <div
                        style={{
                            width: size,
                            height: size,
                            backgroundColor: color,
                        }}
                    />
                );
            case 'triangle':
                return (
                    <div
                        style={{
                            width: 0,
                            height: 0,
                            borderLeft: `${size / 2}px solid transparent`,
                            borderRight: `${size / 2}px solid transparent`,
                            borderBottom: `${size}px solid ${color}`,
                        }}
                    />
                );
            default:
                return null;
        }
    };

    return <div className="inline-block">{renderShape()}</div>;
};

export default ShapesIcon;
