// 지도를 표시할 div 요소를 참조합니다
var mapContainer = document.getElementById("map");
// 지도의 초기 위치 및 확대 레벨을 설정합니다
var mapOptions = {
  center: new kakao.maps.LatLng(33.450701, 126.570667),
  level: 3,
};
// 지도를 생성합니다
var map = new kakao.maps.Map(mapContainer, mapOptions);
// 사용자 위치, 마커, 인포 윈도우 등의 초기값을 설정합니다
var linePath = [];
var currentLocation;
var currentMarker;
var currentInfoWindow;
var otherUserMarker;
var otherUserInfowindow;
var otherUserLat = 33.455701;
var otherUserLon = 126.575667;
var otherUserPosition = new kakao.maps.LatLng(otherUserLat, otherUserLon);
var unique_value = "6731a3269da64168ad3f16f340ebf06f"; // Replace this with your unique value

// 서버에 POST 요청을 보냅니다
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
  .then((response) => response.json()) // 응답을 JSON 형태로 파싱합니다
  .then((data) => console.log(data)) // 파싱된 데이터를 콘솔에 출력합니다
  .catch((error) => console.error("Error:", error)); // 에러가 발생하면 콘솔에 에러를 출력합니다

// 웹소켓 연결을 만듭니다
var socket = new WebSocket("ws://172.30.1.94:8000/navi/" + unique_value + "/");

socket.onopen = function (event) {
  console.log("Connected to WebSocket server."); // 웹소켓 서버에 연결되었음을 출력합니다
};

socket.onmessage = function (event) {
  // 웹소켓 서버로부터 받은 데이터를 파싱하고, 다른 사용자의 위치를 업데이트합니다
  var data = JSON.parse(event.data);
  console.log("Received data from WebSocket server: ", data);

  var userLat = parseFloat(data.coordinate_x);
  var userLon = parseFloat(data.coordinate_y);

  if (!isNaN(userLat) && !isNaN(userLon)) {
    otherUserPosition = new kakao.maps.LatLng(userLat, userLon);
    updateMap(); // 사용자의 위치가 변경되었으므로, 지도를 업데이트합니다
  }
};

socket.onerror = function (error) {
  console.log("WebSocket Error: " + error); // 웹소켓 오류가 발생했을 때 오류를 출력합니다
};

socket.onclose = function (event) {
  console.log("WebSocket connection closed."); // 웹소켓 연결이 종료되었음을 출력합니다
};

// 웹소켓을 통해 현재 위치를 전송합니다
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

// 두 위치 사이의 방향을 구합니다
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

// 현재 위치를 설정합니다
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

// 기존 마커와 인포윈도우를 표시하는 함수
function displayMarker(marker, infowindow, locPosition, message) {
  // 기존 마커 제거
  if (marker) {
    marker.setMap(null);
  }

  var newMarker = new kakao.maps.Marker({
    map: map,
    position: locPosition,
  });

  // 기존 인포윈도우 제거
  if (infowindow) {
    infowindow.close();
  }
  var newInfowindow = new kakao.maps.InfoWindow({
    content: message,
    removable: true,
  });
  newInfowindow.open(map, newMarker);

  return { newMarker, newInfowindow };
}

// 사용자 정의 마커와 인포윈도우를 표시하는 함수
function displayCustomMarker(marker, infowindow, locPosition, message) {
  // 기존 마커 제거
  if (marker) {
    marker.setMap(null);
  }

  var markerImageSrc =
      "http://i1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
    markerImageSize = new kakao.maps.Size(25, 40),
    markerImageOption = { offset: new kakao.maps.Point(25, 40) };

  var markerImage = new kakao.maps.MarkerImage(
    markerImageSrc,
    markerImageSize,
    markerImageOption
  );

  var newMarker = new kakao.maps.Marker({
    map: map,
    position: locPosition,
    image: markerImage,
  });

  // 기존 인포윈도우 제거
  if (infowindow) {
    infowindow.close();
  }
  var newInfowindow = new kakao.maps.InfoWindow({
    content: message,
    removable: true,
  });
  newInfowindow.open(map, newMarker);

  return { newMarker, newInfowindow };
}

setInterval(sendCurrentLocation, 1000); // 매 초마다 현재 위치를 전송합니다

// 두 위치 사이의 거리를 구합니다
function getDistance(position1, position2) {
  function toRad(degree) {
    return (degree * Math.PI) / 180;
  }
  var lat1 = position1.getLat(),
    lon1 = position1.getLng();
  var lat2 = position2.getLat(),
    lon2 = position2.getLng();
  var R = 6371; // 지구의 반지름을 킬로미터 단위로 표현한 값입니다
  var dLat = toRad(lat2 - lat1);
  var dLon = toRad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var distance = R * c; // 거리를 계산합니다
  return distance;
}

// 두 위치를 연결하는 선을 그립니다
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

// 지도의 상태를 업데이트합니다
function updateMap() {
  // 현재 위치, 방향, 거리 정보 업데이트
  var distance = getDistance(currentLocation, otherUserPosition).toFixed(2);
  var direction = getDirection(currentLocation, otherUserPosition);
  var currentLocationMessage = `<div style="padding:5px;width:150px;">현재 위치 <br>다른 사용자와의 거리: ${distance} km <br>다른 사용자의 방향: ${direction} </div>`;
  var result = displayMarker(
    currentMarker,
    currentInfoWindow,
    currentLocation,
    currentLocationMessage
  );
  currentMarker = result.newMarker;
  currentInfoWindow = result.newInfowindow;

  var otherUserMessage = `<div style="padding:5px;width:150px;">일행1</div>`;
  result = displayCustomMarker(
    otherUserMarker,
    otherUserInfowindow,
    otherUserPosition,
    otherUserMessage
  );
  otherUserMarker = result.newMarker;
  otherUserInfowindow = result.newInfowindow;

  // 선을 다시 그립니다
  linePath = [currentLocation, otherUserPosition];
  drawLine();

  // 지도의 중심을 현재 위치로 설정합니다
  map.setCenter(currentLocation);
}

// 현재 위치를 설정하고, 마커와 인포윈도우를 표시한 후, 매 초마다 지도를 업데이트합니다
setCurrentLocation().then(function (locPosition) {
  var currentLocationMessage =
    '<div style="padding:5px;width:150px;">현재 위치</div>';
  var result = displayMarker(
    currentMarker,
    currentInfoWindow,
    locPosition,
    currentLocationMessage
  );
  currentMarker = result.newMarker;
  currentInfoWindow = result.newInfowindow;

  var otherUserMessage = `<div style="padding:5px;width:150px;">일행1</div>`;
  result = displayMarker(
    otherUserMarker,
    otherUserInfowindow,
    otherUserPosition,
    otherUserMessage
  );
  otherUserMarker = result.newMarker;
  otherUserInfowindow = result.newInfowindow;

  setInterval(updateMap, 1000); // 매 초마다 지도를 업데이트합니다
});
