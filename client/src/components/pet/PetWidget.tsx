import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Box, Tooltip } from '@mui/material';
import { getLevel } from '../../api/user';
import type { CultivationLevelDTO } from '../../types';
import { PET_TYPE_EMOJI } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { usePetStore } from '../../stores/petStore';

const PetWidget: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { pet } = usePetStore();
  const [level, setLevel] = useState<CultivationLevelDTO | null>(null);
  const [pos, setPos] = useState({ x: window.innerWidth - 120, y: window.innerHeight - 180 });
  const [dragging, setDragging] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [hearts, setHearts] = useState<number[]>([]);
  const dragRef = useRef({ startX: 0, startY: 0, origX: 0, origY: 0 });
  const heartId = useRef(0);

  useEffect(() => {
    if (isAuthenticated) {
      getLevel().then(res => setLevel(res.data)).catch(() => {});
    }
  }, [isAuthenticated]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setDragging(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
  }, [pos]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPos({
      x: Math.max(0, Math.min(window.innerWidth - 80, dragRef.current.origX + dx)),
      y: Math.max(0, Math.min(window.innerHeight - 80, dragRef.current.origY + dy)),
    });
  }, [dragging]);

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleClick = () => {
    if (dragging) return;
    setClicked(true);
    const id = ++heartId.current;
    setHearts(prev => [...prev, id]);
    setTimeout(() => setClicked(false), 600);
    setTimeout(() => setHearts(prev => prev.filter(h => h !== id)), 2000);
  };

  if (!pet || !isAuthenticated) return null;

  const tierIndex = level?.tierIndex || 0;
  const petSize = 50 + pet.stage * 12;
  const emoji = PET_TYPE_EMOJI[pet.type as keyof typeof PET_TYPE_EMOJI] || '🐱';
  const stageGlow = ['', '0 0 10px #4CAF50', '0 0 15px #FFC107', '0 0 20px #9C27B0', '0 0 25px #F44336'][pet.stage - 1] || '';

  return (
    <div
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        zIndex: 9999,
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        transition: dragging ? 'none' : 'all 0.3s',
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {/* 爱心特效 */}
      {hearts.map(id => (
        <span
          key={id}
          style={{
            position: 'absolute',
            fontSize: 20,
            animation: 'heartFloat 2s ease-out forwards',
            left: petSize / 2,
            top: -10,
            pointerEvents: 'none',
          }}
        >
          ❤️
        </span>
      ))}

      {/* 宠物 */}
      <Tooltip title={`${pet.name} · ${level?.displayName || ''} · 点击互动`} arrow>
        <Box
          sx={{
            width: petSize,
            height: petSize,
            fontSize: petSize * 0.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            filter: stageGlow ? `drop-shadow(${stageGlow})` : 'none',
            transform: clicked ? 'scale(1.3)' : 'scale(1)',
            transition: 'transform 0.3s',
            animation: `float 3s ease-in-out infinite${clicked ? '' : ', blink 4s infinite'}`,
          }}
        >
          {emoji}
        </Box>
      </Tooltip>

      {/* 状态指示 */}
      <Box
        sx={{
          position: 'absolute',
          bottom: -4,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 10,
          bgcolor: 'rgba(0,0,0,0.7)',
          color: 'white',
          px: 0.5,
          borderRadius: 1,
          whiteSpace: 'nowrap',
        }}
      >
        Lv.{level?.totalLevel || 1}
      </Box>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes blink {
          0%, 90%, 100% { opacity: 1; }
          95% { opacity: 0.3; }
        }
        @keyframes heartFloat {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-60px) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default PetWidget;
