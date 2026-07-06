import React from 'react';
import { X } from 'lucide-react';
import defaultAvatar from '../../../assets/avatar-default.svg';
import './style.css';

interface SidebarProfileProps {
  isDesktop: boolean;
  onClose: () => void;
}

export const SidebarProfile: React.FC<SidebarProfileProps> = ({ isDesktop, onClose }) => {
  return (
    <div className="sidebar-profile">
      <div className="profile-avatar guest">
        <img src={defaultAvatar} alt="Avatar" className="profile-avatar-img" />
      </div>
      <div className="profile-info">
        <h3 className="profile-name">Tài khoản ẩn danh</h3>
        <p className="profile-email sync-notice">Đăng nhập để đồng bộ đa nền tảng</p>
      </div>
      {!isDesktop && (
        <button type="button" className="btn btn-secondary btn-icon-only close-btn" onClick={onClose}>
          <X size={18} />
        </button>
      )}
    </div>
  );
};
