"use client";

import {

  useEffect,

  useState,

} from "react";

import {

  Connection,

  LAMPORTS_PER_SOL,

  PublicKey,
  Transaction,

} from "@solana/web3.js";

import {

  Buffer,

} from "buffer";

import {

  phantom,

} from "@/lib/devnet-prediction";

const DEVNET_RPC =
  "https://api.devnet.solana.com";

const V2_PROGRAM_ID =
  "6ePYpybRkB9EBZetcprsxXuxZbVF2xv9qcBUgd6nahfy";

type Direction =

  | "SUBE"

  | "BAJA";

type Outcome =

  | "SUBE"

  | "BAJA"

  | "VOID";

interface PrepareRoundResponse {

  ok: boolean;

  error?: string;

  code?: string;

  transaction?: string;

  roundAddress?: string;

  roundId?: string;

  blockhash?: string;

  lastValidBlockHeight?: number;

  programId?: string;

  network?: string;

  market?: string;

  chainTime?: number;

  closingTime?: number;

  openingPrice?: number;

  openingPriceTimestamp?: number;

}

interface SendRoundResponse {

  ok: boolean;

  error?: string;

  signature?: string;

  network?: string;

}

interface PreparePredictionResponse {

  ok: boolean;

  error?: string;

  code?: string;

  transaction?: string;

  predictionAddress?: string;

  blockhash?: string;

  lastValidBlockHeight?: number;

  programId?: string;

  network?: string;

}

interface SendPredictionResponse {

  ok: boolean;

  error?: string;

  signature?: string;

  network?: string;

}

interface PrepareCloseResponse {

  ok: boolean;

  error?: string;

  code?: string;

  transaction?: string;

  roundAddress?: string;

  resultAddress?: string;

  blockhash?: string;

  lastValidBlockHeight?: number;

  programId?: string;

  network?: string;

  closingPrice?: number;

  closingPriceTimestamp?: number;

  chainTime?: number;

  closingTime?: number;

}

interface SendCloseResponse {

  ok: boolean;

  error?: string;

  signature?: string;

  network?: string;

}


interface DevnetStateResponse {
  ok: boolean;
  error?: string;

  round?: {
    address: string;
    market: string;
    roundId: string;
    authority: string;
    openingPrice: number;
    openingPriceTimestamp: number;
    closingTime: number;
    isOpen: boolean | null;
  };

  wallet?: string | null;

  prediction?: {
    address: string;
    direction: Direction;
    points: number;
  } | null;

  result?: {
    address: string;
    openingPrice: number;
    closingPrice: number;
    closingPriceTimestamp: number;
    outcome: Direction;
  } | null;

  chainTime?: number | null;
}

function explorerAccountUrl(
  address: string
) {
  return (
    "https://explorer.solana.com/address/" +
    encodeURIComponent(address) +
    "?cluster=devnet"
  );
}

function explorerTransactionUrl(
  signature: string
) {
  return (
    "https://explorer.solana.com/tx/" +
    encodeURIComponent(signature) +
    "?cluster=devnet"
  );
}

function activeRoundStorageKey(
  wallet: string
) {
  return (
    "memedictions.hackathon.test.activeRound." +
    wallet
  );
}

export default function DevnetPage() {

  const [programDeployed, setProgramDeployed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkProgramDeployment = async () => {
      try {
        const connection = new Connection(
          DEVNET_RPC,
          "confirmed"
        );

        const programId = new PublicKey(
          V2_PROGRAM_ID
        );

        const accountInfo = await connection.getAccountInfo(
          programId,
          "confirmed"
        );

        if (!cancelled) {
          setProgramDeployed(Boolean(accountInfo?.executable));
        }
      } catch (error) {
        console.error(
          "No se pudo verificar Memedictions en Devnet:",
          error
        );

        if (!cancelled) {
          setProgramDeployed(false);
        }
      }
    };

    void checkProgramDeployment();

    return () => {
      cancelled = true;
    };
  }, []);


  /*

   * ===================================

   * WALLET

   * ===================================

   */

  const [

    walletAddress,

    setWalletAddress,

  ] = useState("");

  const [

    balance,

    setBalance,

  ] =

    useState<number | null>(

      null

    );

  const [

    balanceLoading,

    setBalanceLoading,

  ] = useState(false);

  const [

    connecting,

    setConnecting,

  ] = useState(false);

  /*

   * ===================================

   * RONDA

   * ===================================

   */

  const [

    market,

    setMarket,

  ] = useState(

    "BONK"

  );

  const [

    durationSeconds,

    setDurationSeconds,

  ] = useState(

    180

  );

  const [

    openingPrice,

    setOpeningPrice,

  ] = useState(

    100

  );

  const [

    closingPrice,

    setClosingPrice,

  ] = useState(

    110

  );

  const [

    roundAddress,

    setRoundAddress,

  ] = useState("");

  const [

    roundId,

    setRoundId,

  ] = useState("");

  const [

    roundClosingTime,

    setRoundClosingTime,

  ] =

    useState<number | null>(

      null

    );

  const [

    roundPreparing,

    setRoundPreparing,

  ] = useState(false);

  const [

    roundSending,

    setRoundSending,

  ] = useState(false);

  const [

    roundSignature,

    setRoundSignature,

  ] = useState("");

  const [

    preparedRound,

    setPreparedRound,

  ] = useState<{
    transaction: string;
    blockhash: string;
    lastValidBlockHeight: number;
    roundAddress: string;
    roundId: string;
    closingTime: number;
  } | null>(null);


  /*

   * ===================================

   * PREDICCIÓN

   * ===================================

   */

  const [

    direction,

    setDirection,

  ] =

    useState<Direction>(

      "SUBE"

    );

  const [

    points,

    setPoints,

  ] = useState(

    100

  );

  const [

    predictionPreparing,

    setPredictionPreparing,

  ] = useState(false);

  const [

    predictionSending,

    setPredictionSending,

  ] = useState(false);

  const [

    predictionAddress,

    setPredictionAddress,

  ] = useState("");

  const [

    predictionSignature,

    setPredictionSignature,

  ] = useState("");

  /*

   * ===================================

   * RESOLUCIÓN

   * ===================================

   */


  const [

    closePreparing,

    setClosePreparing,

  ] = useState(false);

  const [

    closeSending,

    setCloseSending,

  ] = useState(false);

  const [

    resultAddress,

    setResultAddress,

  ] = useState("");

  const [

    resultSignature,

    setResultSignature,

  ] = useState("");

  const [

    resolvedOutcome,

    setResolvedOutcome,

  ] =

    useState<Outcome | null>(

      null

    );

  /*
   * ===================================
   * CICLO AUTOMÁTICO
   * ===================================
   */

  const [
    nextRoundCountdown,
    setNextRoundCountdown,
  ] = useState<number | null>(
    null
  );

  function resetPredictionCycle() {
    if (walletAddress) {
      window.localStorage.removeItem(
        activeRoundStorageKey(
          walletAddress
        )
      );
    }

    setRoundAddress("");
    setRoundId("");
    setRoundClosingTime(null);
    setRoundSignature("");
    setPreparedRound(null);

    setPredictionAddress("");
    setPredictionSignature("");

    setResultAddress("");
    setResultSignature("");
    setResolvedOutcome(null);

    setRoundPreparing(false);
    setRoundSending(false);
    setPredictionPreparing(false);
    setPredictionSending(false);
    setClosePreparing(false);
    setCloseSending(false);

    setErrorMessage("");
    setMessage(
      "Nueva ronda lista. La wallet continúa conectada."
    );

    setNextRoundCountdown(null);
  }

  useEffect(() => {
    if (nextRoundCountdown === null) {
      return;
    }

    if (nextRoundCountdown <= 0) {
      resetPredictionCycle();
      return;
    }

    const timer =
      window.setTimeout(() => {
        setNextRoundCountdown(
          (current) =>
            current === null
              ? null
              : current - 1
        );
      }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [nextRoundCountdown]);

  /*

   * ===================================

   * RELOJ

   * ===================================

   */

  const [

    now,

    setNow,

  ] = useState(

    Math.floor(

      Date.now() / 1000

    )

  );

  useEffect(() => {

    const timer =

      window.setInterval(

        () => {

          setNow(

            Math.floor(

              Date.now() / 1000

            )

          );

        },

        1000

      );

    return () => {

      window.clearInterval(

        timer

      );

    };

  }, []);

  /*
   * ===================================
   * RECUPERACIÓN ON-CHAIN
   * ===================================
   */

  useEffect(() => {
    if (!walletAddress) {
      return;
    }

    const savedRound =
      window.localStorage.getItem(
        activeRoundStorageKey(
          walletAddress
        )
      );

    if (!savedRound) {
      return;
    }

    void recoverDevnetState(
      savedRound,
      walletAddress
    );
  }, [walletAddress]);

  useEffect(() => {
    if (
      !walletAddress ||
      !roundAddress
    ) {
      return;
    }

    void recoverDevnetState(
      roundAddress,
      walletAddress
    );
  }, [
    walletAddress,
    roundAddress,
  ]);

  /*

   * ===================================

   * MENSAJES

   * ===================================

   */

  const [

    message,

    setMessage,

  ] = useState("");

  const [

    errorMessage,

    setErrorMessage,

  ] = useState("");

  /*

   * ===================================

   * BALANCE

   * ===================================

   */

  async function recoverDevnetState(
    targetRound: string,
    targetWallet?: string
  ) {
    try {
      const params =
        new URLSearchParams({
          round: targetRound,
        });

      if (targetWallet) {
        params.set(
          "wallet",
          targetWallet
        );
      }

      const response =
        await fetch(
          `/api/test/state?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

      const data =
        (await response.json()) as DevnetStateResponse;

      if (
        !response.ok ||
        !data.ok ||
        !data.round
      ) {
        throw new Error(
          data.error ||
          "No se pudo recuperar la ronda desde Devnet."
        );
      }

      /*
       * La ronda viene de Solana.
       */
      setRoundAddress(
        data.round.address
      );

      setRoundId(
        data.round.roundId
      );

      setMarket(
        data.round.market
      );

      setOpeningPrice(
        data.round.openingPrice
      );

      setRoundClosingTime(
        data.round.closingTime
      );

      /*
       * La predicción pertenece
       * específicamente a la wallet
       * actualmente conectada.
       */
      if (data.prediction) {

        setPredictionAddress(
          data.prediction.address
        );

        setDirection(
          data.prediction.direction
        );

        setPoints(
          data.prediction.points
        );

      } else {

        setPredictionAddress("");
        setPredictionSignature("");

      }

      /*
       * El resultado pertenece a
       * la ronda completa.
       */
      if (data.result) {

        setResultAddress(
          data.result.address
        );

        setClosingPrice(
          data.result.closingPrice
        );

        setResolvedOutcome(
          data.result.outcome
        );

      } else {

        setResultAddress("");
        setResultSignature("");
        setResolvedOutcome(null);

      }

      if (targetWallet) {
        window.localStorage.setItem(
          activeRoundStorageKey(
            targetWallet
          ),
          data.round.address
        );
      }

      return data;

    } catch (error) {

      console.error(
        "V2_DEVNET_STATE_RECOVERY_ERROR",
        error
      );

      return null;
    }
  }

  async function loadBalance(
    addressOverride?: string
  ) {

    const provider =
      phantom();

    const address =
      typeof addressOverride === "string"
        ? addressOverride
        : walletAddress ||
          provider?.publicKey?.toBase58();

    if (!address) {
      setBalance(null);
      return;
    }

    try {
      setBalanceLoading(true);
      setErrorMessage("");

      console.log(
        "V2_DEVNET_BALANCE_API_CHECK",
        {
          wallet: address,
        }
      );

      const response =
        await fetch(
          `/api/test/balance?address=${encodeURIComponent(
            address
          )}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data?.ok ||
        typeof data?.sol !== "number"
      ) {
        throw new Error(
          data?.error ||
          "No se pudo consultar el saldo Devnet."
        );
      }

      console.log(
        "V2_DEVNET_BALANCE_API_RESULT",
        data
      );

      setBalance(data.sol);

    } catch (error) {

      console.error(
        "V2_DEVNET_BALANCE_ERROR",
        error
      );

      setBalance(null);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo consultar el saldo Devnet."
      );

    } finally {

      setBalanceLoading(false);

    }

  }

  /*

   * ===================================

   * CONECTAR PHANTOM

   * ===================================

   */

  async function connectWallet() {

    try {

      setConnecting(

        true

      );

      setMessage("");

      setErrorMessage("");

      const provider =

        phantom();

      if (!provider) {

        throw new Error(

          "Phantom no está disponible en este navegador."

        );

      }

      const result =

        await provider.connect();

      const address =

        result.publicKey

          .toBase58();

      setWalletAddress(

        address

      );

      setMessage(

        "Wallet conectada correctamente."

      );

      await loadBalance(address);

    } catch (error) {

      console.error(

        "V2_DEVNET_CONNECT_ERROR",

        error

      );

      setErrorMessage(

        error instanceof Error

          ? error.message

          : "No se pudo conectar Phantom."

      );

    } finally {

      setConnecting(

        false

      );

    }

  }

  /*

   * ===================================

   * DESCONECTAR

   * ===================================

   */

  async function disconnectWallet() {

    try {

      const provider =

        phantom();

      if (provider) {

        await provider.disconnect();

      }

      setWalletAddress("");

      setBalance(null);

      // La ronda pertenece al estado de Memedictions,
      // no a la sesión de una wallet concreta.
      // No borramos roundAddress, roundId ni closingTime
      // al cambiar de usuario.

      setPredictionAddress("");

      setPredictionSignature("");

      // El resultado pertenece a la ronda,
      // no a la wallet conectada.
      // Se conserva al cambiar de usuario.

      setMessage(

        "Phantom desconectado."

      );

      setErrorMessage("");

    } catch (error) {

      console.error(

        "V2_DEVNET_DISCONNECT_ERROR",

        error

      );

      setErrorMessage(

        error instanceof Error

          ? error.message

          : "No se pudo desconectar Phantom."

      );

    }

  }

  /*

   * ===================================

   * CREAR RONDA

   * ===================================

   */

  async function createRound() {

    const provider =

      phantom();

    if (!provider) {
      setErrorMessage(
        "Phantom no está disponible en este navegador."
      );
      return;
    }

    let authorityAddress = "";

    /*
     * Revalidamos la sesión antes de preparar
     * una transacción. Phantom puede conservar
     * publicKey aunque la sesión de firma haya
     * quedado inactiva.
     */
    try {
      const session =
        await provider.connect();

      if (!session.publicKey) {
        throw new Error(
          "Phantom no devolvió una wallet activa."
        );
      }

      const activeAddress =
        session.publicKey.toBase58();

      authorityAddress =
        activeAddress;

      if (
        walletAddress !== activeAddress
      ) {
        setWalletAddress(
          activeAddress
        );

        await loadBalance(
          activeAddress
        );
      }
    } catch (error) {
      console.error(
        "V2_DEVNET_PHANTOM_SESSION_ERROR",
        error
      );

      setErrorMessage(
        "No se pudo confirmar la sesión de Phantom. Vuelve a intentarlo."
      );

      return;
    }

    if (

      !/^[A-Z0-9]{2,16}$/.test(

        market

      )

    ) {

      setErrorMessage(

        "El mercado debe contener entre 2 y 16 caracteres."

      );

      return;

    }

    if (

      !Number.isSafeInteger(

        durationSeconds

      ) ||

      durationSeconds < 15 ||

      durationSeconds > 3600

    ) {

      setErrorMessage(

        "La duración de la ronda no es válida."

      );

      return;

    }

    if (
      !Number.isSafeInteger(openingPrice) ||
      openingPrice <= 0
    ) {
      setErrorMessage(
        "El precio inicial debe ser un entero positivo."
      );

      return;
    }

    if (

      balance === null ||

      balance <= 0

    ) {

      setErrorMessage(

        "La wallet no tiene SOL Devnet."

      );

      return;

    }

    try {

      setMessage("");

      setErrorMessage("");

      setRoundAddress("");

      setRoundId("");

      setRoundClosingTime(null);

      setRoundSignature("");

      setPredictionAddress("");

      setPredictionSignature("");

      setResultAddress("");

      setResultSignature("");

      setResolvedOutcome(null);

      setRoundPreparing(

        true

      );

      const prepareResponse =

        await fetch(

          "/api/test/round/prepare",

          {

            method:

              "POST",

            headers: {

              "Content-Type":

                "application/json",

            },

            body:

              JSON.stringify({

                authority:

                  authorityAddress,

                market,

                durationSeconds,

                openingPrice,

              }),

          }

        );

      const prepared =

        await prepareResponse

          .json() as PrepareRoundResponse;

      if (

        !prepareResponse.ok ||

        !prepared.ok

      ) {

        if (

          prepared.code ===

          "V2_DEVNET_PROGRAM_NOT_DEPLOYED"

        ) {

          throw new Error(

            "El contrato Memedictions todavía no está desplegado en Devnet."

          );

        }

        throw new Error(

          prepared.error ||

          "No se pudo preparar la ronda Devnet."

        );

      }

      if (

        !prepared.transaction ||

        !prepared.blockhash ||

        prepared

          .lastValidBlockHeight ===

          undefined ||

        !prepared.roundAddress ||

        !prepared.roundId ||

        prepared.closingTime ===

          undefined

      ) {

        throw new Error(

          "La respuesta de preparación de ronda está incompleta."

        );

      }

      setRoundPreparing(
        false
      );

      setPreparedRound({
        transaction:
          prepared.transaction,
        blockhash:
          prepared.blockhash,
        lastValidBlockHeight:
          prepared.lastValidBlockHeight,
        roundAddress:
          prepared.roundAddress,
        roundId:
          prepared.roundId,
        closingTime:
          prepared.closingTime,
      });

      console.log(
        "V2_DEVNET_ROUND_PREPARED_OK",
        {
          transactionLength:
            prepared.transaction.length,
          blockhash:
            prepared.blockhash,
          roundAddress:
            prepared.roundAddress,
        }
      );

      setMessage(
        "Ronda preparada. Firma con Phantom para crearla en Devnet."
      );

    } catch (error) {

      console.error(

        "V2_DEVNET_CREATE_ROUND_ERROR",

        error

      );

      setErrorMessage(

        error instanceof Error

          ? error.message

          : "No se pudo crear la ronda Devnet."

      );

    } finally {

      setRoundPreparing(

        false

      );

      setRoundSending(
        false
      );

    }

  }

  /*

   * ===================================

   * REGISTRAR PREDICCIÓN

   * ===================================

   */

  async function signPreparedRound() {

    const provider =
      phantom();

    if (!provider) {
      setErrorMessage(
        "Phantom no está disponible."
      );
      return;
    }

    if (
      !provider.publicKey
    ) {
      setErrorMessage(
        "Conecta Phantom primero."
      );
      return;
    }

    if (
      !provider.signAndSendTransaction
    ) {
      setErrorMessage(
        "Esta versión de Phantom no permite firmar y enviar la transacción."
      );
      return;
    }

    if (!preparedRound) {
      setErrorMessage(
        "Primero prepara la ronda."
      );
      return;
    }

    try {

      setMessage("");
      setErrorMessage("");
      setRoundSending(true);

      const transaction =
        Transaction.from(
          Buffer.from(
            preparedRound.transaction,
            "base64"
          )
        );

      console.log(
        "V2_DEVNET_ROUND_REQUESTING_PHANTOM_SIGN_AND_SEND"
      );

      const result =
        await provider
          .signAndSendTransaction(
            transaction
          );

      if (
        !result ||
        !result.signature
      ) {
        throw new Error(
          "Phantom no devolvió una firma de transacción."
        );
      }

      console.log(
        "V2_DEVNET_ROUND_PHANTOM_SENT",
        {
          signature:
            result.signature,
          roundAddress:
            preparedRound.roundAddress,
        }
      );

      setRoundAddress(
        preparedRound.roundAddress
      );

      window.localStorage.setItem(
        activeRoundStorageKey(
          provider.publicKey.toBase58()
        ),
        preparedRound.roundAddress
      );

      setRoundId(
        preparedRound.roundId
      );

      setRoundClosingTime(
        preparedRound.closingTime
      );

      setRoundSignature(
        result.signature
      );

      setPreparedRound(null);

      setMessage(
        "Ronda de prueba creada correctamente en Solana Devnet."
      );

      await loadBalance();

    } catch (error) {

      console.error(
        "V2_DEVNET_CREATE_ROUND_ERROR",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo crear la ronda Devnet."
      );

    } finally {

      setRoundSending(false);

    }

  }

  async function submitPrediction() {

    const provider =

      phantom();

    if (

      !provider ||

      !provider.publicKey

    ) {

      setErrorMessage(

        "Conecta Phantom primero."

      );

      return;

    }

    if (!roundAddress) {

      setErrorMessage(

        "Primero debes crear una ronda Devnet."

      );

      return;

    }

    if (

      !Number.isSafeInteger(

        points

      ) ||

      points < 1 ||

      points > 10000

    ) {

      setErrorMessage(

        "Los puntos deben estar entre 1 y 10.000."

      );

      return;

    }

    if (

      balance === null ||

      balance <= 0

    ) {

      setErrorMessage(

        "La wallet no tiene SOL Devnet."

      );

      return;

    }

    try {

      setMessage("");

      setErrorMessage("");

      setPredictionAddress("");

      setPredictionSignature("");

      setPredictionPreparing(

        true

      );

      const prepareResponse =

        await fetch(

          "/api/test/prediction/prepare",

          {

            method:

              "POST",

            headers: {

              "Content-Type":

                "application/json",

            },

            body:

              JSON.stringify({

                round:

                  roundAddress,

                user:

                  provider.publicKey.toBase58(),

                direction,

                points,

              }),

          }

        );

      const prepared =

        await prepareResponse

          .json() as PreparePredictionResponse;

      if (

        !prepareResponse.ok ||

        !prepared.ok

      ) {

        if (

          prepared.code ===

          "V2_DEVNET_PROGRAM_NOT_DEPLOYED"

        ) {

          throw new Error(

            "El contrato Memedictions todavía no está desplegado en Devnet."

          );

        }

        throw new Error(

          prepared.error ||

          "No se pudo preparar la predicción Devnet."

        );

      }

      if (

        !prepared.transaction ||

        !prepared.blockhash ||

        prepared

          .lastValidBlockHeight ===

          undefined

      ) {

        throw new Error(

          "La respuesta de preparación de predicción está incompleta."

        );

      }

      setPredictionPreparing(

        false

      );

      setPredictionSending(

        true

      );

      const unsignedTransaction =
        Transaction.from(
          Buffer.from(
            prepared.transaction,
            "base64"
          )
        );

      const signedTransaction =
        await provider.signTransaction(
          unsignedTransaction
        );

      const signedTransactionBase64 =
        Buffer.from(
          signedTransaction.serialize()
        ).toString("base64");

      console.log(
        "V2_DEVNET_PREDICTION_PHANTOM_SIGNED",
        {
          user:
            provider.publicKey.toBase58(),
          predictionAddress:
            prepared.predictionAddress,
        }
      );

      const sendResponse =

        await fetch(

          "/api/test/prediction/send",

          {

            method:

              "POST",

            headers: {

              "Content-Type":

                "application/json",

            },

            body:

              JSON.stringify({

                transaction:

                  signedTransactionBase64,

                blockhash:

                  prepared.blockhash,

                lastValidBlockHeight:

                  prepared

                    .lastValidBlockHeight,

              }),

          }

        );

      const sent =

        await sendResponse

          .json() as SendPredictionResponse;

      if (

        !sendResponse.ok ||

        !sent.ok ||

        !sent.signature

      ) {

        throw new Error(

          sent.error ||

          "No se pudo enviar la predicción Devnet."

        );

      }

      setPredictionAddress(

        prepared.predictionAddress ||

        ""

      );

      setPredictionSignature(

        sent.signature

      );

      setMessage(

        "Predicción registrada correctamente en Solana Devnet."

      );

      await loadBalance();

    } catch (error) {

      console.error(

        "V2_DEVNET_PREDICTION_ERROR",

        error

      );

      setErrorMessage(

        error instanceof Error

          ? error.message

          : "No se pudo registrar la predicción."

      );

    } finally {

      setPredictionPreparing(

        false

      );

      setPredictionSending(

        false

      );

    }

  }

  /*

   * ===================================

   * RESOLVER RONDA

   * ===================================

   */

  async function resolveRound() {

    const provider =

      phantom();

    if (

      !provider ||

      !provider.publicKey

    ) {

      setErrorMessage(

        "Conecta Phantom primero."

      );

      return;

    }

    if (!roundAddress) {

      setErrorMessage(

        "No existe una ronda Devnet para resolver."

      );

      return;

    }

    if (
      !Number.isSafeInteger(closingPrice) ||
      closingPrice <= 0
    ) {
      setErrorMessage(
        "El precio final debe ser un entero positivo."
      );

      return;
    }

    if (

      balance === null ||

      balance <= 0

    ) {

      setErrorMessage(

        "La wallet no tiene SOL Devnet."

      );

      return;

    }

    try {

      setMessage("");

      setErrorMessage("");

      setResultAddress("");

      setResultSignature("");

      setClosePreparing(

        true

      );

      const prepareResponse =

        await fetch(

          "/api/test/round/close/prepare",

          {

            method:

              "POST",

            headers: {

              "Content-Type":

                "application/json",

            },

            body:

              JSON.stringify({

                round:

                  roundAddress,

                authority:

                  provider.publicKey.toBase58(),

                closingPrice,

              }),

          }

        );

      const prepared =

        await prepareResponse

          .json() as PrepareCloseResponse;

      if (

        !prepareResponse.ok ||

        !prepared.ok

      ) {

        if (

          prepared.code ===

          "V2_DEVNET_PROGRAM_NOT_DEPLOYED"

        ) {

          throw new Error(

            "El contrato Memedictions todavía no está desplegado en Devnet."

          );

        }

        if (

          prepared.code ===

          "ROUND_NOT_FINISHED"

        ) {

          throw new Error(

            "La ronda todavía no terminó según el reloj de Solana. Espera unos segundos y vuelve a intentarlo."

          );

        }

        if (

          prepared.code ===

          "ROUND_ALREADY_RESOLVED"

        ) {

          throw new Error(

            "Esta ronda ya fue resuelta on-chain."

          );

        }

        throw new Error(

          prepared.error ||

          "No se pudo preparar la resolución Devnet."

        );

      }

      if (

        !prepared.transaction ||

        !prepared.blockhash ||

        prepared

          .lastValidBlockHeight ===

          undefined ||

        !prepared.resultAddress

      ) {

        throw new Error(

          "La respuesta de resolución está incompleta."

        );

      }

      setClosePreparing(

        false

      );

      setCloseSending(

        true

      );

      const unsignedTransaction =
        Transaction.from(
          Buffer.from(
            prepared.transaction,
            "base64"
          )
        );

      const signedTransaction =
        await provider.signTransaction(
          unsignedTransaction
        );

      const signedTransactionBase64 =
        Buffer.from(
          signedTransaction.serialize()
        ).toString("base64");

      console.log(
        "V2_DEVNET_CLOSE_PHANTOM_SIGNED",
        {
          authority:
            provider.publicKey.toBase58(),
          resultAddress:
            prepared.resultAddress,
        }
      );

      const sendResponse =

        await fetch(

          "/api/test/round/close/send",

          {

            method:

              "POST",

            headers: {

              "Content-Type":

                "application/json",

            },

            body:

              JSON.stringify({

                transaction:

                  signedTransactionBase64,

                blockhash:

                  prepared.blockhash,

                lastValidBlockHeight:

                  prepared

                    .lastValidBlockHeight,

              }),

          }

        );

      const sent =

        await sendResponse

          .json() as SendCloseResponse;

      if (

        !sendResponse.ok ||

        !sent.ok ||

        !sent.signature

      ) {

        throw new Error(

          sent.error ||

          "No se pudo resolver la ronda en Devnet."

        );

      }

      setResultAddress(

        prepared.resultAddress

      );

      setResultSignature(

        sent.signature

      );

      setMessage(

        "Ronda resuelta correctamente en Solana Devnet."

      );

      await loadBalance();

      await recoverDevnetState(
        roundAddress,
        provider.publicKey.toBase58()
      );

      setNextRoundCountdown(5);

    } catch (error) {

      console.error(

        "V2_DEVNET_RESOLVE_ERROR",

        error

      );

      setErrorMessage(

        error instanceof Error

          ? error.message

          : "No se pudo resolver la ronda Devnet."

      );

    } finally {

      setClosePreparing(

        false

      );

      setCloseSending(

        false

      );

    }

  }

  /*

   * ===================================

   * ESTADOS DERIVADOS

   * ===================================

   */

  const hasBalance =

    balance !== null &&

    balance > 0;

  const walletReady =

    Boolean(

      walletAddress

    );

  const roundReady =

    Boolean(

      roundAddress

    );

  const predictionReady =

    Boolean(

      predictionAddress

    );

  const resultReady =

    Boolean(

      resultAddress

    ) &&

    resolvedOutcome !==

      null;

  const remainingSeconds =

    roundClosingTime ===

    null

      ? null

      : Math.max(

          0,

          roundClosingTime -

            now

        );

  const roundExpired =

    roundClosingTime !==

      null &&

    remainingSeconds === 0;

  const resultVoid =

    resolvedOutcome ===

      "VOID";

  const userWon =

    resolvedOutcome !==

      null &&

    !resultVoid &&

    predictionReady &&

    direction ===

      resolvedOutcome;

  function formatRemainingTime(

    seconds: number

  ) {

    const minutes =

      Math.floor(

        seconds / 60

      );

    const rest =

      seconds % 60;

    return `${minutes}m ${rest

      .toString()

      .padStart(

        2,

        "0"

      )}s`;

  }

  /*

   * ===================================

   * UI

   * ===================================

   */

  const completedSteps = [
    walletReady,
    hasBalance,
    roundReady,
    predictionReady,
    resultReady,
    programDeployed,
  ].filter(Boolean).length;

  const totalSteps = 6;

  const flowCompleted =
    completedSteps === totalSteps;

  const progressPercent =
    (completedSteps / totalSteps) * 100;

  const cardStyle = {
    marginTop: 24,
    padding: 24,
    borderRadius: 20,
    border: "1px solid rgba(169, 139, 255, 0.22)",
    background: "linear-gradient(180deg, rgba(29, 23, 40, 0.96), rgba(20, 16, 30, 0.96))",
    boxShadow: "0 18px 50px rgba(0, 0, 0, 0.22)",
  } as const;

  const mutedTextStyle = {
    color: "#bbb2c8",
    lineHeight: 1.7,
  } as const;

  const monoBoxStyle = {
    marginTop: 10,
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(169, 139, 255, 0.18)",
    background: "rgba(10, 8, 15, 0.55)",
    color: "#cbb9ff",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 13,
    overflowWrap: "anywhere",
  } as const;

  const inputStyle = {
    display: "block",
    width: "100%",
    padding: "13px 14px",
    marginTop: 8,
    boxSizing: "border-box",
    borderRadius: 12,
    border: "1px solid #4a395e",
    background: "#120f1a",
    color: "#ffffff",
    outline: "none",
  } as const;

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #281b3d 0%, #120f1a 38%, #0c0a11 100%)",
        color: "#ffffff",
        padding: "48px 20px 72px",
      }}
    >
      <div
        style={{
          maxWidth: 1040,
          margin: "0 auto",
        }}
      >
        <header
          style={{
            padding: "28px 28px 24px",
            borderRadius: 24,
            border: "1px solid rgba(169, 139, 255, 0.25)",
            background:
              "linear-gradient(135deg, rgba(38, 26, 58, 0.96), rgba(20, 16, 30, 0.96))",
            boxShadow: "0 24px 70px rgba(0, 0, 0, 0.28)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  color: "#a98bff",
                  fontWeight: 900,
                  fontSize: 12,
                  letterSpacing: ".16em",
                }}
              >
                MEMEDICTIONS · HACKATHON TESTNET
              </div>

              <h1
                style={{
                  margin: "10px 0 8px",
                  fontSize: "clamp(32px, 6vw, 54px)",
                  lineHeight: 1,
                  letterSpacing: "-.03em",
                }}
              >
                Predice. Firma. Verifica on-chain.
              </h1>

              <p
                style={{
                  ...mutedTextStyle,
                  maxWidth: 760,
                  margin: 0,
                  fontSize: 16,
                  lineHeight: 1.6,
                }}
              >
                Entorno público de pruebas de Memedictions sobre Solana Devnet.
                Crea una ronda, registra tu predicción y verifica el resultado
                directamente on-chain.
              </p>

              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    padding: "7px 10px",
                    borderRadius: 999,
                    background: "rgba(169,139,255,.10)",
                    border: "1px solid rgba(169,139,255,.28)",
                    color: "#c8b9ff",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  SOLANA DEVNET
                </span>

                <span
                  style={{
                    padding: "7px 10px",
                    borderRadius: 999,
                    background: "rgba(99,230,169,.08)",
                    border: "1px solid rgba(99,230,169,.22)",
                    color: "#8fffc9",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  PTS FICTICIOS
                </span>

                <span
                  style={{
                    padding: "7px 10px",
                    borderRadius: 999,
                    background: "rgba(255,130,159,.08)",
                    border: "1px solid rgba(255,130,159,.22)",
                    color: "#ffabc0",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  SIN FONDOS REALES
                </span>
              </div>
            </div>

            <div
              style={{
                padding: "10px 14px",
                borderRadius: 999,
                border: "1px solid #765425",
                background: "#2c2115",
                color: "#ffcf88",
                fontSize: 13,
                fontWeight: 800,
                whiteSpace: "nowrap",
              }}
            >
              {programDeployed
                  ? "DEVNET · Contrato desplegado"
                  : "DEVNET · Contrato pendiente"}
            </div>
          </div>

          <div
            style={{
              marginTop: 24,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            <div
              style={{
                padding: 16,
                borderRadius: 16,
                background: "rgba(8, 7, 12, 0.42)",
                border: "1px solid rgba(255,255,255,.06)",
              }}
            >
              <div style={{ color: "#8f879a", fontSize: 12 }}>RED</div>
              <strong>Solana Devnet</strong>
            </div>

            <div
              style={{
                padding: 16,
                borderRadius: 16,
                background: "rgba(8, 7, 12, 0.42)",
                border: "1px solid rgba(255,255,255,.06)",
              }}
            >
              <div style={{ color: "#8f879a", fontSize: 12 }}>PROGRESO</div>
              <strong>{completedSteps}/{totalSteps} etapas completadas</strong>
            </div>

            <div
              style={{
                padding: 16,
                borderRadius: 16,
                background: "rgba(8, 7, 12, 0.42)",
                border: "1px solid rgba(255,255,255,.06)",
              }}
            >
              <div style={{ color: "#8f879a", fontSize: 12 }}>ACTIVO</div>
              <strong>{market || "Sin mercado"}</strong>
            </div>

            <div
              style={{
                padding: 16,
                borderRadius: 16,
                background: "rgba(8, 7, 12, 0.42)",
                border: "1px solid rgba(255,255,255,.06)",
              }}
            >
              <div style={{ color: "#8f879a", fontSize: 12 }}>BALANCE WALLET · DEVNET</div>
              <strong>
                {balanceLoading
                  ? "Consultando..."
                  : balance === null
                  ? "No disponible"
                  : `${balance.toFixed(4)} SOL`}
              </strong>
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              height: 8,
              borderRadius: 999,
              overflow: "hidden",
              background: "#0f0c16",
              border: "1px solid rgba(255,255,255,.05)",
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                borderRadius: 999,
                background: "linear-gradient(90deg, #7b61ff, #63e6a9)",
                transition: "width .3s ease",
              }}
            />
          </div>
        </header>

        <section style={cardStyle}>
          <div style={{ color: "#a98bff", fontWeight: 800, fontSize: 12 }}>
            CÓMO PROBAR MEMEDICTIONS
          </div>

          <h2 style={{ margin: "6px 0 8px" }}>
            Completa un mercado de principio a fin
          </h2>

          <p style={{ ...mutedTextStyle, marginTop: 0 }}>
            Todo ocurre sobre Solana Devnet. Los PTS son ficticios y no se
            utilizan fondos reales.
          </p>

          <div
            style={{
              marginTop: 18,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12,
            }}
          >
            {[
              ["01", "Conecta tu wallet", "Conecta una wallet compatible con Solana Devnet."],
              ["02", "Crea una ronda", "Elige mercado, duración y precio inicial."],
              ["03", "Predice", "Selecciona SUBE o BAJA y asigna PTS ficticios."],
              ["04", "Espera el cierre", "La ronda permanece abierta hasta su tiempo de cierre."],
              ["05", "Resuelve", "Registra el precio final y obtén SUBE, BAJA o VOID."],
              ["06", "Verifica", "Comprueba el resultado registrado on-chain."],
            ].map(([number, title, description]) => (
              <div
                key={number}
                style={{
                  padding: 16,
                  borderRadius: 14,
                  background: "rgba(8, 7, 12, 0.42)",
                  border: "1px solid rgba(255,255,255,.06)",
                }}
              >
                <div
                  style={{
                    color: "#a98bff",
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  {number}
                </div>

                <div
                  style={{
                    marginTop: 6,
                    fontWeight: 800,
                  }}
                >
                  {title}
                </div>

                <div
                  style={{
                    marginTop: 6,
                    color: "#8f879a",
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  {description}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ color: "#a98bff", fontWeight: 800, fontSize: 12 }}>
                ESTADO GENERAL
              </div>
              <h2 style={{ margin: "6px 0 0" }}>Checklist Devnet</h2>
            </div>

            <span
              style={{
                padding: "8px 12px",
                borderRadius: 999,
                color: flowCompleted ? "#63e6a9" : "#bbb2c8",
                background: flowCompleted ? "#14251f" : "#15111d",
                border: flowCompleted
                  ? "1px solid #376e59"
                  : "1px solid #4a395e",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {flowCompleted ? "Flujo completado" : "Preparando pruebas"}
            </span>
          </div>

          <div
            style={{
              marginTop: 18,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 10,
            }}
          >
            {[
              [walletReady, "Wallet conectada"],
              [hasBalance, "SOL Devnet disponible"],
              [roundReady, "Ronda Devnet creada"],
              [predictionReady, "Predicción registrada"],
              [resultReady, "Ronda resuelta"],
              [programDeployed, "Contrato Memedictions desplegado"],
            ].map(([ready, label]) => (
              <div
                key={String(label)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "11px 12px",
                  borderRadius: 12,
                  background: ready
                    ? "rgba(20, 37, 31, 0.72)"
                    : "rgba(12, 10, 17, 0.6)",
                  border: ready
                    ? "1px solid rgba(99, 230, 169, .25)"
                    : "1px solid rgba(255,255,255,.05)",
                }}
              >
                <span>{ready ? "✓" : "○"}</span>
                <span style={{ color: ready ? "#d9fff0" : "#bbb2c8" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section style={cardStyle}>
          <div style={{ color: "#a98bff", fontWeight: 800, fontSize: 12 }}>
            PASO 1
          </div>
          <h2 style={{ marginTop: 6 }}>Wallet</h2>
          <p style={mutedTextStyle}>
            Tu wallet firma cada transacción directamente en Solana Devnet.
          </p>

          {!walletAddress ? (
            <button
              type="button"
              onClick={connectWallet}
              disabled={connecting}
              style={{
                marginTop: 8,
                padding: "12px 18px",
                borderRadius: 12,
                border: "1px solid #7b61ff",
                background: "#7b61ff",
                color: "#ffffff",
                fontWeight: 800,
                cursor: connecting ? "not-allowed" : "pointer",
              }}
            >
              {connecting ? "Conectando..." : "Conectar Phantom"}
            </button>
          ) : (
            <>
              <div style={monoBoxStyle}>{walletAddress}</div>

              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <strong>
                  {balanceLoading
                    ? "Consultando balance..."
                    : balance === null
                    ? "Balance no disponible"
                    : `${balance.toFixed(6)} SOL Devnet`}
                </strong>

                <button
                  type="button"
                  onClick={() => void loadBalance()}
                  disabled={balanceLoading}
                  style={{
                    padding: "9px 12px",
                    borderRadius: 10,
                    border: "1px solid #4a395e",
                    background: "#181321",
                    color: "#ffffff",
                  }}
                >
                  Actualizar balance
                </button>

                <button
                  type="button"
                  onClick={disconnectWallet}
                  style={{
                    padding: "9px 12px",
                    borderRadius: 10,
                    border: "1px solid #82465a",
                    background: "#2d1821",
                    color: "#ffb0c3",
                  }}
                >
                  Desconectar
                </button>
              </div>
            </>
          )}
        </section>

        <section style={cardStyle}>
          <div style={{ color: "#a98bff", fontWeight: 800, fontSize: 12 }}>
            PASO 2
          </div>
          <h2 style={{ marginTop: 6 }}>Crear ronda de prueba</h2>
          <p style={mutedTextStyle}>
            Define el mercado, la duración y el precio inicial. La ronda V2
            será firmada desde tu wallet y registrada on-chain en Solana Devnet.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
              marginTop: 18,
            }}
          >
            <label>
              <span style={{ fontWeight: 700 }}>Mercado</span>
              <input
                value={market}
                onChange={(event) => setMarket(event.target.value.toUpperCase())}
                disabled={roundReady}
                style={inputStyle}
              />
            </label>

            <label>
              <span style={{ fontWeight: 700 }}>Duración</span>
              <select
                value={durationSeconds}
                onChange={(event) => setDurationSeconds(Number(event.target.value))}
                disabled={roundReady}
                style={inputStyle}
              >
                <option value={120}>2 minutos</option>
                <option value={180}>3 minutos</option>
                <option value={300}>5 minutos</option>
              </select>
            </label>

            <label>
              <span style={{ fontWeight: 700 }}>Precio inicial</span>
              <input
                type="number"
                min={1}
                step={1}
                value={openingPrice}
                onChange={(event) =>
                  setOpeningPrice(Number(event.target.value))
                }
                disabled={roundReady}
                style={inputStyle}
              />
            </label>
          </div>

          <button
            type="button"
            onClick={
              preparedRound
                ? signPreparedRound
                : createRound
            }
            disabled={
              !walletReady ||
              !hasBalance ||
              roundReady ||
              roundPreparing ||
              roundSending
            }
            style={{
              marginTop: 20,
              padding: "12px 18px",
              borderRadius: 12,
              border: "1px solid #7b61ff",
              background: roundReady ? "#1b3028" : "#7b61ff",
              color: "#ffffff",
              fontWeight: 800,
              opacity:
                !walletReady || !hasBalance || roundPreparing || roundSending
                  ? 0.55
                  : 1,
            }}
          >
            {roundPreparing
              ? "Preparando ronda..."
              : roundSending
              ? "Firmando y enviando..."
              : roundReady
              ? "✓ Ronda creada"
              : preparedRound
              ? "Firmar con Phantom"
              : "Preparar ronda"}
          </button>

          {roundAddress && (
            <div style={{ marginTop: 20 }}>
              <strong>Round PDA</strong>
              <div style={monoBoxStyle}>{roundAddress}</div>
              <a
                href={explorerAccountUrl(roundAddress)}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  color: "#a98bff",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Ver Round PDA en Solana Explorer ↗
              </a>

              {roundId && (
                <p style={{ ...mutedTextStyle, marginBottom: 0 }}>
                  Round ID: <strong style={{ color: "#ffffff" }}>{roundId}</strong>
                </p>
              )}
            </div>
          )}

          {roundSignature && (
            <div style={{ marginTop: 16 }}>
              <p style={{ ...mutedTextStyle, margin: 0 }}>
                ✓ Creación registrada en Solana Devnet.
              </p>
              <a
                href={explorerTransactionUrl(roundSignature)}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  color: "#a98bff",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Ver creación en Solana Explorer ↗
              </a>
            </div>
          )}
        </section>

        <section style={cardStyle}>
          <div style={{ color: "#a98bff", fontWeight: 800, fontSize: 12 }}>
            PASO 3
          </div>
          <h2 style={{ marginTop: 6 }}>Predicción</h2>
          <p style={mutedTextStyle}>
            Elige una dirección y asigna PTS ficticios. No se transfieren tokens
            ni dinero real.
          </p>

          {!roundReady && (
            <div
              style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 12,
                background: "#15111d",
                color: "#bbb2c8",
                border: "1px solid #332940",
              }}
            >
              Primero crea una ronda de prueba.
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginTop: 18,
            }}
          >
            <button
              type="button"
              onClick={() => setDirection("SUBE")}
              disabled={predictionReady}
              style={{
                padding: "14px 12px",
                borderRadius: 12,
                border:
                  direction === "SUBE"
                    ? "2px solid #63e6a9"
                    : "1px solid #4a395e",
                background:
                  direction === "SUBE" ? "#14251f" : "#15111d",
                color: direction === "SUBE" ? "#8fffc9" : "#ffffff",
                fontWeight: 900,
              }}
            >
              ↑ SUBE
            </button>

            <button
              type="button"
              onClick={() => setDirection("BAJA")}
              disabled={predictionReady}
              style={{
                padding: "14px 12px",
                borderRadius: 12,
                border:
                  direction === "BAJA"
                    ? "2px solid #ff829f"
                    : "1px solid #4a395e",
                background:
                  direction === "BAJA" ? "#2d1821" : "#15111d",
                color: direction === "BAJA" ? "#ffabc0" : "#ffffff",
                fontWeight: 900,
              }}
            >
              ↓ BAJA
            </button>
          </div>

          <label style={{ display: "block", marginTop: 18 }}>
            <span style={{ fontWeight: 700 }}>Puntos ficticios</span>
            <input
              type="number"
              min={1}
              max={10000}
              value={points}
              disabled={predictionReady}
              onChange={(event) => setPoints(Number(event.target.value))}
              style={inputStyle}
            />
          </label>

          <button
            type="button"
            onClick={submitPrediction}
            disabled={
              !walletReady ||
              !hasBalance ||
              !roundReady ||
              predictionReady ||
              predictionPreparing ||
              predictionSending
            }
            style={{
              marginTop: 20,
              padding: "12px 18px",
              borderRadius: 12,
              border: "1px solid #7b61ff",
              background: predictionReady ? "#1b3028" : "#7b61ff",
              color: "#ffffff",
              fontWeight: 800,
              opacity:
                !walletReady ||
                !hasBalance ||
                !roundReady ||
                predictionPreparing ||
                predictionSending
                  ? 0.55
                  : 1,
            }}
          >
            {predictionPreparing
              ? "Preparando predicción..."
              : predictionSending
              ? "Firmando y enviando..."
              : predictionReady
              ? "✓ Predicción registrada"
              : "Registrar predicción"}
          </button>

          {predictionAddress && (
            <div style={{ marginTop: 20 }}>
              <strong>Prediction PDA</strong>
              <div style={monoBoxStyle}>{predictionAddress}</div>
              <a
                href={explorerAccountUrl(predictionAddress)}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  color: "#a98bff",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Ver Prediction PDA en Solana Explorer ↗
              </a>

              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  gap: 16,
                  flexWrap: "wrap",
                  color: "#bbb2c8",
                }}
              >
                <span>
                  Dirección: <strong style={{ color: "#ffffff" }}>{direction}</strong>
                </span>
                <span>
                  Stake demo: <strong style={{ color: "#ffffff" }}>{points} PTS</strong>
                </span>
              </div>
            </div>
          )}

          {predictionSignature && (
            <div style={{ marginTop: 16 }}>
              <p style={{ ...mutedTextStyle, margin: 0 }}>
                ✓ Predicción registrada en Solana Devnet.
              </p>
              <a
                href={explorerTransactionUrl(predictionSignature)}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  color: "#a98bff",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Ver predicción en Solana Explorer ↗
              </a>
            </div>
          )}
        </section>

        <section style={cardStyle}>
          <div style={{ color: "#a98bff", fontWeight: 800, fontSize: 12 }}>
            PASO 4
          </div>
          <h2 style={{ marginTop: 6 }}>Esperar / Resolver</h2>

          {!roundReady && <p style={mutedTextStyle}>Todavía no existe una ronda de prueba.</p>}

          {roundReady && !roundExpired && (
            <div
              style={{
                marginTop: 12,
                padding: 18,
                borderRadius: 16,
                background: "#111a18",
                border: "1px solid #29463b",
              }}
            >
              <strong style={{ color: "#8fffc9" }}>Ronda abierta</strong>

              {remainingSeconds !== null && (
                <p style={{ marginBottom: 8 }}>
                  Tiempo restante aproximado:{" "}
                  <strong style={{ color: "#63e6a9", fontSize: 20 }}>
                    {formatRemainingTime(remainingSeconds)}
                  </strong>
                </p>
              )}

              <p style={{ ...mutedTextStyle, marginBottom: 0 }}>
                El endpoint de resolución utiliza el reloj de Solana Devnet como
                autoridad temporal final.
              </p>
            </div>
          )}

          {roundReady && roundExpired && !resultReady && (
            <>
              <div
                style={{
                  marginTop: 12,
                  padding: 14,
                  borderRadius: 12,
                  border: "1px solid #765425",
                  background: "#2c2115",
                  color: "#ffcf88",
                  fontWeight: 700,
                }}
              >
                La ronda está lista para resolver.
              </div>

              <div
                style={{
                  marginTop: 16,
                }}
              >
                <label>
                  <span style={{ fontWeight: 700 }}>
                    Precio final
                  </span>

                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={closingPrice}
                    onChange={(event) =>
                      setClosingPrice(Number(event.target.value))
                    }
                    style={inputStyle}
                  />
                </label>

                <p
                  style={{
                    ...mutedTextStyle,
                    marginTop: 10,
                    marginBottom: 0,
                  }}
                >
                  Memedictions calcula automáticamente SUBE, BAJA o VOID
                  comparando el precio inicial con el precio final.
                </p>
              </div>

              <button
                type="button"
                onClick={resolveRound}
                disabled={
                  !walletReady ||
                  !hasBalance ||
                  closePreparing ||
                  closeSending
                }
                style={{
                  marginTop: 20,
                  padding: "12px 18px",
                  borderRadius: 12,
                  border: "1px solid #7b61ff",
                  background: "#7b61ff",
                  color: "#ffffff",
                  fontWeight: 800,
                  opacity:
                    !walletReady || !hasBalance || closePreparing || closeSending
                      ? 0.55
                      : 1,
                }}
              >
                {closePreparing
                  ? "Preparando resolución..."
                  : closeSending
                  ? "Firmando y enviando..."
                  : "Resolver automáticamente en Devnet"}
              </button>
            </>
          )}

          {resultReady && (
            <div
              style={{
                marginTop: 12,
                padding: 14,
                borderRadius: 12,
                background: "#14251f",
                border: "1px solid #376e59",
                color: "#8fffc9",
                fontWeight: 800,
              }}
            >
              ✓ Ronda resuelta on-chain.
            </div>
          )}
        </section>

        <section
          style={{
            ...cardStyle,
            border: resultReady
              ? resultVoid
                ? "1px solid #6b6380"
                : userWon
                  ? "1px solid #376e59"
                  : "1px solid #82465a"
              : cardStyle.border,
            background: resultReady
              ? resultVoid
                ? "linear-gradient(180deg, #201d29, #15131c)"
                : userWon
                  ? "linear-gradient(180deg, #14251f, #101b17)"
                  : "linear-gradient(180deg, #2d1821, #1d1117)"
              : cardStyle.background,
          }}
        >
          <div style={{ color: "#a98bff", fontWeight: 800, fontSize: 12 }}>
            PASO 5
          </div>
          <h2 style={{ marginTop: 6 }}>Resultado</h2>

          {!resultReady ? (
            <p style={mutedTextStyle}>
              El resultado aparecerá aquí cuando la ronda de prueba quede resuelta en Devnet.
            </p>
          ) : (
            <>
              {predictionReady ? (
                <h3
                  style={{
                    fontSize: 34,
                    marginBottom: 12,
                    color: resultVoid
                      ? "#b9a7ff"
                      : userWon
                        ? "#63e6a9"
                        : "#ff829f",
                  }}
                >
                  {resultVoid
                    ? "— VOID —"
                    : userWon
                      ? "✓ GANASTE"
                      : "✕ PERDISTE"}
                </h3>
              ) : (
                <h3>Ronda finalizada</h3>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 12,
                  marginTop: 16,
                }}
              >
                <div
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    background: "rgba(0,0,0,.18)",
                  }}
                >
                  <div style={{ color: "#8f879a", fontSize: 12 }}>
                    RESULTADO OFICIAL
                  </div>
                  <strong>{resolvedOutcome}</strong>
                </div>

                <div
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    background: "rgba(0,0,0,.18)",
                  }}
                >
                  <div style={{ color: "#8f879a", fontSize: 12 }}>
                    PRECIO INICIAL
                  </div>
                  <strong>{openingPrice}</strong>
                </div>

                <div
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    background: "rgba(0,0,0,.18)",
                  }}
                >
                  <div style={{ color: "#8f879a", fontSize: 12 }}>
                    PRECIO FINAL
                  </div>
                  <strong>{closingPrice}</strong>
                </div>

                {predictionReady && (
                  <>
                    <div
                      style={{
                        padding: 14,
                        borderRadius: 12,
                        background: "rgba(0,0,0,.18)",
                      }}
                    >
                      <div style={{ color: "#8f879a", fontSize: 12 }}>
                        TU PREDICCIÓN
                      </div>
                      <strong>{direction}</strong>
                    </div>

                    <div
                      style={{
                        padding: 14,
                        borderRadius: 12,
                        background: "rgba(0,0,0,.18)",
                      }}
                    >
                      <div style={{ color: "#8f879a", fontSize: 12 }}>
                        PUNTOS FICTICIOS
                      </div>
                      <strong>{points} PTS</strong>
                    </div>
                  </>
                )}
              </div>

              {resultAddress && (
                <div style={{ marginTop: 20 }}>
                  <strong>RoundResult PDA</strong>
                  <div style={monoBoxStyle}>{resultAddress}</div>
                  <a
                    href={explorerAccountUrl(resultAddress)}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-block",
                      marginTop: 8,
                      color: "#a98bff",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    Ver RoundResult en Solana Explorer ↗
                  </a>
                </div>
              )}

              {resultSignature && (
                <div style={{ marginTop: 16 }}>
                  <p style={{ ...mutedTextStyle, margin: 0 }}>
                    ✓ Resolución registrada en Solana Devnet.
                  </p>
                  <a
                    href={explorerTransactionUrl(resultSignature)}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-block",
                      marginTop: 8,
                      color: "#a98bff",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    Ver resolución en Solana Explorer ↗
                  </a>
                </div>
              )}

              {nextRoundCountdown !== null && (
                <div
                  style={{
                    marginTop: 20,
                    padding: 16,
                    borderRadius: 14,
                    border: "1px solid rgba(169,139,255,.35)",
                    background: "rgba(169,139,255,.08)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      color: "#a98bff",
                      fontSize: 12,
                      fontWeight: 800,
                      letterSpacing: ".08em",
                    }}
                  >
                    SIGUIENTE CICLO
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 24,
                      fontWeight: 900,
                    }}
                  >
                    Nueva ronda en {nextRoundCountdown}…
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      color: "#8f879a",
                      fontSize: 13,
                    }}
                  >
                    La wallet seguirá conectada.
                  </div>
                </div>
              )}

              <p style={{ ...mutedTextStyle, marginTop: 20, marginBottom: 0 }}>
                Los PTS continúan siendo completamente ficticios. No se
                transfieren tokens ni fondos reales.
              </p>
            </>
          )}
        </section>

        {balance === 0 && (
          <div
            style={{
              marginTop: 24,
              padding: 16,
              borderRadius: 14,
              border: "1px solid #765425",
              background: "#2c2115",
              color: "#ffcf88",
            }}
          >
            Tu wallet no tiene SOL Devnet disponible. Necesitas una pequeña
            cantidad de SOL de prueba para firmar transacciones en esta demo.
            El SOL Devnet no tiene valor real.
          </div>
        )}

        {message && (
          <div
            role="status"
            style={{
              marginTop: 24,
              padding: 16,
              borderRadius: 14,
              border: "1px solid #376e59",
              background: "#14251f",
              color: "#b8f8d9",
            }}
          >
            {message}
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            style={{
              marginTop: 24,
              padding: 16,
              borderRadius: 14,
              border: "1px solid #82465a",
              background: "#2d1821",
              color: "#ffb0c3",
            }}
          >
            {errorMessage}
          </div>
        )}
      </div>
    </main>
  );
}