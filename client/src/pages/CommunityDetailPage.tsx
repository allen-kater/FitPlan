import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography, Card, CardContent, Box, Avatar, Chip, IconButton,
  TextField, Button, Divider, Paper,
} from '@mui/material';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import * as communityApi from '../api/community';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CATEGORY_LABELS: Record<string, string> = {
  CHECK_IN: '健身打卡', TRAINING: '训练心得', DIET: '饮食分享',
  QUESTION: '问题求助', EXPERIENCE: '经验交流',
};

const CommunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (id) fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const res = await communityApi.getPostDetail(id!);
      const data = res.data.data;
      setPost(data);
      setIsLiked(data.isLiked);
      setIsFavorited(data.isFavorited);
      setLikeCount(data.likeCount);
    } catch (err) {
      console.error('Failed to fetch post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      const res = await communityApi.toggleLike(id!);
      const liked = res.data.data.liked;
      setIsLiked(liked);
      setLikeCount(prev => liked ? prev + 1 : prev - 1);
    } catch (err) { console.error(err); }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      const res = await communityApi.toggleFavorite(id!);
      setIsFavorited(res.data.data.favorited);
    } catch (err) { console.error(err); }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      await communityApi.createComment(id!, commentText);
      setCommentText('');
      fetchPost();
    } catch (err) { console.error(err); }
  };

  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleString('zh-CN');

  if (loading) return <LoadingSpinner message="加载帖子详情..." />;
  if (!post) return <Typography>帖子不存在</Typography>;

  return (
    <div>
      <Box className="flex items-center gap-2 mb-4">
        <IconButton onClick={() => navigate('/community')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" className="flex-1">帖子详情</Typography>
      </Box>

      <Card className="mb-6">
        <CardContent>
          <Box className="flex items-center gap-2 mb-3">
            <Avatar sx={{ bgcolor: 'primary.main' }}>{post.author.username[0]}</Avatar>
            <Box>
              <Typography variant="body1" fontWeight="bold">{post.author.username}</Typography>
              <Typography variant="caption" color="text.secondary">{formatTime(post.createdAt)}</Typography>
            </Box>
          </Box>

          <Chip
            label={CATEGORY_LABELS[post.category] || post.category}
            color="primary"
            size="small"
            className="mb-3"
          />

          <Typography variant="h5" className="mb-3">{post.title}</Typography>
          <Typography variant="body1" className="whitespace-pre-wrap leading-relaxed">
            {post.content}
          </Typography>

          <Divider className="my-3" />

          <Box className="flex items-center gap-4">
            <IconButton onClick={handleLike} color={isLiked ? 'primary' : 'default'}>
              {isLiked ? <ThumbUpIcon /> : <ThumbUpOffAltIcon />}
            </IconButton>
            <Typography variant="body2">{likeCount}</Typography>

            <IconButton onClick={handleFavorite} color={isFavorited ? 'warning' : 'default'}>
              {isFavorited ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
            <Typography variant="body2">{isFavorited ? '已收藏' : '收藏'}</Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Typography variant="h6" className="mb-3">
        评论 ({post.comments?.length || 0})
      </Typography>

      {isAuthenticated && (
        <Paper className="p-3 mb-4">
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="写下你的评论..."
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            inputProps={{ maxLength: 500 }}
          />
          <Box className="flex justify-end mt-2">
            <Button
              variant="contained"
              size="small"
              onClick={handleComment}
              disabled={!commentText.trim()}
            >
              发表评论
            </Button>
          </Box>
        </Paper>
      )}

      <div className="space-y-3">
        {post.comments?.map((comment: any) => (
          <Paper key={comment.id} className="p-3">
            <Box className="flex items-center gap-2 mb-1">
              <Avatar sx={{ width: 28, height: 28, bgcolor: 'secondary.main', fontSize: 14 }}>
                {comment.author.username[0]}
              </Avatar>
              <Typography variant="body2" fontWeight="bold">{comment.author.username}</Typography>
              <Typography variant="caption" color="text.secondary">
                {formatTime(comment.createdAt)}
              </Typography>
            </Box>
            <Typography variant="body2" className="ml-9">{comment.content}</Typography>
          </Paper>
        ))}
        {(!post.comments || post.comments.length === 0) && (
          <Typography color="text.secondary" className="text-center py-4">
            暂无评论，快来抢沙发！
          </Typography>
        )}
      </div>
    </div>
  );
};

export default CommunityDetailPage;
