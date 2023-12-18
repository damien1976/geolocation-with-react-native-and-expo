import React from "react";
import { View, StyleSheet, Dimensions, Image, Text } from "react-native";
import { Callout } from "react-native-maps";
//import { MarkerWithMetadata } from "../App";
import { markers } from './markers';
import { Svg, Image as ImageSvg } from 'react-native-svg';

const screenWidth = Dimensions.get("window").width;

const CustomCallout: React.FC<{
   marker: markers;
 }> = ({ marker }) => {
   return (
     <Callout tooltip>
       <View>
         <View style={styles.container}>
				<View style={{ alignItems: 'center', justifyContent: 'center', padding :10 }}>
					<Svg width={240} height={180}>
						<ImageSvg
							 width={240} 
							 height={'100%'}
							 preserveAspectRatio="xMidYMid slice"
							 href={ marker.image }
						/>
					</Svg>
			   </View>
			 
           <View style={{ paddingHorizontal: 16, paddingVertical: 8, flex: 1 }}>
             <Text
               style={{
                 fontWeight: "bold",
                 fontSize: 18,
               }}
             >
               {marker.nom}
             </Text>

             <Text>{marker.nom}</Text>
           </View>
         </View>
         <View style={styles.triangle}></View>
       </View>
     </Callout>
   );
 };

const styles = StyleSheet.create({
   container: {
     backgroundColor: "white",
     width: screenWidth * 0.8,
     //flexDirection: "row",
     borderWidth: 2,
     borderRadius: 12,
	 borderColor: 'silver',
     overflow: "hidden",
   },
   triangle: {
     left: (screenWidth * 0.8) / 2 - 10,
     width: 0,
     height: 0,
     backgroundColor: "transparent",
     borderStyle: "solid",
     borderTopWidth: 20,
     borderRightWidth: 10,
     borderBottomWidth: 0,
     borderLeftWidth: 10,
     borderTopColor: "silver",
     borderRightColor: "transparent",
     borderBottomColor: "transparent",
     borderLeftColor: "transparent",
   },
 });

export default CustomCallout;