/*
 pogomap 2016-08-13 
*/

"use strict";
var baseURL = "https://vps.ultrafunk.nl/go/";

function excludePokemon(a) {
    $selectExclude.val($selectExclude.val().concat(a)).trigger("change")
}

function notifyAboutPokemon(a) {
    $selectPokemonNotify.val($selectPokemonNotify.val().concat(a)).trigger("change")
}

function removePokemonMarker(a) {
    mapData.pokemons[a].marker.setMap(null), mapData.pokemons[a].hidden = !0
}

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: {
            lat: centerLat,
            lng: centerLng
        },
        zoom: 14,
        fullscreenControl: !0,
        streetViewControl: !1,
        mapTypeControl: !1,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            position: google.maps.ControlPosition.RIGHT_TOP,
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE, "nolabels_style", "dark_style", "style_light2", "style_pgo", "dark_style_nl", "style_light2_nl", "style_pgo_nl"]
        }
    });
    var a = new google.maps.StyledMapType(noLabelsStyle, {
        name: "No Labels"
    });
    map.mapTypes.set("nolabels_style", a);
    var b = new google.maps.StyledMapType(darkStyle, {
        name: "Dark"
    });
    map.mapTypes.set("dark_style", b);
    var c = new google.maps.StyledMapType(light2Style, {
        name: "Light2"
    });
    map.mapTypes.set("style_light2", c);
    var d = new google.maps.StyledMapType(pGoStyle, {
        name: "PokemonGo"
    });
    map.mapTypes.set("style_pgo", d);
    var e = new google.maps.StyledMapType(darkStyleNoLabels, {
        name: "Dark (No Labels)"
    });
    map.mapTypes.set("dark_style_nl", e);
    var f = new google.maps.StyledMapType(light2StyleNoLabels, {
        name: "Light2 (No Labels)"
    });
    map.mapTypes.set("style_light2_nl", f);
    var g = new google.maps.StyledMapType(pGoStyleNoLabels, {
        name: "PokemonGo (No Labels)"
    });
    map.mapTypes.set("style_pgo_nl", g), map.addListener("maptypeid_changed", function(a) {
        Store.set("map_style", this.mapTypeId)
    }), map.setMapTypeId(Store.get("map_style")), google.maps.event.addListener(map, "idle", updateMap), marker = createSearchMarker(), addMyLocationButton(), initSidebar(), google.maps.event.addListenerOnce(map, "idle", function() {
        updateMap()
    }), google.maps.event.addListener(map, "zoom_changed", function() {
        redrawPokemon(mapData.pokemons), redrawPokemon(mapData.lurePokemons)
    })
}

function createSearchMarker() {
    var a = new google.maps.Marker({
            position: {
                lat: centerLat,
                lng: centerLng
            },
            map: map,
            animation: google.maps.Animation.DROP,
            draggable: !Store.get("lockMarker"),
            zIndex: google.maps.Marker.MAX_ZINDEX + 1
         

        }),
        b = null;
    return google.maps.event.addListener(a, "dragstart", function() {
        b = a.getPosition()
    }), google.maps.event.addListener(a, "dragend", function() {
        var c = a.getPosition();
        changeSearchLocation(c.lat(), c.lng()).done(function() {
            b = null
        }).fail(function() {
            b && a.setPosition(b)
        })
    }), a
}

function searchControl(a) {
    $.post(searchControlURI + "?action=" + encodeURIComponent(a))
}

function updateSearchStatus() {
    $.getJSON(searchControlURI).then(function(a) {
        $("#search-switch").prop("checked", a.status)
    })
}

function initSidebar() {
    $("#gyms-switch").prop("checked", Store.get("showGyms")), $("#pokemon-switch").prop("checked", Store.get("showPokemon")), $("#pokestops-switch").prop("checked", Store.get("showPokestops")), $("#lured-pokestops-only-switch").val(Store.get("showLuredPokestopsOnly")), $("#lured-pokestops-only-wrapper").toggle(Store.get("showPokestops")), $("#geoloc-switch").prop("checked", Store.get("geoLocate")), $("#lock-marker-switch").prop("checked", Store.get("lockMarker")), $("#start-at-user-location-switch").prop("checked", Store.get("startAtUserLocation")), $("#scanned-switch").prop("checked", Store.get("showScanned")), $("#spawnpoints-switch").prop("checked", Store.get("showSpawnpoints")), $("#sound-switch").prop("checked", Store.get("playSound"));
    var a = new google.maps.places.SearchBox(document.getElementById("next-location"));
    $("#next-location").css("background-color", $("#geoloc-switch").prop("checked") ? "#e0e0e0" : "#ffffff"), updateSearchStatus(), setInterval(updateSearchStatus, 5e3), a.addListener("places_changed", function() {
        var b = a.getPlaces();
        if (0 !== b.length) {
            var c = b[0].geometry.location;
            changeLocation(c.lat(), c.lng())
        }
    });
    var b = $("#pokemon-icons");
    $.each(pokemonSprites, function(a, c) {
        b.append($("<option></option>").attr("value", a).text(c.name))
    }), b.val(pokemonSprites[Store.get("pokemonIcons")] ? Store.get("pokemonIcons") : "highres"), $("#pokemon-icon-size").val(Store.get("iconSizeModifier"))
}

function pad(a) {
    return a <= 99 ? ("0" + a).slice(-2) : a
}

function getTypeSpan(a) {
    return "<span style='padding: 2px 5px; text-transform: uppercase; color: white; margin-right: 2px; border-radius: 4px; font-size: 0.8em; vertical-align: text-bottom; background-color: " + a.color + "'>" + a.type + "</span>"
}

function pokemonLabel(a, b, c, d, e, f, g, h) {
    var i = new Date(d),
        j = b ? "(" + b + ")" : "",
        k = "";
    $.each(c, function(a, b) {
        k += getTypeSpan(b)
    });
    var l = "\n    <div>\n      <b>" + a + "</b>\n      <span> - </span>\n      <small>\n        <a href='http://www.pokemon.com/us/pokedex/" + e + "' target='_blank' title='View in Pokedex'>#" + e + "</a>\n      </small>\n      <span> " + j + "</span>\n      <span> - </span>\n      <small>" + k + "</small>\n    </div>\n    <div>\n      Disappears at " + pad(i.getHours()) + ":" + pad(i.getMinutes()) + ":" + pad(i.getSeconds()) + "\n      <span class='label-countdown' disappears-at='" + d + "'>(00m00s)</span>\n    </div>\n    <div>\n      Location: " + f.toFixed(6) + ", " + g.toFixed(7) + "\n    </div>\n    <div>\n      <a href='javascript:excludePokemon(" + e + ")'>Exclude</a>&nbsp;&nbsp\n      <a href='javascript:notifyAboutPokemon(" + e + ")'>Notify</a>&nbsp;&nbsp\n      <a href='javascript:removePokemonMarker(\"" + h + "\")'>Remove</a>&nbsp;&nbsp\n      <a href='https://www.google.com/maps/dir/Current+Location/" + f + "," + g + "?hl=en' target='_blank' title='View in Maps'>Get directions</a>\n    </div>";
    return l
}

function gymLabel(a, b, c, d, e) {
    var f = ["0, 0, 0, .4", "74, 138, 202, .6", "240, 68, 58, .6", "254, 217, 40, .6"],
        g;
    if (0 === b) g = "\n      <div>\n        <center>\n          <div>\n            <b style='color:rgba(" + f[b] + ")'>" + a + "</b><br>\n            <img height='70px' style='padding: 5px;' src='static/forts/" + a + "_large.png'>\n          </div>\n          <div>\n            Location: " + d.toFixed(6) + ", " + e.toFixed(7) + "\n          </div>\n          <div>\n            <a href='https://www.google.com/maps/dir/Current+Location/" + d + "," + e + "?hl=en' target='_blank' title='View in Maps'>Get directions</a>\n          </div>\n        </center>\n      </div>";
    else {
        for (var h = [2e3, 4e3, 8e3, 12e3, 16e3, 2e4, 3e4, 4e4, 5e4], i = 1; c >= h[i - 1];) i++;
        g = "\n      <div>\n        <center>\n          <div style='padding-bottom: 2px'>\n            Gym owned by:\n          </div>\n          <div>\n            <b style='color:rgba(" + f[b] + ")'>Team " + a + "</b><br>\n            <img height='70px' style='padding: 5px;' src='static/forts/" + a + "_large.png'>\n          </div>\n          <div>\n            Level: " + i + " | Prestige: " + c + "\n          </div>\n          <div>\n            Location: " + d.toFixed(6) + ", " + e.toFixed(7) + "\n          </div>\n          <div>\n            <a href='https://www.google.com/maps/dir/Current+Location/" + d + "," + e + "?hl=en' target='_blank' title='View in Maps'>Get directions</a>\n          </div>\n        </center>\n      </div>"
    }
    return g
}

function pokestopLabel(a, b, c, d) {
    var e;
    if (a) {
        var f = new Date(b),
            g = new Date,
            h = g.getTime() - f.getTime(),
            i = new Date(g.getTime() + h),
            j = i.getTime();
        e = "\n      <div>\n        <b>Lured Pokéstop</b>\n      </div>\n      <div>\n        Lure expires at " + pad(i.getHours()) + ":" + pad(i.getMinutes()) + ":" + pad(i.getSeconds()) + "\n        <span class='label-countdown' disappears-at='" + j + "'>(00m00s)</span>\n      </div>\n      <div>\n        Location: " + c.toFixed(6) + ", " + d.toFixed(7) + "\n      </div>\n      <div>\n        <a href='https://www.google.com/maps/dir/Current+Location/" + c + "," + d + "?hl=en' target='_blank' title='View in Maps'>Get directions</a>\n      </div>"
    } else e = "\n      <div>\n        <b>Pokéstop</b>\n      </div>\n      <div>\n        Location: " + c.toFixed(6) + ", " + d.toFixed(7) + "\n      </div>\n      <div>\n        <a href='https://www.google.com/maps/dir/Current+Location/" + c + "," + d + "?hl=en' target='_blank' title='View in Maps'>Get directions</a>\n      </div>";
    return e
}

function getGoogleSprite(a, b, c) {
    c = Math.max(c, 3);
    var d = c / b.iconHeight,
        e = new google.maps.Size(d * b.iconWidth - 1, d * b.iconHeight - 1),
        f = new google.maps.Point(a % b.columns * b.iconWidth * d + .5, Math.floor(a / b.columns) * b.iconHeight * d + .5),
        g = new google.maps.Size(d * b.spriteWidth, d * b.spriteHeight),
        h = new google.maps.Point(d * b.iconWidth / 2, d * b.iconHeight / 2);
    return {
        url: b.filename,
        size: e,
        scaledSize: g,
        origin: f,
        anchor: h
    }
}

function setupPokemonMarker(a, b, c) {
    var d = 2 + (map.getZoom() - 3) * (map.getZoom() - 3) * .2 + Store.get("iconSizeModifier"),
        e = a.pokemon_id - 1,
        f = pokemonSprites[Store.get("pokemonIcons")] || pokemonSprites.highres,
        g = getGoogleSprite(e, f, d),
        h = !1;
    c === !0 && (h = !0);
    var i = new google.maps.Marker({
        position: {
            lat: a.latitude,
            lng: a.longitude
        },
        zIndex: 9999,
        map: map,
        icon: g,
        animationDisabled: h
    });
    return i.addListener("click", function() {
        this.setAnimation(null), this.animationDisabled = !0
    }), i.infoWindow = new google.maps.InfoWindow({
        content: pokemonLabel(a.pokemon_name, a.pokemon_rarity, a.pokemon_types, a.disappear_time, a.pokemon_id, a.latitude, a.longitude, a.encounter_id),
        disableAutoPan: !0
    }), (notifiedPokemon.indexOf(a.pokemon_id) > -1 || notifiedRarity.indexOf(a.pokemon_rarity) > -1) && (b || (Store.get("playSound") && audio.play(), sendNotification("A wild " + a.pokemon_name + " appeared!", "Click to load map", "static/icons/" + a.pokemon_id + ".png", a.latitude, a.longitude)), i.animationDisabled !== !0 && i.setAnimation(google.maps.Animation.BOUNCE)), addListeners(i), i
}

function setupGymMarker(a) {
    var b = new google.maps.Marker({
        position: {
            lat: a.latitude,
            lng: a.longitude
        },
        map: map,
        icon: "static/forts/" + gymTypes[a.team_id] + ".png"
    });
    return b.infoWindow = new google.maps.InfoWindow({
        content: gymLabel(gymTypes[a.team_id], a.team_id, a.gym_points, a.latitude, a.longitude),
        disableAutoPan: !0
    }), addListeners(b), b
}

function updateGymMarker(a, b) {
    return b.setIcon("static/forts/" + gymTypes[a.team_id] + ".png"), b.infoWindow.setContent(gymLabel(gymTypes[a.team_id], a.team_id, a.gym_points, a.latitude, a.longitude)), b
}

function setupPokestopMarker(a) {
    var b = a.lure_expiration ? "PstopLured" : "Pstop",
        c = new google.maps.Marker({
            position: {
                lat: a.latitude,
                lng: a.longitude
            },
            map: map,
            zIndex: 2,
            icon: "static/forts/" + b + ".png"
        });
    return c.infoWindow = new google.maps.InfoWindow({
        content: pokestopLabel(!!a.lure_expiration, a.last_modified, a.latitude, a.longitude),
        disableAutoPan: !0
    }), addListeners(c), c
}

function getColorByDate(a) {
    var b = (Date.now() - a) / 1e3 / 60 / 15;
    b > 1 && (b = 1);
    var c = (120 * (1 - b)).toString(10);
    return ["hsl(", c, ",100%,50%)"].join("")
}

function setupScannedMarker(a) {
    var b = new google.maps.LatLng(a.latitude, a.longitude),
        c = new google.maps.Circle({
            map: map,
            clickable: !1,
            center: b,
            radius: 70,
            fillColor: getColorByDate(a.last_modified),
            strokeWeight: 1
        });
    return c
}

function setupSpawnpointMarker(a) {
    var b = new google.maps.LatLng(a.latitude, a.longitude),
        c = new google.maps.Circle({
            map: map,
            clickable: !1,
            center: b,
            radius: 5,
            fillColor: "blue",
            strokeWeight: 1
        });
    return c
}

function clearSelection() {
    document.selection ? document.selection.empty() : window.getSelection && window.getSelection().removeAllRanges()
}

function addListeners(a) {
    return a.addListener("click", function() {
        a.infoWindow.open(map, a), clearSelection(), updateLabelDiffTime(), a.persist = !0
    }), google.maps.event.addListener(a.infoWindow, "closeclick", function() {
        a.persist = null
    }), a.addListener("mouseover", function() {
        a.infoWindow.open(map, a), clearSelection(), updateLabelDiffTime()
    }), a.addListener("mouseout", function() {
        a.persist || a.infoWindow.close()
    }), a
}

function clearStaleMarkers() {
    $.each(mapData.pokemons, function(a, b) {
        (mapData.pokemons[a].disappear_time < (new Date).getTime() || excludedPokemon.indexOf(mapData.pokemons[a].pokemon_id) >= 0) && (mapData.pokemons[a].marker.setMap(null), delete mapData.pokemons[a])
    }), $.each(mapData.lurePokemons, function(a, b) {
        (mapData.lurePokemons[a].lure_expiration < (new Date).getTime() || excludedPokemon.indexOf(mapData.lurePokemons[a].pokemon_id) >= 0) && (mapData.lurePokemons[a].marker.setMap(null), delete mapData.lurePokemons[a])
    }), $.each(mapData.scanned, function(a, b) {
        mapData.scanned[a].last_modified < (new Date).getTime() - 9e5 && (mapData.scanned[a].marker.setMap(null), delete mapData.scanned[a])
    })
}

function showInBoundsMarkers(a) {
    $.each(a, function(b, c) {
        var d = a[b].marker,
            e = !1;
        a[b].hidden || ("function" == typeof d.getBounds ? map.getBounds().intersects(d.getBounds()) && (e = !0) : "function" == typeof d.getPosition && map.getBounds().contains(d.getPosition()) && (e = !0)), e && !d.getMap() ? (d.setMap(map), d.setAnimation && d.oldAnimation && d.setAnimation(d.oldAnimation)) : !e && d.getMap() && (d.getAnimation && (d.oldAnimation = d.getAnimation()), d.setMap(null))
    })
}

function loadRawData() {
    var a = Store.get("showPokemon"),
        b = Store.get("showGyms"),
        c = Store.get("showPokestops") || Store.get("showPokemon"),
        d = Store.get("showScanned"),
        e = Store.get("showSpawnpoints"),
        f = map.getBounds(),
        g = f.getSouthWest(),
        h = f.getNorthEast(),
        i = g.lat(),
        j = g.lng(),
        k = h.lat(),
        l = h.lng();
    return $.ajax({
        url: baseURL + "raw_data",
        type: "GET",
        data: {
            pokemon: a,
            pokestops: c,
            gyms: b,
            scanned: d,
            spawnpoints: e,
            swLat: i,
            swLng: j,
            neLat: k,
            neLng: l
        },
        dataType: "json",
        cache: !1,
        beforeSend: function a() {
            return !rawDataIsLoading && void(rawDataIsLoading = !0)
        },
        complete: function a() {
            rawDataIsLoading = !1
        }
    })
}

function processPokemons(a, b) {
    return !!Store.get("showPokemon") && void(!(b.encounter_id in mapData.pokemons) && excludedPokemon.indexOf(b.pokemon_id) < 0 && (b.marker && b.marker.setMap(null), b.hidden || (b.marker = setupPokemonMarker(b), mapData.pokemons[b.encounter_id] = b)))
}

function processPokestops(a, b) {
    if (!Store.get("showPokestops")) return !1;
    if (Store.get("showLuredPokestopsOnly") && !b.lure_expiration) return mapData.pokestops[b.pokestop_id] && mapData.pokestops[b.pokestop_id].marker && (mapData.pokestops[b.pokestop_id].marker.setMap(null), delete mapData.pokestops[b.pokestop_id]), !0;
    if (mapData.pokestops[b.pokestop_id]) {
        var c = mapData.pokestops[b.pokestop_id];
        !!b.lure_expiration != !!c.lure_expiration && (c.marker.setMap(null), b.marker = setupPokestopMarker(b), mapData.pokestops[b.pokestop_id] = b)
    } else b.marker && b.marker.setMap(null), b.marker = setupPokestopMarker(b), mapData.pokestops[b.pokestop_id] = b
}

function processGyms(a, b) {
    return !!Store.get("showGyms") && (b.gym_id in mapData.gyms ? b.marker = updateGymMarker(b, mapData.gyms[b.gym_id].marker) : b.marker = setupGymMarker(b), void(mapData.gyms[b.gym_id] = b))
}

function processScanned(a, b) {
    if (!Store.get("showScanned")) return !1;
    var c = b.latitude + "|" + b.longitude;
    c in mapData.scanned ? mapData.scanned[c].marker.setOptions({
        fillColor: getColorByDate(b.last_modified)
    }) : (b.marker && b.marker.setMap(null), b.marker = setupScannedMarker(b), mapData.scanned[c] = b)
}

function processSpawnpoints(a, b) {
    if (!Store.get("showSpawnpoints")) return !1;
    var c = b.spawnpoint_id;
    c in mapData.spawnpoints || (b.marker && b.marker.setMap(null), b.marker = setupSpawnpointMarker(b), mapData.spawnpoints[c] = b)
}

function updateMap() {
    loadRawData().done(function(a) {
        $.each(a.pokemons, processPokemons), $.each(a.pokestops, processPokestops), $.each(a.gyms, processGyms), $.each(a.scanned, processScanned), $.each(a.spawnpoints, processSpawnpoints), showInBoundsMarkers(mapData.pokemons), showInBoundsMarkers(mapData.lurePokemons), showInBoundsMarkers(mapData.gyms), showInBoundsMarkers(mapData.pokestops), showInBoundsMarkers(mapData.scanned), showInBoundsMarkers(mapData.spawnpoints), clearStaleMarkers(), $("#stats").hasClass("visible") && countMarkers()
    })
}

function redrawPokemon(a) {
    var b = !0;
    $.each(a, function(c, d) {
        var e = a[c];
        if (!e.hidden) {
            var f = setupPokemonMarker(e, b, this.marker.animationDisabled);
            e.marker.setMap(null), a[c].marker = f
        }
    })
}

function getPointDistance(a, b) {
    return google.maps.geometry.spherical.computeDistanceBetween(a, b)
}

function sendNotification(a, b, c, d, e) {
    if (!("Notification" in window)) return !1;
    if ("granted" !== Notification.permission) Notification.requestPermission();
    else {
        var f = new Notification(a, {
            icon: c,
            body: b,
            sound: "sounds/ding.mp3"
        });
        f.onclick = function() {
            window.focus(), f.close(), centerMap(d, e, 20)
        }
    }
}

function myLocationButton(a, b) {
    var c = document.createElement("div"),
        d = document.createElement("button");
    d.style.backgroundColor = "#fff", d.style.border = "none", d.style.outline = "none", d.style.width = "28px", d.style.height = "28px", d.style.borderRadius = "2px", d.style.boxShadow = "0 1px 4px rgba(0,0,0,0.3)", d.style.cursor = "pointer", d.style.marginRight = "10px", d.style.padding = "0px", d.title = "Your Location", c.appendChild(d);
    var e = document.createElement("div");
    e.style.margin = "5px", e.style.width = "18px", e.style.height = "18px", e.style.backgroundImage = "url(static/mylocation-sprite-1x.png)", e.style.backgroundSize = "180px 18px", e.style.backgroundPosition = "0px 0px", e.style.backgroundRepeat = "no-repeat", e.id = "current-location", d.appendChild(e), d.addEventListener("click", function() {
        centerMapOnLocation()
    }), c.index = 1, a.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(c)
}

function centerMapOnLocation() {
    var a = document.getElementById("current-location"),
        b = "0",
        c = setInterval(function() {
            b = "-18" === b ? "0" : "-18", a.style.backgroundPosition = b + "px 0"
        }, 500);
    navigator.geolocation ? navigator.geolocation.getCurrentPosition(function(b) {
        var d = new google.maps.LatLng(b.coords.latitude, b.coords.longitude);
        locationMarker.setVisible(!0), locationMarker.setOptions({
            opacity: 1
        }), locationMarker.setPosition(d), map.setCenter(d), clearInterval(c), a.style.backgroundPosition = "-144px 0px";
    }) : (clearInterval(c), a.style.backgroundPosition = "0px 0px")
}

function addMyLocationButton() {
    locationMarker = new google.maps.Marker({
        map: map,
        animation: google.maps.Animation.DROP,
        position: {
            lat: centerLat,
            lng: centerLng
        },
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillOpacity: 1,
            fillColor: "#1c8af6",
            scale: 6,
            strokeColor: "#1c8af6",
            strokeWeight: 8,
            strokeOpacity: .3
        }
    }), locationMarker.setVisible(!1), myLocationButton(map, locationMarker), google.maps.event.addListener(map, "dragend", function() {
        var a = document.getElementById("current-location");
        a.style.backgroundPosition = "0px 0px", locationMarker.setOptions({
            opacity: .5
        })
    })
}

function changeLocation(a, b) {
    var c = new google.maps.LatLng(a, b);
    changeSearchLocation(a, b).done(function() {
        map.setCenter(c), marker.setPosition(c)
    })
}

function changeSearchLocation(a, b) {
    return $.post(baseURL + "next_loc?lat=" + a + "&lon=" + b, {})
}

function centerMap(a, b, c) {
    var d = new google.maps.LatLng(a, b);
    map.setCenter(d), c && map.setZoom(c)
}

function i8ln(a) {
    return $.isEmptyObject(i8lnDictionary) && "en" !== language && languageLookups < languageLookupThreshold && $.ajax({
        url: "static/dist/locales/" + language + ".min.json",
        dataType: "json",
        async: !1,
        success: function a(b) {
            i8lnDictionary = b
        },
        error: function a(b, c, d) {
            console.log("Error loading i8ln dictionary: " + d), languageLookups++
        }
    }), a in i8lnDictionary ? i8lnDictionary[a] : a
}

function isTouchDevice() {
    return "ontouchstart" in window || navigator.maxTouchPoints
}
var $selectExclude, $selectPokemonNotify, $selectRarityNotify, $selectStyle, $selectIconResolution, $selectIconSize, $selectLuredPokestopsOnly, language = "" === document.documentElement.lang ? "en" : document.documentElement.lang,
    idToPokemon = {},
    i8lnDictionary = {},
    languageLookups = 0,
    languageLookupThreshold = 3,
    excludedPokemon = [],
    notifiedPokemon = [],
    notifiedRarity = [],
    map, rawDataIsLoading = !1,
    locationMarker, marker, noLabelsStyle = [{
        featureType: "poi",
        elementType: "labels",
        stylers: [{
            visibility: "off"
        }]
    }, {
        featureType: "all",
        elementType: "labels.icon",
        stylers: [{
            visibility: "off"
        }]
    }],
    light2Style = [{
        elementType: "geometry",
        stylers: [{
            hue: "#ff4400"
        }, {
            saturation: -68
        }, {
            lightness: -4
        }, {
            gamma: .72
        }]
    }, {
        featureType: "road",
        elementType: "labels.icon"
    }, {
        featureType: "landscape.man_made",
        elementType: "geometry",
        stylers: [{
            hue: "#0077ff"
        }, {
            gamma: 3.1
        }]
    }, {
        featureType: "water",
        stylers: [{
            hue: "#00ccff"
        }, {
            gamma: .44
        }, {
            saturation: -33
        }]
    }, {
        featureType: "poi.park",
        stylers: [{
            hue: "#44ff00"
        }, {
            saturation: -23
        }]
    }, {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{
            hue: "#007fff"
        }, {
            gamma: .77
        }, {
            saturation: 65
        }, {
            lightness: 99
        }]
    }, {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{
            gamma: .11
        }, {
            weight: 5.6
        }, {
            saturation: 99
        }, {
            hue: "#0091ff"
        }, {
            lightness: -86
        }]
    }, {
        featureType: "transit.line",
        elementType: "geometry",
        stylers: [{
            lightness: -48
        }, {
            hue: "#ff5e00"
        }, {
            gamma: 1.2
        }, {
            saturation: -23
        }]
    }, {
        featureType: "transit",
        elementType: "labels.text.stroke",
        stylers: [{
            saturation: -64
        }, {
            hue: "#ff9100"
        }, {
            lightness: 16
        }, {
            gamma: .47
        }, {
            weight: 2.7
        }]
    }],
    darkStyle = [{
        featureType: "all",
        elementType: "labels.text.fill",
        stylers: [{
            saturation: 36
        }, {
            color: "#b39964"
        }, {
            lightness: 40
        }]
    }, {
        featureType: "all",
        elementType: "labels.text.stroke",
        stylers: [{
            visibility: "on"
        }, {
            color: "#000000"
        }, {
            lightness: 16
        }]
    }, {
        featureType: "all",
        elementType: "labels.icon",
        stylers: [{
            visibility: "off"
        }]
    }, {
        featureType: "administrative",
        elementType: "geometry.fill",
        stylers: [{
            color: "#000000"
        }, {
            lightness: 20
        }]
    }, {
        featureType: "administrative",
        elementType: "geometry.stroke",
        stylers: [{
            color: "#000000"
        }, {
            lightness: 17
        }, {
            weight: 1.2
        }]
    }, {
        featureType: "landscape",
        elementType: "geometry",
        stylers: [{
            color: "#000000"
        }, {
            lightness: 20
        }]
    }, {
        featureType: "poi",
        elementType: "geometry",
        stylers: [{
            color: "#000000"
        }, {
            lightness: 21
        }]
    }, {
        featureType: "road.highway",
        elementType: "geometry.fill",
        stylers: [{
            color: "#000000"
        }, {
            lightness: 17
        }]
    }, {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{
            color: "#000000"
        }, {
            lightness: 29
        }, {
            weight: .2
        }]
    }, {
        featureType: "road.arterial",
        elementType: "geometry",
        stylers: [{
            color: "#000000"
        }, {
            lightness: 18
        }]
    }, {
        featureType: "road.local",
        elementType: "geometry",
        stylers: [{
            color: "#181818"
        }, {
            lightness: 16
        }]
    }, {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{
            color: "#000000"
        }, {
            lightness: 19
        }]
    }, {
        featureType: "water",
        elementType: "geometry",
        stylers: [{
            lightness: 17
        }, {
            color: "#525252"
        }]
    }],
    pGoStyle = [{
        featureType: "landscape.man_made",
        elementType: "geometry.fill",
        stylers: [{
            color: "#a1f199"
        }]
    }, {
        featureType: "landscape.natural.landcover",
        elementType: "geometry.fill",
        stylers: [{
            color: "#37bda2"
        }]
    }, {
        featureType: "landscape.natural.terrain",
        elementType: "geometry.fill",
        stylers: [{
            color: "#37bda2"
        }]
    }, {
        featureType: "poi.attraction",
        elementType: "geometry.fill",
        stylers: [{
            visibility: "on"
        }]
    }, {
        featureType: "poi.business",
        elementType: "geometry.fill",
        stylers: [{
            color: "#e4dfd9"
        }]
    }, {
        featureType: "poi.business",
        elementType: "labels.icon",
        stylers: [{
            visibility: "off"
        }]
    }, {
        featureType: "poi.park",
        elementType: "geometry.fill",
        stylers: [{
            color: "#37bda2"
        }]
    }, {
        featureType: "road",
        elementType: "geometry.fill",
        stylers: [{
            color: "#84b09e"
        }]
    }, {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{
            color: "#fafeb8"
        }, {
            weight: "1.25"
        }]
    }, {
        featureType: "road.highway",
        elementType: "labels.icon",
        stylers: [{
            visibility: "off"
        }]
    }, {
        featureType: "water",
        elementType: "geometry.fill",
        stylers: [{
            color: "#5ddad6"
        }]
    }],
    light2StyleNoLabels = [{
        elementType: "geometry",
        stylers: [{
            hue: "#ff4400"
        }, {
            saturation: -68
        }, {
            lightness: -4
        }, {
            gamma: .72
        }]
    }, {
        featureType: "road",
        elementType: "labels.icon"
    }, {
        featureType: "landscape.man_made",
        elementType: "geometry",
        stylers: [{
            hue: "#0077ff"
        }, {
            gamma: 3.1
        }]
    }, {
        featureType: "water",
        stylers: [{
            hue: "#00ccff"
        }, {
            gamma: .44
        }, {
            saturation: -33
        }]
    }, {
        featureType: "poi.park",
        stylers: [{
            hue: "#44ff00"
        }, {
            saturation: -23
        }]
    }, {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{
            hue: "#007fff"
        }, {
            gamma: .77
        }, {
            saturation: 65
        }, {
            lightness: 99
        }]
    }, {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{
            gamma: .11
        }, {
            weight: 5.6
        }, {
            saturation: 99
        }, {
            hue: "#0091ff"
        }, {
            lightness: -86
        }]
    }, {
        featureType: "transit.line",
        elementType: "geometry",
        stylers: [{
            lightness: -48
        }, {
            hue: "#ff5e00"
        }, {
            gamma: 1.2
        }, {
            saturation: -23
        }]
    }, {
        featureType: "transit",
        elementType: "labels.text.stroke",
        stylers: [{
            saturation: -64
        }, {
            hue: "#ff9100"
        }, {
            lightness: 16
        }, {
            gamma: .47
        }, {
            weight: 2.7
        }]
    }, {
        featureType: "all",
        elementType: "labels.text.stroke",
        stylers: [{
            visibility: "off"
        }]
    }, {
        featureType: "all",
        elementType: "labels.text.fill",
        stylers: [{
            visibility: "off"
        }]
    }, {
        featureType: "all",
        elementType: "labels.icon",
        stylers: [{
            visibility: "off"
        }]
    }],
    darkStyleNoLabels = [{
        featureType: "all",
        elementType: "labels.text.fill",
        stylers: [{
            visibility: "off"
        }]
    }, {
        featureType: "all",
        elementType: "labels.text.stroke",
        stylers: [{
            visibility: "off"
        }]
    }, {
        featureType: "all",
        elementType: "labels.icon",
        stylers: [{
            visibility: "off"
        }]
    }, {
        featureType: "administrative",
        elementType: "geometry.fill",
        stylers: [{
            color: "#000000"
        }, {
            lightness: 20
        }]
    }, {
        featureType: "administrative",
        elementType: "geometry.stroke",
        stylers: [{
            color: "#000000"
        }, {
            lightness: 17
        }, {
            weight: 1.2
        }]
    }, {
        featureType: "landscape",
        elementType: "geometry",
        stylers: [{
            color: "#000000"
        }, {
            lightness: 20
        }]
    }, {
        featureType: "poi",
        elementType: "geometry",
        stylers: [{
            color: "#000000"
        }, {
            lightness: 21
        }]
    }, {
        featureType: "road.highway",
        elementType: "geometry.fill",
        stylers: [{
            color: "#000000"
        }, {
            lightness: 17
        }]
    }, {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{
            color: "#000000"
        }, {
            lightness: 29
        }, {
            weight: .2
        }]
    }, {
        featureType: "road.arterial",
        elementType: "geometry",
        stylers: [{
            color: "#000000"
        }, {
            lightness: 18
        }]
    }, {
        featureType: "road.local",
        elementType: "geometry",
        stylers: [{
            color: "#181818"
        }, {
            lightness: 16
        }]
    }, {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{
            color: "#000000"
        }, {
            lightness: 19
        }]
    }, {
        featureType: "water",
        elementType: "geometry",
        stylers: [{
            lightness: 17
        }, {
            color: "#525252"
        }]
    }],
    pGoStyleNoLabels = [{
        featureType: "landscape.man_made",
        elementType: "geometry.fill",
        stylers: [{
            color: "#a1f199"
        }]
    }, {
        featureType: "landscape.natural.landcover",
        elementType: "geometry.fill",
        stylers: [{
            color: "#37bda2"
        }]
    }, {
        featureType: "landscape.natural.terrain",
        elementType: "geometry.fill",
        stylers: [{
            color: "#37bda2"
        }]
    }, {
        featureType: "poi.attraction",
        elementType: "geometry.fill",
        stylers: [{
            visibility: "on"
        }]
    }, {
        featureType: "poi.business",
        elementType: "geometry.fill",
        stylers: [{
            color: "#e4dfd9"
        }]
    }, {
        featureType: "poi.business",
        elementType: "labels.icon",
        stylers: [{
            visibility: "off"
        }]
    }, {
        featureType: "poi.park",
        elementType: "geometry.fill",
        stylers: [{
            color: "#37bda2"
        }]
    }, {
        featureType: "road",
        elementType: "geometry.fill",
        stylers: [{
            color: "#84b09e"
        }]
    }, {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{
            color: "#fafeb8"
        }, {
            weight: "1.25"
        }]
    }, {
        featureType: "road.highway",
        elementType: "labels.icon",
        stylers: [{
            visibility: "off"
        }]
    }, {
        featureType: "water",
        elementType: "geometry.fill",
        stylers: [{
            color: "#5ddad6"
        }]
    }, {
        featureType: "all",
        elementType: "labels.text.stroke",
        stylers: [{
            visibility: "off"
        }]
    }, {
        featureType: "all",
        elementType: "labels.text.fill",
        stylers: [{
            visibility: "off"
        }]
    }, {
        featureType: "all",
        elementType: "labels.icon",
        stylers: [{
            visibility: "off"
        }]
    }],
    selectedStyle = "light",
    mapData = {
        pokemons: {},
        gyms: {},
        pokestops: {},
        lurePokemons: {},
        scanned: {},
        spawnpoints: {}
    },
    gymTypes = ["Uncontested", "Mystic", "Valor", "Instinct"],
    audio = new Audio("static/sounds/ding.mp3"),
    pokemonSprites = {
        normal: {
            columns: 12,
            iconWidth: 30,
            iconHeight: 30,
            spriteWidth: 360,
            spriteHeight: 390,
            filename: "static/icons-sprite.png",
            name: "Normal"
        },
        highres: {
            columns: 7,
            iconWidth: 65,
            iconHeight: 65,
            spriteWidth: 455,
            spriteHeight: 1430,
            filename: "static/icons-large-sprite.png",
            name: "High-Res"
        }
    },
    StoreTypes = {
        Boolean: {
            parse: function a(b) {
                switch (b.toLowerCase()) {
                    case "1":
                    case "true":
                    case "yes":
                        return !0;
                    default:
                        return !1
                }
            },
            stringify: function a(b) {
                return b ? "true" : "false"
            }
        },
        JSON: {
            parse: function a(b) {
                return JSON.parse(b)
            },
            stringify: function a(b) {
                return JSON.stringify(b)
            }
        },
        String: {
            parse: function a(b) {
                return b
            },
            stringify: function a(b) {
                return b
            }
        },
        Number: {
            parse: function a(b) {
                return parseInt(b, 10)
            },
            stringify: function a(b) {
                return b.toString()
            }
        }
    },
    StoreOptions = {
        map_style: {
            default: "roadmap",
            type: StoreTypes.String
        },
        remember_select_exclude: {
            default: [],
            type: StoreTypes.JSON
        },
        remember_select_notify: {
            default: [],
            type: StoreTypes.JSON
        },
        remember_select_rarity_notify: {
            default: [],
            type: StoreTypes.JSON
        },
        showGyms: {
            default: !1,
            type: StoreTypes.Boolean
        },
        showPokemon: {
            default: !0,
            type: StoreTypes.Boolean
        },
        showPokestops: {
            default: !0,
            type: StoreTypes.Boolean
        },
        showLuredPokestopsOnly: {
            default: 0,
            type: StoreTypes.Number
        },
        showScanned: {
            default: !1,
            type: StoreTypes.Boolean
        },
        showSpawnpoints: {
            default: !1,
            type: StoreTypes.Boolean
        },
        playSound: {
            default: !1,
            type: StoreTypes.Boolean
        },
        geoLocate: {
            default: !1,
            type: StoreTypes.Boolean
        },
        lockMarker: {
            default: isTouchDevice(),
            type: StoreTypes.Boolean
        },
        startAtUserLocation: {
            default: !1,
            type: StoreTypes.Boolean
        },
        pokemonIcons: {
            default: "highres",
            type: StoreTypes.String
        },
        iconSizeModifier: {
            default: 0,
            type: StoreTypes.Number
        }
    },
    Store = {
        getOption: function a(b) {
            var c = StoreOptions[b];
            if (!c) throw new Error("Store key was not defined " + b);
            return c
        },
        get: function a(b) {
            var c = this.getOption(b),
                d = c.type,
                e = localStorage[b];
            if (null === e || void 0 === e) return c.default;
            var f = d.parse(e);
            return f
        },
        set: function a(b, c) {
            var d = this.getOption(b),
                e = d.type || StoreTypes.String,
                f = e.stringify(c);
            localStorage[b] = f
        },
        reset: function a(b) {
            localStorage.removeItem(b)
        }
    },
    searchControlURI = baseURL + "search_control",
    updateLabelDiffTime = function a() {
        $(".label-countdown").each(function(a, b) {
            var c = new Date(parseInt(b.getAttribute("disappears-at"))),
                d = new Date,
                e = Math.abs(c - d),
                f = Math.floor(e / 36e5),
                g = Math.floor((e - 36e5 * f) / 6e4),
                h = Math.floor((e - 36e5 * f - 6e4 * g) / 1e3),
                i = "";
            c < d ? i = "(expired)" : (i = "(", f > 0 && (i = f + "h"), i += ("0" + g).slice(-2) + "m", i += ("0" + h).slice(-2) + "s", i += ")"), $(b).text(i)
        })
    };
$(function() {
    return Notification ? void("granted" !== Notification.permission && Notification.requestPermission()) : void console.log("could not load notifications")
}), $(function() {
    $selectStyle = $("#map-style"), $.getJSON("static/dist/data/mapstyle.min.json").done(function(a) {
        var b = [];
        $.each(a, function(a, c) {
            b.push({
                id: a,
                text: i8ln(c)
            })
        }), $selectStyle.select2({
            placeholder: "Select Style",
            data: b,
            minimumResultsForSearch: 1 / 0
        }), $selectStyle.on("change", function(a) {
            selectedStyle = $selectStyle.val(), map.setMapTypeId(selectedStyle), Store.set("map_style", selectedStyle)
        }), $selectStyle.val(Store.get("map_style")).trigger("change")
    }), $selectIconResolution = $("#pokemon-icons"), $selectIconResolution.select2({
        placeholder: "Select Icon Resolution",
        minimumResultsForSearch: 1 / 0
    }), $selectIconResolution.on("change", function() {
        Store.set("pokemonIcons", this.value), redrawPokemon(mapData.pokemons), redrawPokemon(mapData.lurePokemons)
    }), $selectIconSize = $("#pokemon-icon-size"), $selectIconSize.select2({
        placeholder: "Select Icon Size",
        minimumResultsForSearch: 1 / 0
    }), $selectIconSize.on("change", function() {
        Store.set("iconSizeModifier", this.value), redrawPokemon(mapData.pokemons), redrawPokemon(mapData.lurePokemons)
    }), $selectLuredPokestopsOnly = $("#lured-pokestops-only-switch"), $selectLuredPokestopsOnly.select2({
        placeholder: "Only Show Lured Pokestops",
        minimumResultsForSearch: 1 / 0
    }), $selectLuredPokestopsOnly.on("change", function() {
        Store.set("showLuredPokestopsOnly", this.value), updateMap()
    })
}), $(function() {
    function a(a) {
        if (!a.id) return a.text;
        var b = $('<span><i class="pokemon-sprite n' + a.element.value.toString() + '"></i> ' + a.text + "</span>");
        return b
    }

    function b(a, b, c) {
        return function() {
            Store.set(c, this.checked), this.checked ? updateMap() : $.each(b, function(b, c) {
                $.each(a[c], function(b, d) {
                    a[c][b].marker.setMap(null)
                }), a[c] = {}
            })
        }
    }
    Store.get("startAtUserLocation") && centerMapOnLocation(), $selectExclude = $("#exclude-pokemon"), $selectPokemonNotify = $("#notify-pokemon"), $selectRarityNotify = $("#notify-rarity");
    var c = 151;
    $.getJSON("static/dist/data/pokemon.min.json").done(function(b) {
        var d = [];
        $.each(b, function(a, b) {
            if (a > c) return !1;
            var e = [];
            d.push({
                id: a,
                text: i8ln(b.name) + " - #" + a
            }), b.name = i8ln(b.name), b.rarity = i8ln(b.rarity), $.each(b.types, function(a, b) {
                e.push({
                    type: i8ln(b.type),
                    color: b.color
                })
            }), b.types = e, idToPokemon[a] = b
        }), $selectExclude.select2({
            placeholder: i8ln("Select Pokémon"),
            data: d,
            templateResult: a
        }), $selectPokemonNotify.select2({
            placeholder: i8ln("Select Pokémon"),
            data: d,
            templateResult: a
        }), $selectRarityNotify.select2({
            placeholder: i8ln("Select Rarity"),
            data: [i8ln("Common"), i8ln("Uncommon"), i8ln("Rare"), i8ln("Very Rare"), i8ln("Ultra Rare")],
            templateResult: a
        }), $selectExclude.on("change", function(a) {
            excludedPokemon = $selectExclude.val().map(Number), clearStaleMarkers(), Store.set("remember_select_exclude", excludedPokemon)
        }), $selectPokemonNotify.on("change", function(a) {
            notifiedPokemon = $selectPokemonNotify.val().map(Number), Store.set("remember_select_notify", notifiedPokemon)
        }), $selectRarityNotify.on("change", function(a) {
            notifiedRarity = $selectRarityNotify.val().map(String), Store.set("remember_select_rarity_notify", notifiedRarity)
        }), $selectExclude.val(Store.get("remember_select_exclude")).trigger("change"), $selectPokemonNotify.val(Store.get("remember_select_notify")).trigger("change"), $selectRarityNotify.val(Store.get("remember_select_rarity_notify")).trigger("change")
    }), window.setInterval(updateLabelDiffTime, 1e3), window.setInterval(updateMap, 5e3), window.setInterval(function() {
        navigator.geolocation && Store.get("geoLocate") && navigator.geolocation.getCurrentPosition(function(a) {
            var b = location.protocol + "//" + location.hostname + (location.port ? ":" + location.port : "") + window.location.pathname + "/",
                c = a.coords.latitude,
                d = a.coords.longitude;
            getPointDistance(marker.getPosition(), new google.maps.LatLng(c, d)) > 40 && $.post(baseURL + "next_loc?lat=" + c + "&lon=" + d).done(function() {
                var a = new google.maps.LatLng(c, d);
                map.panTo(a), marker.setPosition(a)
            })
        })
    }, 1e3), $("#gyms-switch").change(b(mapData, ["gyms"], "showGyms")), $("#pokemon-switch").change(b(mapData, ["pokemons"], "showPokemon")), $("#scanned-switch").change(b(mapData, ["scanned"], "showScanned")), $("#spawnpoints-switch").change(b(mapData, ["spawnpoints"], "showSpawnpoints")), $("#pokestops-switch").change(function() {
        var a = {
                duration: 500
            },
            c = $("#lured-pokestops-only-wrapper");
        return this.checked ? c.show(a) : c.hide(a), b(mapData, ["pokestops"], "showPokestops").bind(this)()
    }), $("#sound-switch").change(function() {
        Store.set("playSound", this.checked)
    }), $("#geoloc-switch").change(function() {
        $("#next-location").prop("disabled", this.checked), $("#next-location").css("background-color", this.checked ? "#e0e0e0" : "#ffffff"), navigator.geolocation ? Store.set("geoLocate", this.checked) : this.checked = !1
    }), $("#lock-marker-switch").change(function() {
        Store.set("lockMarker", this.checked), marker.setDraggable(!this.checked)
    }), $("#search-switch").change(function() {
        searchControl(this.checked ? "on" : "off")
    }), $("#start-at-user-location-switch").change(function() {
        Store.set("startAtUserLocation", this.checked)
    }), $("#nav-accordion").accordion({
        active: 0,
        collapsible: !0,
        heightStyle: "content"
    })
});
//# sourceMappingURL=map.min.js.map