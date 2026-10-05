# Memedictions — Devnet Testing

Este documento define el procedimiento de validación de Memedictions sobre Solana Devnet.

La prueba Devnet debe ejecutarse únicamente después de que exista suficiente SOL Devnet para realizar el deployment y las transacciones necesarias con margen suficiente.

---

## Objetivo

Validar públicamente que el flujo completo de Memedictions funciona sobre Solana Devnet:

```text
Deploy
  ↓
Verificar programa
  ↓
Conectar Phantom
  ↓
Crear ronda
  ↓
Registrar predicción
  ↓
Esperar cierre
  ↓
Resolver
  ↓
Consultar resultado
  ↓
Verificar transacciones

La prueba utiliza exclusivamente puntos ficticios.
No se utilizan fondos reales ni settlement con tokens reales.

1. Verificar saldo Devnet
Wallet de deployment:HAv78VyWR7syQ6n9t9EGYnTdSY4LeDgnKZBktT6Exsgj

Comando: solana balance \
  HAv78VyWR7syQ6n9t9EGYnTdSY4LeDgnKZBktT6Exsgj \
  --url https://api.devnet.solana.com

  Antes del deployment debe existir saldo suficiente para:
- rent;
- deployment;
- creación de cuentas;
- fees;
- margen operativo.

2. Confirmar red.
solana config set --url https://api.devnet.solana.com

Comprobar: solana config get
Debe aparecer: RPC URL: https://api.devnet.solana.com

3. Entrar al contrato
Directorio WSL: cd ~/memedictions/memedictions-contract

4. Compilar
Ejecutar: anchor build

La compilación debe terminar sin errores.
No continuar si anchor build falla.

5. Verificar Program ID
Program ID esperado: 6ePYpybRkB9EBZetcprsxXuxZbVF2xv9qcBUgd6nahfy

Comprobar keypair:
solana address \
  -k target/deploy/memedictions_contract-keypair.json

  Debe devolver exactamente: 6ePYpybRkB9EBZetcprsxXuxZbVF2xv9qcBUgd6nahfy

  También deben coincidir:
- declare_id! en Rust;
- Anchor.toml;
- IDL;
- frontend;
- program keypair.
No realizar el deployment si existe cualquier diferencia.

6. Deployment en Devnet
El deployment se realizará únicamente cuando las verificaciones anteriores hayan pasado.
Después del deployment se debe guardar:
- Program ID;
- transaction signature;
- upgrade authority;
- saldo restante;
- información del programa.

7. Verificar programa

Ejecutar: solana program show \
  6ePYpybRkB9EBZetcprsxXuxZbVF2xv9qcBUgd6nahfy \
  --url https://api.devnet.solana.com

Validar:
- Program ID correcto;
- programa ejecutable;
- loader correcto;
- upgrade authority correcta;
- cuenta existente en Devnet.

8. Verificar frontend

Proyecto Windows: C:\Users\camil\Downloads\memedictions-localnet-ready\memedictions-localnet-ready

Ejecutar: npm.cmd run typecheck

Después: npm.cmd run build

Ambos deben terminar sin errores..

9. Abrir interfaz Devnet

Ruta: /devnet

La interfaz debe permitir:
1. Wallet
2. Crear ronda
3. Predicción
4. Resolver
5. Resultado

10. Conectar Phantom
Conectar Phantom desde el navegador.
Validar:
- wallet detectada;
- dirección correcta;
- balance visible;
- firma controlada por Phantom;
- ninguna private key almacenada por el servidor.

11. Crear primera ronda Devnet
Crear una ronda de prueba.

Ejemplo: Mercado: BONK
Duración: 1–3 minutos

12. Verificar Round PDA
La PDA de ronda utiliza: ["round", authority, round_id]

Confirmar que:
- la cuenta existe;
- pertenece al programa;
- contiene la información esperada;
- la authority coincide con la wallet que creó la ronda.

13. Registrar predicción
Desde Phantom: Dirección: SUBE o BAJA
Puntos: ficticios

Registrar:
- Prediction PDA;
- wallet;
- dirección;
- puntos;
- transaction signature.

14. Verificar Prediction PDA
La PDA utiliza: ["prediction", round, user]

Confirmar:
- existencia;
- ownership correcto;
- asociación con la ronda;
- asociación con el usuario;
- prevención de predicción duplicada.

15. Esperar cierre
La ronda debe permanecer abierta hasta el tiempo definido.
El cierre debe depender del reloj de Solana.
No resolver antes del closing time.

16. Resolver ronda
Después del cierre:
Resultado: SUBE o Resultado: BAJA

La resolución actual es manual y debe ejecutarse con la authority correspondiente.
No existe oracle automático en esta etapa.

17. Verificar RoundResult PDA
La PDA utiliza: ["round_result", round]

Confirmar:
- existencia;
- resultado correcto;
- asociación con la ronda;
- transaction signature;
- imposibilidad de resolver nuevamente la misma ronda.

18. Resultado del usuario
La interfaz debe mostrar: GANASTE o PERDISTE según:
predicción del usuario
vs.
resultado oficial
Los puntos continúan siendo ficticios.

19. Verificación en Solana Explorer
Comprobar al menos:
- deployment;
- creación de ronda;
- predicción;
- resolución.
Cada transacción debe poder consultarse públicamente en Devnet.

20. Criterio de éxito
Memedictions Devnet podrá considerarse validado cuando se complete sin errores:
Programa desplegado
✓

Programa verificable
✓

Phantom conectado
✓

Ronda creada
✓

Predicción registrada
✓

Closing time respetado
✓

Ronda resuelta
✓

Resultado registrado
✓

PDAs verificadas
✓

Transacciones visibles en Explorer
✓

Limitaciones de esta etapa
La versión Devnet sigue siendo experimental.

Actualmente:
- utiliza puntos ficticios;
- no utiliza fondos reales;
- no utiliza settlement SPL;
- no utiliza oracle automático;
- la resolución es manual;
- Mainnet no está habilitado.

Después de validar Devnet

Una vez completado satisfactoriamente el flujo Devnet:
1. Abrir beta a testers.
2. Recopilar feedback.
3. Medir errores y comportamiento.
4. Mejorar UX.
5. Evaluar integración de oracle.
6. Evaluar automatización de resultados.
7. Realizar auditoría técnica adicional.
8. Definir la siguiente fase del protocolo.

Regla principal
No avanzar a una fase posterior hasta que el flujo actual pueda repetirse de principio a fin de forma estable y verificable.


