import dynamic from 'next/dynamic';

const BodyScanCamera = dynamic(() => import('@/components/BodyScanCamera'), {
  ssr: false,
  loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Loading camera...</div>,
});

export default function Home() {
  return (
    <main>
      <div className="header">
        <h1>Body Composition Scanner</h1>
        <p>Position yourself in front of the camera and hover for 3 seconds</p>
      </div>
      <BodyScanCamera />
    </main>
  );
}

