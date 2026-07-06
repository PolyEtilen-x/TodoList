import React from 'react';
import { X } from 'lucide-react';
import defaultAvatar from '../../../assets/avatar-default.svg';
import { useApp } from '../../../context/AppContext';
import './style.css';

interface SidebarProfileProps {
  isDesktop: boolean;
  onClose: () => void;
}

export const SidebarProfile: React.FC<SidebarProfileProps> = ({ isDesktop, onClose }) => {
  const { t } = useApp();

  return (
    <div className="sidebar-profile">
      <div className="profile-avatar guest">
        <img src={defaultAvatar} alt="Avatar" className="profile-avatar-img" />
      </div>
      <div className="profile-info">
        <h3 className="profile-name">{t('profileAnonymous')}</h3>
        <p className="profile-email sync-notice">{t('syncNotice')}</p>
      </div>
      {!isDesktop && (
        <button type="button" className="btn btn-secondary btn-icon-only close-btn" onClick={onClose}>
          <X size={18} />
        </button>
      )}
    </div>
  );
};
