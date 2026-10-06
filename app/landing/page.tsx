import Link from "next/link";

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #170c29 0%, #0c0912 52%, #08070d 100%)",
    color: "#ffffff",
    fontFamily:
      "Inter, Arial, Helvetica, sans-serif",
  },

  container: {
    width: "min(1130px, calc(100% - 40px))",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "30px 0",
    gap: "24px",
  },

  logo: {
    fontSize: "25px",
    fontWeight: 900,
    letterSpacing: "-1px",
  },

  nav: {
    display: "flex",
    gap: "28px",
    alignItems: "center",
    flexWrap: "wrap" as const,
  },

  navLink: {
    color: "#ddd2eb",
    textDecoration: "none",
    fontSize: "15px",
  },

  button: {
    display: "inline-block",
    padding: "14px 24px",
    borderRadius: "10px",
    background:
      "linear-gradient(135deg, #7546ff, #aa4cff)",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 800,
  },

  secondaryButton: {
    display: "inline-block",
    padding: "13px 24px",
    borderRadius: "10px",
    border: "1px solid #574268",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 700,
  },

  hero: {
    textAlign: "center" as const,
    padding: "115px 0 130px",
  },

  eyebrow: {
    color: "#a97cff",
    fontWeight: 900,
    letterSpacing: "2px",
    fontSize: "13px",
  },

  heroTitle: {
    margin: "25px auto 25px",
    fontSize: "clamp(48px, 7vw, 88px)",
    lineHeight: 0.98,
    letterSpacing: "-4px",
    maxWidth: "920px",
  },

  gradientText: {
    background:
      "linear-gradient(90deg, #784aff, #63dbe5, #55efc4)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  description: {
    color: "#cbbfd7",
    lineHeight: 1.7,
    fontSize: "19px",
    maxWidth: "720px",
    margin: "30px auto",
  },

  actions: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    flexWrap: "wrap" as const,
    marginTop: "32px",
  },

  disclaimer: {
    color: "#80768c",
    marginTop: "20px",
    fontSize: "13px",
  },

  section: {
    padding: "90px 0",
  },

  sectionTitle: {
    fontSize: "46px",
    letterSpacing: "-2px",
    margin: "10px 0 20px",
  },

  sectionText: {
    color: "#c6bbd0",
    lineHeight: 1.7,
    maxWidth: "650px",
    fontSize: "17px",
  },

  grid4: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginTop: "40px",
  },

  card: {
    background: "#191321",
    border: "1px solid #473452",
    borderRadius: "17px",
    padding: "26px",
  },

  cardNumber: {
    color: "#887998",
    fontSize: "12px",
    fontWeight: 800,
  },

  cardTitle: {
    fontSize: "19px",
    margin: "20px 0 12px",
  },

  cardText: {
    color: "#b8aabd",
    lineHeight: 1.6,
    margin: 0,
  },

  mvpLayout: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "50px",
    alignItems: "center",
  },

  stats: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "12px",
    marginTop: "22px",
  },

  metric: {
    background: "#120e18",
    border: "1px solid #463250",
    borderRadius: "13px",
    padding: "20px",
  },

  metricValue: {
    fontWeight: 900,
    fontSize: "20px",
  },

  metricLabel: {
    color: "#91849a",
    fontSize: "12px",
    marginTop: "7px",
  },

  checklist: {
    marginTop: "28px",
    background: "#1a1422",
    border: "1px solid #463450",
    borderRadius: "16px",
    padding: "24px",
  },

  checklistGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "10px",
  },

  check: {
    background: "#130f18",
    padding: "13px 15px",
    borderRadius: "9px",
  },

  statusGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
    marginTop: "35px",
  },

  statusBox: {
    background: "#191321",
    border: "1px solid #493755",
    borderRadius: "16px",
    padding: "23px",
  },

  label: {
    color: "#8e809a",
    fontSize: "11px",
    letterSpacing: "1px",
    marginBottom: "12px",
  },

  value: {
    fontWeight: 850,
    fontSize: "17px",
  },

  tech: {
    background: "#191321",
    border: "1px solid #493755",
    borderRadius: "16px",
    padding: "25px",
    marginTop: "18px",
  },

  pills: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap" as const,
    marginTop: "20px",
  },

  pill: {
    border: "1px solid #4b3956",
    padding: "8px 13px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
  },

  cta: {
    margin: "90px 0",
    textAlign: "center" as const,
    border: "1px solid #503a60",
    borderRadius: "22px",
    padding: "70px 25px",
    background:
      "linear-gradient(135deg, #24163c, #111823)",
  },

  footer: {
    borderTop: "1px solid #27202e",
    padding: "30px 0 45px",
    color: "#766d7c",
    textAlign: "center" as const,
    fontSize: "13px",
  },
};

export default function LandingPage() {
  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.logo}>
            meme
            <span
              style={{
                color: "#985cff",
              }}
            >
              dictions.
            </span>
          </div>

          <nav style={styles.nav}>
            <a
              href="#how"
              style={styles.navLink}
            >
               How it works </a>

            <a
              href="#mvp"
              style={styles.navLink}
            >
              MVP
            </a>

            <a
              href="#roadmap"
              style={styles.navLink}
            >
              Roadmap
            </a>

            <Link
              href="/test"
              style={styles.button}
            >
               Open demo </Link>
          </nav>
        </header>

        <section style={styles.hero}>
          <div style={styles.eyebrow}>
             BUILT ON SOLANA </div>

          <h1 style={styles.heroTitle}>
             Predict memecoins. <br />

            <span
              style={styles.gradientText}
            >
               Resolve on-chain. </span>
          </h1>

          <p style={styles.description}>
             Memedictions lets users predict whether a memecoin will rise or fall
            during a round, recording predictions and results on Solana. </p>

          <div style={styles.actions}>
            <Link
              href="/test"
              style={styles.button}
            >
               Try the MVP </Link>

            <a
              href="#mvp"
              style={styles.secondaryButton}
            >
               View progress </a>
          </div>

          <p style={styles.disclaimer}>
             Experimental MVP · test points with no monetary value · no real funds. </p>
        </section>

        <section
          id="how"
          style={styles.section}
        >
          <div style={styles.eyebrow}>
             HOW IT WORKS </div>

          <h2 style={styles.sectionTitle}>
             One prediction. Four steps. </h2>

          <div style={styles.grid4}>
            {[
              [
                "01",
                "Choose",
                "Select a memecoin and a round.",
              ],
              [
                "02",
                "Predict",
                "Choose UP or DOWN and submit test points.",
              ],
              [
                "03",
                "Wait",
                "The round remains open until its scheduled closing time.",
              ],
              [
                "04",
                "Resolve",
                "The round authority enters the closing price and records the result on-chain.",
              ],
            ].map(
              ([number, title, text]) => (
                <article
                  key={number}
                  style={styles.card}
                >
                  <div
                    style={
                      styles.cardNumber
                    }
                  >
                    {number}
                  </div>

                  <h3
                    style={
                      styles.cardTitle
                    }
                  >
                    {title}
                  </h3>

                  <p
                    style={
                      styles.cardText
                    }
                  >
                    {text}
                  </p>
                </article>
              )
            )}
          </div>
        </section>

        <section
          id="mvp"
          style={styles.section}
        >
          <div style={styles.mvpLayout}>
            <div>
              <div style={styles.eyebrow}>
                 FUNCTIONAL MVP </div>

              <h2
                style={
                  styles.sectionTitle
                }
              >
                 The complete lifecycle
                is working. </h2>

              <p
                style={
                  styles.sectionText
                }
              >
                 The original Localnet validation covered round creation, predictions,
                closing, results and proportional test-point calculations.
                The current public MVP records predictions and results on Devnet. </p>
            </div>

            <div style={styles.card}>
              <div style={styles.eyebrow}>
                 LOCALNET TEST EXAMPLE </div>

              <h2
                style={{
                  fontSize: 30,
                  margin: "12px 0",
                }}
              >
                BONK
              </h2>

              <div style={styles.stats}>
                <div style={styles.metric}>
                  <div
                    style={
                      styles.metricValue
                    }
                  >
                    325 PTS
                  </div>
                  <div
                    style={
                      styles.metricLabel
                    }
                  >
                     Total test-point pool </div>
                </div>

                <div style={styles.metric}>
                  <div
                    style={
                      styles.metricValue
                    }
                  >
                    175 PTS
                  </div>
                  <div
                    style={
                      styles.metricLabel
                    }
                  >
                     Winning side </div>
                </div>

                <div style={styles.metric}>
                  <div
                    style={
                      styles.metricValue
                    }
                  >
                    150 PTS
                  </div>
                  <div
                    style={
                      styles.metricLabel
                    }
                  >
                     Losing side </div>
                </div>

                <div style={styles.metric}>
                  <div
                    style={
                      styles.metricValue
                    }
                  >
                    325 PTS
                  </div>
                  <div
                    style={
                      styles.metricLabel
                    }
                  >
                     Allocated test points </div>
                </div>
              </div>

              <div style={styles.pills}>
                <span style={styles.pill}>
                   3 test predictions </span>

                <span style={styles.pill}>
                   on-chain flow </span>

                <span style={styles.pill}>
                  Localnet
                </span>
              </div>
            </div>
          </div>

          <div style={styles.checklist}>
            <h3>
               Implemented </h3>

            <div
              style={
                styles.checklistGrid
              }
            >
              {[
                "✓ On-chain rounds",
                "✓ On-chain predictions",
                "✓ Round closing",
                "✓ RoundResult accounts",
                "✓ Localnet test-point calculations",
                "✓ Complete demo interface",
              ].map((item) => (
                <div
                  key={item}
                  style={styles.check}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <div style={styles.eyebrow}>
             PROJECT STATUS </div>

          <h2 style={styles.sectionTitle}>
             Built, tested and
            moving forward. </h2>

          <p style={styles.sectionText}>
             The public V2.1 MVP runs on Solana Devnet using test points.
            Resolution uses a manually entered closing price.
            Price-oracle integration remains experimental. </p>

          <div style={styles.statusGrid}>
            <div style={styles.statusBox}>
              <div style={styles.label}>
                MVP
              </div>

              <div style={styles.value}>
                 ✓ Operational </div>
            </div>

            <div style={styles.statusBox}>
              <div style={styles.label}>
                 CURRENT NETWORK </div>

              <div style={styles.value}>
                 ✓ Solana Devnet </div>
            </div>

            <div style={styles.statusBox}>
              <div style={styles.label}>
                 PRICE ORACLE </div>

              <div style={styles.value}>
                 → Experimental </div>
            </div>

            <div style={styles.statusBox}>
              <div style={styles.label}>
                 RESOLUTION </div>

              <div style={styles.value}>
                 → Manual round authority </div>
            </div>
          </div>

          <div style={styles.tech}>
            <div style={styles.eyebrow}>
               TECHNOLOGY </div>

            <h3
              style={{
                fontSize: 24,
              }}
            >
               Built with </h3>

            <div style={styles.pills}>
              {[
                "Solana",
                "Anchor",
                "Rust",
                "Next.js",
                "TypeScript",
                "Solana Web3.js",
              ].map((item) => (
                <span
                  key={item}
                  style={styles.pill}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section
          id="roadmap"
          style={styles.section}
        >
          <div style={styles.eyebrow}>
            ROADMAP
          </div>

          <h2 style={styles.sectionTitle}>
             What comes next. </h2>

          <div style={styles.grid4}>
            {[
              [
                "01",
                "Devnet",
                "Expand public Devnet testing and collect reproducible evidence.",
              ],
              [
                "02",
                "Wallet flow",
                "Validate the public transaction flow with Solflare and Backpack.",
              ],
              [
                "03",
                "Price oracle",
                "Complete and validate oracle-based price resolution in the experimental version.",
              ],
              [
                "04",
                "SPL test token",
                "Explore staking and settlement with a test token instead of test points.",
              ],
            ].map(
              ([number, title, text]) => (
                <article
                  key={number}
                  style={styles.card}
                >
                  <div
                    style={
                      styles.cardNumber
                    }
                  >
                    {number}
                  </div>

                  <h3
                    style={
                      styles.cardTitle
                    }
                  >
                    {title}
                  </h3>

                  <p
                    style={
                      styles.cardText
                    }
                  >
                    {text}
                  </p>
                </article>
              )
            )}
          </div>
        </section>

        <section style={styles.cta}>
          <div style={styles.eyebrow}>
            MEMEDICTIONS
          </div>

          <h2
            style={{
              fontSize:
                "clamp(38px, 6vw, 62px)",
              margin: "25px 0",
              letterSpacing: "-2px",
            }}
          >
             Memecoins today. <br />
             Predictions tomorrow. </h2>

          <p
            style={{
              color: "#bfb3c8",
              marginBottom: 30,
            }}
          >
             Built on Solana. </p>

          <Link
            href="/test"
            style={styles.button}
          >
             Try the MVP </Link>
        </section>

        <footer style={styles.footer}>
           memedictions.fun · Built on Solana · Experimental Devnet MVP </footer>
      </div>
    </main>
  );
}