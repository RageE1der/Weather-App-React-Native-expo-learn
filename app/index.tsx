import {
    ScrollView,
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    FlatList,
    TouchableWithoutFeedback,
    Animated,
} from "react-native";
import React, {useEffect, useRef, useState} from "react";
import {LinearGradient} from "expo-linear-gradient";
import {Entypo, FontAwesome5} from "@expo/vector-icons";
import Snow from '../assets/images/snow.svg'
import Rain from '../assets/images/rain.svg'
import Fog from '../assets/images/fog.svg'
import Wind from '../assets/images/wind.svg'
import Cloudy from '../assets/images/cloudy.svg'
import Partlycloudyday from '../assets/images/partly-cloudy-day.svg'
import Partlycloudynight from '../assets/images/partly-cloudy-night.svg'
import Clearday from '../assets/images/clear-day.svg'
import Clearnight from '../assets/images/clear-night.svg'
import moment from "moment";
import {BlurView} from "expo-blur";
import * as Location from 'expo-location';


// API Keys
const WeatherapiKey= 'K92ZUV2AC925XT83NUT727QHW';
const geoapifyLocation = 'fbd6be8bbbb84a098c43f17f35a01545'


export default function Index() {

    const [temperature, setTemperature] = useState([]);
    const [hourlytemperature, setHourlyTemperature] = useState([]);
    const [currentTemp, setCurrentTemp] = useState(null);
    const [currentWind, setCurrentWind] = useState(null);
    const [currentHumidity, setCurrentHumidity] = useState(null);
    const [currentIcon, setCurrentIcon] = useState(null);
    const [dailyMaxTemperature, setDailyMaxTemperature] = useState(null)
    const [dailyMinTemperature, setDailyMinTemperature] = useState(null)
    const[hourlyIcons, setHourlyIcons] = useState(null)
    const[dailyIcons, setDailyIcons] = useState(null)
    const[precipitation , setPrecipitation ] = useState(null);
    const[regionLocation, setRegionLocation] = useState('');
    const [suggestionsList, setSuggestionsList] = useState([]);
    const timeOut = useRef(null);

    //Function to display different weather condition images
    const WeatherIcons = ({iconSwitch, size}) => {
        let conditionIcon;
        switch (iconSwitch) {
            case 'snow':
                conditionIcon = <Snow width={size} height={size}/>;
                break;
            case 'rain':
                conditionIcon = <Rain width={size} height={size}/>;
                break;
            case 'fog':
                conditionIcon = <Fog width={size} height={size}/>;
                break;
            case 'wind':
                conditionIcon = <Wind width={size} height={size}/>;
                break;
            case 'cloudy':
                conditionIcon = <Cloudy width={size} height={size}/>;
                break;
            case 'partly-cloudy-day':
                conditionIcon = <Partlycloudyday width={size} height={size}/>;
                break;
            case 'partly-cloudy-night':
                conditionIcon = <Partlycloudynight width={size} height={size}/>;
                break;
            case 'clear-day':
                conditionIcon = <Clearday width={size} height={size}/>;
                break;
            case 'clear-night':
                conditionIcon = <Clearnight width={size} height={size}/>;
                break;
            default:
                conditionIcon = null;
        }
        return conditionIcon ? conditionIcon : null;
    };


    useEffect(() => {

        // getCoordinates gets the users coordinates using their IP address
        const getCoordinates = async () => {

            // try and catch statement to catch errors and log them
            try {
                const response = await fetch(`https://api.geoapify.com/v1/ipinfo?&apiKey=${geoapifyLocation}`);

                if (!response.ok) {
                    throw new Error('not ok');
                }

                const coords = await response.json();

                // gets and assigns a variable to the coordinates
                let longitude = (coords.location.longitude);
                let latitude = (coords.location.latitude);

                // sends the coordinates to fetchWeatherData to get the weather info
                fetchWeatherData(latitude, longitude);

                // sends the coordinates to getLocation to get the location (city, state)
                getLocation(latitude, longitude);


            } catch (err) {
                console.error(err);
            }
        }

        getCoordinates();



    }, []);

    // getLocation gets the city and state from the given coordinates using the expo location Library
    const getLocation = async (latitude, longitude) => {

        // try and catch statement to catch errors and log them
        try {

            // Revers geocodes to get the address from the given coordinates
            let address = await Location.reverseGeocodeAsync({latitude, longitude});

            // gets the city and state from the address and formats it as a string
            const regionLocation = `${address[0].city}, ${address[0].region}`;

            setRegionLocation(regionLocation)


        }
        catch (err) {
            console.error(err);
        }
    }

    // fetchWeatherDat gets the weather data from the given coordinates
    const fetchWeatherData = async (latitude, longitude) => {

        // try and catch statement to catch errors and log them
        try {

            // fetches to get the data form visual crossing api
            const response  = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${latitude},${longitude}?key=${WeatherapiKey}`);

            if (!response.ok) {
                throw new Error('not ok');
            }

            const data = await response.json();
            const temperatureData = [];

            // loop through the next 14 days ( 1 to 14)
            // loop starts at 1 to skip day 0 which would be the current day
            for (let i = 1; i <= 14; i++) {

                // adds an object to the temperatureData array
                temperatureData.push({

                    // gets the maximum temperature of the day
                    maxTemperature: (data.days[i].tempmax).toFixed(0),

                    // gets the minimum temperature of the day
                    minTemperature: (data.days[i].tempmin).toFixed(0),

                    // gets the weather condition icon of the day
                    icons: data.days[i].icon,

                    // gets the day of the week such as monday, tuesday ...
                    time2: moment().add(i, 'days').format('dddd'),

                })

            }

            // gets the current time and rounds it down to the nears hour
            const currentTime = moment().startOf('hour');

            // calculates the number of hours since the day has started
            const hourSinceStartDay = currentTime.diff(moment().startOf("day"), "hours");

            // calculates the maximum time index and adds 4 hours it
            const maxTime = Math.min(hourSinceStartDay+4, data.days[0].hours.length-1)


            const hourlyData =[];

            // loop through the next 4 hours from current time
            for (let j = hourSinceStartDay; j <= maxTime; j++) {

                // adds an object to the hourlydata array
                hourlyData.push({

                    // gets the current time and then adds the time like 3AM or 3PM
                    time: moment().startOf('day').add(j, "hours").format('h A'),

                    // gets the weather condition icon for the hours
                    icon: data.days[0].hours[j].icon,

                    // gets the temperature for the hours and fixes it to 0 decimal places
                    temperature: (data.days[0].hours[j].temp).toFixed(0),

                })
            }

            // sets each hourly weather data to setHourlyTemperature
            setHourlyTemperature(hourlyData);

            // sets each daily weather data to  setTemperature
            setTemperature(temperatureData);


            // extracts the icon property from hourlydata array and creates a new array
            const hrlyIcons = (hourlyData.map(item => item.icon))

            //loops through hrlyIcon array
            for (let i = 0; i < hrlyIcons.length; i++) {

                // sets each icon from the hrlyIcon array
                setHourlyIcons(hrlyIcons[i])
            }

            // extracts the icon property from temperatureData array and creates a new array
            const dlyIcons = (temperatureData.map(item => item.icons))

            //loops through dlyIcons array
            for (let i = 0; i<dlyIcons.length; i++) {

                // sets each icon from the dlyIcons array
                setDailyIcons(dlyIcons[i])
            }


            // gets the current weather data from weather api
            const currentTemperature = (data.currentConditions.temp).toFixed(0);
            const currentHumidity = data.currentConditions.humidity;
            const currentWind = (data.currentConditions.windspeed).toFixed(0);
            const currentIcon = data.currentConditions.icon;
            const Currentprecipitation = (data.currentConditions.precipprob);

            // gets the max and min temperate data from weather api
            const maxTemperature = (data.days[0].tempmax).toFixed(0);
            const minTemperature = (data.days[0].tempmin).toFixed(0);


            // sets each of the data from the weather api
            setCurrentTemp(currentTemperature);
            setCurrentHumidity(currentHumidity);
            setCurrentWind(currentWind);
            setCurrentIcon(currentIcon);
            setDailyMaxTemperature(maxTemperature);
            setDailyMinTemperature(minTemperature)
            setPrecipitation(Currentprecipitation);



        }
        catch(error) {
            console.error('There was an error:', error);
        }

    };


    // {* Function to get the coordinates of city and state from search   *} //
    const getSelectedCityCoordLocation = async (city, state_code: any) => {
        try {

            // creates a string of city and state
            const address = `${city}, ${state_code}`;

            // gets the location coordinates of the city and state
            const location = await Location.geocodeAsync(address);

            // extracts hte latitude and longitude from the location data
            const latitude = location[0].latitude
            const  longitude = location[0].longitude

            // fetches the weather data from the obtained coordinates
            fetchWeatherData(latitude, longitude);
            getLocation(latitude, longitude);



        } catch (error) {
            console.error('There was an error converting address to coordinates:', error);
        }
    }

    // { * Search Feature *} //

    const [searchActive, setSearchActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchAnimation =useRef(new Animated.Value(0)).current;

    // {* Functions to handle search activity *}

    // function to activate search
    const handleSearch = () => {

        // sets search to active
        setSearchActive(true);

        // animation to open the search bar
        Animated.timing(searchAnimation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
    };

    // function to close search
    const handleClose = () => {

        // sets the search query to blank
        setSearchQuery('');

        // animation to closing of the search bar
        Animated.timing(searchAnimation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
        }).start(() => setSearchActive(false));
    };

    // Function to handle text input
    const handleInput = async text => {

        // sets the search query text from the search box
        setSearchQuery(text);

        // checks if there is a timeout
        if (timeOut.current) {

            // clears the timeout to prevent multiple timeouts
            clearTimeout(timeOut.current)
        }

        // sets a new timeout and stores its id in timeout.current
        timeOut.current = setTimeout(async () => {

        if (text.length > 0) {
            try {

                // fetches data from he geoapify website
                const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${text}&apiKey=${geoapifyLocation}`);
                if (!response.ok) {
                    throw new Error('not ok');
                }

                const addressRecommendation = await response.json();
                const suggestionsList = [];

                // loops through the suggested location data based on user input
                for (let i = 0; i <= 4; i++) {

                    // adds an object to the suggestionsList array
                    suggestionsList.push({

                        // gets the city name from the addressRecommendation data
                        city: addressRecommendation.features[i].properties.city,

                        // gets the state code from the addressRecommendation data
                        state_code: addressRecommendation.features[i].properties.state_code,
                    });
                }

                // filters suggestionsList for same city and state code to remove them
                const uniqueList = suggestionsList.filter((item, index, self) =>
                        index === self.findIndex(x =>
                            x.city === item.city && x.state_code === item.state_code
                        )
                );

                setSuggestionsList(uniqueList);
            } catch (err) {
                console.error("Error getting the list", err);
            }
        } else {
            setSuggestionsList([]);
        }
        // adds a delay of 150 ms before fetching the data from api
        }, 150);
    };


    // Function to handle suggestion filter
    const handleSuggestionFilter = () => {

        // filters to only include where the city name contains the search query
        const filterList = suggestionsList.filter(item =>
            item.city && item.city.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // if the list does not contain the search query it logs 'no match found'
        if(filterList.length ==0){
            console.log('No match found');
        }
        return filterList;
    };

    // function to handle searchbar size during animation
    const searchBarHeight = searchAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    // function to handle searchbar opacity during animation

    const searchBarOpacity = searchAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    // Funcation to handle search list selection
    const handleSuggestionSelection = (item) => {

        // fetches data to get the city and state coordinates
        getSelectedCityCoordLocation(item.city, item.state_code);

        // closes the search bar 
       handleClose();

    }
    return (
    <View style={styles.container}>

        <LinearGradient style={styles.container} colors={['#08244F', '#134CB5', '#0B42AB']}>


            <View style={styles.locationContainer}>
                {!searchActive ? (

                        <TouchableOpacity style={styles.locationpin} onPress={handleSearch}>
                            <Entypo  style={styles.locationpin} name="location-pin" size={50} color="white" />
                            <Text style={styles.locationstyle}>
                                {regionLocation}
                            </Text>
                        </TouchableOpacity>

                ) : null}
            </View>

            <View>
                <View style={styles.currentTempBox} >
                    <View style={styles.currentIcon}>
                        <WeatherIcons size={125} iconSwitch={currentIcon} />

                    </View>


                    <View style={styles.currentTempContainer}>
                        <Text style={styles.tempContainer}>{currentTemp}</Text>
                        <Text style={styles.tempSymbol}>°</Text>
                    </View>
                    <View style={styles.currentTempContainer}>
                        <Text style={styles.highlowContainer}>Max: {dailyMaxTemperature}°</Text>
                        <Text style={styles.highlowContainer}> Min: {dailyMinTemperature}°</Text>
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>

                    <View style={styles.whpContainer}>
                        < View style={styles.currentTempContainer}>
                            <FontAwesome5 style={styles.whpIcons}  name="wind" color='#ffff' size={20}/>
                            <Text style={styles.whpText}> {currentWind} MPH</Text>
                        </View>
                        <View style={styles.currentTempContainer}>
                            <FontAwesome5 style={styles.whpIcons} name='temperature-low'  color='#ffff' size={20}/>
                            <Text style={styles.whpText}> {currentHumidity} %</Text>
                        </View>
                        <View style={styles.currentTempContainer}>
                            <Entypo style={styles.whpIcons} name="water" color='#ffff' size={20}/>
                            <Text style={styles.whpText}> {precipitation} %</Text>

                        </View>
                    </View>
                    <ScrollView style={styles.HourlyTempBox} horizontal showsHorizontalScrollIndicator={false}>
                        {hourlytemperature.slice(0, 6).map((item, index) =>
                            <View style={styles.hourlyTempContainer} key={index}>
                                <Text style={styles.timeContainer}>
                                    {item.time}
                                </Text>
                                <View style={styles.hourlyIcons}>
                                    <WeatherIcons size={50} iconSwitch={item.icon}/>
                                </View>

                                <Text style={styles.hourlyTemp}>{item.temperature}°</Text>
                            </View>
                        )}

                    </ScrollView>


                    <View style={styles.dailytempcontainer}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.nextText}>Next Forecast</Text>
                            {temperature.map((item, index) =>
                                <View style={styles.daiydatacontaienr} key={index}>
                                    <Text style={[styles.timeslot, styles.cell, styles.row]}>
                                        {item.time2}
                                    </Text>
                                    <Text style={[styles.cell, styles.row]}>
                                        <WeatherIcons size={40} iconSwitch={item.icons}/>
                                    </Text>
                                    <Text style={[styles.cell, styles.row]}>{item.maxTemperature} / {item.minTemperature}</Text>

                                </View>



                            )}



                        </ScrollView>

                    </View>


                </ScrollView>
            </View>

            {/* start  search bar code*/}
            {searchActive && (
                <Animated.View style={[styles.fullScreenSearch, {opacity: searchBarOpacity}]}>
                    <BlurView style={styles.blurview} intensity={50} tint="light"/>
                    <Animated.View style={[styles.searchContainer, {height: searchBarHeight}]}>
                        <TextInput
                            style={styles.input}
                            placeholder='Search...'
                            value={searchQuery}
                            onChangeText={handleInput}
                        />
                        {searchQuery.length > 0 && (
                            <FlatList style={styles.flatList}
                                data={handleSuggestionFilter()}
                                keyExtractor={(item, index) => `${item.city}-${index}`} // Ensure a unique key
                                renderItem={({ item }) => (
                                    <TouchableWithoutFeedback onPress={() => handleSuggestionSelection(item)}>
                                        <View style={styles.suggestionItem}>
                                            <Text style={styles.suggestsListNames}>{item.city}, {item.state_code}</Text>
                                        </View>
                                    </TouchableWithoutFeedback>
                                )}
                            />
                        )}
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Text style={styles.closeTextButton} >Close</Text>
                        </TouchableOpacity>


                    </Animated.View>
                </Animated.View>
            )}


            {/* end  search bar code*/}


        </LinearGradient>


    </View>
  );
}

var styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    locationContainer: {
        marginTop: 75,


    },
    locationpin: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: 'center',
    },
    locationstyle: {
      textAlign: "center",
      fontSize: 40,
        color: 'white',

    },
    currentTempBox: {
        marginTop: 15,

    },
    currentIcon: {
        alignSelf: "center",
        marginBottom: 5,
        marginTop: 5,
    },
    HourlyTempBox:{
        backgroundColor: 'rgba(0, 16, 38, .3)',
        borderRadius: 13.98,
        padding: 20,
        margin: 20,

    },
    currentTempContainer :{
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: 'center',
        padding: 10,
        textAlign: 'center',


    },
    tempContainer :{
      fontSize: 50,
      color: '#FFFFFF',

    },
    tempSymbol :{
        fontSize: 40,
        color: '#FFFFFF',

    },
    whpContainer: {
        backgroundColor: 'rgba(0, 16, 38, .3)',
        borderRadius: 13.98,
        padding: 10,
        margin: 20,
        marginBottom: -10,
        flexDirection: "row",

    },
    whpText: {
        fontSize: 25,
        color: '#FFFFFF',
    },
    whpIcons: {
        alignSelf: "center",
        paddingRight: 10,
    },
    highlowContainer :{
        fontSize: 25,
        color: '#FFFFFF',

    },
    hourlyTempContainer: {
        marginRight: 50,
        color: '#FFFFFF',

    },
    timeContainer:{
        fontSize: 10,
        textAlign: "center",
        color: '#FFFFFF',

    },
    hourlyTemp: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        color: '#FFFFFF',

    },
    hourlyIcons: {
        marginTop: 10,
        marginBottom: 10,
        alignItems: "center"
    },
    dailytempcontainer: {
        backgroundColor: 'rgba(0, 16, 38, .3)',
        borderRadius: 13.98,
        padding: 10,
        margin: 20,
        marginTop: -10,
        height: 250,

    },
    daiydatacontaienr: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    cell: {
        flexDirection: "row",
        borderBottomWidth: 1,
        paddingVertical: 8,
    },
    row: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 4,
        color: 'white',
        fontSize: 15,
        textAlign: "center",
        alignSelf: "center",
        justifyContent: "center",

    },
    timeslot: {
        marginRight: 65,
    },
    nextText: {
        marginTop: 10,
        fontSize: 20,
        color: 'white',
        paddingHorizontal: 10,
    },
    fullScreenSearch: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    blurview:{
        ...StyleSheet.absoluteFillObject,
    },
    searchContainer: {
        flex: 1,
        width: "100%",
        backgroundColor: 'rgba(255, 255, 255, .9)',
        borderRadius: 10,
        overflow: 'hidden',
        alignItems: 'center',
    },
    input:{
            width: '100%',
            height: 40,
            borderColor: '#ccc',
            borderWidth: 1,
            borderRadius: 5,
            paddingHorizontal: 10,
            marginVertical: 20,
            marginTop: 75,

    },

        suggestionsList: {
            width: '200%',
            color: 'black',
            height: 75,

        },
    suggestsListNames: {
        fontSize: 30,


    },
        suggestionItem: {
            padding: 10,
            borderBottomColor: '#ccc',
            borderBottomWidth: 1,

        },
    closeTextButton:{
        fontSize: 20,
        color: '#007AFF',
    },
    CloseButton: {
        position: 'absolute',
        alignSelf: 'center',
        backgroundColor: '#007bff',
        paddingHorizontal: 20,
        paddingVertical: 10,

        borderRadius: 5,
    },
    flatList: {
        height: 500,
        width: "100%",
        flexGrow:0,
    }

})