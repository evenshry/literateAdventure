import StrokeAnimation from '@/components/StrokeAnimation';
import styles from './index.module.scss';

function TestStroke() {
  return (
    <div className={styles.page}>
      <h1>笔顺动画测试</h1>
      <div className={styles.testArea}>
        <StrokeAnimation char="人" size={250} autoPlay={true} />
      </div>
    </div>
  );
}

export default TestStroke;
