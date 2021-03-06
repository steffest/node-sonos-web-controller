var Sonos = (function(){

    var volume = 100;
    var muted = false;

    function setVolume(value,silent) {
        if (isNaN(value)) { return }
        volume = Math.max(0, Math.min( value, 100 ));
        muted = false;
        socket.emit('transport-state', {
            uuid: currentState.selectedZone,
            state: "setVolume",
            value: volume ,
            forGroup: true
        });
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