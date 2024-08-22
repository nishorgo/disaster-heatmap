import { google as gl } from "googleapis";
import {GoogleMap, HeatmapLayerF, useJsApiLoader} from "@react-google-maps/api"
import { useState } from "react";


export async function getServerSideProps() {
  const auth = await gl.auth.getClient({ scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"] });
  const sheets = gl.sheets({ version: 'v4', auth });

  const range = "Sheet1!A2:C10000";

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEETS_ID,
    range,
  });

  const locations = response.data.values;
  
  return {
    props: {
      locations
    },
  };
}

export default function Home({ locations }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.MAPS_API_KEY,
    libraries: ["visualization"]
  });
  const [map, setMap] = useState(null);
  
  if(!isLoaded) {
    return <div className="grid place-items-center h-screen text-xl">Loading... please wait.</div>
  }
  
  const center = {lat: 37.782, lng: -122.447};
  const heatMapData = locations.map((location) => ({
    location: new google.maps.LatLng(location[0], location[1]), weight: location[2]
  }));

  console.log(heatMapData);

  return (
    <main className="w-screen h-screen" >
      <GoogleMap 
        mapContainerStyle={{position: "relative", width: "100%", height: "100%"}}
        center={center}
        zoom={15}
        onLoad={(map) => setMap(map)}
      >
        { map && heatMapData &&
        <>
          <HeatmapLayerF
            data={heatMapData}
            options={{radius: 30, opacity: 1}}
          />
        </>
        }
      </GoogleMap>
    </main>
  );
}
