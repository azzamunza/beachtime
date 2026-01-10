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
  // Moon visibility: visible at night, semi-visible during twilight
  const isDaytime = timeOfDay >= 6 && timeOfDay < 18;
  const isTwilight = (timeOfDay >= 5 && timeOfDay < 7) || (timeOfDay >= 18 && timeOfDay < 20);
  const baseOpacity = isDaytime ? 0.15 : (isTwilight ? 0.6 : 1);
  const cloudOpacityMod = Math.max(0.3, 1 - (cloudCover / 150)); // Clouds reduce visibility
  const finalOpacity = baseOpacity * cloudOpacityMod;
  
  // Moon moves across the sky from right to left during night (Western Australia, looking north)
  // At sunset (18:00): right side, low
  // At midnight (00:00/24:00): center, high
  // At sunrise (06:00): left side, low
  const nightProgress = timeOfDay < 6 ? (timeOfDay + 6) / 12 : (timeOfDay - 18) / 12; // 0 to 1 across night
  const moonX = 1100 - (nightProgress * 900); // Move from right (1100) to left (200) - adjusted for 1200px viewBox
  const moonY = 80 - (Math.sin(nightProgress * Math.PI) * 40); // Arc up and down
  
  const r = 35;

  // Calculate moon phase shadow path
  const getMoonPath = (phase) => {
    // Phase: 0 = new moon (dark), 0.25 = first quarter, 0.5 = full moon, 0.75 = last quarter, 1 = new moon
    const isLeftShadow = phase < 0.5; 
    const termX = r * Math.cos(phase * 2 * Math.PI);
    return `M ${moonX}, ${moonY - r} 
            A ${r}, ${r} 0 0,${isLeftShadow ? 0 : 1} ${moonX}, ${moonY + r} 
            A ${Math.abs(termX)}, ${r} 0 0,${phase < 0.25 || phase > 0.75 ? (isLeftShadow?1:0) : (isLeftShadow?0:1)} ${moonX}, ${moonY - r}`;
  };

  return React.createElement('g', { 
    className: 'moon-group',
    style: { 
      opacity: finalOpacity, 
      transition: 'opacity 2s ease-in-out'
    }
  },
    // Moon glow
    React.createElement('circle', { cx: moonX, cy: moonY, r: r * 1.5, fill: 'white', opacity: '0.1' }),
    // Moon body
    React.createElement('circle', { cx: moonX, cy: moonY, r: r, fill: '#fdfdff' }),
    // Moon phase shadow
    React.createElement('path', { d: getMoonPath(phase), fill: 'rgba(20,24,30,0.95)' }),
    // Moon crater
    React.createElement('circle', { cx: moonX - 8, cy: moonY - 4, r: 4, fill: 'rgba(200,200,200,0.1)' })
  );
};

const Sun = ({ timeOfDay, cloudCover }) => {
  // Sun is visible during daytime
  const opacity = (timeOfDay >= 6 && timeOfDay <= 18) ? 1 : 0;
  const cloudOpacityMod = Math.max(0.3, 1 - (cloudCover / 100));
  
  // Sun position follows an arc across the sky from RIGHT to LEFT (Western Australia, looking north)
  // At 6am (sunrise): right side, low
  // At 12pm (noon): center, high
  // At 6pm (sunset): left side, low
  const sunProgress = (timeOfDay - 6) / 12; // 0 to 1 from sunrise to sunset
  const cx = 1000 - (sunProgress * 800); // Move from right (1000) to left (200) - adjusted for 1200px viewBox
  const cy = 200 - (Math.sin(sunProgress * Math.PI) * 120); // Arc up and down
  const r = 40;
  
  // Sun color changes from orange at sunrise/sunset to yellow at noon
  const getSunColor = () => {
    if (timeOfDay < 8 || timeOfDay > 17) {
      return '#ff6b35'; // Orange
    } else if (timeOfDay < 10 || timeOfDay > 15) {
      return '#ffa500'; // Orange-yellow
    } else {
      return '#ffd700'; // Golden yellow
    }
  };
  
  return React.createElement('g', { style: { opacity: opacity * cloudOpacityMod, transition: 'opacity 1s' } },
    // Sun glow
    React.createElement('circle', { cx: cx, cy: cy, r: r * 1.8, fill: getSunColor(), opacity: '0.2' }),
    React.createElement('circle', { cx: cx, cy: cy, r: r * 1.4, fill: getSunColor(), opacity: '0.3' }),
    // Sun body
    React.createElement('circle', { cx: cx, cy: cy, r: r, fill: getSunColor() }),
    // Sun rays
    Array.from({ length: 12 }).map((_, i) => {
      const angle = (i / 12) * 2 * Math.PI;
      const x1 = cx + Math.cos(angle) * (r + 5);
      const y1 = cy + Math.sin(angle) * (r + 5);
      const x2 = cx + Math.cos(angle) * (r + 15);
      const y2 = cy + Math.sin(angle) * (r + 15);
      
      return React.createElement('line', {
        key: i,
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2,
        stroke: getSunColor(),
        strokeWidth: '3',
        strokeLinecap: 'round',
        opacity: '0.8'
      });
    })
  );
};

const Clouds = ({ cover, windSpeed, windDir }) => {
  const cloudCount = 6;
  const clouds = useMemo(() => Array.from({ length: cloudCount }).map((_, i) => ({
      id: i,
      x: seededRandom(i) * 1300 - 100,
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
    React.createElement('style', null, '@keyframes float { 0% { transform: translateX(-200px); } 100% { transform: translateX(1400px); } }')
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
      d: `M0,${yPos} Q300,${yPos - waveHeight} 600,${yPos} T1200,${yPos} V400 H0 Z`,
      style: { animation: `wave ${waveSpeed}s linear infinite` }
    }),
    React.createElement('path', { 
      fill: colors.secondary, 
      fillOpacity: '0.8', 
      d: `M0,${yPos + 8} Q300,${yPos + 8 + waveHeight} 600,${yPos + 8} T1200,${yPos + 8} V400 H0 Z`,
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
    id: i, x: Math.random() * 1200, y: Math.random() * 400, len: 8 + Math.random() * 15, speed: 0.5 + Math.random() * 0.5
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
  
  // Position on right side but within visible area (viewBox is 0 0 1200 400)
  const posX = 1050; // Changed to fit in 1200px viewBox
  const posY = 180; // Position it better in the scene

  return React.createElement('g', { className: 'wind-indicator', transform: `translate(${posX}, ${posY})` },
    // Wind sock pole
    React.createElement('rect', { x: '-2', y: '0', width: '4', height: '100', fill: '#5d4037' }),
    // Pole top cap
    React.createElement('circle', { cx: '0', cy: '0', r: '3', fill: '#3e2723' }),
    // Wind sock flag with animation based on wind speed and direction
    React.createElement('g', { 
      className: 'wind-sock',
      transform: `scale(${scaleX}, 1) rotate(${rotation})`,
      style: { transformOrigin: '0 0', transition: 'transform 0.5s ease-out' }
    },
      // Wind sock segments (orange and white stripes)
      React.createElement('path', { d: 'M0,-8 L0,8 L12,6 L12,-6 Z', fill: '#e67e22' }),
      React.createElement('path', { d: 'M12,-6 L12,6 L24,5 L24,-5 Z', fill: '#ecf0f1' }),
      React.createElement('path', { d: 'M24,-5 L24,5 L36,4 L36,-4 Z', fill: '#e67e22' }),
      React.createElement('path', { d: 'M36,-4 L36,4 L48,3 L48,-3 Z', fill: '#ecf0f1' }),
      React.createElement('path', { d: 'M48,-3 L48,3 L72,1 L72,-1 Z', fill: '#e67e22' }),
      // Extra flutter segment for high winds
      speed > 20 && React.createElement('path', { 
        className: 'wind-flutter',
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
    // Wind speed and direction label
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
  const [catchingFish, setCatchingFish] = useState(false);
  const [fishCaught, setFishCaught] = useState(false);
  const [lineEndX, setLineEndX] = useState(-240); // Fishing line enters water at 600px (onJettyX is ~840, so -240 relative)

  useEffect(() => {
    const loop = setInterval(() => {
      // Random chance to start catching a fish
      const roll = Math.random();
      if (roll > 0.92 && !catchingFish) {
        // Start catching sequence
        setCatchingFish(true);
        setState('fishing_bite');
        
        // Sequence: bite (2s) -> reel (3s) -> fling (1s) -> cast (1s) -> back to idle
        setTimeout(() => setState('fishing_reel'), 2000);
        setTimeout(() => setState('fishing_fling'), 5000);
        setTimeout(() => {
          setFishCaught(true);
          setState('fishing_cast');
          setCatchingFish(false);
          // Reset fish caught after animation
          setTimeout(() => setFishCaught(false), 1000);
        }, 6000);
        setTimeout(() => {
          setState('idle');
          setLineEndX(-240); // Reset line to far position
        }, 7000);
      } else if (roll > 0.85 && !catchingFish) {
        setState('fishing_jerk');
      } else if (roll > 0.65 && !catchingFish) {
        setState('drinking');
      } else if (roll > 0.55 && !catchingFish) {
        setState('smoking');
      } else if (!catchingFish) {
        setState('idle');
      }
    }, 4000);
    return () => clearInterval(loop);
  }, [catchingFish]);

  useEffect(() => {
    if (state !== 'idle' && !catchingFish) {
      const timer = setTimeout(() => setState('idle'), 2500); 
      return () => clearTimeout(timer);
    }
  }, [state, catchingFish]);
  
  // Update line position during reeling
  useEffect(() => {
    if (state === 'fishing_reel') {
      const reelInterval = setInterval(() => {
        setLineEndX(prev => Math.min(prev + 5, -60)); // Reel in towards fisherman
      }, 50);
      return () => clearInterval(reelInterval);
    }
  }, [state]);

  const isBite = state === 'fishing_bite';
  const isReel = state === 'fishing_reel';
  const isFling = state === 'fishing_fling';
  const isCast = state === 'fishing_cast';
  const isJerk = state === 'fishing_jerk';
  const isDrinking = state === 'drinking';
  const isSmoking = state === 'smoking';
  
  // Calculate rod rotation based on state
  const getRodRotation = () => {
    if (isFling) return -60; // Fling up high
    if (isCast) return -45; // Cast position
    if (isReel) return -20; // Reel in with slight lift
    if (isBite || isJerk) return -10; // Small jerk
    return 0; // Idle position
  };
  
  // Calculate fish position for catching animation
  const getFishPosition = () => {
    if (isFling) return { x: 50, y: -80 }; // Flying through air towards bucket
    if (isReel) return { x: lineEndX, y: 0 }; // Being reeled in, follows line
    if (isBite) return { x: lineEndX, y: 30 }; // At hook in water
    return null; // No fish visible
  };
  
  // Calculate water splash position (follows line end during reel)
  const getWaterY = () => 320 - onJettyY; // Approximate water surface
  
  const fishPos = getFishPosition();
  
  // Ripple size based on state
  const rippleSize = (isBite || isJerk) ? 'large' : 'small';

  return React.createElement('g', { className: 'fisherman', transform: `translate(${onJettyX + 15}, ${onJettyY}) scale(3.0)` },
    // Continuous ripple effect at line end - always visible
    React.createElement('g', { className: 'water-ripple-continuous', transform: `translate(${lineEndX}, ${getWaterY()}) scale(1.2, 0.3)` },
      // Multiple ripple circles for continuous effect
      React.createElement('circle', { r: '10', stroke: 'white', strokeWidth: '0.5', fill: 'none', opacity: '0.8' },
        React.createElement('animate', { 
          attributeName: 'r', 
          values: rippleSize === 'large' ? '5;40' : '3;20', 
          dur: rippleSize === 'large' ? '0.8s' : '1.2s', 
          repeatCount: 'indefinite' 
        }),
        React.createElement('animate', { attributeName: 'opacity', values: '0.8;0', dur: rippleSize === 'large' ? '0.8s' : '1.2s', repeatCount: 'indefinite' })
      ),
      React.createElement('circle', { r: '10', stroke: 'white', strokeWidth: '0.5', fill: 'none', opacity: '0.6' },
        React.createElement('animate', { 
          attributeName: 'r', 
          values: rippleSize === 'large' ? '5;40' : '3;20', 
          dur: rippleSize === 'large' ? '0.8s' : '1.2s', 
          repeatCount: 'indefinite',
          begin: rippleSize === 'large' ? '0.2s' : '0.3s'
        }),
        React.createElement('animate', { 
          attributeName: 'opacity', 
          values: '0.6;0', 
          dur: rippleSize === 'large' ? '0.8s' : '1.2s', 
          repeatCount: 'indefinite',
          begin: rippleSize === 'large' ? '0.2s' : '0.3s'
        })
      ),
      React.createElement('circle', { r: '10', stroke: 'white', strokeWidth: '0.5', fill: 'none', opacity: '0.4' },
        React.createElement('animate', { 
          attributeName: 'r', 
          values: rippleSize === 'large' ? '5;40' : '3;20', 
          dur: rippleSize === 'large' ? '0.8s' : '1.2s', 
          repeatCount: 'indefinite',
          begin: rippleSize === 'large' ? '0.4s' : '0.6s'
        }),
        React.createElement('animate', { 
          attributeName: 'opacity', 
          values: '0.4;0', 
          dur: rippleSize === 'large' ? '0.8s' : '1.2s', 
          repeatCount: 'indefinite',
          begin: rippleSize === 'large' ? '0.4s' : '0.6s'
        })
      )
    ),
    
    // Splash effect during fling
    isFling && React.createElement('g', { className: 'splash-fling', transform: `translate(${lineEndX}, ${getWaterY()})` },
      [...Array(8)].map((_, i) => 
        React.createElement('line', {
          key: i,
          x1: 0,
          y1: 0,
          x2: Math.cos(i * Math.PI / 4 - Math.PI/2) * 20,
          y2: Math.sin(i * Math.PI / 4 - Math.PI/2) * 25,
          stroke: '#3498db',
          strokeWidth: 2,
          opacity: 0
        },
          React.createElement('animate', {
            attributeName: 'opacity',
            values: '0;1;0',
            dur: '0.6s',
            begin: '0s'
          })
        )
      )
    ),
    
    // Caught fish flying through air (during fling)
    fishPos && React.createElement('g', { 
      className: 'caught-fish',
      transform: `translate(${fishPos.x}, ${fishPos.y}) rotate(${isFling ? -45 : 0})`,
      style: { transition: 'all 0.5s ease-out' }
    },
      React.createElement('ellipse', { cx: 0, cy: 0, rx: 8, ry: 5, fill: '#34495e', opacity: 0.9 }),
      React.createElement('path', { d: 'M-8,0 L-12,-4 L-12,4 Z', fill: '#34495e', opacity: 0.9 }),
      React.createElement('circle', { cx: 4, cy: -1, r: 1.5, fill: 'white' })
    ),
    
    // Splash effect when fish lands in bucket
    fishCaught && React.createElement('g', { className: 'splash', transform: 'translate(60, 0)' },
      [...Array(6)].map((_, i) => 
        React.createElement('line', {
          key: i,
          x1: 0,
          y1: 0,
          x2: Math.cos(i * Math.PI / 3) * 15,
          y2: Math.sin(i * Math.PI / 3) * 15,
          stroke: '#3498db',
          strokeWidth: 2,
          opacity: 0
        },
          React.createElement('animate', {
            attributeName: 'opacity',
            values: '0;0.8;0',
            dur: '0.5s',
            begin: '0s'
          })
        )
      )
    ),
    
    // Fisherman body
    React.createElement('g', { className: 'fisherman-body' },
      // Legs
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
      
      // Torso
      React.createElement('path', { d: 'M2,0 L5,-22', stroke: '#d35400', strokeWidth: '9', strokeLinecap: 'round' }),
      
      // Head
      React.createElement('g', { 
        className: 'fisherman-head',
        transform: (isBite || isJerk) ? 'translate(5, -24) rotate(-10)' : 'translate(5, -24)',
        style: { transition: 'transform 0.2s' }
      },
        React.createElement('circle', { cx: '0', cy: '-4', r: '7', fill: '#ffccbc' }),
        React.createElement('path', { d: 'M-6,-8 Q0,-18 6,-8', fill: '#455a64' }),
        React.createElement('path', { d: 'M-8,-8 L8,-8', stroke: '#455a64', strokeWidth: '1.5' }),
        React.createElement('circle', { cx: '-5', cy: '-4', r: '0.5', fill: '#333' }),
        React.createElement('path', { d: 'M-7,-2 L-5,-2', stroke: '#333', strokeWidth: '0.5' }),
        
        // Cigarette when smoking
        isSmoking && React.createElement('g', { className: 'cigarette', transform: 'translate(-7, -1)' },
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
      
      // Fishing rod arm
      React.createElement('g', { className: 'fishing-arm', transform: 'translate(4, -15)' },
        React.createElement('g', { 
          className: 'rod-group',
          transform: `rotate(${getRodRotation()})`,
          style: { transformOrigin: '0 0', transition: 'transform 0.3s ease-out' }
        },
          React.createElement('path', { d: 'M0,0 L-8,5', stroke: '#d35400', strokeWidth: '5', strokeLinecap: 'round' }),
          React.createElement('path', { d: 'M-8,5 L-15,2', stroke: '#d35400', strokeWidth: '5', strokeLinecap: 'round' }),
          // Fishing rod
          React.createElement('line', { x1: '-12', y1: '2', x2: '-18', y2: '0', stroke: '#3e2723', strokeWidth: '2' }),
          React.createElement('line', { x1: '-18', y1: '0', x2: '-32', y2: '-8', stroke: '#5d4037', strokeWidth: '1.5' }),
          // Reel
          React.createElement('circle', { cx: '-22', cy: '-2', r: '1.5', fill: '#9e9e9e' }),
          // Fishing line - now extends to lineEndX (which changes during reel)
          React.createElement('path', { 
            className: 'fishing-line',
            d: (isBite || isJerk || isReel) ? 
              `M-32,-8 L${lineEndX},${getWaterY()}` : 
              `M-32,-8 Q${lineEndX/2},${getWaterY()/2} ${lineEndX},${getWaterY()}`,
            stroke: 'white',
            strokeWidth: '0.3',
            fill: 'none',
            opacity: '0.6',
            style: { transition: 'all 0.1s linear' }
          }),
          // Fishing lure at end of line
          !isFling && React.createElement('g', { 
            className: 'fishing-lure', 
            transform: `translate(${lineEndX}, ${getWaterY()})`,
            style: { transition: 'all 0.1s linear' }
          },
            // Lure body
            React.createElement('ellipse', { cx: 0, cy: 0, rx: 3, ry: 1.5, fill: '#e74c3c' }),
            React.createElement('ellipse', { cx: 1, cy: 0, rx: 1.5, ry: 1, fill: '#c0392b' }),
            // Lure hook
            React.createElement('path', { d: 'M-2,0 Q-3,2 -2.5,3 L-3,3.5', stroke: '#888', strokeWidth: '0.3', fill: 'none' }),
            // Lure shine
            React.createElement('circle', { cx: 0.5, cy: -0.5, r: 0.5, fill: 'white', opacity: 0.6 })
          )
        )
      ),
      
      // Other arm (drinking or idle)
      React.createElement('g', { className: 'other-arm', transform: 'translate(5, -15)' },
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
    
    // Animation styles
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

// Tide Height Markers Component
const TideHeightMarkers = ({ tideLevel, waterY }) => {
  const markerX = 100;
  const maxHeight = 320; // Bottom of view
  const minHeight = 200; // Top water level
  
  // Create 5 markers from 0% to 100%
  const markers = [0, 25, 50, 75, 100];
  
  return React.createElement('g', null,
    // Tide pole
    React.createElement('line', {
      x1: markerX,
      y1: minHeight,
      x2: markerX,
      y2: maxHeight,
      stroke: '#5d4037',
      strokeWidth: '4'
    }),
    // Markers
    markers.map((percent) => {
      const y = maxHeight - ((maxHeight - minHeight) * (percent / 100));
      const isCurrentLevel = Math.abs(percent - tideLevel) < 10;
      
      return React.createElement('g', { key: percent },
        React.createElement('line', {
          x1: markerX - 10,
          y1: y,
          x2: markerX + 10,
          y2: y,
          stroke: isCurrentLevel ? '#e74c3c' : 'white',
          strokeWidth: isCurrentLevel ? '3' : '2'
        }),
        React.createElement('text', {
          x: markerX - 20,
          y: y + 5,
          textAnchor: 'end',
          fill: isCurrentLevel ? '#e74c3c' : 'white',
          fontSize: isCurrentLevel ? '14' : '12',
          fontWeight: isCurrentLevel ? 'bold' : 'normal',
          style: { textShadow: '1px 1px 2px black' }
        }, `${percent}%`)
      );
    }),
    // Current water level indicator
    React.createElement('circle', {
      cx: markerX,
      cy: waterY,
      r: '8',
      fill: '#e74c3c',
      stroke: 'white',
      strokeWidth: '2'
    })
  );
};

// Marine Life Component - Fish swimming above water
const MarineLife = ({ tideLevel, timeOfDay, waterY }) => {
  const { useState, useEffect, useMemo } = React;
  
  // Determine which species to show based on conditions
  // Fish should remain visible based on time and tide, not disappear
  const getActiveSpecies = () => {
    const species = [];
    
    // Show different species based on time of day, but always show some fish
    // Tailor - active during incoming/high tide, dawn/dusk
    if (tideLevel > 40 || (timeOfDay < 8 || timeOfDay > 17)) {
      species.push({ type: 'tailor', count: 3 });
    }
    
    // Squid - active at night during high tide
    if (tideLevel > 50 || (timeOfDay < 6 || timeOfDay > 20)) {
      species.push({ type: 'squid', count: 2 });
    }
    
    // Whiting - active during incoming tide, daytime
    if (tideLevel > 30 || (timeOfDay > 6 && timeOfDay < 18)) {
      species.push({ type: 'whiting', count: 4 });
    }
    
    // Bream - active year-round, any tide (always visible)
    species.push({ type: 'bream', count: 3 });
    
    // Flathead - active on outgoing tide
    if (tideLevel < 60 || (timeOfDay > 7 && timeOfDay < 19)) {
      species.push({ type: 'flathead', count: 2 });
    }
    
    // Always ensure at least one species is shown
    if (species.length === 0) {
      species.push({ type: 'bream', count: 2 });
    }
    
    return species;
  };
  
  const activeSpecies = useMemo(getActiveSpecies, [tideLevel, timeOfDay]);
  
  // Generate fish positions - fish should swim just below or at the water surface
  const generateFish = (species, count, index) => {
    // Position fish at or just below water surface (not in the sky)
    const baseY = waterY + 15 + (index * 8); // Below water surface
    const fishes = [];
    
    for (let i = 0; i < count; i++) {
      const x = 200 + (i * 180) + (index * 50);
      const swimDepth = Math.sin((i * 2 + index) * 0.5) * 10; // Fish swim at various depths
      fishes.push({
        id: `${species}-${i}`,
        type: species,
        x: x,
        y: baseY + swimDepth,
        size: species === 'squid' ? 20 : (species === 'flathead' ? 28 : 18),
        swimDelay: i * 0.7 + index * 0.3
      });
    }
    
    return fishes;
  };
  
  const allFish = [];
  activeSpecies.forEach((spec, idx) => {
    allFish.push(...generateFish(spec.type, spec.count, idx));
  });
  
  return React.createElement('g', { className: 'marine-life-group', opacity: 0.9 },
    allFish.map(fish => 
      React.createElement('g', { 
        key: fish.id,
        className: `fish fish-${fish.type}`,
        transform: `translate(${fish.x}, ${fish.y})`,
        style: { 
          animation: `swimHorizontal 8s ease-in-out infinite, swimVertical 3s ease-in-out infinite`,
          animationDelay: `${fish.swimDelay}s`
        }
      },
        // Fish body silhouette
        React.createElement('ellipse', {
          cx: 0,
          cy: 0,
          rx: fish.size,
          ry: fish.size * 0.6,
          fill: fish.type === 'squid' ? '#8e44ad' : (fish.type === 'tailor' ? '#2c3e50' : '#34495e'),
          opacity: 0.85,
          stroke: 'rgba(255,255,255,0.3)',
          strokeWidth: '1'
        }),
        // Tail fin
        React.createElement('path', {
          d: `M ${-fish.size},0 L ${-fish.size - 8},-6 L ${-fish.size - 8},6 Z`,
          fill: fish.type === 'squid' ? '#8e44ad' : '#34495e',
          opacity: 0.85
        }),
        // Dorsal fin (top)
        React.createElement('path', {
          d: `M ${-fish.size * 0.3},${-fish.size * 0.6} L ${-fish.size * 0.3 + 5},${-fish.size * 0.9} L ${fish.size * 0.2},${-fish.size * 0.6} Z`,
          fill: fish.type === 'squid' ? '#9b59b6' : '#45566e',
          opacity: 0.7
        }),
        // Eye
        React.createElement('circle', {
          cx: fish.size * 0.5,
          cy: -fish.size * 0.2,
          r: 2.5,
          fill: 'white'
        }),
        React.createElement('circle', {
          cx: fish.size * 0.5 + 0.5,
          cy: -fish.size * 0.2,
          r: 1,
          fill: '#222'
        })
      )
    ),
    // Swimming animation keyframes - ensure continuous looping
    React.createElement('style', null, `
      @keyframes swimHorizontal {
        0% { transform: translateX(0) scaleX(1); }
        25% { transform: translateX(50px) scaleX(1); }
        50% { transform: translateX(100px) scaleX(-1); }
        75% { transform: translateX(50px) scaleX(-1); }
        100% { transform: translateX(0) scaleX(1); }
      }
      @keyframes swimVertical {
        0% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0); }
      }
    `)
  );
};

// Underwater Environment Component  
const UnderwaterView = ({ waterY, tideLevel }) => {
  return React.createElement('g', null,
    // Water column with gradient
    React.createElement('defs', null,
      React.createElement('linearGradient', { id: 'underwaterGradient', x1: '0%', y1: '0%', x2: '0%', y2: '100%' },
        React.createElement('stop', { offset: '0%', stopColor: '#3498db', stopOpacity: '0.3' }),
        React.createElement('stop', { offset: '100%', stopColor: '#1abc9c', stopOpacity: '0.6' })
      )
    ),
    
    // Underwater zone
    React.createElement('rect', {
      x: 0,
      y: waterY,
      width: 1200,
      height: 400 - waterY,
      fill: 'url(#underwaterGradient)'
    }),
    
    // Seaweed/kelp
    Array.from({ length: 12 }).map((_, i) => {
      const x = 200 + (i * 150);
      const height = 30 + Math.random() * 40;
      return React.createElement('g', { key: i, transform: `translate(${x}, 370)` },
        React.createElement('path', {
          d: `M0,0 Q ${5 + Math.random() * 5},-${height/3} 0,-${height/2} Q ${-5 - Math.random() * 5},-${2*height/3} 0,-${height}`,
          stroke: '#27ae60',
          strokeWidth: 3,
          fill: 'none',
          opacity: 0.6,
          style: { 
            animation: `sway ${2 + Math.random()}s ease-in-out infinite`,
            animationDelay: `${Math.random()}s`
          }
        })
      );
    }),
    
    React.createElement('style', null, `
      @keyframes sway {
        0%, 100% { transform: rotate(0deg); }
        50% { transform: rotate(5deg); }
      }
    `)
  );
};

const LandscapeBackground = ({ landscapeType, waterY }) => {
  switch(landscapeType) {
    case 'beach':
      return React.createElement('g', null,
        React.createElement('path', { d: 'M0,400 L0,200 L150,120 L300,220 L480,140 L720,240 L960,160 L1200,180 L1200,400 Z', fill: '#8e7cc3', opacity: '0.3' }),
        React.createElement('path', { d: `M0,${waterY} L0,400 L1200,400 L1200,${waterY + 35} Q960,${waterY + 42} 720,${waterY + 38} Q480,${waterY + 35} 240,${waterY + 42} Q120,${waterY + 38} 0,${waterY} Z`, fill: '#f4d03f' }),
        React.createElement('path', { d: `M0,${waterY + 25} Q240,${waterY + 32} 480,${waterY + 28} Q720,${waterY + 25} 960,${waterY + 30} L1200,${waterY + 32} L1200,400 L0,400 Z`, fill: '#f39c12', opacity: '0.3' })
      );
    
    case 'river':
      return React.createElement('g', null,
        React.createElement('path', { d: 'M0,400 L0,180 Q120,150 240,170 Q360,180 480,160 Q600,175 720,165 Q840,155 960,175 Q1080,160 1200,180 L1200,400 Z', fill: '#27ae60', opacity: '0.4' }),
        React.createElement('path', { d: `M1020,${waterY - 15} L1200,${waterY} L1200,400 L1020,400 Q1080,${waterY + 80} 1140,${waterY + 50} Z`, fill: '#2ecc71' }),
        React.createElement('path', { d: `M960,${waterY + 8} L1020,${waterY - 15} Q1080,${waterY + 15} 1140,${waterY + 50} L1200,400 L960,400 Z`, fill: '#27ae60' }),
        Array.from({ length: 18 }).map((_, i) => 
          React.createElement('line', { 
            key: i, 
            x1: 1020 + i * 10, 
            y1: waterY + 15 + Math.random() * 35, 
            x2: 1020 + i * 10, 
            y2: waterY + 25 + Math.random() * 45, 
            stroke: '#229954', 
            strokeWidth: '2', 
            opacity: '0.6'
          })
        )
      );
    
    case 'estuary':
      return React.createElement('g', null,
        React.createElement('path', { d: 'M0,400 L0,200 L240,160 L480,210 L720,180 L960,220 L1200,190 L1200,400 Z', fill: '#7d6608', opacity: '0.4' }),
        React.createElement('path', { d: `M1020,${waterY} L1200,${waterY + 15} L1200,400 L1020,400 Q1080,${waterY + 65} 1140,${waterY + 40} Z`, fill: '#a98' }),
        Array.from({ length: 15 }).map((_, i) => 
          React.createElement('g', { 
            key: i, 
            transform: `translate(${1032 + i * 12}, ${waterY + 25 + Math.random() * 25})`
          },
            React.createElement('line', { x1: '0', y1: '0', x2: '0', y2: -35 - Math.random() * 15, stroke: '#8b7355', strokeWidth: '1.5' }),
            React.createElement('circle', { cx: '0', cy: -40 - Math.random() * 15, r: '2', fill: '#d4a574' })
          )
        )
      );
    
    case 'breakwater':
      return React.createElement('g', null,
        React.createElement('path', { d: 'M0,400 L0,220 L300,190 L600,230 L900,200 L1200,210 L1200,400 Z', fill: '#566573', opacity: '0.5' }),
        React.createElement('g', null,
          Array.from({ length: 12 }).map((_, i) => {
            const x = 1020 + (i % 4) * 25 - Math.random() * 12;
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
          React.createElement('path', { d: `M1038,${waterY + 40} L1080,${waterY + 32} L1122,${waterY + 44} L1200,${waterY + 40} L1200,400 L1038,400 Z`, fill: '#4d5656' })
        )
      );
    
    case 'lake':
      return React.createElement('g', null,
        React.createElement('path', { d: 'M0,400 L0,140 L120,110 L240,125 L360,100 L480,120 L600,95 L720,115 L840,90 L960,108 L1080,85 L1200,100 L1200,400 Z', fill: '#5f6a6a', opacity: '0.4' }),
        React.createElement('path', { d: 'M0,160 L120,130 L240,145 L360,125 L480,140 L600,120 L720,135 L840,115 L960,128 L1080,110 L1200,125 L1200,400 L0,400 Z', fill: '#27ae60', opacity: '0.3' }),
        React.createElement('path', { d: `M1020,${waterY - 8} L1200,${waterY + 8} L1200,400 L1020,400 Z`, fill: '#52be80' }),
        React.createElement('path', { d: `M1050,${waterY + 8} Q1110,${waterY + 25} 1152,${waterY + 15} T1200,${waterY + 32} L1200,400 L1050,400 Z`, fill: '#45b39d' })
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
    viewBox: '0 0 1200 400', 
    className: 'w-full h-full rounded-lg shadow-2xl bg-gray-900 overflow-hidden',
    preserveAspectRatio: 'xMidYMid meet',
    style: { width: '100%', height: '100%' }
  },
    // ==============================================
    // SECTION 1: SKY AND ATMOSPHERE
    // ==============================================
    
    // Sky gradient definition
    React.createElement(SkyGradient, { timeOfDay: time, cloudCover: clouds, isStormy: isStormy }),
    
    // Sky background
    React.createElement('rect', { width: '100%', height: '100%', fill: 'url(#skyGradient)' }),
    
    // ==============================================
    // SECTION 2: CELESTIAL BODIES (Sun, Moon, Stars)
    // ==============================================
    
    // Sun (visible during daytime)
    React.createElement(Sun, { timeOfDay: time, cloudCover: clouds }),
    
    // Moon (visible at night, with accurate phase rendering)
    React.createElement(Moon, { phase: moonPhase, timeOfDay: time, cloudCover: clouds }),
    
    // ==============================================
    // SECTION 3: LANDSCAPE AND BACKGROUND
    // ==============================================
    
    // Landscape background (hills, shore, vegetation) - varies by landscape type
    React.createElement(LandscapeBackground, { landscapeType: landscapeType, waterY: waterY }),
    
    // ==============================================
    // SECTION 4: ATMOSPHERIC EFFECTS
    // ==============================================
    
    // Cloud coverage and movement (affected by wind speed and direction)
    React.createElement(Clouds, { cover: clouds, windSpeed: windSpeed, windDir: windDir }),
    
    // Birds flying (daytime only, varies by landscape type)
    React.createElement(Birds, { landscapeType: landscapeType, timeOfDay: time }),
    
    // ==============================================
    // SECTION 5: UNDERWATER ENVIRONMENT
    // ==============================================
    
    // Underwater zone with gradient and kelp/seaweed
    React.createElement(UnderwaterView, { waterY: waterY, tideLevel: tide }),
    
    // ==============================================
    // SECTION 6: WATER SURFACE
    // ==============================================
    
    // Water surface animation (must render before marine life for proper layering)
    React.createElement(Water, { tideLevel: tide, windSpeed: windSpeed, landscapeType: landscapeType }),
    
    // ==============================================
    // SECTION 7: MARINE LIFE (Fish)
    // ==============================================
    
    // Fish swimming (rendered after water for proper z-index, controlled by time and tide)
    React.createElement(MarineLife, { tideLevel: tide, timeOfDay: time, waterY: waterY }),
    
    // ==============================================
    // SECTION 8: TIDE INDICATORS
    // ==============================================
    
    // Tide height markers (left side of scene)
    React.createElement(TideHeightMarkers, { tideLevel: tide, waterY: waterY }),
    
    // ==============================================
    // SECTION 9: JETTY AND FISHERMAN
    // ==============================================
    
    // Jetty structure with fisherman and fishing equipment
    React.createElement('g', { className: 'jetty-group', transform: 'translate(0, 5)' },
      // Left jetty support pillar
      React.createElement('rect', { x: '870', y: '280', width: '10', height: '140', fill: '#5d4037' }),
      // Right jetty support pillar
      React.createElement('rect', { x: '1050', y: '280', width: '10', height: '140', fill: '#5d4037' }),
      // Center jetty pole with tide indicators
      React.createElement('g', { className: 'center-pole', transform: 'translate(960, 280)' },
        React.createElement('rect', { x: '0', y: '0', width: '12', height: '140', fill: '#4e342e' }),
        [...Array(8)].map((_, i) => React.createElement('rect', { key: i, x: '2', y: 15 + (i * 15), width: '8', height: '2', fill: 'white', opacity: '0.5' })),
        React.createElement('g', { className: 'tide-flow-indicator', transform: `translate(0, ${Math.max(0, waterY - 280)})` },
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
      // Jetty deck planking (base layer)
      React.createElement('rect', { className: 'jetty-deck-base', x: '840', y: '288', width: '240', height: '18', fill: '#795548' }),
      // Jetty deck top layer
      React.createElement('rect', { className: 'jetty-deck-top', x: '840', y: '280', width: '240', height: '8', fill: '#8d6e63' }),
      // Tackle box on jetty
      React.createElement(TackleBox, { onJettyX: 960, onJettyY: 288 }),
      // White bucket for caught fish (positioned behind fisherman)
      React.createElement('g', { className: 'fish-bucket', transform: 'translate(1020, 288)' },
        // Bucket body
        React.createElement('ellipse', { cx: '0', cy: '15', rx: '15', ry: '8', fill: '#f0f0f0', stroke: '#ddd', strokeWidth: '2' }),
        React.createElement('rect', { x: '-15', y: '15', width: '30', height: '20', fill: '#f8f8f8' }),
        React.createElement('rect', { x: '-15', y: '15', width: '30', height: '20', fill: 'url(#bucketGradient)' }),
        // Bucket rim
        React.createElement('ellipse', { cx: '0', cy: '35', rx: '16', ry: '8', fill: '#e0e0e0' }),
        // Bucket handle
        React.createElement('path', { d: 'M-12,15 Q0,0 12,15', stroke: '#aaa', strokeWidth: '3', fill: 'none' }),
        // Gradient definition for bucket
        React.createElement('defs', null,
          React.createElement('linearGradient', { id: 'bucketGradient', x1: '0%', y1: '0%', x2: '0%', y2: '100%' },
            React.createElement('stop', { offset: '0%', stopColor: '#ffffff', stopOpacity: '0' }),
            React.createElement('stop', { offset: '100%', stopColor: '#cccccc', stopOpacity: '0.3' })
          )
        )
      ),
      // Fisherman on jetty (includes fishing rod, line, lure, and animations)
      React.createElement(Fisherman, { onJettyX: 840, onJettyY: 288 })
    ),
    
    // ==============================================
    // SECTION 10: WEATHER INDICATORS
    // ==============================================
    
    // Wind indicator (repositioned to be visible on screen)
    React.createElement(WindIndicator, { speed: windSpeed, direction: windDir }),
    
    // Rain effect (visible when precipitation is high)
    React.createElement(Rain, { intensity: rain, windSpeed: windSpeed, windDir: windDir }),
    
    // Lightning flash effect during storms
    isStormy && rain > 80 && React.createElement('rect', { width: '100%', height: '100%', fill: 'white', opacity: '0' },
      React.createElement('animate', { 
        attributeName: 'opacity', 
        values: '0;0;0;0.8;0;0',
        dur: '5s',
        repeatCount: 'indefinite',
        begin: `${Math.random()}s`
      })
    ),
    
    // ==============================================
    // SECTION 11: INFO OVERLAYS
    // ==============================================
    
    // Information display (time, wind, landscape type)
    React.createElement('g', null,
      React.createElement('text', { 
        x: '20', 
        y: '30', 
        fill: 'white', 
        fontFamily: 'monospace', 
        fontSize: '13',
        style: { textShadow: '1px 1px 2px black' }
      }, `TIME: ${Math.floor(time)}:${String(Math.round((time % 1) * 60)).padStart(2, '0')} | WIND: ${windSpeed}km/h | ${landscapeType.toUpperCase()}`),
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

  // Get current location from hidden inputs
  const lat = parseFloat(document.getElementById('latitude-fishing')?.value || -31.9688);
  const lng = parseFloat(document.getElementById('longitude-fishing')?.value || 115.7673);
  const now = new Date();
  
  // Calculate moon phase and position
  const moonData = getMoonPhaseAndPosition(lat, lng, now);

  // Sample data - this should be replaced with actual weather data
  currentAnimationData = {
    tide: 50,
    windSpeed: 15,
    windDir: 90,
    rain: 0,
    clouds: 30,
    moonPhase: moonData.phase,
    time: now.getHours() + now.getMinutes() / 60
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
  
  // Get current location
  const lat = parseFloat(document.getElementById('latitude-fishing')?.value || -31.9688);
  const lng = parseFloat(document.getElementById('longitude-fishing')?.value || 115.7673);
  
  // Create a date object for the selected time
  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  targetDate.setHours(Math.floor(timeOfDay));
  targetDate.setMinutes((timeOfDay % 1) * 60);
  
  // Calculate moon phase for this time
  const moonData = getMoonPhaseAndPosition(lat, lng, targetDate);
  
  // Update time, tide, and moon phase in animation data
  const updatedData = {
    ...currentAnimationData,
    time: timeOfDay,
    tide: tideHeight || 50,
    moonPhase: moonData.phase
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
  
  // Get current location
  const lat = parseFloat(document.getElementById('latitude-fishing')?.value || -31.9688);
  const lng = parseFloat(document.getElementById('longitude-fishing')?.value || 115.7673);
  
  // Get current or default time
  const currentTime = currentAnimationData?.time || new Date().getHours();
  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  targetDate.setHours(Math.floor(currentTime));
  targetDate.setMinutes((currentTime % 1) * 60);
  
  // Calculate moon phase
  const moonData = getMoonPhaseAndPosition(lat, lng, targetDate);
  
  currentAnimationData = {
    tide: tideData?.heightPercent || 50,
    windSpeed: weatherData?.windSpeed || 15,
    windDir: weatherData?.windDir || 90,
    rain: weatherData?.rain || 0,
    clouds: weatherData?.clouds || 30,
    moonPhase: moonData.phase,
    time: currentTime
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

// Calculate current moon phase (0-1) using accurate astronomical calculations
function calculateMoonPhase(date = new Date()) {
  // Use the date provided or current date
  const targetDate = date instanceof Date ? date : new Date(date);
  
  // Known new moon: January 6, 2000, 18:14 UTC
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  const synodicMonth = 29.530588853; // Average length of lunar month in days
  
  // Calculate days since known new moon
  const daysSinceKnownNewMoon = (targetDate.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  
  // Calculate current phase (0-1, where 0 = new moon, 0.5 = full moon)
  const phase = (daysSinceKnownNewMoon % synodicMonth) / synodicMonth;
  
  return phase;
}

// Get moon phase and position for a specific location and time
function getMoonPhaseAndPosition(latitude, longitude, dateTime) {
  const phase = calculateMoonPhase(dateTime);
  
  // Calculate moon position in sky (simplified calculation)
  // Moon rises ~50 minutes later each day
  const date = dateTime instanceof Date ? dateTime : new Date(dateTime);
  const hour = date.getHours() + date.getMinutes() / 60;
  
  // Moon visibility calculation
  const isDaytime = hour >= 6 && hour < 18;
  const isTwilight = (hour >= 5 && hour < 7) || (hour >= 18 && hour < 20);
  
  return {
    phase: phase,
    illumination: phase < 0.5 ? phase * 2 : (1 - phase) * 2, // 0 to 1
    isVisible: !isDaytime || isTwilight,
    timeOfDay: hour
  };
}

// Export for use in main app
if (typeof window !== 'undefined') {
  window.Landscape = Landscape;
  window.initFishingAnimation = initFishingAnimation;
  window.updateFishingAnimationTime = updateFishingAnimationTime;
  window.updateFishingAnimationData = updateFishingAnimationData;
}
