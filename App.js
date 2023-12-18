import { StatusBar } from 'expo-status-bar';
import { markers } from './components/markers';
import CustomCallout from './components/CustomCallout';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  Pressable,
  FlatList, Button
} from 'react-native';
import React, { useEffect, useState, useRef } from "react";
//import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import MapView from 'react-native-map-clustering';


let foregroundSubscription = null
/*
const LOCATION_TASK_NAME = "LOCATION_TASK_NAME"
// Define the background task for location tracking
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error(error)
    return
  }
  if (data) {
    // Extract location coordinates from data
    const { locations } = data
    const location = locations[0]
    if (location) {
      console.log("Location in background", location.coords)
    }
  }
})
*/
const App = () => {
  // Define position state: {latitude: number, longitude: number}
  const [position, setPosition] = useState(null);
  const mapRef = useRef(null);
  const [positionMarker, setPositionMarker] = useState(null);
  const [currentMarker, setCurrentMarker] = useState(null);
  const [destination, setDestination] = useState(null);
  const [isRunningGPS, setIsRunningGPS] = useState(false);
  const [isCircuit, setIsCircuit] = useState(false);

  // Request permissions right after starting the app // NSLocationWhenInUseUsageDescription
  useEffect(() => {
    const requestPermissions = async () => {
      const foreground = await Location.requestForegroundPermissionsAsync()
      if (foreground.granted) await Location.requestBackgroundPermissionsAsync()
    }
    requestPermissions()
  }, [])

  // Start location tracking in foreground
  const startForegroundUpdate = async () => {
    // Check if foreground permission is granted
    const { granted } = await Location.getForegroundPermissionsAsync();
	currentMarker!==null && currentMarker.hideCallout();
	setIsRunningGPS(true);
	// Prevoir de modifier la region
    if (!granted) {
      console.log("location tracking denied")
      return
    }

    // Make sure that foreground location tracking is not running
    foregroundSubscription?.remove()

    // Start watching position in real-time
    foregroundSubscription = await Location.watchPositionAsync(
      {
        // For better logs, we set the accuracy to the most sensitive option
        accuracy: Location.Accuracy.BestForNavigation,
      },
      location => {
        setPosition(location.coords);	
      }
    )
  }

  // Stop location tracking in foreground
  const stopForegroundUpdate = () => {
    foregroundSubscription?.remove();
    setPosition(null);
	setIsRunningGPS(false);
  }

	const [region, setRegion] = useState({
		latitude: 43.99819563888889, 
		longitude:5.0603947499999995,
		latitudeDelta: 0.015,
		longitudeDelta: 0.008,
	});
	
	const getInitialState = ()=>{
		return {
				latitude: 43.99819563888889, 
				longitude:5.0584747499999995,
				latitudeDelta: 0.015,
				longitudeDelta: 0.008,
		};
	};

	const setMarkerOnMap = (marker)=>{
		stopForegroundUpdate();
		const new_region = {
			latitude: marker.latitude+0.0005, 
			longitude: marker.longitude,
			latitudeDelta: 0.005,
			longitudeDelta: 0.0008,
		};
		
		currentMarker!==null && currentMarker.hideCallout();
		setRegion(new_region);
		setPositionMarker(marker);
		setDestination(marker);
		mapRef.current.animateToRegion(new_region, 2 * 1000);
	}
	
	const reinitialiser = ()=>{
		stopForegroundUpdate();
		setPositionMarker(null);
		mapRef.current.animateToRegion(getInitialState(), 1000);
	};
	
	const ListItem = ({ item, index }) => {
		return (
			<View key={ index }
					style={positionMarker == null 
								? styles.item
								: ( item.numero == positionMarker.numero ? styles.itemSelected : styles.item )}>
				<Text style={styles.itemText}>{item.nom}</Text>
				<Pressable onPress={()=>setMarkerOnMap(item)}>
					<Image
						source={item.image}
						style={styles.itemPhoto }
						resizeMode="cover"
					/>
				</Pressable>
			</View>
		);
	};
  return (
    <View style={styles.container}>
		<MapView 
			provider={ PROVIDER_GOOGLE }
			/* rajouter key api dans la fichier app.json android > config >googleMaps > ...*/
			style={styles.map} clusterColor='#b3140e' 
			region={ getInitialState()} ref={mapRef} mapType={'terrain'}
			//onRegionChangeComplete={ (region, gesture) => {
					// This fix only works on Google Maps because isGesture is NOT available on Apple Maps
				//	if (!gesture.isGesture) {
				//	return;
			//	}
				// You can use
				//dispatch({ type: "map_region", payload: { mapRegion: region }}); // if using useReducer
				//setRegion(region); // if using useState
			//}
			//}
			>
					{ positionMarker !== null ? 
							<Marker
								key={positionMarker.numero}
								coordinate={{ latitude: positionMarker.latitude, longitude: positionMarker.longitude }}
								ref={_marker => {
										this.marker = _marker;
								}}
								onPress={() => {setCurrentMarker(this.marker)}}
								onCalloutPress={() => {
									 this.marker.hideCallout();
								}}>
								<CustomCallout marker={ positionMarker }></CustomCallout> 
							</Marker>	
						: markers.filter((item)=>isCircuit ? item.monum==true : item).map((marker, index)=>
							<Marker
								key={ index }
								coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
								title={ marker.nom }>
							</Marker>
					)}
					
					{	position!==null &&
						<>
							<MapViewDirections
									origin={{ latitude: position.latitude, longitude: position.longitude }}
									destination={destination}
									apikey="AIzaSyCGFAOywMUMnc327Or-yv-sJXcWfWecWXI"
									strokeWidth={8}
									strokeColor="red"
									mode={'WALKING'}
								/>
							<Marker
								coordinate={{ latitude: position.latitude, longitude: position.longitude }}
								title="Votre position"
							/>
						</>
					}
					
				</MapView>
				{ positionMarker == null && 
					<View style={styles.title}>
						<Pressable onPress={ ()=>{setIsCircuit(!isCircuit)} } 
							style={ isCircuit ? styles.circuitSelected : styles.circuit } >
							<Image
								source={ require("./assets/logo1.jpeg") }
								style = {{ width: 120, height: 120, borderRadius: 20 }}
								resizeMode="cover"
							/>
						</Pressable>
						<Text style={{ color: "white", fontSize: 28, padding: 10, textAlign: "left", width: 240}}>
							Circuit des fontaines de Pernes
						</Text>
					</View>
				}
				{ positionMarker !== null &&
					<>
						{ !isRunningGPS ?
							<Pressable style={styles.fab1} onPress={startForegroundUpdate}	>
								<Text style={{ color: "white", fontSize: 18 }}>Y aller !</Text>
							</Pressable> :
							<Pressable style={styles.fab2}	onPress={stopForegroundUpdate} >
								<Text style={{ color: "white", fontSize: 18 }}>Arrêt GPS</Text>
							</Pressable>
						}
						<Pressable style={!isRunningGPS ? styles.fab2 : styles.fab1}	onPress={reinitialiser} >
							<Text style={{ color: "white", fontSize: 18 }}>Réinitialiser</Text>
						</Pressable>
					</>
				}
				<StatusBar style="light" />
				<SafeAreaView style={styles.sectionList}>
					<FlatList
						horizontal
						data={markers.filter((item)=>isCircuit ? item.monum==true : item)}
						renderItem={({item, index}) => <ListItem item={item} index={index} />}
						keyExtractor={(value, index) => index.toString()}
						showsHorizontalScrollIndicator={false}
					/>
					<View style={styles.footer}>
						<Text style={styles.footer_text}>Créée par Damien ETIENNE - Tous droits réservés</Text>
					</View>
				</SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: '100%',
    height: '100%',
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    marginTop: 15,
  },
  separator: {
    marginVertical: 8,
  },
  sectionList: {
	backgroundColor: 'rgba(255, 255, 255, 0.9)',
	position: 'absolute',
    bottom: 0,
  },
  title: {
	position: 'absolute',
    top: 0,
	right: 0,
	left: 0,
	backgroundColor: 'silver',
	flexDirection: "row",
    alignItems: "center",
	//justifyContent: "space-between",
	paddingTop: 45, 
	padding: 20,
  },
  sectionHeader: {
    fontWeight: '800',
    fontSize: 18,
    color: '#f4f4f4',
    marginTop: 20,
    marginBottom: 5,
  },
  item: {
    padding: 10,
	paddingTop: 2,
	borderBottomWidth: 3,
	borderLeftWidth : 1,
	borderRightWidth: 3,
	borderTopWidth : 1,
	borderColor : 'white',
	alignItems: 'center',
	justifyContent: 'center',
	width : 180,
  },
  itemSelected: {
    padding: 10,
	paddingTop: 2,
	borderBottomWidth: 3,
	borderLeftWidth : 1,
	borderRightWidth: 3,
	borderTopWidth : 1,
	borderColor : 'silver',
	alignItems: 'center',
	justifyContent: 'center',
	width: 180,
  },
  itemPhoto: {
    width: 80,
    height: 80,
	borderRadius: 40,
	marginTop: 10,
	marginBottom: 5,
  },
  itemText: {
    color: 'black',
    marginTop: 5,
	paddingLeft:5,
	paddingRight: 5
  },
  footer: {
    justifyContent: 'center',
    backgroundColor: '#9e9179',
  },
  footer_text: {
    textAlign: 'center',
  },
  fab1: {
	position: 'absolute',
	right: 20,
	bottom: 180,
	margin: 16,
    borderRadius: 20,
    padding: 10,
    elevation: 6,
    backgroundColor: "#a30406",
  },
  fab2: {
	position: 'absolute',
	right: 20,
	bottom: 240,
	margin: 16,
    borderRadius: 20,
    padding: 10,
    elevation: 6,
    backgroundColor: "#a30406",
  },
  circuitSelected: {
	 borderBottomWidth: 4, 
	 borderLeftWidth : 0, 
	 borderRightWidth: 4,
	 borderTopWidth : 0, 
	 borderColor : 'grey',
	 borderRadius: 20
  },
  circuit: { 
	  borderRadius: 20
  },
})

export default App;

/*{item => item.numero}
DRIVING”, “BICYCLING”, “WALKING”, and “TRANSIT” 
*/
