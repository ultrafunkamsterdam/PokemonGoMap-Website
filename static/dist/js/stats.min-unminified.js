/* pogomap 2016-08-13 */ "use strict";function countMarkers(){document.getElementById("stats-pkmn-label").innerHTML="Pokémons",document.getElementById("stats-gym-label").innerHTML="Gyms",document.getElementById("stats-pkstop-label").innerHTML="PokéStops";var a=0,b=[],c=0,d=[],e=0,f=[],g=0;if(Store.get("showPokemon")){$.each(mapData.pokemons,function(a,b){0!==d[mapData.pokemons[a].pokemon_id]&&d[mapData.pokemons[a].pokemon_id]?d[mapData.pokemons[a].pokemon_id].Count+=1:d[mapData.pokemons[a].pokemon_id]={ID:mapData.pokemons[a].pokemon_id,Count:1,Name:mapData.pokemons[a].pokemon_name},e++}),d.sort(sortBy("Name",!1));var h="
<table>
    <thead>
        <tr>
            <th>Icon</th>
            <th>Name</th>
            <th>Count</th>
            <th>%</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td></td>
            <td>Total</td>
            <td>"+e+"</td>
            <td></td>
        </tr>";for(a=0;a
        <d.length;a++)d[a]&&d[a].Count>0&&(h+='
            <tr>
                <td><img src="static/icons/'+d[a].ID+" .png\ " /></td><td><a href='http://www.pokemon.com/us/pokedex/"+d[a].ID+ "' target='_blank' title='View in Pokedex' style=\"color: black;\ ">"+d[a].Name+ "</a></td><td>"+d[a].Count+ "</td><td>"+Math.round(100*d[a].Count/e*10)/10+ "%</td></tr>");h+="</tbody></table>" ,document.getElementById( "pokemonList").innerHTML=h}else document.getElementById( "pokemonList").innerHTML="Pokémons markers are disabled" ;if(Store.get( "showGyms")){$.each(mapData.gyms,function(a,d){0!==b[mapData.gyms[a].team_id]&&b[mapData.gyms[a].team_id]?b[mapData.gyms[a].team_id]+=1:b[mapData.gyms[a].team_id]=1,c++});var i="<table><th>Icon</th><th>Team Color</th><th>Count</th><th>%</th><tr><td></td><td>Total</td><td>" +c+ "</td></tr>";for(a=0;a<b.length;a++)b[a]>0&&(i+=1===a?'
                    <tr>
                        <td><img src="static/forts/Mystic.png" /></td>
                        <td>Blue</td>
                        <td>'+b[a]+"</td>
                        <td>"+Math.round(100*b[a]/c*10)/10+"%</td>
                    </tr>":2===a?'
                    <tr>
                        <td><img src="static/forts/Valor.png" /></td>
                        <td>Red</td>
                        <td>'+b[a]+"</td>
                        <td>"+Math.round(100*b[a]/c*10)/10+"%</td>
                    </tr>":3===a?'
                    <tr>
                        <td><img src="static/forts/Instinct.png" /></td>
                        <td>Yellow</td>
                        <td>'+b[a]+"</td>
                        <td>"+Math.round(100*b[a]/c*10)/10+"%</td>
                    </tr>":'
                    <tr>
                        <td><img src="static/forts/Uncontested.png" /></td>
                        <td>Clear</td>
                        <td>'+b[a]+"</td>
                        <td>"+Math.round(100*b[a]/c*10)/10+"%</td>
                    </tr>");i+="</table>",document.getElementById("arenaList").innerHTML=i}else document.getElementById("arenaList").innerHTML="Gyms markers are disabled";if(Store.get("showPokestops")){$.each(mapData.pokestops,function(a,b){mapData.pokestops[a].lure_expiration&&mapData.pokestops[a].lure_expiration>0?0!==f[1]&&f[1]?f[1]+=1:f[1]=1:0!==f[0]&&f[0]?f[0]+=1:f[0]=1,g++});var j="
<table>
    <th>Icon</th>
    <th>Status</th>
    <th>Count</th>
    <th>%</th>
    <tr>
        <td></td>
        <td>Total</td>
        <td>"+g+"</td>
    </tr>";for(a=0;a
    <f.length;a++)f[a]>0&&(0===a?j+='
        <tr>
            <td><img src="static/forts/Pstop.png" /></td>
            <td>Not Lured</td>
            <td>'+f[a]+"</td>
            <td>"+Math.round(100*f[a]/g*10)/10+"%</td>
        </tr>":1===a&&(j+='
        <tr>
            <td><img src="static/forts/PstopLured.png" /></td>
            <td>Lured</td>
            <td>'+f[a]+"</td>
            <td>"+Math.round(100*f[a]/g*10)/10+"%</td>
        </tr>"));j+="</table>",document.getElementById("pokestopList").innerHTML=j}else document.getElementById("pokestopList").innerHTML="PokéStops markers are disabled"}var sortBy=function a(b,c,d){var e=d?function(a){return d(a[b])}:function(a){return a[b]};return c=c?-1:1,function(a,b){return a=e(a),b=e(b),c*((a>b)-(b>a))}}; //# sourceMappingURL=stats.min.js.map