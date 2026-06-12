import { useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getLevelChars, getLevelsForLanguage, getLevel } from '@/data/hanziData';
import { useProgressStore } from '@/store/progressStore';
import { useLanguageStore } from '@/store/languageStore';
import { ROUTES } from '@/routes';
import LanguageSwitcher from '@components/LanguageSwitcher';
import type { LevelId } from '@/types/global';
import styles from './index.module.scss';

const NODE_SIZE = 56;
const MAP_HEIGHT = 560;
const FLOWER_CANVAS_HEIGHT = 200;
const FLOWER_CANVAS_OFFSET_Y = 350;

interface NodePosition {
  x: number;
  y: number;
}

interface AnimElement {
  x: number;
  y: number;
  scale: number;
  phase: number;
  speed: number;
}

interface Butterfly {
  x: number;
  y: number;
  delay: number;
  phase: number;
}

interface FlowerCluster {
  x: number;
  y: number;
  flowers: { ox: number; oy: number; emoji: string }[];
}

function generateNodePositions(count: number): NodePosition[] {
  const positions: NodePosition[] = [];
  const spacing = 160;
  const startX = 120;
  const startY = 370;

  for (let i = 0; i < count; i++) {
    const offsetY = (i % 2) * 50;
    const x = startX + i * spacing;
    const y = startY + offsetY;
    positions.push({ x, y });
  }
  return positions;
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';

  ctx.beginPath();
  ctx.ellipse(80, 30, 80, 30, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(40, 15, 35, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(85, 8, 40, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(125, 15, 32, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawButterfly(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
  ctx.save();
  ctx.translate(x, y);

  const wingAngle = Math.sin(time * 3) * 0.5;
  ctx.rotate(wingAngle * 0.3);

  ctx.font = '24px serif';
  ctx.fillText('🦋', -12, 8);

  ctx.restore();
}

function drawTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  time: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const sway = Math.sin(time * 1.2) * 0.03;
  ctx.rotate(sway);

  // trunk
  ctx.fillStyle = '#5D4037';
  ctx.beginPath();
  ctx.moveTo(-15, 0);
  ctx.lineTo(-10, -80);
  ctx.lineTo(10, -80);
  ctx.lineTo(15, 0);
  ctx.closePath();
  ctx.fill();

  // canopy made of overlapping arcs
  const leafColors = ['#2E7D32', '#388E3C', '#43A047', '#4CAF50'];

  const drawArcLeaf = (cx: number, cy: number, r: number, colorIdx: number) => {
    ctx.fillStyle = leafColors[colorIdx % leafColors.length];
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, 0);
    ctx.fill();
  };

  // bottom layer - large arcs
  drawArcLeaf(-50, -60, 55, 0);
  drawArcLeaf(50, -60, 55, 0);
  drawArcLeaf(0, -75, 60, 0);

  // middle layer
  drawArcLeaf(-40, -100, 45, 1);
  drawArcLeaf(40, -100, 45, 1);
  drawArcLeaf(0, -115, 50, 1);

  // top layer
  drawArcLeaf(-25, -135, 35, 2);
  drawArcLeaf(25, -135, 35, 2);
  drawArcLeaf(0, -150, 40, 2);

  // top tuft
  drawArcLeaf(0, -170, 25, 3);

  ctx.restore();
}

function drawGrass(ctx: CanvasRenderingContext2D, width: number) {
  const gradient = ctx.createLinearGradient(0, 420, 0, MAP_HEIGHT);
  gradient.addColorStop(0, '#66BB6A');
  gradient.addColorStop(0.4, '#43A047');
  gradient.addColorStop(1, '#2E7D32');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(0, 420);
  ctx.quadraticCurveTo(width / 4, 380, width / 2, 410);
  ctx.quadraticCurveTo((width * 3) / 4, 440, width, 400);
  ctx.lineTo(width, MAP_HEIGHT);
  ctx.lineTo(0, MAP_HEIGHT);
  ctx.closePath();
  ctx.fill();
}

function drawPath(
  ctx: CanvasRenderingContext2D,
  path: { x: number; y: number }[],
  index: number,
  currentIndex: number
) {
  if (path.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);

  for (let i = 1; i < path.length; i++) {
    const curr = path[i - 1];
    const next = path[i];
    const midX = (curr.x + next.x) / 2;
    const midY = (curr.y + next.y) / 2 - 15;
    ctx.quadraticCurveTo(midX, midY, next.x, next.y);
  }

  ctx.strokeStyle = index < currentIndex ? '#2d8b57' : 'rgba(45,139,87,0.3)';
  ctx.lineWidth = index < currentIndex ? 4 : 3;

  if (index >= currentIndex) {
    ctx.setLineDash([8, 4]);
  } else {
    ctx.setLineDash([]);
  }

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawSky(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#4A90D9');
  gradient.addColorStop(0.3, '#7EC8E3');
  gradient.addColorStop(0.6, '#B8E4F0');
  gradient.addColorStop(1, '#D4F1F4');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawSun(ctx: CanvasRenderingContext2D, time: number, fixedX: number) {
  const x = fixedX;
  const y = 80;
  const baseRadius = 40;
  const pulseScale = 1 + Math.sin(time * 1.5) * 0.05;
  const radius = baseRadius * pulseScale;

  // glow effect
  const glowGradient = ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius * 2.5);
  glowGradient.addColorStop(0, 'rgba(255, 235, 59, 0.8)');
  glowGradient.addColorStop(0.5, 'rgba(255, 193, 7, 0.4)');
  glowGradient.addColorStop(1, 'rgba(255, 193, 7, 0)');

  ctx.fillStyle = glowGradient;
  ctx.beginPath();
  ctx.arc(x, y, radius * 2.5, 0, Math.PI * 2);
  ctx.fill();

  // sun body
  const sunGradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
  sunGradient.addColorStop(0, '#FFEB3B');
  sunGradient.addColorStop(0.4, '#FFC107');
  sunGradient.addColorStop(1, '#FF9800');

  ctx.fillStyle = sunGradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function Map() {
  const { level } = useParams();
  const navigate = useNavigate();
  const { data, setLevel } = useProgressStore();
  const language = useLanguageStore((s) => s.language);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const scrollLeftRef = useRef<number>(0);
  const visibleWidthRef = useRef<number>(700);
  // 预渲染花朵的离屏 canvas，避免每帧重复绘制
  const flowerCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const levelsForLang = useMemo(() => getLevelsForLanguage(language), [language]);
  const levelId: LevelId = (level as LevelId) ?? data.currentLevel;
  const levelInfo = useMemo(
    () =>
      getLevel(levelId as LevelId) ??
      (levelsForLang[0] as { id: LevelId; name: string; subtitle: string; unlockStars: number; bgColor: string }),
    [levelId, levelsForLang]
  );
  const chars = useMemo(() => getLevelChars(levelId), [levelId]);
  const nodePositions = useMemo(() => generateNodePositions(chars.length), [chars.length]);

  // Canvas width: startX(120) + spacing between nodes + right margin(150) for trees
  const mapWidth = useMemo(() => {
    if (chars.length === 0) return 700;
    const contentWidth = 120 + (chars.length - 1) * 160 + 150;
    return Math.max(contentWidth, 700);
  }, [chars.length]);

  const currentNodeIndex = useMemo(() => {
    const incompleteIdx = chars.findIndex((h) => !(data.charProgress[h.char]?.completed ?? false));
    return incompleteIdx === -1 ? chars.length - 1 : incompleteIdx;
  }, [chars, data.charProgress]);

  const treePositions = useMemo(() => {
    const count = Math.max(Math.floor(chars.length * 0.375), 1);
    const positions: AnimElement[] = [];
    const spacing = mapWidth / (count + 1);
    for (let i = 0; i < count; i++) {
      positions.push({
        x: spacing * (i + 1) + (Math.random() - 0.5) * 30,
        y: 445 + (Math.random() - 0.5) * 20,
        scale: 1.3 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        speed: 0.8 + Math.random() * 0.4,
      });
    }
    return positions;
  }, [mapWidth, chars.length]);

  const cloudPositions = useMemo(() => {
    const count = Math.max(Math.floor(chars.length / 3), 3);
    const positions: AnimElement[] = [];
    const spacing = mapWidth / (count + 1);
    for (let i = 0; i < count; i++) {
      positions.push({
        x: spacing * (i + 1),
        y: 30 + (i % 3) * 40,
        scale: 0.6 + Math.random() * 0.3,
        phase: i * 0.5,
        speed: i % 2 === 0 ? 1 : 0.8,
      });
    }
    return positions;
  }, [mapWidth, chars.length]);

  const butterflyPositions = useMemo(() => {
    const count = Math.max(Math.floor(chars.length / 4), 2);
    const positions: Butterfly[] = [];
    const spacing = mapWidth / (count + 1);
    for (let i = 0; i < count; i++) {
      positions.push({
        x: spacing * (i + 1),
        y: 100 + (i % 3) * 50,
        delay: i * 0.5,
        phase: i * 0.3,
      });
    }
    return positions;
  }, [mapWidth, chars.length]);

  const flowerClusters = useMemo((): FlowerCluster[] => {
    const flowerEmojis = ['🌸', '🌼', '🌷', '🌻', '🌺', '💐', '🌹'];
    // Number of clusters matches number of tree gaps (treeCount + 1), halved from before
    const clusterCount = Math.max(Math.floor(chars.length * 0.375), 2);
    const clusters: FlowerCluster[] = [];

    // Place clusters in gaps between trees
    const treeCount = treePositions.length;
    for (let i = 0; i < clusterCount; i++) {
      // Distribute clusters across the available tree gaps
      const gapIndex = treeCount > 0 ? i % (treeCount + 1) : i;
      let baseX: number;
      if (treeCount === 0) {
        baseX = mapWidth / 2;
      } else if (gapIndex === 0) {
        // Left of first tree
        baseX = treePositions[0].x * 0.5;
      } else if (gapIndex >= treeCount) {
        // Right of last tree
        baseX = treePositions[treeCount - 1].x + (mapWidth - treePositions[treeCount - 1].x) * 0.5;
      } else {
        // Between two trees
        baseX = (treePositions[gapIndex - 1].x + treePositions[gapIndex].x) / 2;
      }

      // Vary height - flowers fill between tree tops and grass
      const baseY = 430 + Math.random() * 50;
      const flowerCount = 6 + Math.floor(Math.random() * 5);

      const flowers: { ox: number; oy: number; emoji: string }[] = [];
      for (let j = 0; j < flowerCount; j++) {
        flowers.push({
          ox: (Math.random() - 0.5) * 50,
          oy: (Math.random() - 0.5) * 30,
          emoji: flowerEmojis[Math.floor(Math.random() * flowerEmojis.length)],
        });
      }

      clusters.push({ x: baseX, y: baseY, flowers });
    }
    return clusters;
  }, [mapWidth, chars.length, treePositions]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      for (let i = 0; i < nodePositions.length; i++) {
        const pos = nodePositions[i];
        const dx = clickX - pos.x;
        const dy = clickY - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= NODE_SIZE / 2 + 5) {
          const h = chars[i];
          if (h) {
            navigate(ROUTES.LEARN_CHAR(h.char));
            return;
          }
        }
      }
    },
    [nodePositions, chars, navigate]
  );

  // 预渲染花朵到离屏 canvas（只执行一次，数据变化时重建）
  useEffect(() => {
    if (flowerClusters.length === 0) return;
    const offscreen = document.createElement('canvas');
    offscreen.width = mapWidth;
    offscreen.height = FLOWER_CANVAS_HEIGHT;
    const fctx = offscreen.getContext('2d');
    if (!fctx) return;
    fctx.font = '22px serif';
    flowerClusters.forEach((cluster) => {
      cluster.flowers.forEach((flower) => {
        fctx.fillText(
          flower.emoji,
          cluster.x + flower.ox - 10,
          cluster.y - FLOWER_CANVAS_OFFSET_Y + flower.oy
        );
      });
    });
    flowerCanvasRef.current = offscreen;
  }, [mapWidth, flowerClusters]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Scroll listener to cache scroll position (avoids reflow in render loop)
    const scrollParent = canvas.parentElement;
    const handleScroll = () => {
      scrollLeftRef.current = scrollParent?.scrollLeft || 0;
      visibleWidthRef.current = scrollParent?.clientWidth || 700;
    };
    handleScroll();
    scrollParent?.addEventListener('scroll', handleScroll, { passive: true });

    let startTime = performance.now();

    const render = (currentTime: number) => {
      const elapsed = (currentTime - startTime) / 1000;

      // draw sky
      drawSky(ctx, mapWidth, MAP_HEIGHT);

      // draw sun - 固定在可见区域右上角
      const sunX = scrollLeftRef.current + visibleWidthRef.current - 100;
      drawSun(ctx, elapsed, sunX);

      // draw clouds
      cloudPositions.forEach((cloud) => {
        const offsetX = Math.sin(elapsed * cloud.speed + cloud.phase) * 15;
        drawCloud(ctx, cloud.x + offsetX, cloud.y, cloud.scale);
      });

      // draw butterflies
      butterflyPositions.forEach((bt) => {
        const adjustedTime = elapsed + bt.delay;
        const bx = bt.x + Math.sin(adjustedTime * 0.7 + bt.phase) * 25;
        const by = bt.y + Math.sin(adjustedTime * 1.2 + bt.phase) * 10;
        drawButterfly(ctx, bx, by, adjustedTime);
      });

      // draw grass
      drawGrass(ctx, mapWidth);

      // 绘制预渲染的花朵（静态层，只画一次后缓存）
      if (flowerCanvasRef.current) {
        ctx.drawImage(flowerCanvasRef.current, 0, FLOWER_CANVAS_OFFSET_Y);
      }

      // draw trees
      treePositions.forEach((tree) => {
        drawTree(ctx, tree.x, tree.y, tree.scale, elapsed + tree.phase);
      });

      // draw paths
      for (let i = 0; i < nodePositions.length - 1; i++) {
        drawPath(ctx, [nodePositions[i], nodePositions[i + 1]], i, currentNodeIndex);
      }

      // draw nodes
      for (let idx = 0; idx < nodePositions.length; idx++) {
        const pos = nodePositions[idx];
        const h = chars[idx];
        if (!h) continue;

        const cp = data.charProgress[h.char];
        const stars = cp?.stars ?? 0;
        const completed = cp?.completed ?? false;
        const isCurrent = idx === currentNodeIndex;

        // node circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, NODE_SIZE / 2, 0, Math.PI * 2);

        if (completed) {
          ctx.fillStyle = '#e8f5e0';
          ctx.fill();
          ctx.strokeStyle = '#2d8b57';
          ctx.lineWidth = 3;
        } else {
          ctx.fillStyle = '#fff';
          ctx.fill();
          ctx.strokeStyle = isCurrent ? '#ff8a3d' : '#ffd76a';
          ctx.lineWidth = isCurrent ? 4 : 3;
        }

        if (isCurrent) {
          const pulseScale = 1 + Math.sin(elapsed * 4) * 0.1;
          ctx.save();
          ctx.translate(pos.x, pos.y);
          ctx.scale(pulseScale, pulseScale);
          ctx.translate(-pos.x, -pos.y);
        }

        ctx.stroke();

        if (isCurrent) {
          ctx.restore();
        }

        // drop shadow
        ctx.save();
        ctx.shadowColor = completed ? 'rgba(45,139,87,0.3)' : 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;
        ctx.restore();

        // node text - 始终显示汉字
        ctx.font = `${completed ? 32 : 32}px "KaiTi", "STKaiti", serif`;
        ctx.fillStyle = completed ? '#2d8b57' : '#2b2b2b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(h.char, pos.x, pos.y - 4);

        // player character - yellow smiley emoji
        if (isCurrent && !completed) {
          const floatY = Math.sin(elapsed * 6) * 4;
          ctx.font = '36px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('😊', pos.x, pos.y + -30 + floatY);
        }

        // stars - 显示在节点上方，已完成时半透明
        if (stars > 0) {
          ctx.font = '20px serif';
          ctx.globalAlpha = completed ? 0.8 : 1;
          ctx.fillStyle = '#ffb400';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText('⭐'.repeat(stars), pos.x, pos.y + 8);
          ctx.globalAlpha = 1;
        }
      }

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationRef.current);
      scrollParent?.removeEventListener('scroll', handleScroll);
    };
  }, [
    mapWidth,
    nodePositions,
    chars,
    data.charProgress,
    currentNodeIndex,
    treePositions,
    cloudPositions,
    butterflyPositions,
  ]);

  function switchLevel(lid: LevelId) {
    setLevel(lid);
    navigate(`/map/${lid}`);
  }

  const isEnglish = language === 'en';
  const backHomeLabel = isEnglish ? '← Home' : '← 回家';
  const starsLabel = isEnglish ? `⭐ ${data.totalStars}` : `⭐ ${data.totalStars}`;
  const emptyTitle = isEnglish ? '🌱 Words are still sleeping…' : '🌱 字灵们还在沉睡中…';
  const emptySub = isEnglish
    ? 'This area waits to be explored. Try earlier islands first!'
    : '这片区域正在等待探索，请先挑战前面的岛屿吧！';

  return (
    <div className={styles.mapContainer}>
      <header className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          {backHomeLabel}
        </button>
        <div className={styles.titleWrap}>
          <h2 className={styles.title}>🌲 {levelInfo?.name} 🌲</h2>
          <span className={styles.subtitle}>{levelInfo?.subtitle}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LanguageSwitcher compact />
          <div className={styles.starsTag}>{starsLabel}</div>
        </div>
      </header>

      <section className={styles.levelSwitcher}>
        {levelsForLang.map((lvl) => {
          const charsForLvl = getLevelChars(lvl.id);
          const doneCount = charsForLvl.filter(
            (c) => data.charProgress[c.char]?.completed
          ).length;
          const pct = charsForLvl.length
            ? Math.round((doneCount / charsForLvl.length) * 100)
            : 0;
          const active = lvl.id === levelId;
          return (
            <button
              key={lvl.id}
              className={`${styles.switchBtn} ${active ? styles.active : ''}`}
              style={{ background: lvl.bgColor }}
              onClick={() => switchLevel(lvl.id)}
            >
              <div className={styles.switchName}>{lvl.name}</div>
              <div className={styles.switchSub}>
                {doneCount}/{charsForLvl.length} ({pct}%)
              </div>
            </button>
          );
        })}
      </section>

      <section className={styles.mapArea}>
        <div className={styles.scrollContainer}>
          <canvas
            ref={canvasRef}
            width={mapWidth}
            height={MAP_HEIGHT}
            className={styles.mapCanvas}
            onClick={handleCanvasClick}
          />
        </div>

        {chars.length === 0 && (
          <div className={styles.empty}>
            <p>{emptyTitle}</p>
            <p className={styles.emptySub}>{emptySub}</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default Map;
