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
              Cómo funciona
            </a>

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
              href="/"
              style={styles.button}
            >
              Abrir demo
            </Link>
          </nav>
        </header>

        <section style={styles.hero}>
          <div style={styles.eyebrow}>
            CONSTRUIDO SOBRE SOLANA
          </div>

          <h1 style={styles.heroTitle}>
            Predice memecoins.
            <br />

            <span
              style={styles.gradientText}
            >
              Resuelve on-chain.
            </span>
          </h1>

          <p style={styles.description}>
            Memedictions es una plataforma de
            predicciones donde los usuarios
            eligen si una memecoin subirá o
            bajará durante una ronda
            determinada, registrando
            predicciones y resultados sobre
            Solana.
          </p>

          <div style={styles.actions}>
            <Link
              href="/"
              style={styles.button}
            >
              Probar MVP
            </Link>

            <a
              href="#mvp"
              style={styles.secondaryButton}
            >
              Ver avances
            </a>
          </div>

          <p style={styles.disclaimer}>
            MVP experimental · puntos
            ficticios · sin fondos reales.
          </p>
        </section>

        <section
          id="how"
          style={styles.section}
        >
          <div style={styles.eyebrow}>
            CÓMO FUNCIONA
          </div>

          <h2 style={styles.sectionTitle}>
            Una predicción. Cinco pasos.
          </h2>

          <div style={styles.grid4}>
            {[
              [
                "01",
                "Elegir",
                "Selecciona una memecoin y una ronda.",
              ],
              [
                "02",
                "Predecir",
                "Elige SUBE o BAJA y registra puntos ficticios.",
              ],
              [
                "03",
                "Esperar",
                "La ronda permanece abierta hasta el tiempo definido.",
              ],
              [
                "04",
                "Resolver",
                "El resultado queda registrado on-chain.",
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
                MVP FUNCIONAL
              </div>

              <h2
                style={
                  styles.sectionTitle
                }
              >
                El ciclo completo ya
                funciona.
              </h2>

              <p
                style={
                  styles.sectionText
                }
              >
                Memedictions ya validó
                creación, predicción,
                cierre, resultado y
                cálculo de recompensas de
                extremo a extremo en
                Solana Localnet.
              </p>
            </div>

            <div style={styles.card}>
              <div style={styles.eyebrow}>
                RONDA VALIDADA
              </div>

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
                    Pool total
                  </div>
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
                    Lado ganador
                  </div>
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
                    Lado perdedor
                  </div>
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
                    Distribuidos
                  </div>
                </div>
              </div>

              <div style={styles.pills}>
                <span style={styles.pill}>
                  3 predicciones
                </span>

                <span style={styles.pill}>
                  flujo on-chain
                </span>

                <span style={styles.pill}>
                  Localnet
                </span>
              </div>
            </div>
          </div>

          <div style={styles.checklist}>
            <h3>
              Ya implementado
            </h3>

            <div
              style={
                styles.checklistGrid
              }
            >
              {[
                "✓ Rondas on-chain",
                "✓ Predicciones on-chain",
                "✓ Cierre de ronda",
                "✓ Cuentas RoundResult",
                "✓ Cálculo de recompensas",
                "✓ Demo completa desde UI",
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
            ESTADO DEL PROYECTO
          </div>

          <h2 style={styles.sectionTitle}>
            Construido, probado y
            avanzando.
          </h2>

          <p style={styles.sectionText}>
            El núcleo del MVP ya funciona
            sobre Solana Localnet. El
            siguiente gran hito es el
            despliegue público y las
            pruebas en Devnet.
          </p>

          <div style={styles.statusGrid}>
            <div style={styles.statusBox}>
              <div style={styles.label}>
                MVP
              </div>

              <div style={styles.value}>
                ✓ Operativo
              </div>
            </div>

            <div style={styles.statusBox}>
              <div style={styles.label}>
                RED ACTUAL
              </div>

              <div style={styles.value}>
                ✓ Solana Localnet
              </div>
            </div>

            <div style={styles.statusBox}>
              <div style={styles.label}>
                SIGUIENTE RED
              </div>

              <div style={styles.value}>
                → Solana Devnet
              </div>
            </div>

            <div style={styles.statusBox}>
              <div style={styles.label}>
                RESOLUCIÓN
              </div>

              <div style={styles.value}>
                → Autoridad demo
              </div>
            </div>
          </div>

          <div style={styles.tech}>
            <div style={styles.eyebrow}>
              TECNOLOGÍA
            </div>

            <h3
              style={{
                fontSize: 24,
              }}
            >
              Construido con
            </h3>

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
            Lo que viene.
          </h2>

          <div style={styles.grid4}>
            {[
              [
                "01",
                "Devnet",
                "Desplegar y verificar Memedictions públicamente en Solana Devnet.",
              ],
              [
                "02",
                "Wallet flow",
                "Completar la experiencia pública de transacciones con Phantom.",
              ],
              [
                "03",
                "Oracle de precio",
                "Resolver rondas automáticamente mediante precios de mercado.",
              ],
              [
                "04",
                "Token SPL",
                "Pasar de puntos ficticios a staking y settlement con token de prueba.",
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
            Memecoins hoy.
            <br />
            Predicciones mañana.
          </h2>

          <p
            style={{
              color: "#bfb3c8",
              marginBottom: 30,
            }}
          >
            Construido sobre Solana.
          </p>

          <Link
            href="/"
            style={styles.button}
          >
            Probar el MVP
          </Link>
        </section>

        <footer style={styles.footer}>
          memedictions.fun · Construido
          sobre Solana · MVP en desarrollo
        </footer>
      </div>
    </main>
  );
}