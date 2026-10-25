# 幸运冒险岛美术资源

使用内置 image_gen 生成；此目录保留已确认的 PC/H5 概念稿。运行时资源在 `src/assets/adventure/`，原有 Spine 动画骨骼与纹理保留在 `public/spine/dice/`。

## 资源

- `island.webp`：岛屿环境与页面背景。
- `tile-ivory/mint/violet/gold.webp`：普通、道具、特殊路线和入口四种格子。
- `explorer-v2.webp`：独立生成的完整角色，帽顶和脚部留白；左右朝向通过 CSS 镜像处理，逐格跳跃与传送由代码控制。旧图集的角色文件保留作参考。
- `arrow/back/turtle/portal.webp`：前进、后退、慢行、传送。
- `coin/crystal/star.webp`：奖励与特殊入口图标。
- `chest-wood/jade.webp`：普通与高级宝箱。
- `dice.webp`：品牌与按钮图标；静态展示统一使用整张生成的骰子图，实际点数由下方文字显示，投掷期间使用原 Spine 动画，WebGL 不可用时回退到整张骰子图片的旋转动画。

素材图集按 4×4 网格提取并转为 WebP。页面未使用设计稿整图充当可点击棋盘，所有 37 个格子、路线、角色、按钮和奖励都独立渲染。

## 生成提示词：场景

```text
Use case: stylized-concept. Production game environment background texture for the approved Monopoly 幸运冒险岛 premium 3D tropical adventure UI. Generate a portrait 1024x1536 overhead mildly isometric miniature tropical island surrounded by clear teal water, cream limestone rock cliff edges, soft lush palms, tiny ferns, waterfalls, wooden bridge at bottom right, sunlit physically rendered soft clay materials. Crucial composition constraint: center 75% of image is a broad, relatively flat smooth mossy limestone plateau with delicate ground texture, almost empty and visually quiet so 37 interactive game tiles will be rendered above it in code; keep all tall foliage and dramatic cliffs on outer 12% edges. A very small water channel can cross middle background but no distracting central objects. Island fills 90% of canvas with water edge framing. Deep forest green, ivory sandstone, jade and turquoise, small warm gold accents. Match the art direction of the previously approved island page, but this is BACKGROUND ONLY. NO text, NO typography, NO UI, NO buttons, NO dice, NO game tiles, NO paths, NO character, NO treasure chests, NO mascot, NO interface panels, NO signs. Clean beautiful reusable game terrain asset, not screenshot.
```

## 生成提示词：透明素材图集

```text
Use case: stylized-concept. Production transparent game sprite atlas for premium 3D miniature tropical island boardgame. A STRICT uniform 4 columns by 4 rows grid on a square 2048x2048 transparent RGBA canvas. Each sprite must fit entirely within its own 512x512 cell, centered at cell center, max sprite width/height 360px, generous completely transparent margins, no lines, no labels, no backgrounds, no text. Render cohesive smooth clay 3D art with soft warm sun light, front/top view slightly isometric, ivory/jade/gold/lavender. Exactly 16 separate isolated objects in row-major order. Row1: (1) blank rounded-square thick ivory sandstone GAME TILE seen top-front, (2) same tile turquoise mint glaze, (3) same tile lavender glaze gold rim, (4) same tile golden amber glaze. All tiles same camera and silhouette, face occupies 85 percent surface, NO symbols. Row2: (5) chunky polished golden arrow pointing right, (6) single golden coin with subtle star relief, (7) faceted purple amethyst crystal, (8) green jade TURTLE slow item figurine with gold rim shell. Row3: (9) glowing turquoise and violet magic teleport PORTAL ring standing upright, (10) two chunky gold left chevrons backward symbol, (11) closed small walnut WOOD treasure CHEST with brass trim, (12) same chest upgraded emerald jade and GOLD with tiny crown. Row4: (13) cute explorer character in cream safari hat and outfit, GREEN BACKPACK, seen rear three-quarter facing upper right, full body feet visible; (14) same explorer facing upper left, full body; (15) large ivory rounded dice with forest green round pips, attractive polished 3D perspective, (16) gold star medal. This is a functional sprite atlas to be cut into exactly sixteen equal square cells. Transparent background is mandatory; no backdrop tiles or checkerboard drawn in image. Do not mix up ordering. No shadows crossing cell boundaries. Avoid thin outlines, orange hexagons, cropped objects, text and logos.
```
