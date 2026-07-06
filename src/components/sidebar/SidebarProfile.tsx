import React from 'react';
import { X } from 'lucide-react';

interface SidebarProfileProps {
  isDesktop: boolean;
  onClose: () => void;
}

export const SidebarProfile: React.FC<SidebarProfileProps> = ({ isDesktop, onClose }) => {
  return (
    <div className="sidebar-profile">
      <div className="profile-avatar">
        <span>TH</span>
      </div>
      <div className="profile-info">
        <h3 className="profile-name">Tôn Nguyễn Hồng</h3>
        <p className="profile-email">nguyenhongtonpy2004@gmail.com</p>
      </div>
      {!isDesktop && (
        <button type="button" className="btn btn-secondary btn-icon-only close-btn" onClick={onClose}>
          <X size={18} />
        </button>
      )}
    </div>
  );
};
