// Import necessary libraries and styles
import React, { useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link from React Router
import "./Home.css";
import OutputDashboard from "./OutputDashboard";

const Home = () => {

  return (
    <div className="page">
      <div className="area">
        <ul className="circles">
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>

      {/* <div className="home-header"></div> */}
      <div className="text-overlay1">
        <header>
          <h1 className="gradient-text">Innov8or's Catalog Scoring</h1>
        </header>
        <link
          href="https://fonts.googleapis.com/css?family=Archivo+Black&display=swap"
          rel="stylesheet"
        />

        <h6>
          A cutting-edge virtual platform designed to revolutionize discussions,
          collaborative work, and team dynamics
        </h6>
        <div className="cards">
          <div className="card-container">
            {/* Card 1 */}
            <Link to="/score" className="card-link">
              <div className="card">
                <div className="blog-wrapper">
                  <div className="gradient-container" />

                  <h2>Get your catalog Scored </h2>
                  <p>
                    Engage in thoughtful discussions and exchange ideas with
                    your team in real-time.
                  </p>
                  <img src="svg1.png" alt="svg1" />
                </div>
              </div>
            </Link>

            {/* Card 2 */}
            <Link to="/documentation" className="card-link">
              <div className="card">
                <h2>API Documentation</h2>
                <p>Explore our API documentation</p>
                <img src="svg2.png" alt="svg1" />
              </div>
            </Link>

            {/* Card 3 */}
            <Link to="/AI" className="card-link">
              <div className="card">
                <h2>Subscribe to our API</h2>
                <p>
                  Unlock the full potential of our services by subscribing to
                  our API. Gain exclusive access to advanced features, priority
                  support, and seamless integration updates.
                </p>
                <img src="svg3.png" alt="svg1" />
              </div>
            </Link>
          </div>
        </div>
        <footer className="footer--light">
          <div className="footer-big">
            <div className="footer-container">
              <div className="row">
                <div className="col-lg-3 col-sm-6">
                  <div className="footer-widget">
                    <div className="widget-about">
                      <img
                        decoding="async"
                        src="images/bg-1.png"
                        alt=""
                        className="img-fluid"
                      />
                      <p>
                      Elevate your catalog experience. Try CatalogScore now.
                      </p>
                      <ul className="contact-details">
                        <li>
                          <i className="fas fa-phone-alt"></i> Call Us:
                          <a href="#">+91 9921318237
                          </a>
                          <br/>
                          <a href="#">+91 9823632117
                          </a>
                        </li>
                        <li>
                          <i className="fas fa-envelope-open-text"></i>
                          <a href="#">mayur.agarwal22@vit.edu</a>
                          <br/>
                          <a href="#">bhavesh.agone22@vit.edu</a>
                          <br/>
                          <a href="#">vaishnavi.mahindrakar22@vit.edu</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3 col-sm-6"style={{ width: "30%" }}>
                  <div className="footer-widget">
                    <div className="footer-menu">
                      <h4 className="footer-widget-title">Popular Category</h4>
                      <ul>
                        <li>
                          <a href="#">Check Score</a>
                        </li>
                        <li>
                          <a href="#">Dashboard</a>
                        </li>
                        <li>
                          <a href="#">Feedback</a>
                        </li>
                        <li>
                          <a href="#">Get suggessions</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="col-lg-3 col-sm-6"style={{ width: "30%" }}>
                  <div className="footer-widget">
                    <div className="footer-menu">
                      <h4 className="footer-widget-title">Our Team</h4>
                      <ul>
                        <li>
                          <a href="#">About Us</a>
                        </li>
                        <li>
                          <a href="#">How It Works</a>
                        </li>
                        <li>
                          <a href="#">Contact Us</a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                
              </div>
            </div>
          </div>
        </footer>

        <div className="context"></div>
      </div>

    </div>
  );
};

export default Home;
