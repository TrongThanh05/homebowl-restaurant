// src/pages/Home.jsx
import { useState } from 'react';
import BlogSection from '../components/common/BlogSection';
import BookingSection from '../components/common/BookingSection';
import EventSection from '../components/common/EventSection';
import IntroSection from '../components/common/IntroSection';
import MenuSection from '../components/common/MenuSection';
import ReviewSection from '../components/common/ReviewSection';
import SignUpSection from '../components/common/SignUpSection';
import HeroSlider from '../components/common/HeroSlider';
import VideoModal from '../components/common/VideoModal';
import VideoSection from '../components/common/VideoSection';
import WelcomeSection from '../components/common/WelcomeSection';

export default function Home() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <>
      <HeroSlider />
      <WelcomeSection />
      <IntroSection />
      <MenuSection />
      <EventSection />
      <BookingSection />
      <ReviewSection />
      <VideoSection onOpenVideo={() => setIsVideoOpen(true)} />
      <BlogSection />
      <SignUpSection />
      <div id="dropDownSelect1"></div>
      <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
    </>
  );
}
