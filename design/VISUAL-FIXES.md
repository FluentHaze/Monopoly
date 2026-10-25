# 2026-10-25 视觉修正

- 地图改用统一的小圆角，取消椭圆式百分比裁切。
- 角色改用独立生成的完整透明素材 `src/assets/adventure/explorer-v2.webp`，左右朝向通过 CSS 镜像处理，不再从图集边缘切割帽子。
- 地图底部道具图例拥有独立背景和正向间距，PC/H5 均不与地图重叠。
- 静态骰子改为共享边长、真实 3D 变换的六个面；点数与玩法保持一致；原 Spine 投掷动画与 CSS 降级继续保留。
- 移除格子外围椭圆，使用贴合图片透明轮廓的柔光与小星标，并补充当前位置语义。

## 独立角色生成

使用内置 image_gen。提示词：

```text
Use case: stylized-concept. One isolated full-body game explorer sprite for a premium 3D miniature tropical island board game. Cute adult-proportioned chibi safari adventurer, seen from rear three-quarter facing upper right, cream wide-brim safari hat with brown ribbon, tan short-sleeve shirt and shorts, green backpack with leather straps and tiny bedroll, brown boots. High quality rendered soft clay materials, warm sunlight, clear silhouette, matches jade/ivory/gold tropical adventure game art. CRITICAL: entire hat crown and entire brim, full head, backpack and both boots must be completely visible, no cropping anywhere. One character only, centered in a square transparent canvas with at least 15 percent completely empty transparent padding on ALL FOUR SIDES, including above the top of the hat and below both feet. Character should occupy no more than 70 percent canvas height. No other objects, no ground, no tile, no shadow plane, no UI, no sprite sheet, no text. Real alpha transparency.
```

## 骰子素材统一

按最新要求，静态骰子直接使用已生成的 `src/assets/adventure/dice.webp` 整图，彻底移除所有拼接面。投掷使用原 Spine 动画，WebGL 不可用时旋转整图；实际结果用下方数字标注。
