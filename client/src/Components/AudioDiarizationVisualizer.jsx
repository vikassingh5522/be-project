import React, { useEffect, useRef } from 'react';
import { Box, Typography, Paper } from '@mui/material';

const AudioDiarizationVisualizer = ({ diarizationData }) => {
    const canvasRef = useRef(null);
    
    useEffect(() => {
        if (!diarizationData || !diarizationData.success || !diarizationData.segments) {
            return;
        }
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Set up colors for different speakers
        const colors = {
            'Speaker 0': '#FF6B6B',
            'Speaker 1': '#4ECDC4'
        };
        
        // Calculate time scale
        const totalDuration = diarizationData.total_duration;
        const timeScale = width / totalDuration;
        
        // Draw segments
        diarizationData.segments.forEach(segment => {
            const x = segment.start * timeScale;
            const segmentWidth = segment.duration * timeScale;
            
            // Draw segment rectangle
            ctx.fillStyle = colors[segment.speaker] || '#CCCCCC';
            ctx.fillRect(x, 0, segmentWidth, height);
            
            // Draw speaker label
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '12px Arial';
            ctx.fillText(segment.speaker, x + 5, height - 5);
            
            // Draw time labels
            const startTime = formatTime(segment.start);
            const endTime = formatTime(segment.end);
            ctx.fillText(startTime, x + 5, 15);
            ctx.fillText(endTime, x + segmentWidth - 40, 15);
        });
        
    }, [diarizationData]);
    
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    
    if (!diarizationData || !diarizationData.success) {
        return (
            <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="error">
                    {diarizationData?.error || 'No diarization data available'}
                </Typography>
            </Paper>
        );
    }
    
    return (
        <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Speaker Diarization Timeline
            </Typography>
            <Box sx={{ width: '100%', height: 100, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={100}
                    style={{ width: '100%', height: '100%' }}
                />
            </Box>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 20, height: 20, bgcolor: '#FF6B6B' }} />
                    <Typography>Speaker 1</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 20, height: 20, bgcolor: '#4ECDC4' }} />
                    <Typography>Speaker 2</Typography>
                </Box>
            </Box>
        </Paper>
    );
};

export default AudioDiarizationVisualizer; 