var savedSearch = [];
var currentLoc;

function initialize() {
    
    savedSearch = JSON.parse(localStorage.getItem("weathercities"));
    var lastSearch;
    
    if (savedSearch) {
     
        currentLoc = savedSearch[savedSearch.length - 1];
        showPrevious();
        getCurrent(currentLoc);
    }
    else {
  
        if (!navigator.geolocation) {
            getCurrent("Hialeah");
        }
        else {
            navigator.geolocation.getCurrentPosition(success, error);
        }
    }

}

function success(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&APPID=7e4c7478cc7ee1e11440bf55a8358ec3";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        currentLoc = response.name;
        saveLoc(response.name);
        getCurrent(currentLoc);
    });

}

function error(){

    currentLoc = "Hialeah"
    getCurrent(currentLoc);
}

function showPrevious() {
  
    if (savedSearch) {
        $("#prevSearches").empty();
        var btns = $("<div>").attr("class", "list-group");
        for (var i = 0; i < savedSearch.length; i++) {
            var locBtn = $("<a>").attr("href", "#").attr("id", "loc-btn").text(savedSearch[i]);
            if (savedSearch[i] == currentLoc){
                locBtn.attr("class", "list-group-item list-group-item-action active");
            }
            else {
                locBtn.attr("class", "list-group-item list-group-item-action");
            }
            btns.prepend(locBtn);
        }
        $("#prevSearches").append(btns);
    }
}

function getCurrent(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=7e4c7478cc7ee1e11440bf55a8358ec3&units=imperial";
    $.ajax({
        url: queryURL,
        method: "GET",
        error: function (){
            savedSearch.splice(savedSearch.indexOf(city), 1);
            localStorage.setItem("weathercities", JSON.stringify(savedSearch));
            initialize();
        }
    }).then(function (response) {
  
        var currCard = $("<div>").attr("class", "card bg-light");
        $("#earthforecast").append(currCard);

        var currCardHead = $("<div>").attr("class", "card-header").text("Current weather for " + response.name);
        currCard.append(currCardHead);

        var cardRow = $("<div>").attr("class", "row no-gutters");
        currCard.append(cardRow);

        var iconURL = "https://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png";

        var imgDiv = $("<div>").attr("class", "col-md-4").append($("<img>").attr("src", iconURL).attr("class", "card-img"));
        cardRow.append(imgDiv);

        var textDiv = $("<div>").attr("class", "col-md-8");
        var cardBody = $("<div>").attr("class", "card-body");
        textDiv.append(cardBody);
     
        cardBody.append($("<h3>").attr("class", "card-title").text(response.name));

        cardBody.append($("<p>").attr("class", "card-text").html("Temperature: " + response.main.temp + " &#8457;"));
     
        cardBody.append($("<p>").attr("class", "card-text").text("Humidity: " + response.main.humidity + "%"));
  
        cardBody.append($("<p>").attr("class", "card-text").text("Wind Speed: " + response.wind.speed + " MPH"));


        cardRow.append(textDiv);
        getForecast(response.id);
    });
}

function getForecast(city) {
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + city + "&APPID=7e4c7478cc7ee1e11440bf55a8358ec3&units=imperial";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        var newrow = $("<div>").attr("class", "forecast");
        $("#earthforecast").append(newrow);
        for (var i = 0; i < response.list.length; i++) {
            if (response.list[i].dt_txt.indexOf("15:00:00") !== -1) {
                var newCol = $("<div>").attr("class", "one-fifth");
                newrow.append(newCol);
                var newCard = $("<div>").attr("class", "card text-white bg-primary");
                newCol.append(newCard);
                var cardHead = $("<div>").attr("class", "card-header").text(moment(response.list[i].dt, "X").format("MMM Do"));
                newCard.append(cardHead);
                var cardImg = $("<img>").attr("class", "card-img-top").attr("src", "https://openweathermap.org/img/wn/" + response.list[i].weather[0].icon + "@2x.png");
                newCard.append(cardImg);
                var bodyDiv = $("<div>").attr("class", "card-body");
                newCard.append(bodyDiv);
                bodyDiv.append($("<p>").attr("class", "card-text").html("Temp: " + response.list[i].main.temp + " &#8457;"));
                bodyDiv.append($("<p>").attr("class", "card-text").text("Humidity: " + response.list[i].main.humidity + "%"));
            }
        }
    });
}

function clear() {
    $("#earthforecast").empty();
}
function saveLoc(loc){

    if (savedSearch === null) {
        savedSearch = [loc];
    }
    else if (savedSearch.indexOf(loc) === -1) {
        savedSearch.push(loc);
    }
    localStorage.setItem("weathercities", JSON.stringify(savedSearch));
    showPrevious();
}

$("#searchbtn").on("click", function () {

    event.preventDefault();

    var loc = $("#searchinput").val().trim();
    if (loc !== "") {
        clear();
        currentLoc = loc;
        saveLoc(loc);

        $("#searchinput").val("");

        getCurrent(loc);
    }
});

$(document).on("click", "#loc-btn", function () {
    clear();
    currentLoc = $(this).text();
    showPrevious();
    getCurrent(currentLoc);
});

initialize();
