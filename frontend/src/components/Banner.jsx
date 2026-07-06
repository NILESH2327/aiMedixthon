import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Stethoscope,
  Star,
  Calendar,
  Phone,
  Ribbon,
  Clock,
  ShieldUser,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { bannerStyles } from "../assets/dummyStyles";

import doctor1 from "../assets/BannerImg.png";
import doctor2 from "../assets/D1.png";
import doctor3 from "../assets/D2.png";
import doctor4 from "../assets/D3.png";
import doctor5 from "../assets/D4.png";

// Replace these with your 5 final images — same array shape, just swap the src.
const carouselImages = [
   doctor1,
  doctor2,
  doctor3,
  doctor4,
  doctor5,
];

function ImageCarousel({ images, intervalMs = 4000 }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);
  const hoveredRef = useRef(false);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (!hoveredRef.current) {
        setIndex((prev) => (prev + 1) % images.length);
      }
    }, intervalMs);
    return () => clearInterval(timerRef.current);
  }, [images.length, intervalMs]);

  const goTo = (i) => setIndex((i + images.length) % images.length);

  return (
    <div
      className={bannerStyles.carouselViewport}
      onMouseEnter={() => (hoveredRef.current = true)}
      onMouseLeave={() => (hoveredRef.current = false)}
    >
      <div
        className={bannerStyles.carouselTrack}
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Medixthon+ team ${i + 1}`}
            className={bannerStyles.carouselSlide}
          />
        ))}
      </div>

      {/* soft bottom-fade so dots/arrows sit on a readable surface
          instead of floating directly on a bright photo */}
      <div className={bannerStyles.carouselFade}></div>

      <button
        type="button"
        aria-label="Previous image"
        onClick={() => goTo(index - 1)}
        className={`${bannerStyles.carouselArrow} ${bannerStyles.carouselArrowLeft}`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        aria-label="Next image"
        onClick={() => goTo(index + 1)}
        className={`${bannerStyles.carouselArrow} ${bannerStyles.carouselArrowRight}`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className={bannerStyles.carouselDots}>
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to image ${i + 1}`}
            onClick={() => goTo(i)}
            className={
              i === index ? bannerStyles.carouselDotActive : bannerStyles.carouselDot
            }
          />
        ))}
      </div>
    </div>
  );
}

export default function Banner() {
  const navigate = useNavigate();

  return (
    <div className={bannerStyles.bannerContainer}>
      <div className={bannerStyles.mainContainer}>
        <div className={bannerStyles.borderOutline}>
          <div className={bannerStyles.outerAnimatedBand}></div>
          <div className={bannerStyles.innerWhiteBorder}></div>
        </div>

        <div className={bannerStyles.contentContainer}>
          <div className={bannerStyles.flexContainer}>
            <div className={bannerStyles.leftContent}>
              <div className={bannerStyles.headerBadgeContainer}>
                <div className={bannerStyles.stethoscopeContainer}>
                  <div className={bannerStyles.stethoscopeInner}>
                    <Stethoscope className={bannerStyles.stethoscopeIcon} />
                  </div>
                </div>
                <div className={bannerStyles.titleContainer}>
                  <h1 className={bannerStyles.title}>
                    Medi
                    <span className={bannerStyles.titleGradient}>xthon+</span>
                  </h1>
                  {/* stars */}
                  <div className={bannerStyles.starsContainer}>
                    <div className={bannerStyles.starsInner}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star className={bannerStyles.starIcon} key={star} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* tagline */}
              <p className={bannerStyles.tagline}>
                Premium HealthCare
                <span className={`block ${bannerStyles.taglineHighlight}`}>
                  At Your Fingertips
                </span>
              </p>

              <div className={bannerStyles.featuresGrid}>
                <div
                  className={`${bannerStyles.featureItem} ${bannerStyles.featureBorderGreen}`}
                >
                  <Ribbon className={bannerStyles.featureIcon} />
                  <span className={bannerStyles.featureText}>
                    Certified Specialists
                  </span>
                </div>

                <div
                  className={`${bannerStyles.featureItem} ${bannerStyles.featureBorderBlue}`}
                >
                  <Clock className={bannerStyles.featureIcon} />
                  <span className={bannerStyles.featureText}>
                    24/7 Availablity
                  </span>
                </div>

                <div className={bannerStyles.featureItemEmphasis}>
                  <ShieldUser className={bannerStyles.featureIconEmphasis} />
                  <span className={bannerStyles.featureTextEmphasis}>
                    Safe &amp; Secure
                  </span>
                </div>

                <div
                  className={`${bannerStyles.featureItem} ${bannerStyles.featureBorderBlue}`}
                >
                  <Users className={bannerStyles.featureIcon} />
                  <span className={bannerStyles.featureText}>
                    500+ Doctors
                  </span>
                </div>
              </div>

              <div className={bannerStyles.ctaButtonsContainer}>
                <button
                  type="button"
                  onClick={() => navigate("/doctors")}
                  className={bannerStyles.bookButton}
                >
                  <div className={bannerStyles.bookButtonOverlay}></div>
                  <div className={bannerStyles.bookButtonContent}>
                    <Calendar className={bannerStyles.bookButtonIcon} />
                    <span>Book Appointment Now</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => (window.location.href = "tel:9555992690")}
                  className={bannerStyles.emergencyButton}
                >
                  <div className={bannerStyles.emergencyButtonContent}>
                    <Phone className={bannerStyles.emergencyButtonIcon} />
                    <span>Emergency Call</span>
                  </div>
                </button>
              </div>
            </div>

            <div className={bannerStyles.rightImageSection}>
              <div className={bannerStyles.imageContainer}>
                <div className={bannerStyles.imageFrame}>
                  <ImageCarousel images={carouselImages} intervalMs={4000} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
