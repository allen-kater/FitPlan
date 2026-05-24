import React, { useEffect, useState } from 'react';
import {
  Typography, Tabs, Tab, Card, CardContent, CardMedia, Box, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Accordion, AccordionSummary, AccordionDetails, Link,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import * as knowledgeApi from '../api/knowledge';
import LoadingSpinner from '../components/common/LoadingSpinner';

interface JointActivityData {
  tableA: any[];
  tableB: any;
  images: { jointMuscle: any[]; muscleJoint: any[] };
  videoUrl: string;
  softwareInfo: string;
}

const JointActivityPage: React.FC = () => {
  const [data, setData] = useState<JointActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainTab, setMainTab] = useState(0);
  const [bTab, setBTab] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await knowledgeApi.getJointActivity();
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to fetch joint activity data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner message="加载关节活动数据..." />;
  if (!data) return <Typography>加载失败</Typography>;

  const bSections = [
    { key: 'chestShoulder', label: '胸肩' },
    { key: 'back', label: '背' },
    { key: 'arms', label: '手臂' },
    { key: 'legs', label: '腿' },
  ];

  // Group tableA by joint
  const groupedA: Record<string, any[]> = {};
  data.tableA.forEach(row => {
    if (!groupedA[row.joint]) groupedA[row.joint] = [];
    groupedA[row.joint].push(row);
  });

  return (
    <div>
      <Typography variant="h4" gutterBottom>关节活动图谱</Typography>

      <Box className="mb-4">
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

      <Tabs value={mainTab} onChange={(_, v) => setMainTab(v)} className="mb-6">
        <Tab label="A表：关节活动的肌肉" />
        <Tab label="B表：肌肉的关节活动" />
        <Tab label="图示版" />
      </Tabs>

      {/* A Table */}
      {mainTab === 0 && (
        <div>
          <Typography variant="h6" className="mb-3">A表：一个关节活动有哪些肌肉参与？</Typography>
          <Typography variant="body2" color="text.secondary" className="mb-4">
            和标准解剖学相比，本表删除了健身动作里很少利用的关节活动，删除了参与关节活动但非健身目标的肌肉
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
              {`【注1】肩屈时，胸大肌只有上胸参与，越是上胸，肌纤维走向就越竖直，收缩对于肩屈的贡献就越大
【注2】肩伸时，肱三头肌只有长头参与，外侧头和内侧头是单关节肌（肘关节）
【注3】肩伸时，胸大肌只有下胸参与，越是下胸，肌纤维走向就越竖直
【注4】肩外展时，如果大臂在外旋位（手心朝天），肱二头肌长头越在肩关节外展轨迹上
【注5】肩内收时，胸大肌是下胸和中胸参与`}
            </Typography>
          </Paper>
        </div>
      )}

      {/* B Table */}
      {mainTab === 1 && (
        <div>
          <Typography variant="h6" className="mb-3">B表：一块肌肉有哪些关节活动？</Typography>
          <Tabs value={bTab} onChange={(_, v) => setBTab(v)} className="mb-4">
            {bSections.map(s => (
              <Tab key={s.key} label={s.label} />
            ))}
          </Tabs>

          {bSections.map((section, idx) => {
            if (bTab !== idx) return null;
            const sectionData = data.tableB[section.key as keyof typeof data.tableB] as any;
            if (!sectionData) return null;
            return (
              <div key={section.key}>
                <Typography variant="subtitle1" className="mb-2">{sectionData.label}</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {sectionData.headers.map((h: string) => (
                          <TableCell key={h}><strong>{h}</strong></TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sectionData.rows.map((row: any, rIdx: number) => (
                        <TableRow key={rIdx}>
                          <TableCell>{row.movement}</TableCell>
                          <TableCell>{row.description}</TableCell>
                          {sectionData.headers.slice(2).map((header: string) => {
                            const val = row.muscles?.[header];
                            return (
                              <TableCell key={header}>
                                {val ? (
                                  <Typography variant="body2" color="primary">{val}</Typography>
                                ) : (
                                  <Typography variant="body2" color="text.disabled">—</Typography>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            );
          })}
        </div>
      )}

      {/* Images Tab */}
      {mainTab === 2 && (
        <div>
          <Typography variant="h6" className="mb-4">图示版</Typography>

          <Typography variant="subtitle1" className="mb-3">关节活动的肌肉（{data.images.jointMuscle.length}张）</Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {data.images.jointMuscle.map((img: any) => (
              <Card key={img.id}>
                <CardMedia
                  component="img"
                  image={img.image}
                  alt={img.label}
                  sx={{ maxHeight: 500, objectFit: 'contain' }}
                />
                <CardContent>
                  <Typography variant="body2" color="text.secondary">{img.label}</Typography>
                </CardContent>
              </Card>
            ))}
          </div>

          <Typography variant="subtitle1" className="mb-3">肌肉的关节活动（{data.images.muscleJoint.length}张）</Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.images.muscleJoint.map((img: any) => (
              <Card key={img.id}>
                <CardMedia
                  component="img"
                  image={img.image}
                  alt={img.label}
                  sx={{ maxHeight: 500, objectFit: 'contain' }}
                />
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

export default JointActivityPage;
