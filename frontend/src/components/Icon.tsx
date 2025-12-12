import React from 'react';

interface IconProps {
    name: string;
    className?: string;
    size?: number;
}

const Icon: React.FC<IconProps> = ({ name, className = '', size = 40 }) => {
    // Map icon names to emoji or simple symbols
    const iconMap: { [key: string]: string } = {
        // Auth icons
        'lightsaber-skywalker': '🔐',
        'lightsaber-luke-rotj': '🔑',
        'lightsaber-darth-vader': '⚔️',

        // Navigation icons
        'dashboard': '📊',
        'challenges': '🎯',
        'quest': '🗺️',
        'playground': '🎮',
        'leaderboard': '🏆',
        'profile': '👤',
        'reference': '📚',
        'badges': '🏅',
        'admin': '⚙️',

        // Stats icons
        'trophy': '🏆',
        'lightning': '⚡',
        'stats': '📈',
        'certificate': '🎓',
        'strength': '💪',
        'target': '🎯',
        'rocket': '🚀',
        'wave': '👋',

        // Rank icons
        'beginner': '🌱',
        'learner': '📖',
        'practitioner': '⚔️',
        'expert': '⚔️',
        'master': '🌟',
        'grand-master': '💎',

        // Theme icons
        'sun': '☀️',
        'moon': '🌙',

        // Quest icons
        'ship': '🚀',
        'star': '⭐',
        'plane': '✈️',

        // Leaderboard icons
        'gold-medal': '🥇',
        'silver-medal': '🥈',
        'bronze-medal': '🥉',

        // Default
        'default': '⭐'
    };

    const icon = iconMap[name] || iconMap['default'];

    return (
        <span
            className={`inline-flex items-center justify-center ${className}`}
            style={{ fontSize: `${size}px`, lineHeight: 1 }}
            role="img"
            aria-label={name}
        >
            {icon}
        </span>
    );
};

export default Icon;
