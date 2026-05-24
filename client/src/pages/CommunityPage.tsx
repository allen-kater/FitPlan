import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Card, CardContent, Chip, Box, Tabs, Tab, IconButton,
  Avatar, Button, Dialog, DialogTitle, DialogContent, TextField,
  DialogActions, Fab, Tooltip, Paper, List, ListItem, ListItemAvatar,
  ListItemText, Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import * as communityApi from '../api/community';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CATEGORIES = [
  { value: 'ALL', label: '全部' },
  { value: 'CHECK_IN', label: '健身打卡' },
  { value: 'TRAINING', label: '训练心得' },
  { value: 'DIET', label: '饮食分享' },
  { value: 'QUESTION', label: '问题求助' },
  { value: 'EXPERIENCE', label: '经验交流' },
];

const CATEGORY_COLORS: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'info'> = {
  CHECK_IN: 'success',
  TRAINING: 'primary',
  DIET: 'secondary',
  QUESTION: 'warning',
  EXPERIENCE: 'info',
};

interface PostItem {
  id: string;
  title: string;
  content: string;
  category: string;
  likeCount: number;
  commentCount: number;
  author: { id: string; username: string };
  createdAt: string;
}

const CommunityPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('ALL');
  const [sort, setSort] = useState<'latest' | 'hot'>('latest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'CHECK_IN' });
  const [rankings, setRankings] = useState<any[]>([]);
  const [rankingPeriod, setRankingPeriod] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    fetchPosts();
  }, [category, sort, page]);

  useEffect(() => {
    fetchRankings();
  }, [rankingPeriod]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await communityApi.getPosts({
        category: category === 'ALL' ? undefined : category,
        sort,
        page,
        pageSize: 10,
      });
      setPosts(res.data.data.posts);
      setTotalPages(res.data.data.totalPages);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRankings = async () => {
    try {
      const res = await communityApi.getRankings(rankingPeriod);
      setRankings(res.data.data);
    } catch (err) {
      console.error('Failed to fetch rankings:', err);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content) return;
    try {
      await communityApi.createPost(newPost);
      setOpenDialog(false);
      setNewPost({ title: '', content: '', category: 'CHECK_IN' });
      fetchPosts();
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  const getCategoryLabel = (val: string) => CATEGORIES.find(c => c.value === val)?.label || val;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return '刚刚';
    if (diffMin < 60) return `${diffMin}分钟前`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}小时前`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div>
      <Box className="flex items-center justify-between mb-4">
        <Typography variant="h4">健身社区</Typography>
        {isAuthenticated && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
            发帖
          </Button>
        )}
      </Box>

      {/* Category Filter */}
      <Box className="flex gap-2 mb-4 flex-wrap">
        {CATEGORIES.map(cat => (
          <Chip
            key={cat.value}
            label={cat.label}
            variant={category === cat.value ? 'filled' : 'outlined'}
            color="primary"
            onClick={() => { setCategory(cat.value); setPage(1); }}
          />
        ))}
      </Box>

      {/* Sort Toggle */}
      <Box className="mb-4">
        <Tabs value={sort} onChange={(_, v) => { setSort(v); setPage(1); }}>
          <Tab value="latest" label="最新" />
          <Tab value="hot" label="热门" />
        </Tabs>
      </Box>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Post List */}
        <div className="lg:col-span-2">
          {loading ? (
            <LoadingSpinner message="加载帖子..." />
          ) : posts.length === 0 ? (
            <Typography color="text.secondary" className="text-center py-8">
              暂无帖子，快来发表第一篇吧！
            </Typography>
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <Card
                  key={post.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/community/${post.id}`)}
                >
                  <CardContent>
                    <Box className="flex items-center gap-2 mb-2">
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        {post.author.username[0]}
                      </Avatar>
                      <Typography variant="body2" fontWeight="bold">{post.author.username}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(post.createdAt)}
                      </Typography>
                    </Box>
                    <Chip
                      label={getCategoryLabel(post.category)}
                      color={CATEGORY_COLORS[post.category] || 'default'}
                      size="small"
                      className="mb-2"
                    />
                    <Typography variant="h6" className="mb-1">{post.title}</Typography>
                    <Typography variant="body2" color="text.secondary" className="line-clamp-2">
                      {post.content}
                    </Typography>
                    <Box className="flex items-center gap-4 mt-2">
                      <Box className="flex items-center gap-0.5">
                        <ThumbUpOffAltIcon fontSize="small" color="action" />
                        <Typography variant="caption">{post.likeCount}</Typography>
                      </Box>
                      <Box className="flex items-center gap-0.5">
                        <ChatBubbleOutlineIcon fontSize="small" color="action" />
                        <Typography variant="caption">{post.commentCount}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
              {/* Pagination */}
              {totalPages > 1 && (
                <Box className="flex justify-center gap-2 mt-4">
                  <Button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>上一页</Button>
                  <Typography className="py-2">{page} / {totalPages}</Typography>
                  <Button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>下一页</Button>
                </Box>
              )}
            </div>
          )}
        </div>

        {/* Sidebar - Rankings */}
        <div>
          <Paper className="p-4 sticky top-4">
            <Box className="flex items-center gap-2 mb-3">
              <EmojiEventsIcon color="warning" />
              <Typography variant="h6">打卡排行榜</Typography>
            </Box>
            <Tabs
              value={rankingPeriod}
              onChange={(_, v) => setRankingPeriod(v)}
              variant="fullWidth"
              className="mb-2"
            >
              <Tab value="weekly" label="周榜" />
              <Tab value="monthly" label="月榜" />
            </Tabs>
            {rankings.length === 0 ? (
              <Typography variant="body2" color="text.secondary" className="text-center py-4">
                暂无打卡数据
              </Typography>
            ) : (
              <List dense>
                {rankings.map((r, idx) => (
                  <React.Fragment key={r.user.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: idx < 3 ? 'warning.main' : 'grey.400', width: 32, height: 32 }}>
                          {idx + 1}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={r.user.username}
                        secondary={`${r.checkInCount} 次打卡`}
                      />
                    </ListItem>
                    {idx < rankings.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </div>
      </div>

      {/* FAB for mobile */}
      {isAuthenticated && (
        <Tooltip title="发帖">
          <Fab
            color="primary"
            className="fixed bottom-6 right-6 lg:hidden"
            onClick={() => setOpenDialog(true)}
          >
            <AddIcon />
          </Fab>
        </Tooltip>
      )}

      {/* Create Post Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>发布帖子</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="标题"
            fullWidth
            value={newPost.title}
            onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))}
            inputProps={{ maxLength: 50 }}
            className="mb-3"
          />
          <TextField
            label="内容"
            fullWidth
            multiline
            rows={6}
            value={newPost.content}
            onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
            inputProps={{ maxLength: 2000 }}
            className="mb-3"
          />
          <Typography variant="body2" className="mb-2">选择分类：</Typography>
          <Box className="flex gap-2 flex-wrap">
            {CATEGORIES.filter(c => c.value !== 'ALL').map(cat => (
              <Chip
                key={cat.value}
                label={cat.label}
                variant={newPost.category === cat.value ? 'filled' : 'outlined'}
                color={CATEGORY_COLORS[cat.value] || 'default'}
                onClick={() => setNewPost(p => ({ ...p, category: cat.value }))}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>取消</Button>
          <Button
            variant="contained"
            onClick={handleCreatePost}
            disabled={!newPost.title || !newPost.content}
          >
            发布
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CommunityPage;
