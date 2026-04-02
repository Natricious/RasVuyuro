import { Link } from 'react-router-dom';
import { HERO_POSTER_URLS } from '../../data/movies';
import './HeroBanner.css';

const STATS = [
  { value: '10K+', label: 'ფილმი' },
  { value: '4.8★', label: 'საშ. რეიტინგი' },
  { value: '50K+', label: 'მომხმარებელი' },
];

export default function HeroBanner() {
  return (
    <section className="hero">

      {/* Background */}
      <div className="hero__bg">
        <img
          src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80"
          alt=""
          className="hero__bg-img"
          aria-hidden="true"
        />
        <div className="hero__bg-gradient-top" />
        <div className="hero__bg-gradient-side" />
        <div className="hero__blob hero__blob--1" />
        <div className="hero__blob hero__blob--2" />
      </div>

      {/* Content */}
      <div className="hero__content container">
        <div className="hero__grid">

          {/* Left column */}
          <div className="hero__left">
            <div className="hero__space">

              <span className="hero__badge" style={{ animationDelay: '0.2s' }}>
                ინტელექტუალური კინო-გზამკვლელი
              </span>

              <h1 className="hero__heading" style={{ animationDelay: '0.4s' }}>
                რომელი ფილმი<br />
                <span className="hero__heading-line2">უყუროთ დღეს</span><br />
                ღამით?
              </h1>

              <p className="hero__description" style={{ animationDelay: '0.55s' }}>
                პასუხობ კითხვებს — CineGuide პოულობს შენს სრულყოფილ ფილმს
              </p>

              <div className="hero__actions" style={{ animationDelay: '0.7s' }}>
                <Link to="/movies" className="hero__btn-primary">
                  კინო-ჯადოსნური დაწყება
                </Link>
                <Link to="/movies" className="hero__btn-secondary">
                  ყველა ფილმის ნახვა
                </Link>
              </div>

              <div className="hero__stats" style={{ animationDelay: '0.85s' }}>
                {STATS.map(({ value, label }) => (
                  <div key={label} className="hero__stat">
                    <span className="hero__stat-value">{value}</span>
                    <span className="hero__stat-label">{label}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Right column — floating poster cards (desktop only) */}
          <div className="hero__right" aria-hidden="true">
            <div className="hero__cards">
              <div className="hero__card hero__card--left">
                <img src={HERO_POSTER_URLS[0]} alt="" className="hero__card-img" />
                <div className="hero__card-overlay" />
              </div>
              <div className="hero__card hero__card--center">
                <img src={HERO_POSTER_URLS[1]} alt="" className="hero__card-img" />
                <div className="hero__card-overlay" />
              </div>
              <div className="hero__card hero__card--right">
                <img src={HERO_POSTER_URLS[2]} alt="" className="hero__card-img" />
                <div className="hero__card-overlay" />
              </div>
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
