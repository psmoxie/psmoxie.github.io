// Cache references to DOM elements.
var ids = ['track', 'playBtn', 'pauseBtn', 'prevBtn', 'nextBtn', 'list', 'progress', 'timer', 'wave'];
ids.forEach(function(id) {
  window[id] = document.getElementById(id);
});

var playcheck = true;
var Player = function(playlist) {
  this.playlist = playlist;
  this.index = 0;
  this.sound = null; // Store the current sound object
  this.seeking = false; // Flag to track if seeking is in progress
  this.updateInterval = null; // Store the interval 

  // Display the title of the first track.
  track.innerHTML = '1. ' + playlist[0].title;

  // Setup the playlist display.
  playlist.forEach(function(song, index) {
    var div = document.createElement('div');
    div.className = 'list-song';
    div.innerHTML = (index + 1) + '. ' + song.title;
    div.onclick = function() {
      player.skipTo(index);
    };
    list.appendChild(div);
  });
};

Player.prototype = {
  play: function(index) {
    var self = this;

    index = typeof index === 'number' ? index : self.index;
    var data = self.playlist[index];

    // If we already loaded this track, use the current one.
    // Otherwise, setup and load a new Howl.
    if (data.howl) {
      self.sound = data.howl;
    } else {
      self.sound = data.howl = new Howl({
        src: ['./audio/' + data.file + '.mp3'],
        html5: true, 
        onplay: function() {
          // Display the duration.
          duration.innerHTML = self.formatTime(Math.round(self.sound.duration()));
          // Start updating the timer
          self.updateTimer();
        }
      });
    }

    // Begin playing the sound.
    if(playcheck){
	wave.start();
    	self.sound.play();
	playcheck = false;
}

    // Update the track display.
    track.innerHTML = (index + 1) + '. ' + data.title;

    // Keep track of the index we are currently playing.
    self.index = index;
  },

  /**
   * Pause the currently playing track.
   */
  pause: function() {
    wave.stop();
    playcheck = true;
    var self = this;

    // Pause the sound.
    self.sound.pause();

    // Stop updating the timer
    clearInterval(self.updateInterval);
  },

  skip: function(direction) {
    var self = this;
    self.pause(index);

    // Get the next track based on the direction of the track.
    var index = direction === 'prev' ? (self.index - 1 + self.playlist.length) % self.playlist.length : (self.index + 1) % self.playlist.length;

    // Skip to the next or previous track.
    self.skipTo(index);
  },

  skipTo: function(index) {
    var self = this;

    // Stop the current track.
    if (self.sound) {
      self.sound.stop();
    }

    // Play the new track.
	playcheck = false; 
	self.play(index);
     self.pause(index);
  },

  formatTime: function(secs) {
    var minutes = Math.floor(secs / 60) || 0;
    var seconds = (secs - minutes * 60) || 0;
    wave.setAmplitude(seconds);

    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  },
  
  updateTimer: function() {
    var self = this;

    // Update the timer every second
    self.updateInterval = setInterval(function() {
      // If not seeking, update the timer
      if (!self.seeking) {
        timer.innerHTML = self.formatTime(Math.round(self.sound.seek())) + "/";
        var progress1 = Math.round(self.sound.seek()) / Math.round(self.sound.duration()).toString() * 100  + "%";
        document.getElementById("progress").style.width = progress1;
      }
    }, 1000);
  }
};

// Setup our new audio player class and pass it the playlist.
var player = new Player([
  {
    title: 'New Magic Wand',
    file: 'newmagicwand',
    howl: null
  },
  {
    title: 'Feel Good Inc',
    file: 'feelgoodinc',
    howl: null
  },
  {
    title: 'Bad to The Bone',
    file: 'bad-to-the-bone',
    howl: null
  },
  { 
    title: 'Gymnopede',
    file: 'Erik_Satie_-_Gymnopedie_No.1',
    howl: null
  }
]);

// Bind our player controller
playBtn.addEventListener('click', function() {
  player.play();  
});

pauseBtn.addEventListener('click', function() {
  player.pause();
});

prevBtn.addEventListener('click', function() {
  player.skip('prev');
});

nextBtn.addEventListener('click', function() {
  player.skip('next');
});

var wave = new SiriWave({
  container: waveform,
  width: window.innerWidth,
  height: window.innerHeight * 0.3,
  cover: true,
  speed: 0.03,
  amplitude: 0.7,
  frequency: 2
});