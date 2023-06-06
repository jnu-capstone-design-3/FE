// 햄버거 메뉴 클릭시 메뉴바 보이기
const hamburgerMenu = document.querySelector(".hamburger-menu");
const menu = document.querySelector(".menu");
const close = document.querySelector(".close-menu");
const menuLinks = document.querySelectorAll(".menu-link");

hamburgerMenu.addEventListener("click", () => {
  hamburgerMenu.classList.toggle("active");
  menu.classList.toggle("active");
});

/*
close.addEventListener('click', () => {
  menu.classList.remove('active');
});
*/

menuLinks.forEach((menuLink) => {
  menuLinks.addEventListener("click", () => {
    menu.classList.remove("show");
    hamburgerMenu.classList.remove("active");
  });
});


//지도 생성

var mapContainer = document.getElementById("map");
var mapOptions = {
  center: new kakao.maps.LatLng(33.450701, 126.570667),
  level: 3,
};
var map = new kakao.maps.Map(mapContainer, mapOptions);
var linePath = [];
var currentLocation;
var currentMarker;
var otherUserLat = 33.455701;
var otherUserLon = 126.575667;
var otherUserPosition = new kakao.maps.LatLng(otherUserLat, otherUserLon);
var unique_value = "6731a3269da64168ad3f16f340ebf06f"; // Replace this with your unique value

// Generate data and send POST request
var data = {
  user_id: 3,
};
fetch("http://172.30.1.94:8000/generate/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
})
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error("Error:", error));

// Create a WebSocket connection
var socket = new WebSocket("ws://172.30.1.94:8000/navi/" + unique_value + "/");

socket.onopen = function (event) {
  console.log("Connected to WebSocket server.");
};

socket.onmessage = function (event) {
  var data = JSON.parse(event.data);
  console.log("Received data from WebSocket server: ", data);

  // 데이터에서 사용자의 위치를 가져옵니다
  var userLat = parseFloat(data.coordinate_x);
  var userLon = parseFloat(data.coordinate_y);

  // 유효한 좌표 값인지 확인합니다
  if (!isNaN(userLat) && !isNaN(userLon)) {
    // 사용자의 위치를 업데이트합니다
    otherUserPosition = new kakao.maps.LatLng(userLat, userLon);
    updateMap();
  }
};

socket.onerror = function (error) {
  console.log("WebSocket Error: " + error);
};

socket.onclose = function (event) {
  console.log("WebSocket connection closed.");
};

function sendCurrentLocation() {
  if (socket.readyState === WebSocket.OPEN) {
    var data = {
      user_id: 3,
      coordinate_x: currentLocation.getLat(),
      coordinate_y: currentLocation.getLng(),
    };
    socket.send(JSON.stringify(data));
  }
}

// 주어진 두 점 사이의 방향을 계산하는 함수입니다.
function getDirection(origin, dest) {
  var deltaY = dest.getLat() - origin.getLat();
  var deltaX = dest.getLng() - origin.getLng();
  var angleInDegrees = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;

  if (angleInDegrees >= -45 && angleInDegrees < 45) {
    return "동쪽";
  } else if (angleInDegrees >= 45 && angleInDegrees < 135) {
    return "북쪽";
  } else if (angleInDegrees >= -135 && angleInDegrees < -45) {
    return "남쪽";
  } else {
    return "서쪽";
  }
}

function setCurrentLocation() {
  return new Promise(function (resolve, reject) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        var lat = position.coords.latitude,
          lon = position.coords.longitude;
        var locPosition = new kakao.maps.LatLng(lat, lon);
        currentLocation = locPosition;
        resolve(locPosition);
      });
    } else {
      var locPosition = new kakao.maps.LatLng(33.450701, 126.570667);
      currentLocation = locPosition;
      resolve(locPosition);
    }
  });
}

function displayMarker(locPosition, message) {
  var marker = new kakao.maps.Marker({
    map: map,
    position: locPosition,
  });

  if (locPosition === currentLocation) {
    currentMarker = marker;
  }

  var iwContent = message,
    iwRemoveable = true;
  var infowindow = new kakao.maps.InfoWindow({
    content: iwContent,
    removable: iwRemoveable,
  });
  infowindow.open(map, marker);
  linePath.push(locPosition);
}

// 1초마다 사용자의 위치를 서버로 보냅니다.
setInterval(sendCurrentLocation, 1000);

function getDistance(position1, position2) {
  function toRad(degree) {
    return (degree * Math.PI) / 180;
  }
  var lat1 = position1.getLat(),
    lon1 = position1.getLng();
  var lat2 = position2.getLat(),
    lon2 = position2.getLng();
  var R = 6371;
  var dLat = toRad(lat2 - lat1);
  var dLon = toRad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var distance = R * c;
  return distance;
}

function drawLine() {
  var polyline = new kakao.maps.Polyline({
    path: linePath,
    strokeWeight: 5,
    strokeColor: "#FF0000",
    strokeOpacity: 0.7,
    strokeStyle: "solid",
  });
  polyline.setMap(map);
}

function updateMap() {
  // 현재 마커를 지웁니다
  currentMarker.setMap(null);

  // 새 위치에 마커를 추가합니다
  displayMarker(otherUserPosition, "새 위치");

  // 선을 다시 그립니다
  linePath = [currentLocation, otherUserPosition]; // 선의 경로를 업데이트합니다
  drawLine();
}

async function initMap() {
  await setCurrentLocation();
  var distance = getDistance(currentLocation, otherUserPosition).toFixed(2);
  var direction = getDirection(currentLocation, otherUserPosition);
  var currentLocationMessage = `<div style="padding:5px;width:150px;">현재 위치 <br>다른 사용자와의 거리: ${distance} km <br>다른 사용자의 방향: ${direction} </div>`;
  displayMarker(currentLocation, currentLocationMessage);
  var otherUserMessage = '<div style="padding:5px;">다른 사용자</div>';
  displayMarker(otherUserPosition, otherUserMessage);
  drawLine();
}

navigator.geolocation.watchPosition(function (position) {
  var lat = position.coords.latitude,
    lon = position.coords.longitude;
  currentLocation = new kakao.maps.LatLng(lat, lon);

  // 위치가 변경될 때마다 WebSocket으로 현재 위치를 보냅니다.
  sendCurrentLocation();
});

initMap();