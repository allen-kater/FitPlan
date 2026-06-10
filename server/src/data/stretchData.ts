/**
 * 拉伸图谱数据配置
 * 
 * 图片文件位于: client/public/images/stretch/
 * 如果发现图片与名称不匹配，请修改对应条目的 name/targetMuscle 字段
 * 
 * 格式说明:
 *   id: 唯一标识
 *   name: 拉伸动作名称  
 *   targetMuscle: 目标肌肉
 *   image: 图片路径 (相对于public目录)
 *   position: 上身/下身
 */

export interface StretchItem {
  id: string;
  name: string;
  targetMuscle: string;
  image: string;
  position: string;
}

export interface StretchData {
  upper: StretchItem[];
  lower: StretchItem[];
  attribution: string;
}

// ============ 上身拉伸 (Upper Body Stretches) ============
// 图片: public/images/stretch/upper/upper_stretch_01.png ~ 11.png
export const upperStretch: StretchItem[] = [
  { id: 'us-1', name: '胸部拉伸 1', targetMuscle: '胸大肌', image: '/images/stretch/upper/upper_stretch_01.png', position: '上身' },
  { id: 'us-2', name: '胸部拉伸 2', targetMuscle: '胸大肌', image: '/images/stretch/upper/upper_stretch_02.png', position: '上身' },
  { id: 'us-3', name: '肩部拉伸 1', targetMuscle: '三角肌', image: '/images/stretch/upper/upper_stretch_03.png', position: '上身' },
  { id: 'us-4', name: '肩部拉伸 2', targetMuscle: '三角肌', image: '/images/stretch/upper/upper_stretch_04.png', position: '上身' },
  { id: 'us-5', name: '背阔肌拉伸 1', targetMuscle: '背阔肌', image: '/images/stretch/upper/upper_stretch_05.png', position: '上身' },
  { id: 'us-6', name: '背阔肌拉伸 2', targetMuscle: '背阔肌', image: '/images/stretch/upper/upper_stretch_06.png', position: '上身' },
  { id: 'us-7', name: '肱二头肌拉伸', targetMuscle: '肱二头肌', image: '/images/stretch/upper/upper_stretch_07.png', position: '上身' },
  { id: 'us-8', name: '肱三头肌拉伸', targetMuscle: '肱三头肌', image: '/images/stretch/upper/upper_stretch_08.png', position: '上身' },
  { id: 'us-9', name: '前臂拉伸', targetMuscle: '前臂肌群', image: '/images/stretch/upper/upper_stretch_09.png', position: '上身' },
  { id: 'us-10', name: '斜方肌拉伸', targetMuscle: '斜方肌', image: '/images/stretch/upper/upper_stretch_10.png', position: '上身' },
  { id: 'us-11', name: '肩胛骨周围拉伸', targetMuscle: '菱形肌/肩胛提肌', image: '/images/stretch/upper/upper_stretch_11.png', position: '上身' },
];

// ============ 下身拉伸 (Lower Body Stretches) ============
// 图片: public/images/stretch/lower/lower_stretch_01.png ~ 04.png
export const lowerStretch: StretchItem[] = [
  { id: 'ls-1', name: '股四头肌拉伸', targetMuscle: '股四头肌', image: '/images/stretch/lower/lower_stretch_01.png', position: '下身' },
  { id: 'ls-2', name: '腘绳肌拉伸', targetMuscle: '腘绳肌', image: '/images/stretch/lower/lower_stretch_02.png', position: '下身' },
  { id: 'ls-3', name: '臀部拉伸', targetMuscle: '臀大肌', image: '/images/stretch/lower/lower_stretch_03.png', position: '下身' },
  { id: 'ls-4', name: '小腿拉伸', targetMuscle: '腓肠肌/比目鱼肌', image: '/images/stretch/lower/lower_stretch_04.png', position: '下身' },
];

export const stretchData: StretchData = {
  upper: upperStretch,
  lower: lowerStretch,
  attribution: '拉伸图片由 Joe Muscolino 博士绘制，经授权用于公众教育',
};
