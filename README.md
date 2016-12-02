# PokemonGoMap-Website
Upload a static website, so you can share your scanning session with others. They cannot move marker or start searches.

You need to have a running PokemonGo-Map instance that is accessible from the web.

Visitor's are only able to 'read'. So not change location or start/stop searching. It's just displaying the instance, but instead of all the static content go through your lines, it can be hosted seperately.

You need to modify 2 lines to make it work for your own PokemonGo-Maps instance:

Open index.html, preferably in notepad++ (because of the line breaks and  UTF-8).
on line 38 and 40  -or if you don't know how to get there, just browse untill you see the text `/* ADD YOUR POKEMONGO-MAPS SERVER INSTANCE LINK HERE.)`

You will see 2 required fields to be filled. Your server endpoint, and your Google Maps API key 

Below this two lines, you can set options like location and zoom.

Enjoy!
