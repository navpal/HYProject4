var wike = {};

wike.weatherKey = 'd21cf2494f6cfb1c1cf5d51366d50ca9';
wike.bikeUrl = `http://api.citybik.es/v2/networks`;
wike.weatherUrl = `http://api.openweathermap.org/data/2.5/weather`;

wike.getUserLocation = function(){
	$('form').on('submit', function(e){
		e.preventDefault();
		var userLoc = $('select').val();
		var weatherloc = $('select option:selected').text();
		$.when(wike.getWeatherInfo(weatherloc),wike.getBikeInfo(userLoc))
			.then((weatherRes,bikeRes) => {
				$('.bikes').empty();
				var temp = wike.convertTemp(weatherRes[0].main.temp);
				var tempMax = wike.convertTemp(weatherRes[0].main.temp_max);
				var tempMin = wike.convertTemp(weatherRes[0].main.temp_min);
				var iconCode = weatherRes[0].weather[0].icon;
				var description = weatherRes[0].weather[0].description;
				wike.displayWeather(temp, tempMax, tempMin, iconCode, description);
				var bikeStations = bikeRes[0].network.stations;
				wike.showStations(bikeStations);

		});
	});
}

wike.showStations = function(station){

	station.forEach(function(bikeStation){
		var noNumStationName = bikeStation.name.replace(/[0-9]/g, '');
		var stationName = $('<h3>').text(noNumStationName);
		var containerDiv = $('<div>');
		var freeBikes = $('<p>').text(`Free Bikes: ${bikeStation.free_bikes}`);
		var emptySlots = $('<p>').text(`Empty Slots: ${bikeStation.empty_slots}`);
		containerDiv.append(freeBikes, emptySlots);
		$('.bikes').append(stationName, containerDiv);
	});
	$('.bikes').accordion();
}

wike.displayWeather = function(temp, max, min, code, description){
	$('.temp').html(`${temp} &#8451`);
	$('.tempMax').html(`MAX: ${max} &#8451`);
	$('.tempMin').html(`MIN: ${min} &#8451`);
	$('.weatherIcon').attr('src', `https://openweathermap.org/img/w/${code}.png`);
	$('.description').html(description);
	if(temp >= 18){
		$('.weatherMessage').html(`Enjoy the warm weather today!`);
	}
	else if(temp <= 18 && temp >= 10){
		$('.weatherMessage').html(`It's a bit on the chilly side today!`);
	}
	else if(temp < 10 && temp >= 0){
		$('.weatherMessage').html(`Don't forget to pack a warm sweater!`);
	}
	else if(temp < 0){
		$('.weatherMessage').html(`Remember to bundle up!`);
	}
}

wike.convertTemp = function(kelvin){
	var celcius = (kelvin - 273.15).toFixed(0);
	return celcius;
}

wike.getBikeInfo = function(loc){
	return $.ajax({
		url: `http://api.citybik.es/v2/networks/${loc}`,
		method: 'GET',
		dataType: 'JSON'
	})
}

wike.getWeatherInfo = function(loc){
	return $.ajax({
		url: wike.weatherUrl,
		method: 'GET',
		dataType: 'JSON',
		data: {
			appid: wike.weatherKey,
			format: 'JSON',
			q: loc
		}
	})
}


wike.getPossibleLocations = function() {
	var arr = [];
	$.ajax({
		url: `http://api.citybik.es/v2/networks/`,
		method: 'GET',
		dataType: 'JSON'
	}).then(function(data) {
		data.networks.forEach(function(network) {
			arr.push({
				city: network.location.city,
				id: network.id
			})
		})
		var newArray = arr.sort(function(a, b){
			var nameA = a.city;
			var nameB = b.city;
			  if (nameA < nameB) {
			    return -1;
			  }
			  if (nameA > nameB) {
			    return 1;
			  }
			  return 0;
		});


		newArray.forEach(function(cityNet){
			$('select').append(`<option value=${cityNet.id}>${cityNet.city}</option>`)
		});
	});
}

wike.init = function(){
	wike.getUserLocation();
	wike.getPossibleLocations();
}

$(function(){
	wike.init();
});
