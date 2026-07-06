import React from "react";
import { Link } from "react-router-dom";
import {
  Stethoscope,
  Activity,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Send,
} from "lucide-react";

import {
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
} from "react-icons/fa";

import { footerStyles as styles } from "../assets/dummyStyles";
import logo from "../assets/logo.png";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "Doctors", href: "/doctors" },
  { name: "Services", href: "/services" },
  { name: "Contact", href: "/contact" },
  { name: "Appointments", href: "/appointments" },
  { name: "AI Tools", href: "/tools" },
];

const services = [
  { name: "Blood Pressure Check", href: "/services" },
  { name: "Blood Sugar Test", href: "/services" },
  { name: "Full Blood Count", href: "/services" },
  { name: "X-Ray Scan", href: "/services" },
  { name: "Health Consultation", href: "/services" },
];

const socialLinks = [
  {
    Icon: FaTwitter,
    color: styles.twitterColor,
    name: "Twitter",
    href: "https://x.com/Nileshkuma83532/",
  },
  {
    Icon: FaInstagram,
    color: styles.instagramColor,
    name: "Instagram",
    href: "https://www.instagram.com/the_n1l3sh/",
  },
  {
    Icon: FaLinkedinIn,
    color: styles.linkedinColor,
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/nilesh-kumar-51b3ba28b/",
  },
  {
    Icon: FaGithub,
    color: styles.youtubeColor,
    name: "Github",
    href: "https://github.com/NILESH2327",
  },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footerContainer}>
      {/* Floating Icons */}

      <div className={styles.floatingIcon1}>
        <Stethoscope className={styles.stethoscopeIcon} />
      </div>

      <div
        className={styles.floatingIcon2}
        style={{ animationDelay: "3s" }}
      >
        <Activity className={styles.activityIcon} />
      </div>

      <div className={styles.mainContent}>
        <div className={styles.gridContainer}>
          {/* Company Section */}

          <div className={styles.companySection}>
            <div className={styles.logoContainer}>
              <div className={styles.logoWrapper}>
                <div className={styles.logoImageContainer}>
                  <img
                    src={logo}
                    alt="Medixthon Logo"
                    className={styles.logoImage}
                  />
                </div>
              </div>

              <div>
                <h2 className={styles.companyName}>
                  Medixthon
                </h2>

                <p className={styles.companyTagline}>
                  Healthcare Solutions
                </p>
              </div>
            </div>

            <p className={styles.companyDescription}>
              Your trusted partner in healthcare innovation.
              We are committed to providing exceptional
              medical care with cutting-edge technology
              and compassionate service.
            </p>

            <div className={styles.contactContainer}>
              <div className={styles.contactItem}>
                <div className={styles.contactIconWrapper}>
                  <Phone className={styles.contactIcon} />
                </div>

                <span className={styles.contactText}>
                  +91 9555992690
                </span>
              </div>

              <div className={styles.contactItem}>
                <div className={styles.contactIconWrapper}>
                  <Mail className={styles.contactIcon} />
                </div>

                <span className={styles.contactText}>
                  starnilesh38@gmail.com
                </span>
              </div>

              <div className={styles.contactItem}>
                <div className={styles.contactIconWrapper}>
                  <MapPin className={styles.contactIcon} />
                </div>

                <span className={styles.contactText}>
                  Basti, Uttar Pradesh, India
                </span>
              </div>
            </div>
          </div>
                    {/* Quick Links */}
          <div className={styles.linksSection}>
            <h3 className={styles.sectionTitle}>
              Quick Links
            </h3>

            <ul className={styles.linksList}>
              {quickLinks.map((link, index) => (
                <li
                  key={link.name}
                  className={styles.linkItem}
                >
                  <Link
                    to={link.href}
                    className={styles.quickLink}
                    style={{
                      animationDelay: `${index * 60}ms`,
                    }}
                  >
                    <span className={styles.quickLinkIconWrapper}>
                      <ArrowRight
                        className={styles.quickLinkIcon}
                      />
                    </span>

                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className={styles.linksSection}>
            <h3 className={styles.sectionTitle}>
              Our Services
            </h3>

            <ul className={styles.linksList}>
              {services.map((service) => (
                <li key={service.name}>
                  <Link
                    to={service.href}
                    className={styles.serviceLink}
                  >
                    <span className={styles.serviceIcon}></span>

                    <span>{service.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className={styles.newsletterSection}>
            <h3 className={styles.newsletterTitle}>
              Stay Connected
            </h3>

            <p className={styles.newsletterDescription}>
              Subscribe for health tips, medical updates,
              wellness insights and healthcare news.
            </p>

            <form className={styles.newsletterForm}>
              {/* Mobile */}
              <div
                className={styles.mobileNewsletterContainer}
              >
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Enter your email"
                  className={styles.emailInput}
                />

                <button
                  type="submit"
                  className={styles.mobileSubscribeButton}
                >
                  <Send
                    className={styles.mobileButtonIcon}
                  />
                  Connect
                </button>
              </div>

              {/* Desktop */}
              <div
                className={styles.desktopNewsletterContainer}
              >
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Enter your email"
                  className={styles.desktopEmailInput}
                />

                <button
                  type="submit"
                  className={styles.desktopSubscribeButton}
                >
                  <Send
                    className={styles.desktopButtonIcon}
                  />

                  <span
                    className={styles.desktopButtonText}
                  >
                    Connect
                  </span>
                </button>
              </div>

              {/* Social Icons */}
              <div className={styles.socialContainer}>
                {socialLinks.map(
                  (
                    {
                      Icon,
                      color,
                      name,
                      href,
                    },
                    index
                  ) => (
                    <a
                      key={name}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      style={{
                        animationDelay: `${
                          index * 120
                        }ms`,
                      }}
                    >
                      <div
                        className={
                          styles.socialIconBackground
                        }
                      />

                      <Icon
                        className={`${styles.socialIcon} ${color}`}
                      />
                    </a>
                  )
                )}
              </div>
            </form>
          </div>

        </div>
                {/* Bottom Footer */}
        <div className={styles.bottomSection}>
          <p className={styles.copyright}>
            © {currentYear} Medixthon Healthcare. All Rights Reserved.
          </p>

          <p className={styles.designerText}>
            Designed & Developed by{" "}
            <a
              href="https://github.com/NILESH2327"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.designerLink}
            >
              Nilesh Kumar
            </a>
          </p>
        </div>
      </div>

      <style>{styles.animationStyles}</style>
    </footer>
  );
};

export default Footer;