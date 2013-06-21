jQuery.fn.extend({
	
	volumeSlider: function (Sonos) {
		var state = {
			originalX: 0,
			maxX: 0,
			currentX: 0,
			slider: this.find('img').get(0),
			volume: 0
		};

        init();

        function init(){
            var sliderWidth = state.slider.parentNode.clientWidth;
            state.maxX = sliderWidth - 21;
        }

		function onDrag(e) {
			var deltaX = e.clientX - state.originalX;
			var nextX = state.currentX + deltaX;
			
			if ( nextX > state.maxX ) nextX = state.maxX;
			else if ( nextX < 1) nextX = 1;

			state.slider.style.marginLeft = nextX + 'px';

			// calculate percentage
			var volume = Math.floor(nextX / state.maxX * 100);
			if (volume != state.volume) {
                $(Sonos).trigger("volume.changed",volume);
			}
			state.volume = volume;
		}

		$('img', this).on('mousedown', function (e) {
			//state.slider = this;
			state.originalX = e.clientX;
			state.currentX = this.offsetLeft;
			$(document).on('mousemove', onDrag);
			e.preventDefault();
		});
		
		$(document).on('mouseup', function () {
			$(document).off('mousemove', onDrag);
		});

        $(document).on('UI.volume.changed',function(event,data){
            var x = Math.floor((data * state.maxX) / 100);
            state.slider.style.marginLeft = x + 'px';
        });
	},

	reRenderZones: function (zones) {
		console.log(zones);
		var oldWrapper = document.getElementById('zone-wrapper');
		var newWrapper = oldWrapper.cloneNode(false);
		zones.forEach(function (zone) {
			var ul = document.createElement('ul');
			ul.uuid = zone.uuid;
			ul.className = 'zone';

			var groupButton = document.createElement('button');
			groupButton.textContent = "Group";
			ul.appendChild(groupButton);

			zone.members.forEach(function (player) {
				var li = document.createElement('li');
				var span = document.createElement('span');
				span.textContent = player.roomName;
				li.appendChild(span);
				ul.appendChild(li);
			});

			newWrapper.appendChild(ul);	
		});
		oldWrapper.parentNode.replaceChild(newWrapper, oldWrapper);
	}


});