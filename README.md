<<<<<<< HEAD
# memedictions
Memecoin prediction platform built on Solana, featuring transparent, verifiable UP/DOWN predictions and short-duration markets.
=======
# Memedictions

**Memedictions** es un proyecto construido sobre Solana para crear rondas de predicción relacionadas con memecoins.

Los usuarios pueden participar en una ronda eligiendo si el activo indicado subirá o bajará antes del cierre.

Actualmente Memedictions utiliza exclusivamente **puntos ficticios**.

No utiliza dinero real, no acepta apuestas reales y no realiza settlement con tokens o activos financieros reales.

---

## Estado actual

### Localnet

✅ **MVP funcional end-to-end**

El flujo completo ha sido implementado, desplegado y probado en Solana Localnet:

```text
Crear ronda
     ↓
Registrar predicción
     ↓
Esperar cierre
     ↓
Resolver ronda
     ↓
Registrar resultado
     ↓
Calcular recompensa
El MVP permite actualmente:
- Crear rondas on-chain.
- Definir una duración para cada ronda.
- Registrar predicciones on-chain.
- Elegir entre SUBE y BAJA.
- Registrar puntos ficticios asociados a una predicción.
- Utilizar el reloj de Solana para determinar el cierre.
- Impedir predicciones una vez cerrada la ronda.
- Resolver la ronda.
- Registrar el resultado on-chain.
- Consultar predicciones.
- Consultar rondas.
- Consultar resultados.
- Calcular recompensas proporcionalmente.
- Ejecutar el flujo completo desde la interfaz web.
El flujo Localnet ha sido probado satisfactoriamente de principio a fin.
Devnet

Infraestructura preparada — deployment pendiente
La aplicación ya contiene la infraestructura necesaria para comenzar las pruebas sobre Solana 

Actualmente están preparados:
- Conexión con Phantom.
- Lectura de saldo Devnet.
- Creación de rondas desde el navegador.
- Firma de transacciones mediante Phantom.
- Registro de predicciones.
- Preparación del cierre de rondas.
- Resolución de rondas.
- Envío de transacciones firmadas.
- Validación de existencia del programa.
- Validación de cuentas PDA.
- Validación del tiempo de cierre.
- Prevención de predicciones duplicadas.
- Consulta del resultado.

Las transacciones de Devnet siguen el modelo:
Frontend
   ↓
API /prepare
   ↓
Construcción de transacción sin firmar
   ↓
Phantom
   ↓
Firma del usuario
   ↓
API /send
   ↓
Solana Devnet

El contrato todavía no ha sido desplegado oficialmente en Devnet.
El deployment se realizará cuando exista suficiente SOL Devnet para cubrir de forma segura las cuentas necesarias, rent y fees asociados al despliegue.

Programa Solana
Program ID actual:
6ePYpybRkB9EBZetcprsxXuxZbVF2xv9qcBUgd6nahfy
El mismo Program ID está sincronizado entre:
- Anchor
- Rust
- IDL
- frontend
- configuración del proyecto

Arquitectura
Memedictions está compuesto principalmente por:
Smart contract
Desarrollado con:
- Rust
- Anchor
- Solana
Responsable de:
- creación de rondas;
- almacenamiento del estado;
- predicciones;
- cierre;
- resolución;
- resultados on-chain.
Frontend
Desarrollado con:
- Next.js
- TypeScript
- React
Responsable de:
- interfaz de usuario;
- conexión de wallets;
- creación de rondas;
- registro de predicciones;
- visualización de resultados;
- interacción con las APIs;
- interacción con Solana.
Wallet
La versión Devnet utiliza Phantom para:
- conectar la wallet;
- identificar al usuario;
- firmar transacciones;
- autorizar operaciones on-chain.
Las claves privadas del usuario no son manejadas por el servidor.

PDAs
El protocolo utiliza Program Derived Addresses para representar distintas cuentas del sistema.
["round", authority, round_id]

Prediction
["prediction", round, user]

Round Result
["round_result", round]

Sistema actual de predicción
Cada usuario selecciona una dirección:
SUBE
o
BAJA
y asigna una cantidad de puntos ficticios.

Ejemplo:
Usuario A → SUBE → 100 PTS
Usuario B → BAJA → 150 PTS
Usuario C → SUBE → 75 PTS

Una vez finalizada la ronda, la autoridad registra manualmente el resultado.

Recompensas
Actualmente las recompensas se calculan utilizando puntos ficticios.
Los usuarios que aciertan recuperan sus puntos originales y reciben proporcionalmente una parte del pool correspondiente a las predicciones perdedoras.

Conceptualmente:
Pool total ganador
+
Pool total perdedor
        ↓
Distribución proporcional
entre los ganadores

Si una ronda termina sin usuarios en el lado ganador, los puntos pueden ser retornados según la lógica actual del MVP.
No existe transferencia de dinero real.

Resolución de rondas
Actualmente el resultado de una ronda es declarado manualmente por la autoridad correspondiente.
Esto significa que la versión actual:
- no utiliza oracle;
- no consulta automáticamente precios externos;
- no determina automáticamente el resultado de mercado.
La resolución manual forma parte de la etapa MVP.

Oracles:

No implementados todavía
Una evolución futura del protocolo puede integrar un sistema de oracle para obtener precios verificables de forma automática..

Posibles funciones futuras:
Precio inicial
      ↓
Oracle
      ↓
Precio de cierre
      ↓
Comparación
      ↓
Resultado automático

La selección e integración del oracle se realizará en una etapa posterior.

Tokens
La versión actual no utiliza settlement con tokens SPL.
Los puntos utilizados dentro del MVP son ficticios y existen exclusivamente para probar:
- mecánica de predicción;
- distribución proporcional;
- comportamiento de rondas;
- experiencia de usuario.
No representan dinero, stablecoins ni activos intercambiables.

Landing
Memedictions incluye una landing independiente del MVP.

Ruta:
/landing

Su objetivo es presentar públicamente:
- el proyecto;
- su propuesta;
- el concepto;
- la evolución futura del protocolo.
La landing permanece separada de la interfaz utilizada para las pruebas técnicas.

Interfaz Localnet
El MVP principal de Localnet utiliza:
DemoRoundControl
desde la página principal.
Permite ejecutar visualmente el ciclo completo:
Create
→ Predict
→ Wait
→ Resolve
→ Result

Interfaz Devnet
La versión destinada a Devnet está disponible en:
/devnet
Incluye actualmente las etapas:
1. Wallet

2. Crear ronda Devnet

3. Registrar predicción

4. Resolver / cerrar ronda

5. Resultado

El flujo comenzará a utilizarse completamente una vez que el programa sea desplegado en Solana Devnet.

Seguridad
El diseño actual evita almacenar claves privadas de Phantom en el servidor.
La arquitectura de Devnet utiliza:
Servidor prepara transacción
        ↓
Navegador recibe transacción
        ↓
Phantom firma
        ↓
Transacción firmada
        ↓
Servidor transmite a Solana
La firma continúa bajo control de la wallet del usuario.

Limitaciones actuales
Memedictions continúa siendo un MVP experimental.
Actualmente:
- utiliza puntos ficticios;
- no utiliza dinero real;
- no utiliza tokens para settlement;
- no existe oracle automático;
- la resolución es manual;
- Devnet todavía está pendiente de deployment;
- Mainnet no está habilitado.

Roadmap inmediato:
Etapa 1 — Localnet
✅ Contrato funcional
✅ Crear ronda
✅ Registrar predicción
✅ Cerrar ronda
✅ Resolver ronda
✅ Resultado on-chain
✅ Cálculo de recompensas
✅ Interfaz completa
✅ Pruebas end-to-end  

Etapa 2 — Devnet
🟡 Obtener SOL Devnet suficiente
⬜ Deploy del programa
⬜ Verificar Program ID en Devnet
⬜ Crear primera ronda Devnet
⬜ Registrar primera predicción con Phantom
⬜ Esperar cierre real de la ronda
⬜ Resolver ronda
⬜ Verificar resultado
⬜ Verificar PDAs
⬜ Verificar firmas y transacciones en Solana Explorer  

Etapa 3 — Beta pública
⬜ Demo pública
⬜ Testers externos
⬜ Métricas de uso
⬜ Corrección de errores
⬜ Mejoras UX
⬜ Documentación para testers
⬜ Feedback de comunidad  

Etapa 4 — Automatización
⬜ Evaluación de oracle
⬜ Resolución automática
⬜ Datos de mercado verificables
⬜ Mayor descentralización del proceso de resolución  

Etapa 5 — Evolución del protocolo
Posibles áreas futuras de investigación:
- mercados adicionales;
- nuevos mecanismos de predicción;
- reputación de usuarios;
- estadísticas;
- rankings;
- mecanismos sociales;
- infraestructura de oracle;
- settlement SPL;
- escalabilidad;
- seguridad;
- gobernanza.
Estas características no forman parte todavía del MVP actual.

Próximo milestone
El siguiente objetivo técnico principal de Memedictions es:
DEPLOY COMPLETO EN SOLANA DEVNET
Después del deployment se ejecutará una prueba completa:
Deploy
   ↓
Create Round
   ↓
Connect Phantom
   ↓
Predict
   ↓
Wait
   ↓
Resolve
   ↓
Result
   ↓
Verify on Solana Explorer

Una vez completado este flujo, Memedictions tendrá una implementación funcional y públicamente verificable sobre Solana Devnet.

Disclaimer
Memedictions se encuentra actualmente en fase experimental.
La versión actual:
- no procesa dinero real;
- no procesa apuestas reales;
- no ofrece productos financieros;
- utiliza exclusivamente puntos ficticios;
- está destinada a desarrollo y pruebas.
Cualquier evolución futura que incorpore activos reales requerirá previamente una evaluación técnica, de seguridad y regulatoria adecuada.

Memedictions
Prediction markets for the memecoin generation.
Built on Solana..





>>>>>>> ca5552d (Prepare Memedictions Hackathon Testnet release)
