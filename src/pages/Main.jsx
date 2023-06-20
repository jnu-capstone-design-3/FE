import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import styles from "./Main.module.css";
import userIcon from "../assets/img/profile.png";
import arrow from "../assets/img/arrow.png";
import arrow2 from "../assets/img/arrow2.png";
import marker from "../assets/img/spot.png";
import myMarker from "../assets/img/spot2.png";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Spinner from "../components/Spinner";

const samplePositionArr = [
  {
    name: "스타벅스 제주시청점",
    x: 33.50045492878241,
    y: 126.52954866063075,
  },
  { name: "제주문예회관", x: 33.50454022876408, y: 126.53521162318202 },
  { name: "엽기떡볶이 신제주점", x: 33.48694346493617, y: 126.49105562371763 },
  {
    name: "롯데시네마 제주아라점",
    x: 33.483821976922755,
    y: 126.53591139423118,
  },
];

function Main() {
  const [map, setMap] = useState(null);
  const [isToggle, setIsToggle] = useState(false);
  const [infowindow, setInfowindow] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [friendText, setFriendText] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);
  const [list, setList] = useState([]);
  const [coords, setCoords] = useState([33.450701, 126.570667]);
  const [sampleFriendArr, setSampleFriendArr] = useState([
    "고겨레",
    "김의진",
    "김다희",
    "테무진",
  ]);
  const [isMouseoverMarker, setIsMouseoverMarker] = useState(false);
  const [distance, setDistance] = useState(null);
  const [markerName, setMarkerName] = useState(null);
  const [walkText, setWalkText] = useState(null);
  const [bycicleText, setBycicleText] = useState(null);

  const mapRef = useRef(null);
  const navRef = useRef(null);
  const navBgRef = useRef(null);
  const addGroupDialogRef = useRef(null);

  const navigate = useNavigate();
  const { fullName: user } = useSelector((state) => state.user);

  useEffect(() => {
    if (user === "") {
      alert("로그인 후 이용해주세요");
      navigate("/login");
    }
    if (sampleFriendArr.includes(user)) {
      const arr = [...sampleFriendArr];
      arr.splice(arr.indexOf(user), 1);
      setSampleFriendArr(arr);
    }
    const { kakao } = window;
    const markerImage = new kakao.maps.MarkerImage(
      myMarker,
      new kakao.maps.Size(50, 50),
      { offset: new kakao.maps.Point(25, 45) }
    );
    setInfowindow(new kakao.maps.InfoWindow({ zIndex: 1 }));
    navigator.geolocation.getCurrentPosition(
      (res) => {
        const { latitude, longitude } = res.coords;
        setCoords([latitude, longitude]);
        const pos = {
          center: new kakao.maps.LatLng(latitude, longitude), // 지도의 중심좌표
          level: 4, // 지도의 확대 레벨
        };
        const data = new kakao.maps.Map(mapRef.current, pos);
        new kakao.maps.Marker({
          map: data,
          position: new kakao.maps.LatLng(latitude, longitude),
          image: markerImage,
        });
        setMap(data);
      },
      (err) => {
        console.error(err);
        alert("위치정보를 가져오지 못했습니다");
        const pos = {
          center: new kakao.maps.LatLng(coords[0], coords[1]),
          level: 3,
        };
        const data = new kakao.maps.Map(mapRef.current, pos);
        setMap(data);
      },
      {
        enableHighAccuracy: true,
      }
    );
  }, []);

  useEffect(() => {
    if (isToggle === true) {
      navRef.current.style.left = "0";
      navBgRef.current.style.display = "block";
    } else {
      navRef.current.style.left = "-300px";
      navBgRef.current.style.display = "none";
    }
  }, [isToggle]);

  const onChangeCheckBox = (e) => {
    if (e.currentTarget.checked) {
      setList([...list, e.currentTarget.dataset.name]);
    } else {
      const index = list.indexOf(e.currentTarget.dataset.name);
      const arr = [...list];
      arr.splice(index, 1);
      setList(arr);
    }
  };

  const onSearchPlaceEvent = (e) => {
    e.preventDefault();
    const { kakao } = window;
    const ps = new kakao.maps.services.Places();
    ps.keywordSearch(searchText, (data, status, pagination) => {
      if (status === kakao.maps.services.Status.OK) {
        const bounds = new kakao.maps.LatLngBounds();
        for (let i = 0; i < data.length; i++) {
          const marker = new kakao.maps.Marker({
            map: map,
            position: new kakao.maps.LatLng(data[i].y, data[i].x),
          });
          const polyline = new kakao.maps.Polyline({
            path: [
              marker.getPosition(),
              new kakao.maps.LatLng(coords[0], coords[1]),
            ],
            strokeWeight: 5, // 선의 두께 입니다
            strokeColor: "#cd5c4a", // 선의 색깔입니다
            strokeOpacity: 0.7, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
            strokeStyle: "solid", // 선의 스타일입니다
          });
          kakao.maps.event.addListener(marker, "mouseover", () => {
            // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
            infowindow.setContent(
              '<div style="padding: 10px 5px; font-size:12px; font-family: Arial, sans-serif;">' +
                data[i].place_name +
                "</div>"
            );
            infowindow.open(map, marker);
            polyline.setMap(map);
            const walkTime = (polyline.getLength() / 67) | 0; // 도보의 시속은 평균 4km/h 이고 도보의 분속은 67m/min입니다
            const bycicleTime = (polyline.getLength() / 227) | 0; // 자전거의 평균 시속은 16km/h 이고 이것을 기준으로 자전거의 분속은 267m/min입니다
            setWalkText(
              (v) =>
                `${walkTime >= 60 ? `${Math.floor(walkTime / 60)}시간` : ``} ${
                  walkTime % 60
                }분`
            );
            setBycicleText(
              (v) =>
                `${
                  bycicleTime >= 60 ? `${Math.floor(bycicleTime / 60)}시간` : ``
                } ${bycicleTime % 60}분`
            );
            setMarkerName(data[i].place_name);
            setIsMouseoverMarker(true);
            setDistance(polyline.getLength());
          });
          kakao.maps.event.addListener(marker, "mouseout", () => {
            infowindow.close();
            polyline.setMap(null);
            setWalkText(null);
            setIsMouseoverMarker(false);
            setBycicleText(null);
          });
          kakao.maps.event.addListener(marker, "click", () => {
            map.setLevel(2);
            map.panTo(marker.getPosition());
          });
          bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
        }
        // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
        map.setBounds(bounds);
      } else {
        alert("키워드를 올바르게 입력해주세요!");
        setSearchText("");
      }
    });
  };

  const onClickNavToggle = () => {
    setIsToggle((v) => !v);
  };
  const onChangeSearchText = (e) => {
    setSearchText(e.target.value);
  };
  const onChangeFriendText = (e) => {
    setFriendText(e.target.value);
  };
  const onClickAddGroup = () => {
    addGroupDialogRef.current.showModal();
  };
  const onClickAddGroupFinishButton = (e) => {
    e.preventDefault();
    let word = "";
    for (let i = 0; i < list.length; i++) {
      if (i === list.length - 1)
        word = word.concat(`${list[i]}님과 그룹이 되었습니다.`);
      else word = word.concat(`${list[i]}님, `);
    }
    alert(word);
    addGroupDialogRef.current.close();
    setIsToggle((v) => !v);
    setShowSpinner(true);
    const timer = setTimeout(() => {
      const { kakao } = window;
      map.setLevel(6);
      const markerImage = new kakao.maps.MarkerImage(
        marker,
        new kakao.maps.Size(50, 50),
        { offset: new kakao.maps.Point(25, 50) }
      );
      for (let i = 0; i < list.length; i++) {
        const point = new kakao.maps.Marker({
          map: map,
          position: new kakao.maps.LatLng(
            samplePositionArr[i].x,
            samplePositionArr[i].y
          ),
          image: markerImage,
        });
        const polyline = new kakao.maps.Polyline({
          path: [
            new kakao.maps.LatLng(
              samplePositionArr[i].x,
              samplePositionArr[i].y
            ),
            new kakao.maps.LatLng(coords[0], coords[1]),
          ], // 선을 구성하는 좌표배열 입니다
          strokeWeight: 5, // 선의 두께 입니다
          strokeColor: "#cd5c4a", // 선의 색깔입니다
          strokeOpacity: 0.7, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
          strokeStyle: "solid", // 선의 스타일입니다
        });
        kakao.maps.event.addListener(point, "mouseover", () => {
          infowindow.setContent(
            '<div style="padding:5px; font-size:12px; font-family: Arial, sans-serif; font-weight : bold;">' +
              list[i] +
              "</div>"
          );
          infowindow.open(map, point);
          setIsMouseoverMarker(true);
          setDistance(polyline.getLength());
          setMarkerName(samplePositionArr[i].name);
          polyline.setMap(map);
        });
        kakao.maps.event.addListener(point, "mouseout", () => {
          infowindow.close();
          setIsMouseoverMarker(false);
          polyline.setMap(null);
        });
      }
      setShowSpinner(false);
      clearTimeout(timer);
    }, 1500);
  };
  const onClickResetButton = () => {
    const { kakao } = window;
    map.panTo(new kakao.maps.LatLng(coords[0], coords[1]));
  };
  const test = () => {
    alert("개발중");
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <div ref={mapRef} style={{ flex: 1 }}></div>
      <div className={styles.searchBarWrap}>
        <form className={styles.searchBar} onSubmit={onSearchPlaceEvent}>
          <Icon
            className={styles.icon}
            style={{
              paddingRight: "5px",
            }}
            icon="ci:hamburger-lg"
            width={30}
            onClick={onClickNavToggle}
          />
          <input
            style={{ flex: 1, padding: "10px 0", border: "none" }}
            value={searchText}
            onChange={onChangeSearchText}
            required
            placeholder="목적지를 입력하세요"
          />
          <Icon
            icon="fluent:mic-28-regular"
            width={30}
            className={styles.icon}
            onClick={test}
          />
        </form>
        <div
          className={styles.distance_wrap}
          style={{
            display: isMouseoverMarker ? "flex" : "none",
          }}
        >
          <Icon icon="game-icons:path-distance" width={45} color="#ffffff" />
          <div>
            <h2
              style={{
                fontSize: "2rem",
              }}
            >
              약{Math.round(distance)}m
            </h2>
            <h4
              style={{
                fontSize: ".7rem",
              }}
            >
              {markerName}
            </h4>
          </div>
        </div>
      </div>
      <div className={styles.nav} ref={navRef}>
        <div>
          <Icon
            className={styles.icon}
            icon="ph:arrow-left-bold"
            color="#cd5c4a"
            width={25}
            onClick={onClickNavToggle}
          />
        </div>
        <img
          style={{
            alignSelf: "center",
          }}
          src={userIcon}
          width={45}
        />
        <h2 className={styles.nav_h2}>{user}</h2>
        <ul className={styles.nav_ul}>
          <li onClick={onClickAddGroup}>그룹 설정하기</li>
          <li onClick={test}>그룹 주행</li>
          <li onClick={test}>안전 주행</li>
          <li onClick={test}>일정 관리</li>
        </ul>
      </div>
      <div className={styles.nav_bg} ref={navBgRef}></div>
      <div
        className={styles.bottom_nav_wrap}
        style={{
          display: walkText ? "flex" : "none",
        }}
      >
        <div className={styles.bottom_nav}>
          <div>
            <h3>도보</h3>
            <img
              src={arrow}
              alt="image"
              style={{ width: "60px", height: "60px" }}
            />
            <p>약 {walkText}</p>
          </div>
          <div>
            <h3>자전거</h3>
            <img
              src={arrow2}
              alt="image"
              style={{ width: "60px", height: "60px" }}
            />
            <p>약 {bycicleText}</p>
          </div>
        </div>
      </div>
      <div
        className={styles.reset_button}
        title="내 위치"
        onClick={onClickResetButton}
      >
        <Icon icon="iconoir:position" width={50} />
      </div>
      <dialog className={styles.add_group_dialog_wrap} ref={addGroupDialogRef}>
        <form
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #cd5c4a",
              padding: "10px",
            }}
          >
            <Icon
              className={styles.icon}
              icon="ph:arrow-left-bold"
              color="#cd5c4a"
              width={25}
              onClick={() => addGroupDialogRef.current.close()}
            />
            <h1 style={{ color: "#cd5c4a", fontWeight: "bold" }}>그룹 생성</h1>
            <button
              style={{
                border: "none",
                backgroundColor: "inherit",
                color: "#cd5c4a",
                cursor: "pointer",
                opacity: list.length ? 1 : 0.5,
              }}
              disabled={!list.length}
              onClick={onClickAddGroupFinishButton}
            >
              확인
            </button>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "20px 10px",
            }}
          >
            <input
              style={{
                border: "1px solid #ec6a56",
                borderRadius: "5px",
                padding: "10px",
                // marginBottom: "6px",
              }}
              value={friendText}
              onChange={onChangeFriendText}
              placeholder="이름 검색"
            />
          </div>
          <ul
            style={{
              padding: "0 10px",
            }}
          >
            {sampleFriendArr.map((v, i) => (
              <li
                style={{
                  margin: "14px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  display: `${v.includes(friendText) ? "flex" : "none"}`,
                }}
                key={i}
              >
                <img src={userIcon} width={40} />
                <h2
                  style={{
                    fontWeight: "bold",
                    flex: 1,
                  }}
                >
                  {v}
                </h2>
                <label
                  className={styles.checkbox_label}
                  style={{
                    backgroundColor: list.includes(v) ? "#cd5c4a" : "white",
                    cursor: "pointer",
                  }}
                >
                  <input
                    data-name={v}
                    type={"checkbox"}
                    onChange={onChangeCheckBox}
                  />
                </label>
              </li>
            ))}
          </ul>
        </form>
      </dialog>
      <Spinner show={showSpinner} />
    </div>
  );
}

export default Main;
