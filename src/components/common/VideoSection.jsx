import { useLanguage } from '../../i18n/languageContext';
import { getImage } from '../../utils/images';

const VideoSection = () => {
  const { t } = useLanguage();
  return (
    <section
      className="section-video parallax100"
      style={{ backgroundImage: `url(${getImage('bg-cover-video-02.jpg')})` }}
    >
      <div className="content-video t-center p-t-225 p-b-250">
        <span className="tit2 p-l-15 p-r-15">{t('common.discover')}</span>

        <h3 className="tit4 t-center p-l-15 p-r-15 p-t-3">{t('video.title')}</h3>

        <div
          className="btn-play ab-center size16 hov-pointer m-l-r-auto m-t-43 m-b-33"
          data-toggle="modal"
          data-target="#modal-video-01"
        >
          <div className="flex-c-m sizefull bo-cir bgwhite color1 hov1 trans-0-4">
            <i className="fa fa-play fs-18 m-l-2" aria-hidden="true"></i>
          </div>
        </div>
      </div>
    </section>
  );
};
export default VideoSection;
