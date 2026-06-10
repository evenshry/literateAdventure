import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '@pages/Home';
import Map from '@pages/Map';
import Learn from '@pages/Learn';
import WrongBook from '@pages/WrongBook';
import Dashboard from '@pages/Dashboard';
import { useProgressStore } from '@/store/progressStore';

function App() {
  const { init, ready } = useProgressStore();

  useEffect(() => {
    void init();
  }, [init]);

  if (!ready) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #fff5d6, #e8f5e0)',
        fontFamily: '"PingFang SC", sans-serif',
        fontSize: 24,
        color: '#2d8b57',
      }}>
        正在加载冒险地图…
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/map" element={<Map />} />
      <Route path="/map/:level" element={<Map />} />
      <Route path="/learn/:char" element={<Learn />} />
      <Route path="/wrong" element={<WrongBook />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}

export default App;
