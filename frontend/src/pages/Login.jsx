import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../style/login.css";

import designerImage from "../resources/logo.png";
import image1 from "../resources/image1.jpg";
import image2 from "../resources/image2.png";
import image3 from "../resources/image3.jpeg";
import { useSignUp } from "../context/SignUpContext";

const Login = () => {
  const { isSignUp, setIsSignUp } = useSignUp();
  const [loginValues, setLoginValues] = useState({ email: "", password: "" });
  const [registerValues, setRegisterValues] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    nickName: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const inputFields = document.querySelectorAll(".input-field");
    inputFields.forEach((input) => {
      input.addEventListener("focus", () => {
        input.classList.add("active");
      });
      input.addEventListener("blur", () => {
        if (input.value !== "") return;
        input.classList.remove("active");
      });
    });
  }, []);

  const handleLoginChange = (e) => {
    setLoginValues({ ...loginValues, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterValues({ ...registerValues, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    const loginData = {
      email: loginValues.email.toLowerCase(),
      password: loginValues.password,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        loginData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      let user = response.data;
      localStorage.setItem("token", user.token);
      if (user.adminToken && user.adminToken.trim() !== "") { 
        localStorage.setItem("admintoken", user.adminToken);
      }
      localStorage.setItem("nickName", user.nickName);
      localStorage.setItem("userConfig", JSON.stringify(user.userConfig));

      if (user.isAdmin) {
        navigate("/admin");
      } else if (user.isUser) {
        navigate("/");
      } else {
        alert("Login failed. Please check your credentials and try again.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please check your credentials and try again.");
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (registerValues.password !== registerValues.passwordConfirm) {
      alert("Password does not match");
      return;
    }

    const registerData = {
      email: registerValues.email.toLowerCase(),
      password: registerValues.password,
      nickName: registerValues.nickName,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`,
        registerData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.message) {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(error.response.data.message);
      }
    }
  };

  const moveSlider = (index) => {
    const currentImage = document.querySelector(`.img-${index}`);
    const images = document.querySelectorAll(".image");
    images.forEach((img) => img.classList.remove("show"));
    currentImage.classList.add("show");

    const textSlider = document.querySelector(".text-group");
    textSlider.style.transform = `translateY(${-(index - 1) * 2.2}rem)`;

    const bullets = document.querySelectorAll(".bullets span");
    bullets.forEach((bull) => bull.classList.remove("active"));
    bullets[index - 1].classList.add("active");
  };

  return (
    <div className="loginContainer">
      <main className={isSignUp ? "sign-up-mode" : ""}>
        <div className="box">
          <div className="inner-box">
            <div className="forms-wrap">
              <form onSubmit={handleLoginSubmit} className="sign-in-form">
                <div className="logo">
                  <img src={designerImage} alt="easyclass" />
                  <h4 style={{ color: "#0f7377" }}>
                    VTC<span style={{ color: "#333" }}> Forum</span>
                  </h4>
                </div>
                <div className="heading">
                  <h2>Welcome Back</h2>
                  <h6>Not registered yet?</h6>
                  <div className="toggle" onClick={() => setIsSignUp(true)}>
                    Sign up
                  </div>
                </div>
                <div className="actual-form">
                  <div className="input-wrap">
                    <input
                      type="email"
                      name="email"
                      className="input-field"
                      value={loginValues.email}
                      onChange={handleLoginChange}
                      required
                    />
                    <label>Email</label>
                  </div>
                  <div className="input-wrap">
                    <input
                      type="password"
                      name="password"
                      className="input-field"
                      value={loginValues.password}
                      onChange={handleLoginChange}
                      required
                    />
                    <label>Password</label>
                  </div>
                  <input type="submit" value="Sign In" className="sign-btn" />
                  <p className="text">
                    Forgotten your password or your login details?
                    <div>Get help</div> signing in
                  </p>
                </div>
              </form>

              <form onSubmit={handleRegisterSubmit} className="sign-up-form">
                <div className="logo">
                  <img src={designerImage} alt="easyclass" />
                  <h3 style={{ color: "#0f7377" }}>
                    VTC<span style={{ color: "#333" }}> Forum</span>
                  </h3>
                </div>
                <div className="heading">
                  <h2>Get Started</h2>
                  <h6>Already have an account?</h6>
                  <div className="toggle" onClick={() => setIsSignUp(false)}>
                    Sign in
                  </div>
                </div>
                <div className="actual-form">
                  <div className="input-wrap">
                    <input
                      type="email"
                      name="email"
                      className="input-field"
                      value={registerValues.email}
                      onChange={handleRegisterChange}
                      required
                    />
                    <label>Email</label>
                  </div>
                  <div className="input-wrap">
                    <input
                      type="password"
                      name="password"
                      className="input-field"
                      value={registerValues.password}
                      onChange={handleRegisterChange}
                      required
                    />
                    <label>Password</label>
                  </div>
                  <div className="input-wrap">
                    <input
                      type="password"
                      name="passwordConfirm"
                      className="input-field"
                      value={registerValues.passwordConfirm}
                      onChange={handleRegisterChange}
                      required
                    />
                    <label>Confirm Password</label>
                  </div>
                  <div className="input-wrap">
                    <input
                      type="text"
                      name="nickName"
                      className="input-field"
                      value={registerValues.nickName}
                      onChange={handleRegisterChange}
                      required
                    />
                    <label>Nickname</label>
                  </div>
                  <input type="submit" value="Sign Up" className="sign-btn" />
                  <p className="text">
                    By signing up, I agree to the <div>Terms of Services</div>{" "}
                    and <div>Privacy Policy</div>
                  </p>
                </div>
              </form>
            </div>
            <div className="carousel">
              <div className="images-wrapper">
                <img src={image1} className="image img-1 show" alt="" />
                <img src={image2} className="image img-2" alt="" />
                <img src={image3} className="image img-3" alt="" />
              </div>
              <div className="text-slider">
                <div className="text-wrap">
                  <div className="text-group">
                    <h2>Contant with people</h2>
                    <h2>Finding your interest</h2>
                    <h2>Look for club</h2>
                  </div>
                </div>
                <div className="bullets">
                  <span
                    className="active"
                    data-value="1"
                    onClick={() => moveSlider(1)}
                  ></span>
                  <span data-value="2" onClick={() => moveSlider(2)}></span>
                  <span data-value="3" onClick={() => moveSlider(3)}></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
