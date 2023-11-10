const userLoc = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchtab]");
const grantingLocation = document.querySelector(".grant_location");
const searchForm = document.querySelector("[data-search-form]");
const loader = document.querySelector(".loading");
const userContainer = document.querySelector("[user-full-curr-info]");
const bodyHandleError = document.querySelector(".error");

let currTab = userLoc;
currTab.classList.add("select-tab");
const API_KEY = "0429c082794170ec2700349d81161b1c";

//if already stoored in local storage no need to fetch or ask for granting

get_loc_from_curr_session();

function render_weather_info(weatherInfo){
    console.log(weatherInfo);
    let not_found_err = weatherInfo?.cod;
    if(not_found_err == 404){
        loader.classList.remove("active");
        userContainer.classList.remove("active");
        grantingLocation.classList.remove("active");
        bodyHandleError.classList.add("active");
    }

    const cityName = document.querySelector("[user-city-name]");
    const countryIcon = document.querySelector("[user-country-icon]");
    const weatherDescrip = document.querySelector("[data-weather-descript]");
    const weatherIcon = document.querySelector("[data-weather-icon]");
    const currTemp = document.querySelector("[data-temp]");
    const windSpeed = document.querySelector("[data-wind-speed]");
    const humid = document.querySelector("[data-humidity-speed]");
    const cloudSpeed = document.querySelector("[data-cloud-speed]");

    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    weatherDescrip.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    currTemp.innerText = weatherInfo?.main?.temp + " °C";
    windSpeed.innerText = weatherInfo?.wind?.speed + " m/s";
    humid.innerText = weatherInfo?.main?.humidity + "%";
    cloudSpeed.innerText = weatherInfo?.clouds?.all + "%";
}

async function fetch_api_using_corrdinates(coordinates){
    const {lat,lon} = coordinates;
    //now we have to remove grant access location
    grantingLocation.classList.remove("active");
    //add loading part
    loader.classList.add("active"); //loader will gets activated
    try {
        //  API CALL
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        loader.classList.remove("active");
        //we have to also make the userinfo part visible but we have to put value also
        userContainer.classList.add("active");
        //render all data fetched info into site
        render_weather_info(data);
    } 
    catch (err) {
        loader.classList.remove("active");
        console.log("In fetch api we get error -> ", err);
    }

}

//check if already location is saved in local or not
function get_loc_from_curr_session(){
    const location_coordinates = sessionStorage.getItem("user-coordinate");
    //if location coordinates are not present then ask for location coord
    if( !location_coordinates ){
        grantingLocation.classList.add("active");
    }
    else{
        //we already have location coordinates so fetch api and do all stuffs
        const coordinates = JSON.parse(location_coordinates);
        fetch_api_using_corrdinates(coordinates);
    }
}

//switch tab if not same as prev
function switch_tab_if_needed(clickedTab){
    if(currTab != clickedTab){
        currTab.classList.remove("select-tab");
        currTab = clickedTab;
        currTab.classList.add("select-tab");
    }
    // finding in which tab we are present
    if( !searchForm.classList.contains("active") ){
        //remove the granding or user container part as we only need to show search bar
        grantingLocation.classList.remove("active");
        userContainer.classList.remove("active");

        bodyHandleError.classList.remove("active"); //chnges

        //search form ko visible karo means we are in gransing/userloc
        searchForm.classList.add("active");
    }
    else{
        bodyHandleError.classList.remove("active");

        //we are in user-curr-loc
        searchForm.classList.remove("active");
        //  -------------->>>>>>>>>>>>>check this line
        userContainer.classList.remove("active");
        //now let's check local storage first to check if we had location or not that's why we remove 
        //usercontainer -> active part
        get_loc_from_curr_session();
    }
}

userLoc.addEventListener("click", () => {
    // change the current tab whicherever you clicked
    switch_tab_if_needed(userLoc);
});

searchTab.addEventListener("click", () => {
    // change the current tab whicherever you clicked
    switch_tab_if_needed(searchTab);
});


// going lower direction -> location granting

function getLocation(){
    //if your device has this
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        //show some alert
        alert("Don't have geolocation");
    }
}

function showPosition(position){
    //here we get the user location
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude
    }
    //now adding this location to local 
    sessionStorage.setItem("user-coordinate", JSON.stringify(userCoordinates));
    //now show all the UI atteched with it
    fetch_api_using_corrdinates(userCoordinates);
}

const grantAccessButton = document.querySelector("[grant-access-loc]");
grantAccessButton.addEventListener("click", getLocation );

//  search weather showing


const searchCity = document.querySelector("[data-search-input]");
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if(searchCity.value === ""){return;}
    fetch_weather_using_city(searchCity.value);
});

//  fetching weather info from city API

async function fetch_weather_using_city(findCity){

    loader.classList.add("active");
    userContainer.classList.remove("active");
    grantingLocation.classList.remove("active");

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${findCity}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        loader.classList.remove("active");
        bodyHandleError.classList.remove("active");
        userContainer.classList.add("active");
        render_weather_info(data);

    } catch (err) {
        loader.classList.remove("active");
        console.log("your weather API with city is not working ");
    }
    
}