import Link from "next/link";
import { FeaturedEventPreview } from "@/components/featured-event-preview";
import { PublicEventGrid } from "@/components/public-event-grid";

export default function HomePage() {
  return (
    <main className="home-page">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Ticklit home">
          <span className="brand-spark">✦</span> ticklit
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <Link href="#discover">Explore</Link>
          <Link href="#features">For hosts</Link>
          <Link href="#ticketing">Sell tickets</Link>
        </nav>
        <div className="nav-actions">
          <Link className="login-button" href="/login">
            Log in
          </Link>
          <Link className="create-button" href="/create">
            Create event <span>↗</span>
          </Link>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-sticker sticker-one">
          RSVP
          <br />
          <b>YES!</b>
        </div>
        <div className="hero-sticker sticker-two">
          YOU&apos;RE
          <br />
          INVITED
        </div>
        <div className="confetti" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>

        <div className="hero-copy">
          <p className="tiny-label">PLANS ARE BETTER TOGETHER</p>
          <h1>
            Make something
            <br />
            <span>happen.</span>
          </h1>
          <p className="hero-tagline">One tick and it&apos;s lit.</p>
          <p>
            Create a page that matches the vibe, invite your people, sell tickets,
            and keep everyone on the same page.
          </p>
          <Link className="hero-cta" href="/create">
            Create an event <span>→</span>
          </Link>
          <small>Free to create. Takes about 30 seconds.</small>
        </div>

        <div className="invite-stack" aria-label="Example event invitation">
          <div className="invite-card card-back-one">
            <span>BRUNCH<br />CLUB</span>
          </div>
          <div className="invite-card card-back-two">
            <span>FRI<br />09.18</span>
          </div>
          <article className="invite-card card-main">
            <div className="invite-art">
              <span className="art-kicker">ONE NIGHT ONLY</span>
              <i className="star star-a">✦</i>
              <i className="star star-b">✦</i>
              <div className="disco-ball" />
              <h2>
                AFTER
                <br />
                HOURS
              </h2>
              <span className="scribble">let&apos;s dance</span>
            </div>
            <div className="invite-details">
              <div>
                <strong>After Hours at The Courtyard</strong>
                <span>Friday, Sept 18 · 9:00 PM</span>
              </div>
              <Link className="rsvp-button" href="/signup">
                RSVP
              </Link>
            </div>
          </article>
          <div className="guest-bubble">
            <span className="avatar avatar-a">M</span>
            <span className="avatar avatar-b">J</span>
            <span className="avatar avatar-c">S</span>
            <b>+82 going</b>
          </div>
        </div>
      </section>

      <section className="press-strip" aria-label="Social proof">
        <span>Loved by hosts everywhere</span>
        <b>★★★★★</b>
        <span>40,000+ five-star ratings</span>
        <i />
        <span>Over 1M memories made</span>
      </section>

      <section className="template-section" id="discover">
        <div className="section-title">
          <span className="pill-label">PICK YOUR VIBE</span>
          <h2>
            Invites that don&apos;t
            <br />
            feel like homework.
          </h2>
          <p>Start with a template, then make it entirely yours.</p>
        </div>

        <div className="template-rail" aria-label="Invitation templates">
          <article className="template-card template-pink">
            <div className="template-art">
              <span className="mini">SATURDAY / 8PM</span>
              <b>BIRTHDAY<br />BEHAVIOR</b>
              <i>♠</i>
            </div>
            <h3>Big birthday energy</h3>
            <p>Party · Bold</p>
          </article>
          <article className="template-card template-blue">
            <div className="template-art">
              <span className="mini">SUNDAZE</span>
              <b>POOL<br />SIDE</b>
              <i>☼</i>
            </div>
            <h3>Poolside social</h3>
            <p>Summer · Chill</p>
          </article>
          <article className="template-card template-yellow">
            <div className="template-art">
              <span className="mini">YOU&apos;RE INVITED TO</span>
              <b>SUPPER<br />AT EIGHT</b>
              <i>✿</i>
            </div>
            <h3>Dinner with friends</h3>
            <p>Dinner · Cozy</p>
          </article>
          <article className="template-card template-green">
            <div className="template-art">
              <span className="mini">MEET AT 6:30AM</span>
              <b>RUN<br />CLUB</b>
              <i>➜</i>
            </div>
            <h3>Sunday run club</h3>
            <p>Wellness · Active</p>
          </article>
          <article className="template-card template-purple">
            <div className="template-art">
              <span className="mini">DOWNTOWN / 7PM</span>
              <b>NIGHT<br />MARKET</b>
              <i>✦</i>
            </div>
            <h3>Night market</h3>
            <p>Community · Food</p>
          </article>
        </div>

        <button className="outline-button" type="button">
          Shuffle the vibes <span>↻</span>
        </button>
      </section>

      <section className="social-feature" id="features">
        <div className="feature-copy">
          <span className="pill-label dark">EVERYONE&apos;S IN</span>
          <h2>
            Not just an invite.
            <br />
            It&apos;s the group chat
            <br />
            <em>before the group chat.</em>
          </h2>
          <p>
            Guests can see who&apos;s going, react, comment, share photos, and get
            updates without downloading anything.
          </p>
          <Link className="text-link" href="/signup">
            Get the party started <span>→</span>
          </Link>
        </div>

        <FeaturedEventPreview />
      </section>

      <section className="events-section" aria-labelledby="events-title">
        <div className="events-heading">
          <div>
            <span className="pill-label">WHAT&apos;S HAPPENING</span>
            <h2 id="events-title">Find your next plan.</h2>
          </div>
          <form className="search-box">
            <label>
              <span className="sr-only">Search events</span>
              <span>⌕</span>
              <input type="search" placeholder="Search Dubai events" />
            </label>
          </form>
        </div>

        <div className="category-row" role="group" aria-label="Filter event categories">
          <button className="category active" type="button">
            Everything
          </button>
          <button className="category" type="button">
            Music
          </button>
          <button className="category" type="button">
            Food
          </button>
          <button className="category" type="button">
            Creative
          </button>
          <button className="category" type="button">
            Wellness
          </button>
        </div>

        <PublicEventGrid />
      </section>

      <section className="ticket-section" id="ticketing">
        <div className="ticket-visual">
          <div className="big-ticket">
            <div className="ticket-top">
              <small>TICKLIT PRESENTS</small>
              <strong>
                NEON
                <br />
                NIGHTS
              </strong>
              <span>SEP 21 · DUBAI</span>
            </div>
            <div className="ticket-bottom">
              <span>
                <small>ADMIT</small>
                <b>ONE</b>
              </span>
              <span>
                <small>PRICE</small>
                <b>AED 95</b>
              </span>
              <i />
            </div>
          </div>
          <span className="sold-stamp">
            SOLD
            <br />
            OUT!
          </span>
        </div>

        <div className="ticket-copy">
          <span className="pill-label light">NEW: TICKETING</span>
          <h2>
            Sell the tickets.
            <br />
            Skip the headache.
          </h2>
          <p>
            Set up ticket tiers, take secure payments, scan QR codes at the door,
            and track every sale from one simple dashboard.
          </p>
          <ul>
            <li>
              <span>✓</span> Flexible ticket tiers
            </li>
            <li>
              <span>✓</span> Fast, secure payouts
            </li>
            <li>
              <span>✓</span> QR check-in
            </li>
          </ul>
          <Link className="white-button" href="/signup">
            Start selling tickets <span>→</span>
          </Link>
        </div>
      </section>

      <section className="final-cta">
        <span className="burst burst-a">✦</span>
        <span className="burst burst-b">✷</span>
        <p>SO... WHAT ARE WE DOING?</p>
        <h2>
          Your people are
          <br />
          waiting.
        </h2>
        <Link className="hero-cta" href="/create">
          Create your event <span>→</span>
        </Link>
      </section>

      <footer>
        <Link className="brand" href="#top">
          <span className="brand-spark">✦</span> ticklit
        </Link>
        <p>Make plans. Make memories.</p>
        <div>
          <Link href="#discover">Explore</Link>
          <Link href="#features">For hosts</Link>
          <Link href="#ticketing">Tickets</Link>
        </div>
        <span>© 2026 Ticklit</span>
      </footer>
    </main>
  );
}
