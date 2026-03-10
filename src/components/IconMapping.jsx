import React from 'react';
import * as LucideIcons from 'lucide-react';

const IconMapping = ({ iconName, size = 24, color, className = '', style = {} }) => {
    // Basic fallback if icon not found
    const IconComponent = LucideIcons[iconName] || LucideIcons.HelpCircle;

    return (
        <IconComponent 
            size={size} 
            color={color} 
            className={className} 
            style={style} 
            strokeWidth={2.5} 
        />
    );
};

export default IconMapping;
