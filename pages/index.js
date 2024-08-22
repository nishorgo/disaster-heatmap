import { google as gl } from "googleapis";
import {GoogleMap, HeatmapLayerF, useJsApiLoader} from "@react-google-maps/api"
import { useState } from "react";


export async function getServerSideProps() {
  const credentials = {
    type: process.env.TYPE,
    project_id: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
    universe_domain: process.env.UNIVERSE_DOMAIN
  };

  const auth = await gl.auth.getClient({ credentials, scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"] });
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
    googleMapsApiKey: "AIzaSyCz2ghAQaQ3qX0OiaTUNZfgHFHLYD4yaXs",
    libraries: ["visualization"]
  });
  const [map, setMap] = useState(null);
  
  if(!isLoaded) {
    return <div className="grid place-items-center h-screen text-xl">Loading... please wait.</div>
  }
  
  const center = {lat: 22.8724, lng: 91.0973};
  const heatMapData = locations.map((location) => ({
    location: new google.maps.LatLng(location[0], location[1]), weight: location[2]
  }));

  console.log(heatMapData);

  return (
    <main className="w-screen h-screen" >
      <GoogleMap 
        mapContainerStyle={{position: "relative", width: "100%", height: "100%"}}
        center={center}
        zoom={10}
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
