import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Timeline from './components/Timeline';
import Faq from './components/Faq';
import Footer from './components/Footer';
import Referral from './components/Referral';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      <main>
        <Hero />
        <Referral />
        <Timeline />
        <Faq />
      </main>
      <Footer />
    </div>
  );
};

export default App;