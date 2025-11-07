import BodyScanCamera from '@/components/BodyScanCamera';

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

