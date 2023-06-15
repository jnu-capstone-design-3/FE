import React, { useEffect } from "react";
import logo from "../assets/img/logo.svg";
import styles from "./OnBoard.module.css";
import { useNavigate } from "react-router-dom";

function OnBoard() {
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      navigate("/login");
    }, 2222);
  }, []);
  return (
    <div className={styles.onboard_wrap}>
      <img src={logo} className={styles.onboard_logo} alt={"메인로고"} />
    </div>
  );
}

export default OnBoard;
