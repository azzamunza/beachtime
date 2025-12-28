// Fishing Landscape Animation
// Adapted from FishingTime repository for use in BeachTime

// Use React globals loaded via CDN
const { useState, useEffect, useMemo, useRef } = React;

// --- Helper Functions ---

const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// --- Sub-Components ---

const SkyGradient = ({ timeOfDay, cloudCover, isStormy }) => {
  const getSkyColors = () => {
    if (isStormy) return ['#2c3e50', '#34495e', '#2c5e50']; 
    if (timeOfDay < 5 || timeOfDay > 20) return ['#0f2027', '#203a43', '#2c5364']; 
    if (timeOfDay >= 5 && timeOfDay < 8) return ['#ff9966', '#ff5e62', '#2c3e50']; 
    if (timeOfDay >= 17 && timeOfDay <= 20) return ['#f12711', '#f5af19', '#2c3e50']; 
    if (cloudCover > 60) return ['#757f9a', '#d7dde8', '#eef2f3']; 
    return ['#2980b9', '#6dd5fa', '#ffffff']; 
  };
  const colors = getSkyColors();
  return React.createElement('defs', null,
    React.createElement('linearGradient', { id: 'skyGradient', x1: '0%', y1: '0%', x2: '0%', y2: '100%' },
      React.createElement('stop', { offset: '0%', stopColor: colors[0], style: { transition: 'stop-color 1s' } }),
      React.createElement('stop', { offset: '50%', stopColor: colors[1], style: { transition: 'stop-color 1s' } }),
      React.createElement('stop', { offset: '100%', stopColor: colors[2], style: { transition: 'stop-color 1s' } })
    )
  );
};

const Moon = ({ phase, timeOfDay, cloudCover }) => {
  const opacity = (timeOfDay > 6 && timeOfDay < 18) ? 0.2 : 1;
  const cloudOpacityMod = Math.max(0, 1 - (cloudCover / 100));
  const cx = 1800;
  const cy = 60;
  const r = 35;

  const getMoonPath = (phase) => {
    const isLeftShadow = phase < 0.5; 
    const termX = r * Math.cos(phase * 2 * Math.PI);
    return `M ${cx}, ${cy - r} 
            A ${r}, ${r} 0 0,${isLeftShadow ? 0 : 1} ${cx}, ${cy + r} 
            A ${Math.abs(termX)}, ${r} 0 0,${phase < 0.25 || phase > 0.75 ? (isLeftShadow?1:0) : (isLeftShadow?0:1)} ${cx}, ${cy - r}`;
  };

  return React.createElement('g', { style: { opacity: opacity * cloudOpacityMod, transition: 'opacity 1s' } },
    React.createElement('circle', { cx: cx, cy: cy, r: r * 1.5, fill: 'white', opacity: '0.1' }),
    React.createElement('circle', { cx: cx, cy: cy, r: r, fill: '#fdfdff' }),
    React.createElement('path', { d: getMoonPath(phase), fill: 'rgba(20,24,30,0.95)' }),
    React.createElement('circle', { cx: cx - 8, cy: cy - 4, r: 4, fill: 'rgba(200,200,200,0.1)' })
  );
};

const Clouds = ({ cover, windSpeed, windDir }) => {
  const cloudCount = 6;
  const clouds = useMemo(() => Array.from({ length: cloudCount }).map((_, i) => ({
      id: i,
      x: seededRandom(i) * 2200 - 100,
      y: 30 + seededRandom(i + 100) * 80,
      scale: 0.6 + seededRandom(i + 200) * 1.2,
      speed: 0.2 + seededRandom(i) * 0.5
    })), []);

  const opacity = Math.min(1, cover / 80);
  const directionMult = (windDir > 180) ? -1 : 1;
  const moveDuration = (105 - windSpeed) * 2;

  if (cover < 5) return null;

  return React.createElement('g', { className: 'clouds', style: { opacity } },
    clouds.map((cloud) => 
      React.createElement('g', { 
        key: cloud.id, 
        style: { 
          transform: `translate(${cloud.x}px, ${cloud.y}px) scale(${cloud.scale})`,
          animation: `float ${moveDuration / cloud.speed}s linear infinite`,
          animationDirection: directionMult > 0 ? 'normal' : 'reverse'
        }
      },
        React.createElement('path', { 
          d: 'M25,60.2c-13.8,0-25-11.2-25-25s11.2-25,25-25c2.5,0,4.9,0.4,7.2,1.1c5-10.9,16-18.5,28.7-18.5 c15.1,0,27.8,10.7,30.6,25.1c2.1-0.6,4.3-0.9,6.6-0.9c13.8,0,25,11.2,25,25s-11.2,25-25,25H25z',
          fill: cover > 60 ? '#bdc3c7' : '#ecf0f1',
          opacity: '0.9'
        })
      )
    ),
    React.createElement('style', null, '@keyframes float { 0% { transform: translateX(-200px); } 100% { transform: translateX(2400px); } }')
  );
};

const Water = ({ tideLevel, windSpeed, landscapeType }) => {
  const yPos = 320 - (tideLevel * 0.8); 
  const waveHeight = 4 + (windSpeed / 5); 
  const waveSpeed = 20 - (windSpeed / 6);
  
  const waterColors = {
    beach: { primary: '#2980b9', secondary: '#3498db' },
    river: { primary: '#27ae60', secondary: '#2ecc71' },
    estuary: { primary: '#7f8c8d', secondary: '#95a5a6' },
    breakwater: { primary: '#16a085', secondary: '#1abc9c' },
    lake: { primary: '#3498db', secondary: '#5dade2' }
  };
  
  const colors = waterColors[landscapeType] || waterColors.beach;

  return React.createElement('g', null,
    React.createElement('path', { 
      fill: colors.primary, 
      fillOpacity: '0.6', 
      d: `M0,${yPos} Q500,${yPos - waveHeight} 1000,${yPos} T2000,${yPos} V400 H0 Z`,
      style: { animation: `wave ${waveSpeed}s linear infinite` }
    }),
    React.createElement('path', { 
      fill: colors.secondary, 
      fillOpacity: '0.8', 
      d: `M0,${yPos + 8} Q500,${yPos + 8 + waveHeight} 1000,${yPos + 8} T2000,${yPos + 8} V400 H0 Z`,
      style: { animation: `wave ${waveSpeed * 0.8}s linear infinite reverse` }
    }),
    React.createElement('style', null, '@keyframes wave { 0% { transform: scaleY(1); } 50% { transform: scaleY(1.05); } 100% { transform: scaleY(1); } }')
  );
};

const Rain = ({ intensity, windSpeed, windDir }) => {
  if (intensity < 10) return null;
  const dropCount = Math.floor(intensity * 2);
  const angle = (windDir > 180 ? -1 : 1) * (windSpeed / 4);
  const drops = useMemo(() => Array.from({ length: 150 }).map((_, i) => ({
    id: i, x: Math.random() * 2000, y: Math.random() * 400, len: 8 + Math.random() * 15, speed: 0.5 + Math.random() * 0.5
  })), []);

  return React.createElement('g', { className: 'rain' },
    drops.slice(0, dropCount).map(drop => 
      React.createElement('line', { 
        key: drop.id, 
        x1: drop.x, 
        y1: drop.y, 
        x2: drop.x + angle, 
        y2: drop.y + drop.len, 
        stroke: '#aaddff', 
        strokeWidth: '1', 
        opacity: '0.6',
        style: { animation: `fall ${1 / drop.speed}s linear infinite` }
      })
    ),
    React.createElement('style', null, '@keyframes fall { 0% { transform: translateY(-400px); } 100% { transform: translateY(400px); } }')
  );
};

const WindIndicator = ({ speed, direction }) => {
  const isBlowingRight = direction >= 0 && direction < 180;
  const lift = 80 - (Math.min(speed, 100) * 0.8);
  const rotation = isBlowingRight ? -lift : lift; 
  const scaleX = isBlowingRight ? 1 : -1;

  return React.createElement('g', { transform: 'translate(1850, 300)' },
    React.createElement('rect', { x: '-2', y: '0', width: '4', height: '100', fill: '#5d4037' }),
    React.createElement('circle', { cx: '0', cy: '0', r: '3', fill: '#3e2723' }),
    React.createElement('g', { transform: `scale(${scaleX}, 1) rotate(${rotation})` },
      React.createElement('path', { d: 'M0,-8 L0,8 L12,6 L12,-6 Z', fill: '#e67e22' }),
      React.createElement('path', { d: 'M12,-6 L12,6 L24,5 L24,-5 Z', fill: '#ecf0f1' }),
      React.createElement('path', { d: 'M24,-5 L24,5 L36,4 L36,-4 Z', fill: '#e67e22' }),
      React.createElement('path', { d: 'M36,-4 L36,4 L48,3 L48,-3 Z', fill: '#ecf0f1' }),
      React.createElement('path', { d: 'M48,-3 L48,3 L72,1 L72,-1 Z', fill: '#e67e22' }),
      speed > 20 && React.createElement('path', { 
        d: 'M72,-1 L72,1 L80,0 Z', 
        fill: '#e67e22', 
        opacity: '0.8'
      },
        React.createElement('animate', { 
          attributeName: 'd', 
          values: 'M72,-1 L72,1 L80,0 Z; M72,-1 L72,1 L85,4 Z; M72,-1 L72,1 L80,0 Z',
          dur: `${0.5 - (speed/400)}s`,
          repeatCount: 'indefinite'
        })
      )
    ),
    React.createElement('text', { 
      x: '0', 
      y: '115', 
      textAnchor: 'middle', 
      fill: 'white', 
      fontSize: '11',
      style: { textShadow: '1px 1px 2px black' }
    }, `${speed} km/h ${isBlowingRight ? 'E' : 'W'}`)
  );
};

const Birds = ({ landscapeType, timeOfDay }) => {
  const getBirdTypes = () => {
    switch(landscapeType) {
      case 'beach':
      case 'breakwater':
        return ['seagull', 'tern', 'pelican'];
      case 'river':
        return ['swan', 'duck', 'cormorant'];
      case 'estuary':
        return ['heron', 'pelican', 'tern'];
      case 'lake':
        return ['swan', 'duck', 'heron'];
      default:
        return ['seagull'];
    }
  };
  
  const birds = useMemo(() => {
    const types = getBirdTypes();
    return Array.from({ length: 4 }).map((_, i) => ({
      id: i,
      type: types[i % types.length],
      x: 300 + i * 400,
      y: 80 + seededRandom(i) * 60,
      speed: 3 + seededRandom(i + 50) * 2,
      delay: seededRandom(i + 100) * 3
    }));
  }, [landscapeType]);
  
  if (timeOfDay < 5 || timeOfDay > 20) return null;

  return React.createElement('g', null,
    birds.map((bird) => 
      React.createElement('g', { 
        key: bird.id, 
        style: { 
          transform: `translate(${bird.x}px, ${bird.y}px)`,
          animation: `fly ${bird.speed}s ease-in-out infinite`,
          animationDelay: `${bird.delay}s`
        }
      },
        React.createElement('path', { 
          d: 'M-10,-2 Q-5,-8 0,-2 Q5,-8 10,-2', 
          stroke: '#333', 
          strokeWidth: '2', 
          fill: 'none'
        })
      )
    ),
    React.createElement('style', null, `
      @keyframes fly {
        0% { transform: translateX(0) translateY(0); }
        25% { transform: translateX(100px) translateY(-15px); }
        50% { transform: translateX(200px) translateY(0); }
        75% { transform: translateX(100px) translateY(15px); }
        100% { transform: translateX(0) translateY(0); }
      }
    `)
  );
};

const TackleBox = ({ onJettyX, onJettyY }) => {
  return React.createElement('g', { transform: `translate(${onJettyX - 100}, ${onJettyY + 12})` },
    React.createElement('rect', { x: '0', y: '0', width: '35', height: '22', fill: '#4a4a4a', rx: '2' }),
    React.createElement('rect', { x: '0', y: '0', width: '35', height: '10', fill: '#666', rx: '2' }),
    React.createElement('path', { d: 'M10,0 Q17.5,-4 25,0', stroke: '#888', strokeWidth: '2', fill: 'none' }),
    React.createElement('rect', { x: '4', y: '13', width: '7', height: '7', fill: '#e67e22', rx: '1' }),
    React.createElement('rect', { x: '14', y: '13', width: '7', height: '7', fill: '#27ae60', rx: '1' }),
    React.createElement('rect', { x: '24', y: '13', width: '7', height: '7', fill: '#3498db', rx: '1' }),
    React.createElement('circle', { cx: '17.5', cy: '5', r: '1.5', fill: '#ffd700' })
  );
};

const Fisherman = ({ onJettyX, onJettyY }) => {
  const [state, setState] = useState('idle');

  useEffect(() => {
    const loop = setInterval(() => {
      const roll = Math.random();
      if (roll > 0.85) setState('fishing_jerk');
      else if (roll > 0.65) setState('drinking');
      else if (roll > 0.55) setState('smoking');
      else setState('idle');
    }, 4000);
    return () => clearInterval(loop);
  }, []);

  useEffect(() => {
    if (state !== 'idle') {
      const timer = setTimeout(() => setState('idle'), 2500); 
      return () => clearTimeout(timer);
    }
  }, [state]);

  const isJerk = state === 'fishing_jerk';
  const isDrinking = state === 'drinking';
  const isSmoking = state === 'smoking';

  return React.createElement('g', { transform: `translate(${onJettyX + 15}, ${onJettyY}) scale(3.0)` },
    isJerk && React.createElement('g', { transform: 'translate(-65, 35) scale(1.2, 0.3)' },
      React.createElement('circle', { r: '10', stroke: 'white', strokeWidth: '0.5', fill: 'none', opacity: '0.8' },
        React.createElement('animate', { attributeName: 'r', values: '5;30', dur: '1s', repeatCount: 'indefinite' }),
        React.createElement('animate', { attributeName: 'opacity', values: '0.8;0', dur: '1s', repeatCount: 'indefinite' })
      )
    ),
    React.createElement('g', null,
      React.createElement('g', { transform: 'translate(1, -1)' },
        React.createElement('path', { d: 'M0,0 L-14,0', stroke: '#263238', strokeWidth: '7', strokeLinecap: 'round' }),
        React.createElement('g', { className: 'leg-swing-offset' },
          React.createElement('path', { d: 'M-14,0 L-14,16', stroke: '#263238', strokeWidth: '7', strokeLinecap: 'round' }),
          React.createElement('path', { d: 'M-14,16 L-18,18', stroke: '#212121', strokeWidth: '5', strokeLinecap: 'round' })
        )
      ),
      React.createElement('g', null,
        React.createElement('path', { d: 'M0,0 L-14,0', stroke: '#37474f', strokeWidth: '7', strokeLinecap: 'round' }),
        React.createElement('g', { className: 'leg-swing', transform: 'translate(-14, 0)' },
          React.createElement('path', { d: 'M0,0 L0,16', stroke: '#37474f', strokeWidth: '7', strokeLinecap: 'round' }),
          React.createElement('path', { d: 'M0,16 L-4,18', stroke: '#333', strokeWidth: '5', strokeLinecap: 'round' })
        )
      ),
      React.createElement('path', { d: 'M2,0 L5,-22', stroke: '#d35400', strokeWidth: '9', strokeLinecap: 'round' }),
      React.createElement('g', { 
        transform: isJerk ? 'translate(5, -24) rotate(-10)' : 'translate(5, -24)',
        style: { transition: 'transform 0.2s' }
      },
        React.createElement('circle', { cx: '0', cy: '-4', r: '7', fill: '#ffccbc' }),
        React.createElement('path', { d: 'M-6,-8 Q0,-18 6,-8', fill: '#455a64' }),
        React.createElement('path', { d: 'M-8,-8 L8,-8', stroke: '#455a64', strokeWidth: '1.5' }),
        React.createElement('circle', { cx: '-5', cy: '-4', r: '0.5', fill: '#333' }),
        React.createElement('path', { d: 'M-7,-2 L-5,-2', stroke: '#333', strokeWidth: '0.5' }),
        isSmoking && React.createElement('g', { transform: 'translate(-7, -1)' },
          React.createElement('line', { x1: '0', y1: '0', x2: '-6', y2: '1', stroke: 'white', strokeWidth: '1' }),
          React.createElement('circle', { cx: '-6.5', cy: '1.1', r: '0.8', fill: 'red' },
            React.createElement('animate', { attributeName: 'opacity', values: '0.5;1;0.5', dur: '0.5s', repeatCount: 'indefinite' })
          ),
          React.createElement('circle', { cx: '-8', cy: '-2', r: '1.5', fill: 'grey', opacity: '0.5' },
            React.createElement('animate', { attributeName: 'cy', values: '-2;-10', dur: '1s', repeatCount: 'indefinite' }),
            React.createElement('animate', { attributeName: 'opacity', values: '0.5;0', dur: '1s', repeatCount: 'indefinite' })
          )
        )
      ),
      React.createElement('g', { transform: 'translate(4, -15)' },
        React.createElement('g', { 
          transform: isJerk ? 'rotate(-10)' : 'rotate(0)',
          style: { transition: 'transform 0.1s' }
        },
          React.createElement('path', { d: 'M0,0 L-8,5', stroke: '#d35400', strokeWidth: '5', strokeLinecap: 'round' }),
          React.createElement('path', { d: 'M-8,5 L-15,2', stroke: '#d35400', strokeWidth: '5', strokeLinecap: 'round' }),
          React.createElement('line', { x1: '-12', y1: '2', x2: '-18', y2: '0', stroke: '#3e2723', strokeWidth: '2' }),
          React.createElement('line', { x1: '-18', y1: '0', x2: '-65', y2: '-15', stroke: '#5d4037', strokeWidth: '1.5' }),
          React.createElement('circle', { cx: '-22', cy: '-2', r: '1.5', fill: '#9e9e9e' }),
          React.createElement('path', { 
            d: isJerk ? 'M-65,-15 L-65,35' : 'M-65,-15 Q-65,15 -60,30',
            stroke: 'white',
            strokeWidth: '0.3',
            fill: 'none',
            opacity: '0.6'
          })
        )
      ),
      React.createElement('g', { transform: 'translate(5, -15)' },
        isDrinking ? React.createElement('g', { className: 'arm-drink' },
          React.createElement('path', { d: 'M0,0 L2,4', stroke: '#e67e22', strokeWidth: '4.5', strokeLinecap: 'round' }),
          React.createElement('path', { d: 'M2,4 L-4,-6', stroke: '#e67e22', strokeWidth: '4.5', strokeLinecap: 'round' }),
          React.createElement('g', { transform: 'translate(-6, -8) rotate(-20)' },
            React.createElement('rect', { width: '4', height: '6', fill: '#f44336', rx: '1' }),
            React.createElement('rect', { width: '4', height: '1', fill: '#bdbdbd', y: '0' })
          )
        ) : React.createElement('g', null,
          React.createElement('path', { d: 'M0,0 L2,10', stroke: '#e67e22', strokeWidth: '4.5', strokeLinecap: 'round' })
        )
      )
    ),
    React.createElement('style', null, `
      .leg-swing { animation: swing 3s ease-in-out infinite; transform-origin: 0 0; }
      .leg-swing-offset { animation: swing 3s ease-in-out infinite; animation-delay: 0.5s; transform-origin: -14px 0; }
      @keyframes swing { 0% { transform: rotate(-10deg); } 50% { transform: rotate(20deg); } 100% { transform: rotate(-10deg); } }
      .arm-drink { animation: drink-move 2.5s ease-in-out forwards; transform-origin: 0 0; }
      @keyframes drink-move { 
        0% { transform: rotate(0deg); }
        30% { transform: rotate(-10deg); }
        50% { transform: rotate(-15deg); }
        70% { transform: rotate(-10deg); }
        100% { transform: rotate(0deg); }
      }
    `)
  );
};

const LandscapeBackground = ({ landscapeType, waterY }) => {
  switch(landscapeType) {
    case 'beach':
      return React.createElement('g', null,
        React.createElement('path', { d: 'M0,400 L0,200 L250,120 L500,220 L800,140 L1200,240 L1600,160 L2000,180 L2000,400 Z', fill: '#8e7cc3', opacity: '0.3' }),
        React.createElement('path', { d: `M0,${waterY} L0,400 L2000,400 L2000,${waterY + 35} Q1600,${waterY + 42} 1200,${waterY + 38} Q800,${waterY + 35} 400,${waterY + 42} Q200,${waterY + 38} 0,${waterY} Z`, fill: '#f4d03f' }),
        React.createElement('path', { d: `M0,${waterY + 25} Q400,${waterY + 32} 800,${waterY + 28} Q1200,${waterY + 25} 1600,${waterY + 30} L2000,${waterY + 32} L2000,400 L0,400 Z`, fill: '#f39c12', opacity: '0.3' })
      );
    
    case 'river':
      return React.createElement('g', null,
        React.createElement('path', { d: 'M0,400 L0,180 Q200,150 400,170 Q600,180 800,160 Q1000,175 1200,165 Q1400,155 1600,175 Q1800,160 2000,180 L2000,400 Z', fill: '#27ae60', opacity: '0.4' }),
        React.createElement('path', { d: `M1700,${waterY - 15} L2000,${waterY} L2000,400 L1700,400 Q1800,${waterY + 80} 1900,${waterY + 50} Z`, fill: '#2ecc71' }),
        React.createElement('path', { d: `M1600,${waterY + 8} L1700,${waterY - 15} Q1800,${waterY + 15} 1900,${waterY + 50} L2000,400 L1600,400 Z`, fill: '#27ae60' }),
        Array.from({ length: 30 }).map((_, i) => 
          React.createElement('line', { 
            key: i, 
            x1: 1700 + i * 10, 
            y1: waterY + 15 + Math.random() * 35, 
            x2: 1700 + i * 10, 
            y2: waterY + 25 + Math.random() * 45, 
            stroke: '#229954', 
            strokeWidth: '2', 
            opacity: '0.6'
          })
        )
      );
    
    case 'estuary':
      return React.createElement('g', null,
        React.createElement('path', { d: 'M0,400 L0,200 L400,160 L800,210 L1200,180 L1600,220 L2000,190 L2000,400 Z', fill: '#7d6608', opacity: '0.4' }),
        React.createElement('path', { d: `M1700,${waterY} L2000,${waterY + 15} L2000,400 L1700,400 Q1800,${waterY + 65} 1900,${waterY + 40} Z`, fill: '#a98' }),
        Array.from({ length: 25 }).map((_, i) => 
          React.createElement('g', { 
            key: i, 
            transform: `translate(${1720 + i * 12}, ${waterY + 25 + Math.random() * 25})`
          },
            React.createElement('line', { x1: '0', y1: '0', x2: '0', y2: -35 - Math.random() * 15, stroke: '#8b7355', strokeWidth: '1.5' }),
            React.createElement('circle', { cx: '0', cy: -40 - Math.random() * 15, r: '2', fill: '#d4a574' })
          )
        )
      );
    
    case 'breakwater':
      return React.createElement('g', null,
        React.createElement('path', { d: 'M0,400 L0,220 L500,190 L1000,230 L1500,200 L2000,210 L2000,400 Z', fill: '#566573', opacity: '0.5' }),
        React.createElement('g', null,
          Array.from({ length: 12 }).map((_, i) => {
            const x = 1700 + (i % 4) * 25 - Math.random() * 12;
            const y = waterY + 15 + Math.floor(i / 4) * 20;
            const size = 18 + Math.random() * 12;
            return React.createElement('ellipse', { 
              key: i, 
              cx: x, 
              cy: y, 
              rx: size, 
              ry: size * 0.8, 
              fill: i % 2 === 0 ? '#5d6d7e' : '#797d7f',
              stroke: '#34495e',
              strokeWidth: '1'
            });
          }),
          React.createElement('path', { d: `M1730,${waterY + 40} L1800,${waterY + 32} L1870,${waterY + 44} L2000,${waterY + 40} L2000,400 L1730,400 Z`, fill: '#4d5656' })
        )
      );
    
    case 'lake':
      return React.createElement('g', null,
        React.createElement('path', { d: 'M0,400 L0,140 L200,110 L400,125 L600,100 L800,120 L1000,95 L1200,115 L1400,90 L1600,108 L1800,85 L2000,100 L2000,400 Z', fill: '#5f6a6a', opacity: '0.4' }),
        React.createElement('path', { d: 'M0,160 L200,130 L400,145 L600,125 L800,140 L1000,120 L1200,135 L1400,115 L1600,128 L1800,110 L2000,125 L2000,400 L0,400 Z', fill: '#27ae60', opacity: '0.3' }),
        React.createElement('path', { d: `M1700,${waterY - 8} L2000,${waterY + 8} L2000,400 L1700,400 Z`, fill: '#52be80' }),
        React.createElement('path', { d: `M1750,${waterY + 8} Q1850,${waterY + 25} 1920,${waterY + 15} T2000,${waterY + 32} L2000,400 L1750,400 Z`, fill: '#45b39d' })
      );
    
    default:
      return null;
  }
};

const Landscape = ({ data, tideStats, landscapeType = 'beach' }) => {
  const { tide, windSpeed, windDir, rain, clouds, moonPhase, time } = data;
  const isStormy = rain > 60 || clouds > 90;
  const waterY = 320 - (tide * 0.8); 

  return React.createElement('svg', { 
    viewBox: '0 0 2000 400', 
    className: 'w-full h-full rounded-lg shadow-2xl bg-gray-900 overflow-hidden',
    preserveAspectRatio: 'xMidYMid slice',
    style: { width: '100%', height: '100%' }
  },
    React.createElement(SkyGradient, { timeOfDay: time, cloudCover: clouds, isStormy: isStormy }),
    React.createElement('rect', { width: '100%', height: '100%', fill: 'url(#skyGradient)' }),
    React.createElement(Moon, { phase: moonPhase, timeOfDay: time, cloudCover: clouds }),
    React.createElement(LandscapeBackground, { landscapeType: landscapeType, waterY: waterY }),
    React.createElement(Clouds, { cover: clouds, windSpeed: windSpeed, windDir: windDir }),
    React.createElement(Birds, { landscapeType: landscapeType, timeOfDay: time }),
    React.createElement(Water, { tideLevel: tide, windSpeed: windSpeed, landscapeType: landscapeType }),
    React.createElement('g', { transform: 'translate(0, 5)' },
      React.createElement('rect', { x: '1450', y: '280', width: '10', height: '140', fill: '#5d4037' }),
      React.createElement('rect', { x: '1750', y: '280', width: '10', height: '140', fill: '#5d4037' }),
      React.createElement('g', { transform: 'translate(1600, 280)' },
        React.createElement('rect', { x: '0', y: '0', width: '12', height: '140', fill: '#4e342e' }),
        [...Array(8)].map((_, i) => React.createElement('rect', { key: i, x: '2', y: 15 + (i * 15), width: '8', height: '2', fill: 'white', opacity: '0.5' })),
        React.createElement('g', { transform: `translate(0, ${Math.max(0, waterY - 280)})` },
          tideStats.flow !== 0 && React.createElement('g', null,
            React.createElement('path', { 
              d: tideStats.flow > 0 ? 'M-15,5 L-5,5 M15,5 L25,5' : 'M-5,5 L-15,5 M25,5 L15,5',
              stroke: 'white',
              strokeWidth: '2',
              strokeOpacity: '0.6'
            },
              React.createElement('animate', { attributeName: 'strokeDashoffset', from: '0', to: '10', dur: '1s', repeatCount: 'indefinite' })
            ),
            React.createElement('path', { 
              d: tideStats.flow > 0 ? 'M-5,5 L-8,2 M-5,5 L-8,8' : 'M-15,5 L-12,2 M-15,5 L-12,8',
              stroke: 'white',
              strokeWidth: '2',
              strokeOpacity: '0.8',
              fill: 'none'
            })
          )
        )
      ),
      React.createElement('rect', { x: '1400', y: '288', width: '400', height: '18', fill: '#795548' }),
      React.createElement('rect', { x: '1400', y: '280', width: '400', height: '8', fill: '#8d6e63' }),
      React.createElement(TackleBox, { onJettyX: 1400, onJettyY: 288 }),
      React.createElement(Fisherman, { onJettyX: 1400, onJettyY: 288 })
    ),
    React.createElement(WindIndicator, { speed: windSpeed, direction: windDir }),
    React.createElement(Rain, { intensity: rain, windSpeed: windSpeed, windDir: windDir }),
    isStormy && rain > 80 && React.createElement('rect', { width: '100%', height: '100%', fill: 'white', opacity: '0' },
      React.createElement('animate', { 
        attributeName: 'opacity', 
        values: '0;0;0;0.8;0;0',
        dur: '5s',
        repeatCount: 'indefinite',
        begin: `${Math.random()}s`
      })
    ),
    React.createElement('g', null,
      React.createElement('text', { 
        x: '20', 
        y: '30', 
        fill: 'white', 
        fontFamily: 'monospace', 
        fontSize: '13',
        style: { textShadow: '1px 1px 2px black' }
      }, `TIME: ${Math.floor(time)}:00 | WIND: ${windSpeed}km/h | ${landscapeType.toUpperCase()}`),
      React.createElement('text', { 
        x: '20', 
        y: '50', 
        fill: tideStats.color, 
        fontFamily: 'monospace', 
        fontSize: '13',
        fontWeight: 'bold',
        style: { textShadow: '1px 1px 2px black' }
      }, `TIDE: ${Math.round(tide)}% (${tideStats.status}) ${tideStats.arrow}`)
    )
  );
};

// Global state for animation
let animationRoot = null;
let currentAnimationData = null;

// Initialize the animation with current weather data
function initFishingAnimation() {
  const rootElement = document.getElementById('fishing-animation-root');
  if (!rootElement) return;

  // Sample data - this should be replaced with actual weather data
  currentAnimationData = {
    tide: 50,
    windSpeed: 15,
    windDir: 90,
    rain: 0,
    clouds: 30,
    moonPhase: 0.5,
    time: new Date().getHours()
  };

  const tideStats = {
    status: 'Rising',
    arrow: '↑',
    color: '#32dbae',
    flow: 1
  };

  animationRoot = ReactDOM.createRoot(rootElement);
  animationRoot.render(React.createElement(Landscape, { 
    data: currentAnimationData, 
    tideStats: tideStats,
    landscapeType: 'beach'
  }));
}

// Update animation for a specific time
function updateFishingAnimationTime(timeOfDay, tideHeight) {
  if (!animationRoot || !currentAnimationData) return;
  
  // Update time and tide in animation data
  const updatedData = {
    ...currentAnimationData,
    time: timeOfDay,
    tide: tideHeight || 50
  };
  
  currentAnimationData = updatedData;
  
  // Calculate tide stats
  const tideStats = calculateTideStats(tideHeight, timeOfDay);
  
  // Re-render with updated data
  animationRoot.render(React.createElement(Landscape, { 
    data: updatedData, 
    tideStats: tideStats,
    landscapeType: 'beach'
  }));
}

// Calculate tide statistics
function calculateTideStats(tideHeight, timeOfDay) {
  // Simple tide movement detection based on time of day
  const tidePhase = (timeOfDay / 12) * Math.PI;
  const tideTrend = Math.cos(tidePhase);
  
  if (tideTrend > 0.1) {
    return {
      status: 'Rising',
      arrow: '↑',
      color: '#32dbae',
      flow: 1
    };
  } else if (tideTrend < -0.1) {
    return {
      status: 'Falling',
      arrow: '↓',
      color: '#e74c3c',
      flow: -1
    };
  } else {
    return {
      status: 'Slack',
      arrow: '→',
      color: '#f39c12',
      flow: 0
    };
  }
}

// Update animation with weather data
function updateFishingAnimationData(weatherData, tideData) {
  if (!animationRoot) return;
  
  currentAnimationData = {
    tide: tideData?.heightPercent || 50,
    windSpeed: weatherData?.windSpeed || 15,
    windDir: weatherData?.windDir || 90,
    rain: weatherData?.rain || 0,
    clouds: weatherData?.clouds || 30,
    moonPhase: calculateMoonPhase(),
    time: currentAnimationData?.time || new Date().getHours()
  };
  
  const tideStats = {
    status: tideData?.status || 'Unknown',
    arrow: tideData?.arrow || '→',
    color: tideData?.color || '#32dbae',
    flow: tideData?.flow || 0
  };
  
  animationRoot.render(React.createElement(Landscape, { 
    data: currentAnimationData, 
    tideStats: tideStats,
    landscapeType: 'beach'
  }));
}

// Calculate current moon phase (0-1)
function calculateMoonPhase() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  
  // Simplified moon phase calculation
  const c = Math.floor(365.25 * year);
  const e = Math.floor(30.6 * month);
  const jd = c + e + day - 694039.09;
  const daysSinceNew = jd % 29.53;
  
  return daysSinceNew / 29.53;
}

// Export for use in main app
if (typeof window !== 'undefined') {
  window.Landscape = Landscape;
  window.initFishingAnimation = initFishingAnimation;
  window.updateFishingAnimationTime = updateFishingAnimationTime;
  window.updateFishingAnimationData = updateFishingAnimationData;
}
