import { useEffect } from 'react';
import AppRouter from '@/routes';
import { useProgressStore } from '@/store/progressStore';

function App() {
  const { init, ready } = useProgressStore();

  useEffect(() => {
    void init();
  }, [init]);

  if (!ready) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #fff5d6, #e8f5e0)',
          fontFamily: '"PingFang SC", sans-serif',
          fontSize: 24,
          color: '#2d8b57',
        }}
      >
        正在加载冒险地图…
      </div>
    );
  }

  return <AppRouter />;
}

export default App;
