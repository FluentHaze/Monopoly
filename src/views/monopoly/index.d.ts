// 地图格子奖励
interface Reward {
  isReward: boolean;
  img: string;
}
// 地图格子数据
interface BoxItem {
  id: number;
  boxType: 1 | 2 | 3 | 4;
  box_depth: number;
  active: boolean;
  reward: Reward;
}
// 地图数据
interface MapProps {
  BoxList: BoxItem[];
  sourceId: number;
  turtleNumber: number;
}
// 用户数据
interface UserInfo {
  boxId: number;
  boxIndex: number;
  top: number;
  left: number;
  topOffset: number;
  leftOffset: number;
  isMove: boolean;
  animation: boolean;
  rotateY: number;
}
// 移动回调
interface MoveResult {
  success: boolean;
  message: string;
  currentBoxId?: number;
}
