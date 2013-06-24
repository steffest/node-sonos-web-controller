var currentState = {
    selectedZone: null,
    masterVolume: 0
};

var PLAYERSTATE = {
    PLAYING:        {code: "PLAYING", css:"playing"},
    TRANSITIONING:  {code: "TRANSITIONING" , css:"transitioning"},
    STOPPED:        {code: "STOPPED", css: "stopped"},
    PAUSED:         {code: "PAUSED", css: "paused"}
};

var getEnumByCode = function(obj, code) {
    var result = undefined;
    $.each(obj, function(i, e) {
        if (e.code == code) {
            result = e;
            return false;
        }
    });
    return result;
};


$(document).on('UI.player.state.changed',function(event,_playerState){
    console.log("setting playerstate to " + _playerState);

    var playPause = $('#play-pause').get(0);
    var playerState = getEnumByCode(PLAYERSTATE,_playerState);
    if (playerState){
        playPause.className = playerState.css;
    }
});

var setUIState = function(uuid,state){
    // sets the state of the Player control UI when a change is triggered
    if (state){
        if (state.volume) $(document).trigger('UI.volume.changed',state.volume);
        if (state.currentTrack) setCurrentTrack(state.currentTrack);
        if (state.currentState) $(document).trigger('UI.player.state.changed',state.currentState);
    }
};

var setCurrentTrack = function(currentTrack){
    var trackHTML = "";

    trackHTML += buildTrackItem(currentTrack.artist, "Artist");
    trackHTML += buildTrackItem(currentTrack.title, "Title");
    trackHTML += buildTrackItem(currentTrack.album, "Album");
    trackHTML += buildTrackItem(currentTrack.duration, "Duration");

    $("#now-playing-container").html(trackHTML);
};

var buildTrackItem = function(trackElement,label){
    var result = "";
    if (trackElement && trackElement != ""){
        result = "<div><span>" + label + ":</span>" + trackElement + "</div>";
    }
    return result;
};

socket.on('topology-change', function (data) {
    $('#zone-container').reRenderZones(data);
});

socket.on('transport-change', function (zone) {
    if (zone.uuid == currentState.selectedZone && zone.state){
        console.log("socket transport-change ", zone.uuid, zone.state);
        setUIState(zone.uuid,zone.state);
    }
});

socket.on('volume', function (zone) {
    if (zone.uuid == currentState.selectedZone && zone.state.volume){
        console.log("socket volume ", zone.uuid, zone.state);
        $(document).trigger('UI.volume.changed',zone.state.volume);
    }
});

socket.on('mute', function (zone) {
    if (zone.uuid == currentState.selectedZone){
        console.log("socket mute ", zone.uuid, zone.state);
        zone.state.forEach(function (muteState) {
            if (muteState.channel == "Master"){
                $('#master-mute').toggleClass("muted",muteState.isMute);
            }
        });
    }
});

$('#play-pause').on('click', function () {
    var action;

    if (this.className == "playing") {
        this.className = PLAYERSTATE.PAUSED.css;
        action = 'pause';
    } else {
        this.className = PLAYERSTATE.PLAYING.css;
        action = 'play';
    }

    socket.emit('transport-state', { uuid: currentState.selectedZone, state: action });
});

$('#master-mute').on('click',function(){
    $(this).toggleClass("muted");
    var isMute = $(this).hasClass("muted") ? 1 : 0;
    var state = {
        Master: isMute,
        forGroup: true
    };

    socket.emit('mute', { uuid: currentState.selectedZone, state: state});
});


$('#zone-container').on('click', 'ul', function () {
    currentState.selectedZone = this.uuid;
    var zone = $(this);
    zone.addClass('selected');
    zone.siblings().removeClass('selected');
    console.log("active zone",this.uuid);
});

$('#master-volume').volumeSlider(Sonos);