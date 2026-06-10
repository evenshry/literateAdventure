import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LEVELS, getLevelChars, getHanzi } from '@/data/hanziData';
import { useProgressStore } from '@/store/progressStore';
import { ROUTES } from '@/routes';
import type { LevelId } from '@/types/global';

const NODE_SIZE = 56;

interface NodePosition {
  x: number;
  y: number;
}

function generateNodePositions(count: number): NodePosition[] {
  const positions: NodePosition[] = [];
  const spacing = 140;
  const startX = 150;
  const startY = 220;

  for (let i = 0; i < count; i++) {
    const offsetY = (i % 2) * 60;
    const x = startX + i * spacing + (Math.random() - 0.5) * 30;
    const y = startY + offsetY + (Math.random() - 0.5) * 20;
    positions.push({ x, y });
  }
  return positions;
}

function Map() {
  const { level } = useParams();
  const navigate = useNavigate();
  const { data, setLevel } = useProgressStore();

  const levelId: LevelId = (level as LevelId) ?? data.currentLevel;
  const levelInfo = useMemo(() => LEVELS.find((l) => l.id === levelId) ?? LEVELS[0], [levelId]);
  const chars = useMemo(() => getLevelChars(levelId), [levelId]);
  const nodePositions = useMemo(() => generateNodePositions(chars.length), [chars.length]);

  const mapWidth = useMemo(() => {
    if (chars.length === 0) return 1200;
    const maxX = Math.max(...nodePositions.map(p => p.x));
    return Math.max(maxX + 300, 1200);
  }, [nodePositions, chars.length]);

  const currentNodeIndex = useMemo(() => {
    const incompleteIdx = chars.findIndex((h) => !(data.charProgress[h.char]?.completed ?? false));
    return incompleteIdx === -1 ? chars.length - 1 : incompleteIdx;
  }, [chars, data.charProgress]);

  function switchLevel(lid: LevelId) {
    setLevel(lid);
    navigate(`/map/${lid}`);
  }

  const paths = useMemo(() => {
    const pathData: string[] = [];
    for (let i = 0; i < nodePositions.length - 1; i++) {
      const curr = nodePositions[i];
      const next = nodePositions[i + 1];
      const midX = (curr.x + next.x) / 2;
      const midY = (curr.y + next.y) / 2 - 15;
      pathData.push(`M ${curr.x} ${curr.y} Q ${midX} ${midY} ${next.x} ${next.y}`);
    }
    return pathData;
  }, [nodePositions]);

  const treePositions = useMemo(() => {
    const count = Math.max(Math.floor(chars.length / 3), 6);
    const positions = [];
    const spacing = (mapWidth - 200) / (count + 1);
    for (let i = 0; i < count; i++) {
      positions.push({
        x: 100 + spacing * (i + 1),
        y: 490,
        scale: 0.9 + Math.random() * 0.2,
      });
    }
    return positions;
  }, [mapWidth, chars.length]);

  const cloudPositions = useMemo(() => {
    const count = Math.max(Math.floor(chars.length / 4), 5);
    const positions = [];
    const spacing = (mapWidth - 200) / (count + 1);
    for (let i = 0; i < count; i++) {
      positions.push({
        x: 100 + spacing * (i + 1),
        y: 30 + (i % 3) * 30,
        scale: 0.5 + Math.random() * 0.3,
      });
    }
    return positions;
  }, [mapWidth, chars.length]);

  const butterflyPositions = useMemo(() => {
    const count = Math.max(Math.floor(chars.length / 5), 4);
    const positions = [];
    const spacing = (mapWidth - 300) / (count + 1);
    for (let i = 0; i < count; i++) {
      positions.push({
        x: 150 + spacing * (i + 1),
        y: 100 + (i % 3) * 35,
        delay: i * 0.5,
      });
    }
    return positions;
  }, [mapWidth, chars.length]);

  const flowerPositions = useMemo(() => {
    const count = Math.max(chars.length, 10);
    const flowerEmojis = ['🌸', '🌼', '🌷', '🌻', '🌺', '💐', '🌹', '🌺'];
    const positions = [];
    const spacing = (mapWidth - 160) / (count + 1);
    for (let i = 0; i < count; i++) {
      positions.push({
        x: 80 + spacing * (i + 1),
        y: 500,
        emoji: flowerEmojis[i % flowerEmojis.length],
      });
    }
    return positions;
  }, [mapWidth, chars.length]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      paddingBottom: '220px', 
      position: 'relative', 
      overflowX: 'hidden',
      background: '#D4F1F4',
    }}>
      <div style={{
        position: 'fixed',
        top: '60px',
        right: '40px',
        width: '80px',
        height: '80px',
        background: 'radial-gradient(circle, #FFEB3B 0%, #FFC107 40%, #FF9800 100%)',
        borderRadius: '50%',
        boxShadow: '0 0 60px rgba(255,235,59,0.8), 0 0 100px rgba(255,193,7,0.5)',
        zIndex: 100,
        animation: 'sunPulse 4s ease-in-out infinite',
      }}></div>

      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}>
        <button 
          onClick={() => navigate('/')}
          style={{
            background: '#fff',
            border: '2px solid #2d8b57',
            color: '#2d8b57',
            fontSize: '16px',
            padding: '8px 14px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >← 回家</button>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{
            fontFamily: '"ZCOOL KuaiLe", sans-serif',
            fontSize: '28px',
            color: '#1f6b40',
            margin: 0,
            letterSpacing: '3px',
          }}>🌲 {levelInfo.name} 🌲</h2>
          <span style={{ color: '#6b6b6b', fontSize: '14px' }}>{levelInfo.subtitle}</span>
        </div>
        <div style={{
          background: '#fff',
          padding: '8px 14px',
          borderRadius: '999px',
          fontWeight: '600',
          color: '#ff8a3d',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}>⭐ {data.totalStars}</div>
      </header>

      <nav style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        margin: '18px 12px 10px',
        flexWrap: 'wrap',
        position: 'relative',
        zIndex: 5,
      }}>
        {LEVELS.map((lvl) => {
          const locked = data.totalStars < lvl.unlockStars && lvl.id !== 'L1';
          return (
            <button
              key={lvl.id}
              disabled={locked}
              onClick={() => switchLevel(lvl.id)}
              style={{
                padding: '10px 18px',
                background: lvl.id === levelId ? '#2d8b57' : 'rgba(255,255,255,0.9)',
                border: '2px solid transparent',
                borderRadius: '999px',
                fontFamily: '"ZCOOL KuaiLe", sans-serif',
                fontSize: '18px',
                color: lvl.id === levelId ? '#fff' : '#555',
                cursor: locked ? 'not-allowed' : 'pointer',
                opacity: locked ? 0.6 : 1,
                transition: 'all 0.2s',
              }}
            >
              {lvl.name}
              {locked && ' 🔒'}
            </button>
          );
        })}
      </nav>

      <section style={{
        maxWidth: '100%',
        margin: '10px 0 0',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          padding: '0',
          scrollbarWidth: 'auto',
          msOverflowStyle: 'auto',
        }}>
          <div style={{ width: `${mapWidth}px`, height: '580px', position: 'relative' }}>
            <svg 
              width={mapWidth} 
              height={580}
              style={{ cursor: 'pointer', display: 'block' }}
            >
              <defs>
                <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4A90D9" />
                  <stop offset="30%" stopColor="#7EC8E3" />
                  <stop offset="60%" stopColor="#B8E4F0" />
                  <stop offset="100%" stopColor="#D4F1F4" />
                </linearGradient>
                <linearGradient id="grassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#66BB6A" />
                  <stop offset="40%" stopColor="#43A047" />
                  <stop offset="100%" stopColor="#2E7D32" />
                </linearGradient>
                <style>{`
                  @keyframes treeSway {
                    0%, 100% { transform: rotate(-1.5deg); }
                    50% { transform: rotate(1.5deg); }
                  }
                  @keyframes nodePulse {
                    0%, 100% { stroke-width: 4; }
                    50% { stroke-width: 6; }
                  }
                  @keyframes playerFloat {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                  }
                  @keyframes cloudFloat1 {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(15px); }
                  }
                  @keyframes cloudFloat2 {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(-12px); }
                  }
                  @keyframes butterflyFloat {
                    0% { transform: translate(0, 0) rotate(0deg); }
                    25% { transform: translate(15px, -10px) rotate(5deg); }
                    50% { transform: translate(25px, 5px) rotate(-3deg); }
                    75% { transform: translate(10px, 12px) rotate(3deg); }
                    100% { transform: translate(0, 0) rotate(0deg); }
                  }
                  @keyframes sunPulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                  }
                `}</style>
              </defs>

              <rect x="0" y="0" width={mapWidth} height="580" fill="url(#skyGradient)" />

              {cloudPositions.map((cloud, idx) => (
                <g key={`cloud-${idx}`} transform={`translate(${cloud.x}, ${cloud.y}) scale(${cloud.scale})`} style={{ animation: idx % 2 === 0 ? 'cloudFloat1 12s ease-in-out infinite' : 'cloudFloat2 14s ease-in-out infinite', animationDelay: `${idx * 0.3}s` }}>
                  <ellipse cx="80" cy="30" rx="80" ry="30" fill="rgba(255,255,255,0.95)" />
                  <circle cx="40" cy="15" r="35" fill="rgba(255,255,255,0.95)" />
                  <circle cx="85" cy="8" r="40" fill="rgba(255,255,255,0.95)" />
                  <circle cx="125" cy="15" r="32" fill="rgba(255,255,255,0.95)" />
                </g>
              ))}

              {butterflyPositions.map((bt, idx) => (
                <g 
                  key={`butterfly-${idx}`} 
                  transform={`translate(${bt.x}, ${bt.y})`}
                  style={{ animation: `butterflyFloat ${3 + idx * 0.3}s ease-in-out infinite`, animationDelay: `${bt.delay}s` }}
                >
                  <text fontSize="24">🦋</text>
                </g>
              ))}

              <path 
                d={`M 0 450 Q ${mapWidth / 4} 400 ${mapWidth / 2} 440 Q ${(mapWidth * 3) / 4} 480 ${mapWidth} 430 L ${mapWidth} 580 L 0 580 Z`} 
                fill="url(#grassGradient)"
              />

              {treePositions.map((tree, idx) => (
                <g key={`tree-${idx}`} transform={`translate(${tree.x}, ${tree.y}) scale(${tree.scale})`} style={{ animation: 'treeSway 4s ease-in-out infinite', animationDelay: `${idx * 0.2}s` }}>
                  <rect x="-12" y="20" width="24" height="50" fill="#5D4037" rx="2" />
                  <polygon points="0,-55 35,20 -35,20" fill="#2E7D32" />
                  <polygon points="0,-35 28,5 -28,5" fill="#388E3C" />
                  <polygon points="0,-18 18,12 -18,12" fill="#43A047" />
                </g>
              ))}

              {flowerPositions.map((flower, idx) => (
                <text 
                  key={`flower-${idx}`} 
                  x={flower.x} 
                  y={flower.y} 
                  fontSize="26"
                >{flower.emoji}</text>
              ))}

              {paths.map((path, idx) => (
                <path
                  key={idx}
                  d={path}
                  fill="none"
                  stroke={idx < currentNodeIndex ? '#2d8b57' : 'rgba(45,139,87,0.3)'}
                  strokeWidth={idx < currentNodeIndex ? 4 : 3}
                  strokeDasharray={idx < currentNodeIndex ? 'none' : '8 4'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}

              {nodePositions.map((pos, idx) => {
                const h = chars[idx];
                if (!h) return null;
                const cp = data.charProgress[h.char];
                const stars = cp?.stars ?? 0;
                const completed = cp?.completed ?? false;
                const isCurrent = idx === currentNodeIndex;

                return (
                  <g key={h.char}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={NODE_SIZE / 2}
                      fill={completed ? '#e8f5e0' : '#fff'}
                      stroke={isCurrent ? '#ff8a3d' : (completed ? '#2d8b57' : '#ffd76a')}
                      strokeWidth={isCurrent ? 4 : 3}
                      style={{
                        filter: `drop-shadow(0 4px 10px ${completed ? 'rgba(45,139,87,0.3)' : 'rgba(0,0,0,0.1)'})`,
                        animation: isCurrent ? 'nodePulse 1.5s ease-in-out infinite' : 'none',
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate(ROUTES.LEARN_CHAR(h.char))}
                    />
                    <text 
                      x={pos.x} 
                      y={pos.y + 6} 
                      fontSize={completed ? 26 : 28}
                      fill={completed ? 'currentColor' : '#2b2b2b'}
                      fontWeight="700"
                      textAnchor="middle"
                      style={{ fontFamily: '"KaiTi", "STKaiti", serif' }}
                    >
                      {completed ? '⭐' : h.char}
                    </text>
                    {isCurrent && !completed && (
                      <g style={{ animation: 'playerFloat 2s ease-in-out infinite' }}>
                        <circle cx={pos.x} cy={pos.y - NODE_SIZE} r="20" fill="#42A5F5" style={{ filter: 'drop-shadow(0 4px 8px rgba(66,165,245,0.5))' }} />
                        <circle cx={pos.x - 6} cy={pos.y - NODE_SIZE - 4} r="4" fill="#fff" />
                        <circle cx={pos.x + 6} cy={pos.y - NODE_SIZE - 4} r="4" fill="#fff" />
                        <path d={`M ${pos.x - 4} ${pos.y - NODE_SIZE + 4} Q ${pos.x} ${pos.y - NODE_SIZE + 8} ${pos.x + 4} ${pos.y - NODE_SIZE + 4}`} fill="none" stroke="#fff" strokeWidth="2" />
                      </g>
                    )}
                    {stars > 0 && (
                      <text 
                        x={pos.x + NODE_SIZE / 2 + 8} 
                        y={pos.y - NODE_SIZE / 2 + 4} 
                        fontSize="16"
                        fill="#ffb400"
                        fontWeight="700"
                      >
                        {'★'.repeat(stars)}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {chars.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'rgba(255,255,255,0.85)',
            borderRadius: '24px',
            color: '#555',
            maxWidth: '400px',
            margin: '0 auto',
          }}>
            <p style={{ fontSize: 24 }}>🌱 字灵们还在沉睡中…</p>
            <p style={{ marginTop: 8, color: '#6b6b6b' }}>
              这片区域正在等待探索，请先挑战前面的岛屿吧！
            </p>
          </div>
        )}
      </section>

      <div style={{
        maxWidth: '600px',
        margin: '20px auto 0',
        padding: '16px 20px',
        background: 'rgba(255,255,255,0.9)',
        borderRadius: '16px',
        display: 'flex',
        gap: '14px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        position: 'relative',
        zIndex: 5,
      }}>
        <div style={{ fontSize: '32px', flexShrink: 0 }}>📜</div>
        <div>
          <p style={{ margin: '6px 0', fontSize: '14px', lineHeight: '1.6', fontWeight: '600', color: '#2d8b57', marginTop: 0 }}>
            你是一名字灵学徒，正在探索神秘的字灵森林。
          </p>
          <p style={{ margin: '6px 0', fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
            森林中散落着许多汉字精灵，它们因未被认识而沉睡。
          </p>
          <p style={{ margin: '6px 0', fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
            找到并"收服"它们（完成识、写、练、读），获得星星奖励！
          </p>
        </div>
      </div>

      <footer style={{
        textAlign: 'center',
        marginTop: '20px',
        color: '#555',
        fontSize: '14px',
        position: 'relative',
        zIndex: 5,
      }}>
        🌿 左右滑动探索森林 · 点击字灵开始学习 🌟
      </footer>
    </div>
  );
}

export default Map;
