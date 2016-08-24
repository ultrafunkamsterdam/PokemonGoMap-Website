# PokemonGoMap-Website
Upload a static website, so you can share your scanning session with others. They cannot move marker or start searches.

You need to have a running PokemonGo-Map instance that is accessible from the web.

Users can't send any commands, they can just read what is being scanned, and stored gyms/stops/spawnpoint from the DB.

You need to change 3 files in order to make it work.


Change index.html line 34 :
<script>var baseURL = "http(s)://yourdomain.tld/";></script> 

Change index.html line 245 and 246. Find a lat lon genenerator online, pick your starting point, get the latitude and longitude and use them in this 2 vars.

var centerLat = "1.234567";
var centerLng = "5.67890";

In this line, your apikey must be supplied
<script defer src="https://maps.googleapis.com/maps/api/js?key=APIKEYGOESHERE&amp;callback=initMap&amp;libraries=places,geometry"></script>


Change /static/dist/js/map.min-unminified.js to point to your instance.
line 6
var baseURL = "http(s)://yourdomainorip:(portmaybe>/
