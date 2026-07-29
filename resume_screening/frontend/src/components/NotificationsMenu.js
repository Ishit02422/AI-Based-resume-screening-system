import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function NotificationsMenu() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Click outside to close
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuRef]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications');
      if (res.data && res.data.data) {
        setNotifications(res.data.data);
        const count = res.data.data.filter(n => !n.isRead).length;
        setUnreadCount(count);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.post(`/api/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  return (
    <div className="relative" ref={menuRef} style={{ position: 'relative', display: 'inline-block', marginRight: '15px' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', position: 'relative' }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '-5px', right: '-5px',
            background: 'red', color: 'white', borderRadius: '50%',
            padding: '2px 6px', fontSize: '10px', fontWeight: 'bold'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', right: 0, top: '40px', width: '300px',
          background: 'white', border: '1px solid #ccc', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 1000, overflow: 'hidden'
        }}>
          <div style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, color: '#333' }}>Notifications</h4>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} style={{ fontSize: '12px', background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer' }}>
                Mark all as read
              </button>
            )}
          </div>
          
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No notifications</div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif._id} 
                  onClick={() => {
                    if (!notif.isRead) markAsRead(notif._id);
                    setIsOpen(false);
                  }}
                  style={{
                    padding: '12px 15px', 
                    borderBottom: '1px solid #eee',
                    background: notif.isRead ? '#fff' : '#f0f8ff',
                    cursor: 'pointer',
                    display: 'block',
                    textDecoration: 'none',
                    color: '#333'
                  }}
                >
                  {notif.link ? (
                    <Link to={notif.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ fontSize: '14px', marginBottom: '5px' }}>{notif.message}</div>
                      <div style={{ fontSize: '11px', color: '#888' }}>{new Date(notif.createdAt).toLocaleString()}</div>
                    </Link>
                  ) : (
                    <>
                      <div style={{ fontSize: '14px', marginBottom: '5px' }}>{notif.message}</div>
                      <div style={{ fontSize: '11px', color: '#888' }}>{new Date(notif.createdAt).toLocaleString()}</div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationsMenu;
