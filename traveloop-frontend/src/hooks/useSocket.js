import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { addNotification } from '@/store/slices/notificationSlice';
import toast from 'react-hot-toast';

export const useSocket = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
      withCredentials: true,
    });

    if (user?.id) {
      socketRef.current.on('connect', () => {
        socketRef.current.emit('join_user_room', user.id);
      });
    }

    socketRef.current.on('new_notification', (notification) => {
      dispatch(addNotification(notification));
      toast(notification.message, { icon: '🔔' });
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user, dispatch]);

  return socketRef.current;
};
