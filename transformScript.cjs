const fs = require('fs');
const path = require('path');

const emojiToIconConfig = {
    '👋': 'Hand', '☀️': 'Sun', '🌤️': 'CloudSun', '🌙': 'Moon', '🤝': 'Handshake',
    '🍎': 'Apple', '⚽': 'Dribbble', '🐱': 'Cat', '⭕': 'Circle', '🐫': 'Tent', 
    '🦁': 'Cat', '🐮': 'Beef', '🏀': 'Dribbble', '🎩': 'Tent', '🛋️': 'Armchair',
    '📺': 'Tv', '💡': 'Lightbulb', '🍳': 'FryingPan', '🍽️': 'Utensils', '🛏️': 'Bed',
    '🪟': 'AppWindow', '🚿': 'Droplet', '🪥': 'Brush', '👀': 'Eye', '🤫': 'VolumeX',
    '🧠': 'Brain', '🙂': 'Smile', '👍': 'ThumbsUp', '❓': 'HelpCircle', '💭': 'MessageCircle',
    '🔄': 'RefreshCw', '💬': 'MessageSquare', '🎯': 'Target', '💼': 'Briefcase', '📧': 'Mail',
    '✍️': 'PenTool', '👥': 'Users', '📊': 'BarChart2', '📞': 'Phone', '✈️': 'Plane',
    '🎫': 'Ticket', '🏨': 'Building', '🔑': 'Key', '🗺️': 'Map', '🧭': 'Compass', '🥘': 'Utensils',
    '🚒': 'Truck', '🍓': 'Apple', '☁️': 'Cloud', '🌊': 'Waves', '🫐': 'Circle', '🍌': 'Smile',
    '🍋': 'Circle', '🎨': 'Palette', '💜': 'Heart', '💚': 'Heart', '🧡': 'Heart', '👃': 'Smile',
    '🔺': 'Triangle', '🪑': 'Armchair', '✋': 'Hand', '🐜': 'Bug', '📅': 'Calendar', '🕷️': 'Bug',
    '🪐': 'Globe', '🙌': 'Hand', '🎉': 'PartyPopper', '🐷': 'Smile', '🐔': 'Bird', '🐕': 'Dog',
    '🐈': 'Cat', '🐠': 'Fish', '🐘': 'Tent', '🦒': 'Tent', '🐋': 'Fish', '🦈': 'Fish', '🐙': 'Bug',
    '✅': 'CheckCircle'
};

const filePath = path.join(__dirname, 'src', 'data', 'course_data.js');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/export const COURSE_DATA = /g, "import React from 'react';\nimport IconMapping from '../components/IconMapping';\n\nexport const COURSE_DATA = ");

// Function to replace HTML styles with React styles string format
function reactifyStyle(styleStr) {
    const props = styleStr.split(';').map(p => p.trim()).filter(Boolean);
    const objProps = {};
    for (let p of props) {
        if (!p.includes(':')) continue;
        let [k, v] = p.split(/:(.+)/);
        k = k.trim();
        v = v.trim();
        // camelCase
        k = k.replace(/-([a-z])/g, g => g[1].toUpperCase());
        // Handle specifics
        if (k === 'webkitBackgroundClip') k = 'WebkitBackgroundClip';
        if (k === 'webkitTextFillColor') k = 'WebkitTextFillColor';
        objProps[k] = v;
    }
    return `style={${JSON.stringify(objProps)}}`;
}

// Transform `visual:` strings
content = content.replace(/visual:\s*`([^`]*)`/g, (match, html) => {
    let jsx = html.replace(/style="([^"]+)"/g, (m, style) => reactifyStyle(style));
    jsx = jsx.replace(/class=/g, 'className=');
    // Replace emojis
    Object.keys(emojiToIconConfig).forEach(emoji => {
        jsx = jsx.split(emoji).join(`<IconMapping iconName="${emojiToIconConfig[emoji]}" size={64} style={{ display: 'inline-block' }}/>`);
    });
    return `visual: ( <React.Fragment>${jsx}</React.Fragment> )`;
});

// Transform `content:` strings
content = content.replace(/content:\s*`([^`]*)`/g, (match, html) => {
    let jsx = html.replace(/style="([^"]+)"/g, (m, style) => reactifyStyle(style));
    jsx = jsx.replace(/class=/g, 'className=');
    // Replace emojis
    Object.keys(emojiToIconConfig).forEach(emoji => {
        jsx = jsx.split(emoji).join(`<IconMapping iconName="${emojiToIconConfig[emoji]}" size={24} style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0 4px' }}/>`);
    });
    return `content: ( <React.Fragment>${jsx}</React.Fragment> )`;
});

fs.writeFileSync(filePath.replace('.js', '.jsx'), content);
fs.unlinkSync(filePath);
console.log('Successfully transformed course_data');
