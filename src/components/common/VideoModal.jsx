// src/components/common/VideoModal.jsx
import { getImage } from '../../utils/images';

const VideoModal = ({ isOpen, onClose }) => {
  return (
    <>
      <div
        className={`modal fade ${isOpen ? 'show' : ''}`}
        id="modal-video-01"
        tabIndex="-1"
        role="dialog"
        aria-hidden={!isOpen}
        style={{ display: isOpen ? 'block' : 'none' }}
        onClick={onClose}
      >
        <div
          className="modal-dialog"
          role="document"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="close-mo-video-01 trans-0-4"
            aria-label="Close"
            onClick={onClose}
            role="button"
            tabIndex={0}
          >
            &times;
          </div>

          <div className="wrap-video-mo-01">
            <div className="w-full wrap-pic-w op-0-0">
              <img src={getImage('icons/video-16-9.jpg')} alt="IMG" />
            </div>
            <div className="video-mo-01">
              {isOpen && (
                <iframe
                  src="https://www.youtube.com/embed/5k1hSu2gdKE?autoplay=1&rel=0&showinfo=0"
                  allowFullScreen
                  title="Restaurant Video"
                ></iframe>
              )}
            </div>
          </div>
        </div>
      </div>
      {isOpen && <div className="modal-backdrop fade show" onClick={onClose}></div>}
    </>
  );
};

export default VideoModal;
