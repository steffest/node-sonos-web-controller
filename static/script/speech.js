var USE_SPEECH = false;

function showInfo(info){
    speechboxinfo.innerHTML = info;
}

function upgrade(){
    showInfo("Speech recognision not available");
}

var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
    return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

var first_char = /\S/;
function capitalize(s) {
    return s.replace(first_char, function(m) { return m.toUpperCase(); });
}


if (!('webkitSpeechRecognition' in window)) {
    $("#speechbox").html("Speech recognision not available")
} else {
    var final_transcript = '';
    var recognizing = false;
    var ignore_onend;
    var start_timestamp;

    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function() {
        recognizing = true;
        showInfo('info_speak_now');
    };

    recognition.onerror = function(event) {
        if (event.error == 'no-speech') {
            showInfo('info_no_speech');
            ignore_onend = true;
        }
        if (event.error == 'audio-capture') {

            showInfo('info_no_microphone');
            ignore_onend = true;
        }
        if (event.error == 'not-allowed') {
            if (event.timeStamp - start_timestamp < 100) {
                showInfo('info_blocked');
            } else {
                showInfo('info_denied');
            }
            ignore_onend = true;
        }
    };

    recognition.onend = function() {
        recognizing = false;
        if (ignore_onend) {
            return;
        }

        if (!final_transcript) {
            showInfo('info_start');
            return;
        }
        showInfo('');
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
            var range = document.createRange();
            range.selectNode(document.getElementById('final_span'));
            window.getSelection().addRange(range);
        }

    };

    recognition.onresult = function(event) {
        var interim_transcript = '';
        if (typeof(event.results) == 'undefined') {
            recognition.onend = null;
            recognition.stop();
            upgrade();
            return;
        }
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {

                var command = event.results[i][0].transcript.trim();

                console.error(command);

                // some nonense crap
                // TODO: clean up or remove
                if (command == "stop muziek") Sonos.stop();
                if (command == "popmuziek") Sonos.stop();
                if (command == "speel muziek") Sonos.play();
                if (command == "start muziek") Sonos.play();
                if (command == "luider") Sonos.setVolume(Sonos.getVolume() + 5);
                if (command == "luier") Sonos.setVolume(Sonos.getVolume() + 5);
                if (command == "stiller") Sonos.setVolume(Sonos.getVolume() - 10);

                final_transcript += event.results[i][0].transcript;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }
        final_transcript = capitalize(final_transcript);
        final_span.innerHTML = linebreak(final_transcript);
        interim_span.innerHTML = linebreak(interim_transcript);
    };

    if (USE_SPEECH){
        setTimeout(function(){

            if (recognizing) {
                recognition.stop();
            }
            final_transcript = '';

            var language = {
                en: 'en-US',
                nl: 'nl-NL',
                vl: 'nl-BE',
                se: 'sv-SE'
            };
            recognition.lang = language.nl;

            recognition.start();
            ignore_onend = false;
            final_span.innerHTML = '';
            interim_span.innerHTML = '';

            showInfo('info_allow');

            start_timestamp = new Date().getTime();
        },2000)
    }

}