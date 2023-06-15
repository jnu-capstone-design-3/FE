import React from "react";
import styles from "./SignUp.module.css";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  setFullName,
  setPassword,
  setUserEmail,
} from "../stores/features/user";

function SignUp() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { fullName, email, password } = useSelector((state) => state.user);
  const onSubmitEvent = (e) => {
    e.preventDefault();
    alert(`회원가입이 완료되었습니다`);
    navigate("/login");
  };
  const onChangeFullName = (e) => {
    dispatch(setFullName(e.target.value));
  };
  const onChangeEmail = (e) => {
    dispatch(setUserEmail(e.target.value));
  };
  const onChangePassword = (e) => {
    dispatch(setPassword(e.target.value));
  };
  return (
    <div className={styles.signup_wrap}>
      <form className={styles.signup_form} onSubmit={onSubmitEvent}>
        <h1 className={styles.signup_h1}>회원가입</h1>
        <label className={styles.signup_label} htmlFor="name">
          이름:
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={fullName}
          onChange={onChangeFullName}
        />
        <label className={styles.signup_label} htmlFor="email">
          이메일:
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={email}
          onChange={onChangeEmail}
        />
        <label className={styles.signup_label} htmlFor="password1">
          비밀번호:
        </label>
        <input
          type="password"
          id="password1"
          name="password1"
          value={password}
          onChange={onChangePassword}
          required
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <input type="submit" value="회원가입" />
          <input
            type="button"
            onClick={() => navigate("/login")}
            value="뒤로가기"
          />
        </div>
      </form>
    </div>
  );
}

export default SignUp;
