console.log('Waking up bot');

var Twit = require('twit');

var config = require('./config');
var T = new Twit(config);

function tweetIt(name, age, sex, race, street, city, state) {
	var filename = 'google.png';
  	var params = {
      encoding: 'base64'
  	}
    var b64 = fs.readFileSync(filename, params);
    T.post('media/upload', { media_data: b64 }, uploaded);

    if(race == "European-American/White") {
    	race = "White" ;
    }
    else if(race == "African-American/Black") {
    	race = "African-American" ;
    }
     else if(race == "Hispanic/Latino") {
    	race = "Hispanic" ;
    }

    function uploaded(err, data, response) {
      var id = data.media_id_string;
	  var tweet = {
	    status: sex + '/'+age+'/'+race+' -- '+street+','+city+','+state,
	    media_ids: [id]
	  }
      T.post('statuses/update', tweet, tweeted);

    }

    function tweeted(err, data, response) {
	  if (err) {
	  	console.log("Tweet: Something went wrong!");
	  } else {
	    console.log("Tweet: It worked!");
	  }
	}
}

var fs = require('fs');
var parse = require('csv-parse');
var input='fatal-encounters.csv';
var GoogleMapsAPI = require('googlemaps') ;
var request = require('request');

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
  
    request(uri).pipe(fs.createWriteStream(filename)).on('close', function() {
   			callback(res.headers['content-length']);
	}
    	);
  });
};

var publicConfig = {
  key: 'XXX', // replace with GoogleMapsAPI key
  secure:             true // use https
};
var gmAPI = new GoogleMapsAPI(publicConfig);


var i = 20 ;

var parser = parse({delimiter: ','}, function (err, data) {
  
	var readByRow = function() {
			i = i + 1 ;
			if(i == 20) {
				clearInterval(nextTweet);
			}
			else {
				var name = data[i][1];
				var age = data[i][2];
				var sex = data[i][3] ;
				var race = data[i][4];
				var date = data[i][6];
				var street = data[i][7];
				var city = data[i][8];
				var state =data[i][9];
				var zip = data[i][10];
				var description = data[i][14];
				var lat = data[i][24] ;
				var lon = data[i][25] ;

				var address = street + " " + city + " " + state + " " + zip ;

				
				var params = {
				  location: lat+','+lon,
				  size: '880x440',
				  //heading: 108.4,
				  pitch: 7,
				  fov: 120
				}
				
				var result = gmAPI.streetView(params);
				console.log("Row number: " + i);

				download(result, 'google.png', function(text){
				 
				  if(text == 7425) {
				  	console.log("Empty image") ;
				  }
				  else {
				  	tweetIt(name, age, sex, race, street, city, state);
				  }
				  
				});	
				
			}

		} ; // End of read by row

	
	var nextTweet = setInterval(readByRow, 1000*60*60*4);
});

fs.createReadStream(input).pipe(parser);