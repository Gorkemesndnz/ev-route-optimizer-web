import { APIProvider, Map } from '@vis.gl/react-google-maps';

export default function BackgroundMap({ apiKey }: { apiKey: string }) {
  return (
    <div className="absolute inset-0 z-0">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={{ lat: 39.92077, lng: 32.85411 }} // Ankara default
          defaultZoom={6}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
          mapId={"DEMO_MAP_ID"}
          className="w-full h-full"
        />
      </APIProvider>
    </div>
  );
}
