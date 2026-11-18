// src/components/common/VideoSection.jsx
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../i18n/languageContext';
import { getImage } from '../../utils/images';
import ownVideo from '../../assets/videos/own_video.mp4';

const VideoSection = ({
  onOpenVideo,
  playInline = true,
  bgImage = 'bg-cover-video-02.jpg',
  videoSrc = ownVideo,
}) => {
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const sectionRef = useRef(null);
  const [sectionHeight, setSectionHeight] = useState(null);

  // Lưu chiều cao chính xác của section khi ở trạng thái banner ban đầu
  useEffect(() => {
    const updateHeight = () => {
      if (sectionRef.current && !isPlaying) {
        setSectionHeight(sectionRef.current.offsetHeight);
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [isPlaying]);

  // Thoát chế độ xem video khi nhấn phím Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isPlaying) {
        setIsPlaying(false);
      }
    };
    if (isPlaying) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  const handlePlayClick = () => {
    if (playInline) {
      setIsPlaying(true);
    } else if (onOpenVideo) {
      onOpenVideo();
    } else {
      setIsPlaying(true);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="section-video parallax100"
      style={{
        backgroundImage: `url(${typeof bgImage === 'string' && (bgImage.startsWith('http') || bgImage.startsWith('/')) ? bgImage : getImage(bgImage)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden',
        height: isPlaying && sectionHeight ? `${sectionHeight}px` : 'auto',
        minHeight: '480px',
      }}
    >
      {isPlaying ? (
        /* Vùng nền mờ hai bên - Click vào khoảng thừa hai bên này để thoát */
        <div
          className="video-backdrop-wrapper flex-c-m"
          onClick={() => setIsPlaying(false)}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
          title="Click vào khoảng thừa hai bên để thoát"
        >
          {/* Nút 'X' để thoát chế độ xem video */}
          <button
            type="button"
            className="btn-close-video flex-c-m trans-0-4"
            onClick={(e) => {
              e.stopPropagation();
              setIsPlaying(false);
            }}
            aria-label={t('common.close')}
            title="Thoát chế độ xem video (Esc)"
            style={{
              position: 'absolute',
              top: '20px',
              right: '25px',
              zIndex: 40,
              color: '#ffffff',
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '50%',
              width: '42px',
              height: '42px',
              fontSize: '24px',
              cursor: 'pointer',
              lineHeight: '1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(236, 29, 36, 0.85)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.65)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            &times;
          </button>

          {/* Khung video: Chiều cao bằng chiều cao section, chiều dài (rộng) tự động theo tỷ lệ video */}
          <div
            className="video-container"
            onClick={(e) => e.stopPropagation()}
            style={{
              height: '100%',
              maxHeight: sectionHeight ? `${sectionHeight}px` : '100%',
              width: 'auto',
              maxWidth: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'default',
              boxShadow: '0 10px 45px rgba(0, 0, 0, 0.85)',
              backgroundColor: '#000',
            }}
          >
            <video
              src={videoSrc}
              controls
              autoPlay
              playsInline
              title={t('video.title')}
              onClick={(e) => e.stopPropagation()}
              style={{
                height: '100%',
                maxHeight: sectionHeight ? `${sectionHeight}px` : '100%',
                width: 'auto',
                maxWidth: '100%',
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto',
                backgroundColor: '#000',
              }}
            />
          </div>
        </div>
      ) : (
        <div className="content-video t-center p-t-225 p-b-250">
          <span className="tit2 p-l-15 p-r-15">{t('common.discover')}</span>

          <h3 className="tit4 t-center p-l-15 p-r-15 p-t-3">{t('video.title')}</h3>

          <button
            type="button"
            className="btn-play ab-center size16 hov-pointer m-l-r-auto m-t-43 m-b-33 border-0 bg-transparent"
            onClick={handlePlayClick}
            aria-label={t('common.playVideo')}
          >
            <div className="flex-c-m sizefull bo-cir bgwhite color1 hov1 trans-0-4">
              <i className="fa fa-play fs-18 m-l-2" aria-hidden="true"></i>
            </div>
          </button>
        </div>
      )}
    </section>
  );
};

export default VideoSection;
