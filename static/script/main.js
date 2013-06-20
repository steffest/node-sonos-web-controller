var Sonos = (function(){

    var volume = 100;
    var muted = false;

    function setVolume(value) {
        if (isNaN(value)) { return }
        volume = Math.max(0, Math.min( value, 100 ));
        muted = false;
        socket.emit('transport-state', { uuid: currentState.selectedZone, state: "setVolume", value: volume });
    }

    function toggleMute(value) {
        if (typeof value == "undefined") { value = ! muted; }
        muted = value;
        $(Sonos).trigger("volume.changed");
    }

    function play(){
        socket.emit('transport-state', { uuid: currentState.selectedZone, state: "play" });
    }

    function stop(){
        socket.emit('transport-state', { uuid: currentState.selectedZone, state: "pause" });
    }

    function getVolume(){
        return volume;
    }

    function isMuted() {
        return muted;
    }

    return {
        getVolume : getVolume,
        setVolume : setVolume,
        toggleMute : toggleMute,
        isMuted : isMuted,
        play : play,
        stop : stop
    };
}());

$(Sonos).on("volume.changed",function(e,volume){
    console.log("volume.changed",volume);
    Sonos.setVolume(volume);
});

$('#play-pause').on('click', function () {

    var action;
    // Find state of current player
    if (/play/.test(this.src)) {
        // Is play state, switch to pause
        this.src = this.src.replace('play', 'pause');
        action = 'pause';
    } else {
        // Is play state, switch to pause
        this.src = this.src.replace('pause', 'play');
        action = 'play';
    }

    socket.emit('transport-state', { uuid: currentState.selectedZone, state: action });
});

var currentState = {
    selectedZone: null,
    masterVolume: 0,
    setMasterVolume: function (volume) {

    }
};

socket.on('topology-change', function (data) {
    $('#zone-container').reRenderZones(data);
});

$('#zone-container').on('click', 'ul', function () {
    currentState.selectedZone = this.uuid;
    var zone = $(this);
    console.log(zone)
    zone.addClass('selected');
    zone.siblings().removeClass('selected');


    console.log(this.uuid);
});
$('#master-volume').volumeSlider(Sonos);