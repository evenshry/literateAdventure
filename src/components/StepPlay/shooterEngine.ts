// 敌人
export interface ShooterEnemy {
  id: number;
  char: string;
  x: number;
  y: number;
  vx: number; // 速度方向
  speed: number;
  isTarget: boolean;
  isHit: boolean;
  hitTime?: number;
}

// 大炮
export interface Cannon {
  x: number;
  y: number;
  angle: number; // 角度，0为正上，负值左偏，正值右偏
  targetAngle: number;
  cooldown: number;
  maxCooldown: number;
}

// 爆炸效果
export interface Explosion {
  x: number;
  y: number;
  progress: number;
  isSuccess: boolean;
}

// 子弹
export interface Bullet {
  id: number;
  x: number;
  y: number;
  speed: 3;
}

// 击中特效
export interface HitEffect {
  x: number;
  y: number;
  progress: number;
  isSuccess: boolean;
}

// 游戏状态
export interface ShooterGameState {
  phase: 'ready' | 'playing' | 'victory' | 'gameover';
  targetChar: string;
  distractors: string[];
  enemies: ShooterEnemy[];
  cannon: Cannon;
  bullets: Bullet[];
  explosions: Explosion[];
  hitEffects: HitEffect[];
  screenShake: number;
  score: number;
  mistakes: number;
  maxScore: number;
  maxMistakes: number;
  enemyIdCounter: number;
  bulletIdCounter: number;
  hintActive: boolean;
  hintEndTime: number;
}

// 混淆字池
const DISTRACTOR_PAIRS: Record<string, string[]> = {
  日: ['目', '白', '百', '曰', '田'],
  月: ['日', '用', '朋', '肉', '且'],
  人: ['入', '大', '天', '夫', '八'],
  口: ['日', '田', '回', '囚', '囗'],
  大: ['人', '天', '太', '夫', '犬'],
  小: ['少', '木', '术', '木', '示'],
  中: ['申', '甲', '由', '田', '电'],
  上: ['下', '止', '卡', '土', '丑'],
  下: ['上', '卡', '卞', '丑', '不'],
  土: ['土', '士', '王', '主', '玉'],
  山: ['出', '屮', '凵', '屰', '岳'],
  水: ['木', '氷', '氺', '永', '氾'],
  火: ['大', '炎', '灬', '灰', '灭'],
  手: ['毛', '丰', '予', '书', '尹'],
  目: ['日', '自', '省', '眉', '貝'],
  耳: ['目', '耷', '茸', '取', '弋'],
  足: ['足', '走', '促', '捉', '跳'],
  木: ['本', '术', '沫', '休', '床'],
  云: ['去', '公', '会', '合', '令'],
  雨: ['两', '西', '严', '需', '灵'],
  天: ['天', '夫', '大', '夭', '太'],
  多: ['夕', '名', '外', '夜', '够'],
  少: ['小', '妙', '沙', '纱', '钞'],
  白: ['日', '百', '自', '臼', '皀'],
  石: ['右', '后', '古', '台', '各'],
  田: ['日', '目', '由', '甲', '申'],
};

// 默认混淆字
const DEFAULT_DISTRACTORS = [
  '日',
  '目',
  '白',
  '人',
  '大',
  '小',
  '中',
  '上',
  '下',
  '口',
  '山',
  '水',
  '火',
  '木',
  '土',
  '天',
  '多',
  '少',
  '月',
  '石',
];

// 获取混淆字
function getDistractorsForChar(char: string): string[] {
  if (DISTRACTOR_PAIRS[char]) {
    return DISTRACTOR_PAIRS[char];
  }
  return DEFAULT_DISTRACTORS.filter((c) => c !== char)
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);
}

// 初始化游戏
export function initShooterGame(targetChar: string): ShooterGameState {
  const distractors = getDistractorsForChar(targetChar);

  return {
    phase: 'ready',
    targetChar,
    distractors,
    enemies: [],
    cannon: {
      x: 50,
      y: 88,
      angle: 0,
      targetAngle: 0,
      cooldown: 0,
      maxCooldown: 0.5,
    },
    bullets: [],
    explosions: [],
    hitEffects: [],
    screenShake: 0,
    score: 0,
    mistakes: 0,
    maxScore: 3,
    maxMistakes: 3,
    enemyIdCounter: 0,
    bulletIdCounter: 0,
    hintActive: false,
    hintEndTime: 0,
  };
}

// 生成敌人队列
export function spawnEnemies(state: ShooterGameState, count: number = 10): void {
  // 确保至少3个目标字
  const targetCount = 3;

  // 生成随机排列的位置索引
  const positions = Array.from({ length: count }, (_, i) => i);
  const shuffled = positions.sort(() => Math.random() - 0.5);
  const targetPositions = shuffled.slice(0, targetCount);

  // 生成所有敌人
  for (let i = 0; i < count; i++) {
    // 分散位置：8%-92%，分成3行
    const row = i % 3;
    const col = Math.floor(i / 3);
    const yBase = 15 + row * 12; // 3行，分别在15%、27%、39%
    const xSpread = 10 + (col / 3) * 80; // 从左到右分布

    // 添加随机偏移
    const x = xSpread + Math.random() * 10 - 5;
    const y = yBase + Math.random() * 5;

    const isTarget = targetPositions.includes(i);
    state.enemies.push(createEnemy(state, x, y, isTarget));
  }
}

// 创建单个敌人
function createEnemy(
  state: ShooterGameState,
  x: number,
  y: number,
  isTarget: boolean
): ShooterEnemy {
  return {
    id: state.enemyIdCounter++,
    char: isTarget
      ? state.targetChar
      : state.distractors[Math.floor(Math.random() * state.distractors.length)],
    x,
    y,
    vx: Math.random() > 0.5 ? 1 : -1,
    speed: 0.12 + Math.random() * 0.08,
    isTarget,
    isHit: false,
  };
}

// 开始游戏
export function startGame(state: ShooterGameState): void {
  state.phase = 'playing';
  state.score = 0;
  state.mistakes = 0;
  state.enemies = [];
  state.bullets = [];
  state.explosions = [];
  state.hitEffects = [];
  state.screenShake = 0;
  state.cannon.cooldown = 0;
  spawnEnemies(state);
}

// 更新敌人
export function updateEnemies(state: ShooterGameState, deltaTime: number): void {
  for (const enemy of state.enemies) {
    if (enemy.isHit) continue;

    // 移动
    enemy.x += enemy.vx * enemy.speed * deltaTime * 10;

    // 边界反弹
    if (enemy.x > 92) {
      enemy.x = 92;
      enemy.vx = -1;
    } else if (enemy.x < 8) {
      enemy.x = 8;
      enemy.vx = 1;
    }
  }

  // 移除被击中且动画完成的敌人
  const now = Date.now();
  state.enemies = state.enemies.filter((e) => {
    if (e.isHit && e.hitTime) {
      return now - e.hitTime < 500; // 500ms后移除
    }
    return true;
  });
}

// 更新大炮
export function updateCannon(state: ShooterGameState, deltaTime: number): void {
  if (state.cannon.cooldown > 0) {
    state.cannon.cooldown -= deltaTime;
  }

  // 平滑旋转
  const angleDiff = state.cannon.targetAngle - state.cannon.angle;
  state.cannon.angle += angleDiff * 0.15;
}

// 设置瞄准角度
export function aimCannon(state: ShooterGameState, angle: number): void {
  state.cannon.targetAngle = Math.max(-50, Math.min(50, angle));
}

// 发射
export function fire(state: ShooterGameState): ShooterEnemy | null {
  if (state.cannon.cooldown > 0 || state.phase !== 'playing') {
    return null;
  }

  state.cannon.cooldown = state.cannon.maxCooldown;

  // 创建子弹，使用当前大炮角度
  state.bullets.push({
    id: state.bulletIdCounter++,
    x: state.cannon.x,
    y: state.cannon.y - 5,
    speed: 3,
  });

  return null; // 不再使用射线检测，返回null
}

// 检测子弹与敌人的碰撞
export function checkBulletCollisions(state: ShooterGameState): ShooterEnemy | null {
  let hitEnemy: ShooterEnemy | null = null;

  for (const bullet of state.bullets) {
    for (const enemy of state.enemies) {
      if (enemy.isHit) continue;

      // 计算子弹与敌人的距离
      const dx = bullet.x - enemy.x;
      const dy = bullet.y - enemy.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // 敌人半径约3单位
      if (dist < 4) {
        enemy.isHit = true;
        enemy.hitTime = Date.now();
        bullet.x = -100; // 将子弹移出屏幕

        // 添加爆炸效果
        state.explosions.push({
          x: enemy.x,
          y: enemy.y,
          progress: 0,
          isSuccess: enemy.isTarget,
        });

        // 添加击中特效
        for (let i = 0; i < 12; i++) {
          state.hitEffects.push({
            x: enemy.x,
            y: enemy.y,
            progress: 0,
            isSuccess: enemy.isTarget,
          });
        }

        // 屏幕震动
        state.screenShake = 0.3;

        // 更新分数
        if (enemy.isTarget) {
          state.score++;
        } else {
          state.mistakes++;
          state.cannon.cooldown += 0.5;
        }

        // 检查胜利/失败
        if (state.score >= state.maxScore) {
          state.phase = 'victory';
        } else if (state.mistakes >= state.maxMistakes) {
          state.phase = 'gameover';
        }

        // 补充敌人
        setTimeout(() => {
          if (state.phase === 'playing') {
            const x = Math.random() > 0.5 ? 5 : 95;
            const y = 15 + Math.random() * 25;
            const isTarget = Math.random() < 0.35;
            state.enemies.push(createEnemy(state, x, y, isTarget));
          }
        }, 600);

        hitEnemy = enemy;
        break;
      }
    }
    if (hitEnemy) break;
  }

  return hitEnemy;
}

// 更新子弹（使用累积角度）
export function updateBullets(state: ShooterGameState, deltaTime: number): void {
  // 存储每个子弹的发射角度
  if (!state.bullets) return;

  // 清理已爆炸的子弹
  state.bullets = state.bullets.filter((b) => {
    const angleRad = ((-90 + state.cannon.angle) * Math.PI) / 180;
    b.x += Math.cos(angleRad) * b.speed * deltaTime * 12;
    b.y += Math.sin(angleRad) * b.speed * deltaTime * 12;
    return b.y > -10 && b.y < 100 && b.x > -10 && b.x < 110;
  });
}

// 更新爆炸效果
export function updateExplosions(state: ShooterGameState, deltaTime: number): void {
  state.explosions = state.explosions.filter((exp) => {
    exp.progress += deltaTime * 3;
    return exp.progress < 1;
  });

  // 更新击中特效
  state.hitEffects = state.hitEffects.filter((effect) => {
    effect.progress += deltaTime * 4;
    return effect.progress < 1;
  });

  // 更新屏幕震动
  if (state.screenShake > 0) {
    state.screenShake -= deltaTime * 2;
    if (state.screenShake < 0) state.screenShake = 0;
  }
}

// 使用提示
export function activateHint(state: ShooterGameState): void {
  state.hintActive = true;
  state.hintEndTime = Date.now() + 2000; // 2秒
}

// 重置游戏
export function resetGame(state: ShooterGameState): void {
  state.phase = 'ready';
  state.score = 0;
  state.mistakes = 0;
  state.enemies = [];
  state.explosions = [];
  state.cannon.cooldown = 0;
  state.hintActive = false;
  // 清理背景缓存，允许重新生成
  backgroundCache = null;
}

// 绘制游戏
export function drawShooterGame(
  ctx: CanvasRenderingContext2D,
  state: ShooterGameState,
  width: number,
  height: number,
  time: number
): void {
  const scaleX = width / 100;
  const scaleY = height / 100;

  ctx.save();

  // 应用屏幕震动
  if (state.screenShake > 0) {
    const shakeX = (Math.random() - 0.5) * state.screenShake * 20;
    const shakeY = (Math.random() - 0.5) * state.screenShake * 20;
    ctx.translate(shakeX, shakeY);
  }

  ctx.clearRect(-50, -50, width + 100, height + 100);

  // 绘制背景
  drawBackground(ctx, width, height, time);

  // 绘制敌人
  drawEnemies(ctx, state, scaleX, scaleY, time);

  // 绘制瞄准线（在敌人之下，捕虫网之上）
  if (state.phase === 'playing') {
    drawAimLine(ctx, state.cannon, width, height);
  }

  // 绘制子弹
  drawBullets(ctx, state, scaleX, scaleY);

  // 绘制爆炸效果
  drawExplosions(ctx, state, scaleX, scaleY);

  // 绘制击中特效
  drawHitEffects(ctx, state, scaleX, scaleY);

  // 绘制大炮
  drawCannon(ctx, state.cannon, scaleX, scaleY, time);

  // 绘制UI
  drawUI(ctx, state, width);

  ctx.restore();
}

// 背景缓存 - 避免草地闪烁
let backgroundCache: HTMLCanvasElement | null = null;
let backgroundCacheWidth = 0;
let backgroundCacheHeight = 0;

// 绘制背景（使用缓存避免随机元素闪烁）
function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number
): void {
  // 如果没有缓存或尺寸变化，重新生成背景缓存
  if (!backgroundCache || backgroundCacheWidth !== width || backgroundCacheHeight !== height) {
    backgroundCache = document.createElement('canvas');
    backgroundCache.width = width;
    backgroundCache.height = height;
    backgroundCacheWidth = width;
    backgroundCacheHeight = height;

    const bgCtx = backgroundCache.getContext('2d')!;

    // === 预渲染静态背景元素 ===

    // 天空渐变 - 更柔和的色调
    const skyGradient = bgCtx.createLinearGradient(0, 0, 0, height * 0.75);
    skyGradient.addColorStop(0, '#6BB3D9');
    skyGradient.addColorStop(0.4, '#A8E1F5');
    skyGradient.addColorStop(0.8, '#D4F0FA');
    skyGradient.addColorStop(1, '#E8F8FF');
    bgCtx.fillStyle = skyGradient;
    bgCtx.fillRect(0, 0, width, height * 0.75);

    // 太阳
    bgCtx.fillStyle = '#FFE066';
    bgCtx.beginPath();
    bgCtx.arc(width * 0.85, height * 0.12, 25, 0, Math.PI * 2);
    bgCtx.fill();
    bgCtx.fillStyle = '#FFD700';
    bgCtx.beginPath();
    bgCtx.arc(width * 0.85, height * 0.12, 18, 0, Math.PI * 2);
    bgCtx.fill();

    // 远山
    bgCtx.fillStyle = 'rgba(150, 180, 160, 0.35)';
    bgCtx.beginPath();
    bgCtx.moveTo(0, height * 0.68);
    bgCtx.quadraticCurveTo(width * 0.2, height * 0.48, width * 0.4, height * 0.62);
    bgCtx.quadraticCurveTo(width * 0.6, height * 0.42, width * 0.8, height * 0.65);
    bgCtx.quadraticCurveTo(width * 0.9, height * 0.52, width, height * 0.68);
    bgCtx.lineTo(width, height * 0.75);
    bgCtx.lineTo(0, height * 0.75);
    bgCtx.closePath();
    bgCtx.fill();

    // 地面 - 更柔和的绿色
    const groundGradient = bgCtx.createLinearGradient(0, height * 0.75, 0, height);
    groundGradient.addColorStop(0, '#90EE90');
    groundGradient.addColorStop(0.4, '#7CCD7C');
    groundGradient.addColorStop(0.7, '#5CB85C');
    groundGradient.addColorStop(1, '#3D993D');
    bgCtx.fillStyle = groundGradient;
    bgCtx.fillRect(0, height * 0.75, width, height * 0.25);

    // 草地纹理 - 使用确定性随机（基于索引）
    bgCtx.strokeStyle = 'rgba(30, 120, 30, 0.45)';
    bgCtx.lineWidth = 2;
    for (let i = 0; i < 40; i++) {
      // 确定性随机：使用索引计算位置，避免闪烁
      const randX = ((i * 7919) % 1000) / 1000;
      const randY = ((i * 6151) % 1000) / 1000;
      const x = randX * width;
      const y = height * 0.75 + 3 + randY * 18;
      const curve = (((i * 127) % 100) / 100) * 4 - 2;
      bgCtx.beginPath();
      bgCtx.moveTo(x, y + 10);
      bgCtx.quadraticCurveTo(x + curve, y, x + curve * 0.5, y - 6);
      bgCtx.stroke();
    }

    // 小花点缀 - 也是确定性位置
    const flowerColors = ['#FFB6C1', '#FFC0CB', '#FFDAB9', '#E6E6FA', '#FFFACD'];
    for (let i = 0; i < 10; i++) {
      const randX = ((i * 5417) % 1000) / 1000;
      const randY = ((i * 8821) % 1000) / 1000;
      const x = randX * width;
      const y = height * 0.77 + randY * 12;
      const petalColor = flowerColors[i % flowerColors.length];

      // 花瓣
      bgCtx.fillStyle = petalColor;
      for (let j = 0; j < 5; j++) {
        const angle = (j / 5) * Math.PI * 2;
        bgCtx.beginPath();
        bgCtx.arc(x + Math.cos(angle) * 2.5, y + Math.sin(angle) * 2.5, 2, 0, Math.PI * 2);
        bgCtx.fill();
      }
      // 花心
      bgCtx.fillStyle = '#FFD700';
      bgCtx.beginPath();
      bgCtx.arc(x, y, 1.5, 0, Math.PI * 2);
      bgCtx.fill();
    }
  }

  // 绘制缓存的静态背景
  ctx.drawImage(backgroundCache, 0, 0);

  // 云朵（动态，可漂浮）
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  for (let i = 0; i < 5; i++) {
    const x = ((i * 30 + time * 2) % 120) - 10;
    const y = 15 + (i % 3) * 22;
    drawCloud(ctx, (x * width) / 100, (y * height) / 100, 22 + (i % 2) * 8);
  }
}

// 绘制云朵
function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.beginPath();
  ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
  ctx.arc(x + size * 0.4, y - size * 0.2, size * 0.4, 0, Math.PI * 2);
  ctx.arc(x + size * 0.8, y, size * 0.45, 0, Math.PI * 2);
  ctx.fill();
}

// 绘制捕网（抛出的网）
function drawBullets(
  ctx: CanvasRenderingContext2D,
  state: ShooterGameState,
  scaleX: number,
  scaleY: number
): void {
  for (const bullet of state.bullets) {
    const x = bullet.x * scaleX;
    const y = bullet.y * scaleY;

    // 网圈
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.stroke();

    // 网兜（菱形网格）
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1;

    // 小网格
    for (let i = -8; i <= 8; i += 4) {
      for (let j = -8; j <= 8; j += 4) {
        const dist = Math.sqrt(i * i + j * j);
        if (dist <= 10) {
          ctx.beginPath();
          ctx.moveTo(x + i, y + j);
          ctx.lineTo(x + i + 2, y + j - 2);
          ctx.lineTo(x + i, y + j - 4);
          ctx.lineTo(x + i - 2, y + j - 2);
          ctx.closePath();
          ctx.stroke();
        }
      }
    }

    // 连接线（从网中心到边缘）
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * 12, y + Math.sin(angle) * 12);
      ctx.stroke();
    }

    // 抛出效果尾迹
    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(x + 5, y + 5, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 10, y + 10, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 绘制瞄准线
function drawAimLine(
  ctx: CanvasRenderingContext2D,
  cannon: Cannon,
  width: number,
  height: number
): void {
  const cx = (cannon.x * width) / 100;
  const cy = (cannon.y * height) / 100;
  // 修复角度：0度指向正上方，正值向右偏，负值向左偏
  const angleRad = ((-90 + cannon.angle) * Math.PI) / 180;

  ctx.strokeStyle = 'rgba(255, 255, 0, 0.4)';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 5]);

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(angleRad) * height * 0.8, cy + Math.sin(angleRad) * height * 0.8);
  ctx.stroke();

  // 瞄准点
  const aimX = cx + Math.cos(angleRad) * height * 0.6;
  const aimY = cy + Math.sin(angleRad) * height * 0.6;

  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(aimX, aimY, 8, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(aimX, aimY, 12, 0, Math.PI * 2);
  ctx.stroke();
}

// 绘制蝴蝶敌人（侧面视角，整体转90度，翅膀在上重叠）
function drawEnemies(
  ctx: CanvasRenderingContext2D,
  state: ShooterGameState,
  scaleX: number,
  scaleY: number,
  time: number
): void {
  for (const enemy of state.enemies) {
    if (enemy.isHit) continue;

    const x = enemy.x * scaleX;
    const y = enemy.y * scaleY;

    // 飞行动画（轻微上下浮动）
    const floatY = Math.sin(time * 3 + enemy.id) * 3;

    // 目标蝴蝶金色光环
    if (enemy.isTarget) {
      ctx.beginPath();
      ctx.arc(x, y + floatY, 35, 0, Math.PI * 2);
      ctx.fillStyle = state.hintActive ? 'rgba(255, 215, 0, 0.45)' : 'rgba(255, 215, 0, 0.15)';
      ctx.fill();

      if (state.hintActive) {
        const pulseSize = 35 + Math.sin(time * 10) * 5;
        ctx.beginPath();
        ctx.arc(x, y + floatY, pulseSize, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // 翅膀扇动
    const wingFlap = Math.sin(time * 10 + enemy.id) * 5;

    // 目标蝴蝶 vs 普通蝴蝶
    const isTarget = enemy.isTarget;
    const palette = [
      { front: '#ff6b9d', back: '#feca57', edge: '#c44569', body: '#2d3436' },
      { front: '#74b9ff', back: '#81ecec', edge: '#0984e3', body: '#2d3436' },
      { front: '#a29bfe', back: '#fd79a8', edge: '#6c5ce7', body: '#2d3436' },
      { front: '#fab1a0', back: '#55efc4', edge: '#e17055', body: '#2d3436' },
    ];
    const colorIdx = isTarget ? 0 : (enemy.id % 3) + 1;
    const colors = palette[colorIdx];

    const cx = x;
    const cy = y + floatY;

    // === 侧面视角蝴蝶：翅膀在上，身体在翅膀底部下方水平 ===
    // 根据移动方向翻转蝴蝶，让头朝向飞行方向
    const facingLeft = enemy.vx < 0;
    const faceScale = facingLeft ? -1 : 1;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(faceScale, 1);

    // 蝴蝶中心点 = (0, 0)
    // 翅膀在正上方，身体在翅膀底部正下方（水平横放）

    // === 翅膀（在上，以身体与翅膀连接点为圆心扇动）===
    // 翅膀连接点 = (0, 0)

    // 后翅膀（上层，稍微靠左）
    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(-0.2 + wingFlap * 0.04);

    // 后翅膀主体
    ctx.fillStyle = colors.back;
    ctx.beginPath();
    ctx.ellipse(-5, -22, 12, 18, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // 后翅膀花纹
    ctx.fillStyle = colors.edge;
    ctx.beginPath();
    ctx.arc(-5, -22, 4, 0, Math.PI * 2);
    ctx.fill();

    // 后翅膀轮廓
    ctx.strokeStyle = colors.edge;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(-5, -22, 12, 18, -0.1, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();

    // 前翅膀（下层，稍微靠右，覆盖在后翅膀上）
    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(0.2 - wingFlap * 0.04);

    // 前翅膀主体
    ctx.fillStyle = colors.front;
    ctx.beginPath();
    ctx.ellipse(5, -25, 14, 20, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // 前翅膀花纹
    ctx.fillStyle = colors.edge;
    ctx.beginPath();
    ctx.arc(5, -25, 4, 0, Math.PI * 2);
    ctx.fill();

    // 前翅膀轮廓
    ctx.strokeStyle = colors.edge;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(5, -25, 14, 20, 0.1, 0, Math.PI * 2);
    ctx.stroke();

    // === 汉字写在前翅膀中心（白色，加粗加大，文字描边阴影）===
    // 单独反向翻转，让文字保持正向显示
    // 翻转后位置需要补偿：scale(-1,1) 时 x 坐标会变号，所以要取反
    ctx.save();
    ctx.scale(faceScale, 1);
    const textX = 5 * faceScale; // 翻转补偿
    ctx.fillStyle = '#fff';
    ctx.font = '900 20px "PingFang SC", "Microsoft YaHei", "SimHei", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // 多重阴影增强可读性
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    // 绘制描边（增强可见性）
    ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.strokeText(enemy.char, textX, -25);
    // 绘制填充文字
    ctx.fillText(enemy.char, textX, -25);
    // 清除阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.restore();

    ctx.restore();

    // === 身体（水平横放，紧贴翅膀底部）===
    // 身体在翅膀底部（y = 0）水平放置
    ctx.fillStyle = colors.body;
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // === 头部（身体右端）===
    ctx.fillStyle = colors.body;
    ctx.beginPath();
    ctx.arc(14, 0, 2.8, 0, Math.PI * 2);
    ctx.fill();

    // 眼睛
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(15, -1, 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(15, 1, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // 触角（从头部向上伸出）
    ctx.strokeStyle = colors.body;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(15, -3);
    ctx.quadraticCurveTo(18, -8, 19, -11);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(16, -3);
    ctx.quadraticCurveTo(20, -8, 22, -11);
    ctx.stroke();

    // 触角球
    ctx.fillStyle = colors.body;
    ctx.beginPath();
    ctx.arc(19, -11, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(22, -11, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// 绘制爆炸效果
function drawExplosions(
  ctx: CanvasRenderingContext2D,
  state: ShooterGameState,
  scaleX: number,
  scaleY: number
): void {
  for (const exp of state.explosions) {
    const x = exp.x * scaleX;
    const y = exp.y * scaleY;
    const size = 20 + exp.progress * 40;
    const alpha = 1 - exp.progress;

    if (exp.isSuccess) {
      // 成功：金色光环扩散
      ctx.strokeStyle = `rgba(255, 215, 0, ${alpha})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.stroke();

      // 内部光晕
      ctx.fillStyle = `rgba(255, 255, 200, ${alpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // 失败：红色警告圈
      ctx.strokeStyle = `rgba(255, 50, 50, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

// 绘制击中特效（粒子）
function drawHitEffects(
  ctx: CanvasRenderingContext2D,
  state: ShooterGameState,
  scaleX: number,
  scaleY: number
): void {
  for (let i = 0; i < state.hitEffects.length; i++) {
    const effect = state.hitEffects[i];
    const x = effect.x * scaleX;
    const y = effect.y * scaleY;

    // 每个粒子沿随机方向飞散
    const angle = (i / state.hitEffects.length) * Math.PI * 2 + Math.random() * 0.5;
    const dist = effect.progress * 60;
    const px = x + Math.cos(angle) * dist;
    const py = y + Math.sin(angle) * dist;
    const alpha = 1 - effect.progress;
    const size = 6 * (1 - effect.progress * 0.5);

    if (effect.isSuccess) {
      // 成功：金色粒子
      ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
    } else {
      // 失败：红色粒子
      ctx.fillStyle = `rgba(255, 80, 80, ${alpha})`;
    }

    ctx.beginPath();
    ctx.arc(px, py, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

// 绘制捕虫网
function drawCannon(
  ctx: CanvasRenderingContext2D,
  cannon: Cannon,
  scaleX: number,
  scaleY: number,
  time: number
): void {
  const x = cannon.x * scaleX;
  const y = cannon.y * scaleY;

  // 冷却状态
  const isCooling = cannon.cooldown > 0;
  const alpha = isCooling ? 0.6 : 1;

  ctx.save();
  ctx.translate(x, y);

  // 旋转（朝向目标方向）
  ctx.rotate((cannon.angle * Math.PI) / 180);

  // 捕虫网手柄（木质，加长）
  const handleGradient = ctx.createLinearGradient(-4, -45, 4, 35);
  handleGradient.addColorStop(0, isCooling ? '#8b6645' : '#d4b896');
  handleGradient.addColorStop(0.5, isCooling ? '#a07050' : '#c4a080');
  handleGradient.addColorStop(1, isCooling ? '#7a5d3f' : '#b09070');
  ctx.fillStyle = handleGradient;
  ctx.fillRect(-4, -45, 8, 80);

  // 手柄纹理
  ctx.strokeStyle = `rgba(0,0,0,${isCooling ? 0.15 : 0.25})`;
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(-4, -35 + i * 10);
    ctx.lineTo(4, -35 + i * 10);
    ctx.stroke();
  }

  // 手柄两端金属箍
  ctx.fillStyle = isCooling ? '#888' : '#c0c0c0';
  ctx.fillRect(-5, -46, 10, 4);
  ctx.fillRect(-5, 30, 10, 4);

  // 网圈（圆形，带立体感）
  ctx.save();

  // 外圈阴影
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(2, -63, 26, 0, Math.PI * 2);
  ctx.stroke();

  // 主网圈
  const ringGradient = ctx.createRadialGradient(-3, -68, 0, 0, -65, 25);
  ringGradient.addColorStop(0, isCooling ? '#a0a0a0' : '#ffd700');
  ringGradient.addColorStop(0.5, isCooling ? '#888' : '#d4af37');
  ringGradient.addColorStop(1, isCooling ? '#666' : '#b89500');
  ctx.strokeStyle = ringGradient;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, -65, 25, 0, Math.PI * 2);
  ctx.stroke();

  // 网兜（菱形网格，铺满整个圆框）
  ctx.save();

  // 创建圆形裁剪区域，让网格限制在网圈内
  ctx.beginPath();
  ctx.arc(0, -65, 23, 0, Math.PI * 2);
  ctx.clip();

  ctx.strokeStyle = isCooling ? 'rgba(200,200,200,0.5)' : 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 1;

  // 绘制菱形网格，覆盖整个圆框范围
  const gridSize = 6;
  const ringCenterY = -65;
  const ringRadius = 23;
  const startI = -ringRadius;
  const endI = ringRadius;
  const startJ = ringCenterY - ringRadius;
  const endJ = ringCenterY + ringRadius;

  for (let i = startI; i <= endI; i += gridSize) {
    for (let j = startJ; j <= endJ; j += gridSize) {
      ctx.beginPath();
      ctx.moveTo(i, j);
      ctx.lineTo(i + gridSize / 2, j - gridSize / 2);
      ctx.lineTo(i, j - gridSize);
      ctx.lineTo(i - gridSize / 2, j - gridSize / 2);
      ctx.closePath();
      ctx.stroke();
    }
  }

  ctx.restore();

  // 网兜放射状连接线（从中心到边缘）
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, -65, 23, 0, Math.PI * 2);
  ctx.clip();

  ctx.strokeStyle = isCooling ? 'rgba(200,200,200,0.4)' : 'rgba(255,215,0,0.3)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(0, -65);
    ctx.lineTo(Math.cos(angle) * 22, -65 + Math.sin(angle) * 22);
    ctx.stroke();
  }

  ctx.restore();

  // 网兜边缘装饰小球
  ctx.fillStyle = isCooling ? '#888' : '#ff6b6b';
  ctx.beginPath();
  ctx.arc(-18, -62, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(18, -62, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -78, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -52, 4, 0, Math.PI * 2);
  ctx.fill();

  // 小球高光
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.arc(-17, -63, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(17, -63, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(1, -79, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(1, -53, 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // 冷却指示
  if (isCooling) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('准备中...', x, y + 40);
  }
}

// 绘制UI（统计信息在组件外部显示，画布内不再绘制）
function drawUI(ctx: CanvasRenderingContext2D, state: ShooterGameState, width: number): void {
  // 空函数，统计信息已在组件外部显示
}
