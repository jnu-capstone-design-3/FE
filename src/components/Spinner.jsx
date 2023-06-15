import React from "react";
import styles from "./Spinner.module.css";

function Spinner({ show }) {
  return (
    <div
      className={styles.spinner_wrap}
      style={{
        display: show ? "flex" : "none",
      }}
    >
      <div className={styles.spinner}></div>
    </div>
  );
}

export default Spinner;
