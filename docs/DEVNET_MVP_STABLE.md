# Memedictions — Devnet MVP Stable

Fecha: 2026-10-01

## Estado validado

- Programa Memedictions desplegado en Solana Devnet
- Program ID:
  6ePYpybRkB9EBZetcprsxXuxZbVF2xv9qcBUgd6nahfy
- Programa confirmado on-chain como executable
- Frontend /devnet operativo
- Phantom conectado correctamente
- Wallet con SOL Devnet
- Creación de ronda on-chain validada
- Predicción SUBE/BAJA on-chain validada
- Cierre de ronda on-chain validado
- Resultado on-chain validado
- UI muestra GANASTE / PERDISTE
- RoundResult PDA generado
- Puntos utilizados son ficticios
- No se transfieren fondos reales

## Flujo validado

Phantom
→ Crear ronda
→ Firmar transacción
→ Ronda on-chain
→ Registrar predicción
→ Firmar transacción
→ Predicción on-chain
→ Esperar cierre
→ Resolver ronda
→ Resultado on-chain
→ Mostrar resultado

## Pendiente

- Pruebas con dos wallets distintas
- Pruebas multiusuario
- Robustez de Phantom
- Manejo de reconexión
- Mejor manejo de transacciones expiradas
- Pruebas repetidas de múltiples rondas
- Integración de precio/oracle real
- Automatización de resolución
- Auditoría de seguridad
- Mejoras UX
- Preparación para beta pública
