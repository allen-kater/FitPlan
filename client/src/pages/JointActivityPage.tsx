import React, { useEffect, useState } from 'react';
import {
  Typography, Card, CardContent, CardMedia, Box, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Accordion, AccordionSummary, AccordionDetails, Link, Divider,
  Tabs, Tab, Alert, IconButton, Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import ImageIcon from '@mui/icons-material/Image';
import * as knowledgeApi from '../api/knowledge';
import LoadingSpinner from '../components/common/LoadingSpinner';

/** A表行：关节活动 → 参与肌肉 */
interface TableARow {
  joint: string;
  movement: string;
  description: string;
  example: string;
  muscles: string[];
}

/** B表行：肌肉 → 关节活动 */
interface TableBRow {
  muscleGroup: string;
  subGroup: string;
  jointActivities: string[];
}

interface JointActivityData {
  tableA: TableARow[];
  tableB: TableBRow[];
  images: { jointMuscle: any[]; muscleJoint: any[] };
  videoUrl: string;
  softwareInfo: string;
}

/** A表注释 */
const TABLE_A_NOTES = `【注1】肩屈时，胸大肌只有上胸参与，越是上胸，肌纤维走向就越竖直，收缩对于肩屈的贡献就越大
【注2】肩伸时，肱三头肌只有长头参与，外侧头和内侧头是单关节肌（肘关节）
【注3】肩伸时，胸大肌只有下胸参与，越是下胸，肌纤维走向就越竖直
【注4】肩外展时，如果大臂在外旋位（手心朝天），肱二头肌长头越在肩关节外展轨迹上
【注5】肩内收时，胸大肌是下胸和中胸参与`;

/** B表肌肉群分组标签 */
const B_SECTION_LABELS: Record<string, string> = {
  chestShoulder: '胸肩',
  back: '背',
  arms: '手臂',
  legs: '腿',
};

/** B表肌肉群分组映射 */
const B_SECTION_MAPPING: Record<string, string[]> = {
  chestShoulder: ['胸', '肩'],
  back: ['背'],
  arms: ['臂'],
  legs: ['臀', '腿'],
};

// ==================== Sub-components ====================

/** 支持动画切换的图片组件 */
const AnimatedImage: React.FC<{ img: any }> = ({ img }) => {
  const [useAnimated, setUseAnimated] = useState(!!img.animatedImage);
  const [animError, setAnimError] = useState(false);

  const currentSrc = useAnimated && !animError ? img.animatedImage : img.image;

  return (
    <Box sx={{ position: 'relative' }}>
      <CardMedia
        component="img"
        image={currentSrc}
        alt={img.label}
        sx={{ maxHeight: 500, objectFit: 'contain' }}
        onError={() => {
          if (useAnimated) {
            setAnimError(true);
            setUseAnimated(false);
          }
        }}
      />
      {img.animatedImage && !animError && (
        <Box sx={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', gap: 0.5 }}>
          <Tooltip title={useAnimated ? '查看静态图' : '查看动态图'}>
            <IconButton
              size="small"
              sx={{ bgcolor: 'rgba(0,0,0,0.6)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
              onClick={() => setUseAnimated(!useAnimated)}
            >
              {useAnimated ? <ImageIcon fontSize="small" /> : <PlayCircleIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};

/** 第一大部分：关节活动的肌肉（A表） */
const JointMuscleSection: React.FC<{ data: JointActivityData }> = ({ data }) => {
  // Group tableA rows by joint
  const groupedA: Record<string, TableARow[]> = {};
  data.tableA.forEach(row => {
    if (!groupedA[row.joint]) groupedA[row.joint] = [];
    groupedA[row.joint].push(row);
  });

  return (
    <div>
      <Typography variant="body2" color="text.secondary" className="mb-4">
        以<strong>关节 + 活动</strong>为主体，展示每个关节活动有哪些肌肉参与。
        和标准解剖学相比，本表删除了健身动作里很少利用的关节活动，删除了参与关节活动但非健身目标的肌肉。
      </Typography>

      {Object.entries(groupedA).map(([joint, rows]) => (
        <Accordion key={joint} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Chip label={joint} color="primary" className="mr-2" />
            <Typography>{rows.length} 个关节活动</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>关节活动</TableCell>
                    <TableCell>通俗描述</TableCell>
                    <TableCell>单关节动作举例</TableCell>
                    <TableCell>参与肌肉</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell><strong>{row.movement}</strong></TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell>{row.example}</TableCell>
                      <TableCell>
                        {row.muscles.map((m: string, i: number) => (
                          <Chip key={i} label={m} size="small" variant="outlined" className="m-0.5" />
                        ))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Notes */}
      <Paper className="p-4 mt-4" variant="outlined">
        <Typography variant="body2" color="text.secondary" className="whitespace-pre-line text-sm">
          {TABLE_A_NOTES}
        </Typography>
      </Paper>

      {/* A表图片 */}
      {data.images.jointMuscle.length > 0 && (
        <div className="mt-6">
          <Typography variant="subtitle1" className="mb-3">
            关节活动的肌肉图示（{data.images.jointMuscle.length}张）
            <Chip label="可切换动图" size="small" color="info" variant="outlined" className="ml-2" />
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.images.jointMuscle.map((img: any) => (
              <Card key={img.id}>
                <AnimatedImage img={img} />
                <CardContent>
                  <Typography variant="body2" color="text.secondary">{img.label}</Typography>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/** 第二大部分：肌肉的关节活动（B表） */
const MuscleJointSection: React.FC<{ data: JointActivityData }> = ({ data }) => {
  const [bTab, setBTab] = useState(0);

  // Group tableB rows by muscleGroup, then further by B_SECTION_MAPPING sections
  const bSectionKeys = Object.keys(B_SECTION_MAPPING);
  const groupedBSections = bSectionKeys.map(sectionKey => {
    const groups = B_SECTION_MAPPING[sectionKey];
    const rows = data.tableB.filter(row => groups.includes(row.muscleGroup));
    return { key: sectionKey, label: B_SECTION_LABELS[sectionKey], rows };
  });

  return (
    <div>
      <Typography variant="body2" color="text.secondary" className="mb-4">
        以<strong>肌肉 + 部位</strong>为主体，展示每块肌肉参与的所有关节活动。
      </Typography>

      <Tabs value={bTab} onChange={(_, v) => setBTab(v)} className="mb-4">
        {groupedBSections.map(section => (
          <Tab key={section.key} label={section.label} />
        ))}
      </Tabs>

      {groupedBSections.map((section, idx) => {
        if (bTab !== idx) return null;
        if (section.rows.length === 0) {
          return (
            <Typography key={section.key} color="text.secondary" className="text-center py-8">
              暂无数据
            </Typography>
          );
        }
        return (
          <div key={section.key}>
            <Typography variant="subtitle1" className="mb-2">{section.label}</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>肌肉群</strong></TableCell>
                    <TableCell><strong>肌肉</strong></TableCell>
                    <TableCell><strong>参与的关节活动</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {section.rows.map((row, rIdx) => (
                    <TableRow key={rIdx}>
                      <TableCell>{row.muscleGroup}</TableCell>
                      <TableCell><strong>{row.subGroup}</strong></TableCell>
                      <TableCell>
                        {row.jointActivities.map((activity: string, i: number) => (
                          <Chip key={i} label={activity} size="small" color="primary" variant="outlined" className="m-0.5" />
                        ))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        );
      })}

      {/* B表图片 */}
      {data.images.muscleJoint.length > 0 && (
        <div className="mt-6">
          <Typography variant="subtitle1" className="mb-3">
            肌肉的关节活动图示（{data.images.muscleJoint.length}张）
            <Chip label="可切换动图" size="small" color="info" variant="outlined" className="ml-2" />
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.images.muscleJoint.map((img: any) => (
              <Card key={img.id}>
                <AnimatedImage img={img} />
                <CardContent>
                  <Typography variant="body2" color="text.secondary">{img.label}</Typography>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== Main Page ====================

const JointActivityPage: React.FC = () => {
  const [data, setData] = useState<JointActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await knowledgeApi.getJointActivity();
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch joint activity data:', err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner message="加载关节活动数据..." />;
  if (!data) return <Typography>加载失败 {error ? `: ${error}` : ''}</Typography>;

  return (
    <div>
      <Typography variant="h4" gutterBottom>关节活动图谱</Typography>

      <Box className="mb-4">
        <Alert severity="info" sx={{ mb: 2 }}>
          动态图功能已上线！点击图片右下角的 <PlayCircleIcon fontSize="small" sx={{ verticalAlign: 'middle' }} /> 按钮可切换动图。
          动图文件请放入 <code>public/images/joint/animated/</code> 目录（GIF格式），<strong>文件命名需与静态图一致</strong>。
        </Alert>
        <Typography variant="body2" color="text.secondary">
          配套视频：
          <Link href={data.videoUrl} target="_blank" underline="hover" className="ml-1">
            《健身新手的解剖完全手册》
          </Link>
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mt-1">
          {data.softwareInfo}
        </Typography>
      </Box>

      {/* ===== 第一大部分：关节活动的肌肉（A表） ===== */}
      <Paper className="p-6 mb-8" variant="outlined" sx={{ borderColor: 'primary.main', borderWidth: 2 }}>
        <Typography variant="h5" gutterBottom color="primary">
          一、关节活动的肌肉
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mb-1">
          对应 Excel Sheet28 — 以关节 + 活动为主体
        </Typography>
        <Divider className="mb-4" />
        <JointMuscleSection data={data} />
      </Paper>

      {/* ===== 第二大部分：肌肉的关节活动（B表） ===== */}
      <Paper className="p-6 mb-8" variant="outlined" sx={{ borderColor: 'secondary.main', borderWidth: 2 }}>
        <Typography variant="h5" gutterBottom color="secondary">
          二、肌肉的关节活动
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mb-1">
          对应 Excel Sheet29 — 以肌肉 + 部位为主体
        </Typography>
        <Divider className="mb-4" />
        <MuscleJointSection data={data} />
      </Paper>
    </div>
  );
};

export default JointActivityPage;
