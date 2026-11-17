// src/components/common/VideoModal.jsx
import { useEffect } from 'react';
import { useLanguage } from '../../i18n/languageContext';
import { getImage } from '../../utils/images';
import ownVideo from '../../assets/videos/own_video.mp4';

const VideoModal = ({ isOpen, onClose, videoSrc = ownVideo }) => {
  const { t } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <>
      <div
        className={`modal fade ${isOpen ? 'show' : ''}`}
        id="modal-video-01"
        tabIndex="-1"
        role="dialog"
        aria-hidden={!isOpen}
        style={{
          display: isOpen ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          zIndex: 1250,
        }}
        onClick={onClose}
      >
        <div
          className="modal-dialog"
          role="document"
          style={{
            pointerEvents: 'auto',
            maxWidth: 'min(92vw, 960px)',
            width: '100%',
            margin: '0 auto',
            position: 'relative',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Nút đóng góc trên bên phải */}
          <button
            type="button"
            className="close-mo-video-01 trans-0-4 border-0 bg-transparent"
            aria-label={t('common.close')}
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '-45px',
              right: '0',
              zIndex: 1300,
              color: '#fff',
              fontSize: '40px',
              cursor: 'pointer',
              lineHeight: '1',
              pointerEvents: 'auto',
            }}
          >
            &times;
          </button>

          <div
            className="wrap-video-mo-01"
            style={{
              width: '100%',
              maxWidth: '100%',
              margin: '0',
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.7)',
              backgroundColor: '#000',
              aspectRatio: '16 / 9',
              pointerEvents: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full wrap-pic-w op-0-0" style={{ display: 'none' }}>
              <img src={getImage('icons/video-16-9.jpg')} alt="IMG" />
            </div>

            <div
              className="video-mo-01"
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                opacity: 1,
                pointerEvents: 'auto',
                backgroundColor: '#000',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {isOpen && (
                <video
                  src={videoSrc}
                  controls
                  autoPlay
                  playsInline
                  title={t('video.modalTitle')}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                    pointerEvents: 'auto',
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      {isOpen && (
        <div
          className="modal-backdrop fade show"
          style={{ zIndex: 1240 }}
          onClick={onClose}
        ></div>
      )}
    </>
  );
};

export default VideoModal;
