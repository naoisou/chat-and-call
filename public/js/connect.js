navigator.mediaDevices = navigator.mediaDevices || ((navigator.mozGetUserMedia || navigator.webkitGetUserMedia) ? {
   getUserMedia: function(c) {
     return new Promise(function(y, n) {
       (navigator.mozGetUserMedia ||
        navigator.webkitGetUserMedia).call(navigator, c, y, n);
     });
   }
} : null);

var SKYWAY_API_KEY = '14185266-8190-4350-8dda-784078bb5ea2';
var peer =null;
var selfId = null;
var localStream = null;
const constraints = {audio: true,
                     video: true
                    };
let mediaStreams = [];

const videoToggle = (ev) => {
  if (localStream) {
    localStream.getVideoTracks()[0].enabled = ev.target.checked;
  }
}

const mikeToggle = (ev) => {
  if (localStream) {
    localStream.getAudioTracks()[0].enabled = ev.target.checked;
  }
}

function changeCamera(cameraId, isIOS){
  // videoを切る
  var video = document.getElementById('my-video');
  video.srcObject = null;
  if (localStream) {
      localStream.getTracks().forEach(function(track) {
          track.stop();
      });
    }
  var constraints = isIOS? { video: { facingMode: cameraId } } : {
              video: {deviceId: cameraId}
          };
  // なぜか1回しか切り替えられない。。。
  setStream(constraints);
}

function setStream(constraints){
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream){
            localStream = stream;
            mediaStreams.forEach((ms) => {
              ms.replaceStream(localStream);
            })

            var video = document.getElementById('my-video');
            video.srcObject = stream;
            video.autoplay = video.playsInline = true;

        }).catch(function(err){
            console.log(err);
        });
        
}



function initializePeer(callback) {
  peer = new Peer({ key: SKYWAY_API_KEY });
  peer.on('open', function(id) {
    selfId = id;
    callback();
  });
  peer.on('call', function(mediaConnection) {
    mediaConnection.answer(localStream);
    settingMediaConnection(mediaConnection);
    //localStream.getVideoTracks()[0].enabled = false;
  });
  peer.on('close', function(){
    peer.destroy();
  });
  peer.on('error', function(err){
    console.error(err);
  });
}

function initializeMedia(callback) {
  navigator.mediaDevices.getUserMedia(constraints)
    .then(function(stream) {
      stream.getVideoTracks()[0].enabled = false;
      localStream = stream;
      var video = document.getElementById('my-video');
      video.muted = true;
      video.srcObject = stream;
      video.autoplay = video.playsInline = true;
      //video.play();
      callback();
    },
    function(err) {
      if(err.message == 'Permission denied'){
        alert("このページではカメラとマイクがブロックされている可能性があります。設定を確認し、再接続ボタンを押下してください")
        
      }
      console.error(err);
    }
  );

}

function callRemoteAll() {
  peer.listAllPeers(function(remoteIds) {
    for (var i = 0; i < remoteIds.length; i++ ) {
      var remoteId = remoteIds[i];
      var mediaConnection = peer.call(remoteId, localStream);
      mediaStreams.push(mediaConnection);
      settingMediaConnection(mediaConnection);
    }
    alert("通話が開始されました。")
  });
}

function settingMediaConnection(mediaConnection) {
  var remoteId = mediaConnection.peer;
  var remoteStream = null;
  var video = null;
  mediaConnection.on('stream', function(stream) {
    debugger;
    video = document.createElement('video');
    video.id = remoteId;
    video.muted = true;
    video.autoplay = video.playsInline = true;
    video.srcObject = stream;
    video.play();

    audio = document.createElement('audio');
    audio.id = remoteId;
    audio.autoplay = audio.playsInline = true;
    audio.srcObject = stream;

    var parent = document.getElementById('connection-users');
    parent.appendChild(video);
    parent.appendChild(audio);
  });
  mediaConnection.on('close', function(){
    video.srcObject = null;
    video.parentNode.removeChild(video);
  });
  mediaConnection.on('error', function(err){
    console.error(err);
  });
}

function initialize() {
  initializeMedia(function() {
    initializePeer(function() {
      callRemoteAll();
    });
  });
}


function getVideoSources(callback) {
  if (!navigator.mediaDevices) {
    console.log("MediaStreamTrack");
    MediaStreamTrack.getSources(function(cams) {
      cams.forEach(function(c, i, a) {
        if (c.kind != 'video') return;
        callback({
          name: c.facing,
          id: c.id
        });
      });
    });
  } else {
    navigator.mediaDevices.enumerateDevices().then(function(cams) {
      cams.forEach(function(c, i, a) {
        console.log("mediaDevices", c);
        if (c.kind != 'videoinput') return;
        callback({
          name: c.label,
          id: c.deviceId
        });
      });
    });
  }
}


// window.addEventListener('load', initialize);
