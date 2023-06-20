import React, { useState } from "react";
import styles from "./Login.module.css";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function Main() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { email: realEmail, password: realPassword } = useSelector(
    (state) => state.user
  );
  const navigate = useNavigate();
  const onSubmitEvent = (e) => {
    e.preventDefault();
    if (email === realEmail && password === realPassword) navigate("/main");
    else alert("정보를 다시 입력해주세요");
  };
  const onChangeEmail = (e) => {
    setEmail(e.target.value);
  };
  const onChangePassword = (e) => {
    setPassword(e.target.value);
  };
  return (
    <div className={styles.login_container}>
      <form className={styles.main_form} onSubmit={onSubmitEvent}>
        <h1 className={styles.main_h1}>Login</h1>
        <label className={styles.main_label} htmlFor="username">
          이메일
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={email}
          onChange={onChangeEmail}
          required
        />
        <label className={styles.main_label} htmlFor="password">
          비밀번호
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={onChangePassword}
          required
        />
        <button type="submit" className={styles.kakao_login}>카카오톡 로그인</button>
        <button type="submit" className={styles.login}>로그인</button>
        <button type="button" onClick={() => navigate("/signup")} className={styles.register}>
          회원가입
        </button>
      </form>
    </div>
  );
}

export default Main;
