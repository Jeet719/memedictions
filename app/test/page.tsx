"use client";

import WalletStandardPanel from "./wallet-standard-panel";

import {
  useConnectedWallet,
} from "@solana/kit-plugin-wallet/react";

import {
  useClient,
} from "@solana/react";

import {
  testSolanaClient,
} from "@/lib/solana/test-client";


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
  getTransactionCodec,
} from "@solana/transactions";

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

  const walletClient =
    useClient<typeof testSolanaClient>();

  const connectedWallet =
    useConnectedWallet(walletClient);

  const [pageMounted, setPageMounted] =
    useState(false);

  useEffect(() => {
    setPageMounted(true);
  }, []);


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

    const address =
      typeof addressOverride === "string"
        ? addressOverride
        : connectedWallet?.account.address ||
          walletAddress;

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

   * CREAR RONDA

   * ===================================

   */

  async function createRound() {

    console.log(
      "MEMEDICTIONS_CREATE_ROUND_CLICKED",
      {
        connectedWallet: Boolean(connectedWallet),
        walletAddress,
        balance,
        market,
        durationSeconds,
        openingPrice,
      }
    );

    if (!connectedWallet) {
      setErrorMessage(
        "Connect a compatible wallet first."
      );
      return;
    }

    if (!connectedWallet.signer) {
      setErrorMessage(
        "La wallet conectada no permite firmar transacciones."
      );
      return;
    }

    const authorityAddress =
      connectedWallet.account.address;

    if (
      walletAddress !== authorityAddress
    ) {
      setWalletAddress(
        authorityAddress
      );

      await loadBalance(
        authorityAddress
      );
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

      console.log(
        "MEMEDICTIONS_BEFORE_ROUND_PREPARE",
        {
          authorityAddress,
          market,
          durationSeconds,
          openingPrice,
        }
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
        "Round prepared. Sign with your wallet to create it on Devnet."
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

    if (!connectedWallet) {
      setErrorMessage(
        "Connect a compatible wallet first."
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

      if (!connectedWallet.signer) {
        throw new Error(
          "La wallet conectada no tiene un signer disponible."
        );
      }

      if (
        !(
          "modifyAndSignTransactions"
          in connectedWallet.signer
        )
      ) {
        throw new Error(
          "La wallet conectada no soporta firma de transacciones."
        );
      }

      const transactionBytes =
        Buffer.from(
          preparedRound.transaction,
          "base64"
        );

      const transactionCodec =
        getTransactionCodec();

      const kitTransaction =
        transactionCodec.decode(
          transactionBytes
        );

      console.log(
        "V2_DEVNET_ROUND_REQUESTING_WALLET_STANDARD_SIGNATURE",
        {
          wallet:
            connectedWallet.wallet.name,
          authority:
            connectedWallet.account.address,
        }
      );

      const signedTransactions =
        await connectedWallet.signer
          .modifyAndSignTransactions([
            kitTransaction,
          ]);

      const signedTransaction =
        signedTransactions[0];

      if (!signedTransaction) {
        throw new Error(
          "La wallet no devolvió una transacción firmada."
        );
      }

      const signedTransactionBytes =
        transactionCodec.encode(
          signedTransaction
        );

      const signedTransactionBase64 =
        Buffer.from(
          signedTransactionBytes
        ).toString("base64");

      const sendResponse =
        await fetch(
          "/api/test/round/send",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              transaction:
                signedTransactionBase64,
              blockhash:
                preparedRound.blockhash,
              lastValidBlockHeight:
                preparedRound
                  .lastValidBlockHeight,
            }),
          }
        );

      const sent: SendRoundResponse =
        await sendResponse.json();

      if (
        !sendResponse.ok ||
        !sent.ok ||
        !sent.signature
      ) {
        throw new Error(
          sent.error ||
          "No se pudo enviar la ronda firmada a Devnet."
        );
      }

      console.log(
        "V2_DEVNET_ROUND_WALLET_STANDARD_SENT",
        {
          signature:
            sent.signature,
          roundAddress:
            preparedRound.roundAddress,
        }
      );

      setRoundAddress(
        preparedRound.roundAddress
      );

      window.localStorage.setItem(
        activeRoundStorageKey(
          connectedWallet.account.address
        ),
        preparedRound.roundAddress
      );

      setWalletAddress(
        connectedWallet.account.address
      );

      setRoundId(
        preparedRound.roundId
      );

      setRoundClosingTime(
        preparedRound.closingTime
      );

      setRoundSignature(
        sent.signature
      );

      setPreparedRound(null);

      setMessage(
        "Test round created successfully on Solana Devnet."
      );

      await loadBalance(
        connectedWallet.account.address
      );

    } catch (error) {

      console.error(
        "V2_DEVNET_CREATE_ROUND_WALLET_STANDARD_ERROR",
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

    if (!connectedWallet) {
      setErrorMessage(
        "Connect a compatible wallet first."
      );
      return;
    }

    if (!connectedWallet.signer) {
      setErrorMessage(
        "La wallet conectada no permite firmar transacciones."
      );
      return;
    }

    if (
      !(
        "modifyAndSignTransactions"
        in connectedWallet.signer
      )
    ) {
      setErrorMessage(
        "La wallet conectada no soporta firma de transacciones."
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
      !Number.isSafeInteger(points) ||
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

    const userAddress =
      connectedWallet.account.address;

    try {

      setMessage("");
      setErrorMessage("");

      setPredictionAddress("");
      setPredictionSignature("");

      setPredictionPreparing(true);

      const prepareResponse =
        await fetch(
          "/api/test/prediction/prepare",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              round:
                roundAddress,

              user:
                userAddress,

              direction,

              points,
            }),
          }
        );

      const prepared: PreparePredictionResponse =
        await prepareResponse.json();

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
        prepared.lastValidBlockHeight ===
          undefined
      ) {
        throw new Error(
          "La respuesta de preparación de predicción está incompleta."
        );
      }

      setPredictionPreparing(false);
      setPredictionSending(true);

      const transactionBytes =
        Buffer.from(
          prepared.transaction,
          "base64"
        );

      const transactionCodec =
        getTransactionCodec();

      const kitTransaction =
        transactionCodec.decode(
          transactionBytes
        );

      console.log(
        "V2_DEVNET_PREDICTION_REQUESTING_WALLET_STANDARD_SIGNATURE",
        {
          wallet:
            connectedWallet.wallet.name,
          user:
            userAddress,
          predictionAddress:
            prepared.predictionAddress,
        }
      );

      const signedTransactions =
        await connectedWallet.signer
          .modifyAndSignTransactions([
            kitTransaction,
          ]);

      const signedTransaction =
        signedTransactions[0];

      if (!signedTransaction) {
        throw new Error(
          "La wallet no devolvió una predicción firmada."
        );
      }

      const signedTransactionBytes =
        transactionCodec.encode(
          signedTransaction
        );

      const signedTransactionBase64 =
        Buffer.from(
          signedTransactionBytes
        ).toString("base64");

      console.log(
        "V2_DEVNET_PREDICTION_WALLET_STANDARD_SIGNED",
        {
          user:
            userAddress,
          predictionAddress:
            prepared.predictionAddress,
        }
      );

      const sendResponse =
        await fetch(
          "/api/test/prediction/send",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              transaction:
                signedTransactionBase64,

              blockhash:
                prepared.blockhash,

              lastValidBlockHeight:
                prepared.lastValidBlockHeight,
            }),
          }
        );

      const sent: SendPredictionResponse =
        await sendResponse.json();

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
        "Prediction registered successfully on Solana Devnet."
      );

      await loadBalance(
        userAddress
      );

    } catch (error) {

      console.error(
        "V2_DEVNET_PREDICTION_WALLET_STANDARD_ERROR",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo registrar la predicción."
      );

    } finally {

      setPredictionPreparing(false);
      setPredictionSending(false);

    }

  }

  /*

   * ===================================

   * RESOLVER RONDA

   * ===================================

   */

  async function resolveRound() {

    console.log(
      "MEMEDICTIONS_RESOLVE_ROUND_CLICKED",
      {
        connectedWallet:
          Boolean(connectedWallet),
        walletAddress,
        balance,
        roundAddress,
        closingPrice,
        closePreparing,
        closeSending,
      }
    );

    if (!connectedWallet) {
      setErrorMessage(
        "Connect a compatible wallet first."
      );
      return;
    }

    if (!connectedWallet.signer) {
      setErrorMessage(
        "La wallet conectada no permite firmar transacciones."
      );
      return;
    }

    if (
      !(
        "modifyAndSignTransactions"
        in connectedWallet.signer
      )
    ) {
      setErrorMessage(
        "La wallet conectada no soporta firma de transacciones."
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

    const authorityAddress =
      connectedWallet.account.address;

    try {

      setMessage("");
      setErrorMessage("");

      setResultAddress("");
      setResultSignature("");

      setClosePreparing(true);

      const prepareResponse =
        await fetch(
          "/api/test/round/close/prepare",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              round:
                roundAddress,

              authority:
                authorityAddress,

              closingPrice,
            }),
          }
        );

      const prepared: PrepareCloseResponse =
        await prepareResponse.json();

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
        prepared.lastValidBlockHeight ===
          undefined ||
        !prepared.resultAddress
      ) {
        throw new Error(
          "La respuesta de resolución está incompleta."
        );
      }

      setClosePreparing(false);
      setCloseSending(true);

      const transactionBytes =
        Buffer.from(
          prepared.transaction,
          "base64"
        );

      const transactionCodec =
        getTransactionCodec();

      const kitTransaction =
        transactionCodec.decode(
          transactionBytes
        );

      console.log(
        "V2_DEVNET_CLOSE_REQUESTING_WALLET_STANDARD_SIGNATURE",
        {
          wallet:
            connectedWallet.wallet.name,
          authority:
            authorityAddress,
          resultAddress:
            prepared.resultAddress,
        }
      );

      const signedTransactions =
        await connectedWallet.signer
          .modifyAndSignTransactions([
            kitTransaction,
          ]);

      const signedTransaction =
        signedTransactions[0];

      if (!signedTransaction) {
        throw new Error(
          "La wallet no devolvió una resolución firmada."
        );
      }

      const signedTransactionBytes =
        transactionCodec.encode(
          signedTransaction
        );

      const signedTransactionBase64 =
        Buffer.from(
          signedTransactionBytes
        ).toString("base64");

      console.log(
        "V2_DEVNET_CLOSE_WALLET_STANDARD_SIGNED",
        {
          authority:
            authorityAddress,
          resultAddress:
            prepared.resultAddress,
        }
      );

      const sendResponse =
        await fetch(
          "/api/test/round/close/send",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              transaction:
                signedTransactionBase64,

              blockhash:
                prepared.blockhash,

              lastValidBlockHeight:
                prepared.lastValidBlockHeight,
            }),
          }
        );

      const sent: SendCloseResponse =
        await sendResponse.json();

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
        "Round resolved successfully on Solana Devnet."
      );

      await loadBalance(
        authorityAddress
      );

      await recoverDevnetState(
        roundAddress,
        authorityAddress
      );

      setNextRoundCountdown(5);

    } catch (error) {

      console.error(
        "V2_DEVNET_RESOLVE_WALLET_STANDARD_ERROR",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo resolver la ronda Devnet."
      );

    } finally {

      setClosePreparing(false);
      setCloseSending(false);

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

    pageMounted &&
    Boolean(
      connectedWallet?.account.address ||
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
            position: "relative",
            overflow: "hidden",
            padding: "34px 30px 26px",
            borderRadius: 26,
            border: "1px solid rgba(153, 69, 255, 0.28)",
            background:
              "linear-gradient(135deg, rgba(31,20,47,.98), rgba(15,13,23,.98) 55%, rgba(10,23,21,.96))",
            boxShadow:
              "0 28px 90px rgba(0,0,0,.34), 0 0 80px rgba(153,69,255,.06)",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 320,
              height: 320,
              borderRadius: "50%",
              background: "rgba(153,69,255,.12)",
              filter: "blur(90px)",
              top: -170,
              left: -90,
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "absolute",
              width: 280,
              height: 280,
              borderRadius: "50%",
              background: "rgba(20,241,149,.08)",
              filter: "blur(90px)",
              right: -100,
              bottom: -170,
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 20,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  maxWidth: 760,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    color: "#14f195",
                    fontWeight: 900,
                    fontSize: 11,
                    letterSpacing: ".15em",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: programDeployed ? "#14f195" : "#ffcf88",
                      boxShadow: programDeployed
                        ? "0 0 18px rgba(20,241,149,.95)"
                        : "0 0 18px rgba(255,207,136,.75)",
                    }}
                  />

                  {programDeployed
                    ? "LIVE ON SOLANA DEVNET"
                    : "SOLANA DEVNET · DEPLOYMENT PENDING"}
                </div>

                <div
                  style={{
                    marginTop: 18,
                    fontSize: 13,
                    fontWeight: 900,
                    letterSpacing: ".18em",
                    color: "#aaa1b5",
                  }}
                >
                  MEMEDICTIONS
                </div>

                <h1
                  style={{
                    margin: "8px 0 0",
                    fontSize: "clamp(42px, 8vw, 76px)",
                    lineHeight: .95,
                    letterSpacing: "-.055em",
                    fontWeight: 950,
                    background:
                      "linear-gradient(90deg, #ffffff 0%, #c8b5ff 38%, #9945ff 62%, #14f195 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  Memedictions
                </h1>

                <h2
                  style={{
                    margin: "18px 0 0",
                    maxWidth: 720,
                    fontSize: "clamp(22px, 4vw, 34px)",
                    lineHeight: 1.16,
                    letterSpacing: "-.025em",
                    fontWeight: 850,
                  }}
                >
                  From meme culture to verifiable prediction markets.
                </h2>

                <p
                  style={{
                    ...mutedTextStyle,
                    maxWidth: 720,
                    margin: "14px 0 0",
                    fontSize: 16,
                    lineHeight: 1.7,
                  }}
                >
                  Create short-duration markets, submit predictions and verify
                  outcomes directly on Solana. Fast community conviction,
                  transparent rounds and on-chain results.
                </p>

                <div
                  style={{
                    marginTop: 20,
                    display: "flex",
                    gap: 9,
                    flexWrap: "wrap",
                  }}
                >
                  {[
                    ["PUBLIC TESTING", "#c9b8ff", "rgba(153,69,255,.11)", "rgba(153,69,255,.30)"],
                    ["WALLET STANDARD", "#9deeff", "rgba(0,194,255,.08)", "rgba(0,194,255,.22)"],
                    ["NO REAL FUNDS", "#ffb7c7", "rgba(255,130,159,.08)", "rgba(255,130,159,.22)"],
                  ].map(([label, color, background, border]) => (
                    <span
                      key={label}
                      style={{
                        padding: "7px 11px",
                        borderRadius: 999,
                        background,
                        border: `1px solid ${border}`,
                        color,
                        fontSize: 11,
                        fontWeight: 900,
                        letterSpacing: ".035em",
                      }}
                    >
                      {label}
                    </span>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: 22,
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <a
                    href="#wallet"
                    style={{
                      padding: "12px 18px",
                      borderRadius: 12,
                      background:
                        "linear-gradient(135deg, #9945ff 0%, #14f195 100%)",
                      color: "#08070c",
                      textDecoration: "none",
                      fontWeight: 900,
                      fontSize: 14,
                      boxShadow: "0 12px 30px rgba(92,55,145,.30)",
                    }}
                  >
                    Connect Wallet
                  </a>

                  <a
                    href="https://faucet.solana.com/"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "12px 18px",
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,.11)",
                      background: "rgba(255,255,255,.045)",
                      color: "#ffffff",
                      textDecoration: "none",
                      fontWeight: 800,
                      fontSize: 14,
                    }}
                  >
                    Get Devnet SOL
                  </a>

                  <a
                    href="https://github.com/Jeet719/memedictions"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: "12px 18px",
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,.11)",
                      background: "rgba(255,255,255,.025)",
                      color: "#d8d1df",
                      textDecoration: "none",
                      fontWeight: 800,
                      fontSize: 14,
                    }}
                  >
                    View GitHub
                  </a>
                </div>

                <div
                  style={{
                    marginTop: 16,
                    color: "#807687",
                    fontSize: 12,
                  }}
                >
                  Transparent rounds. Verifiable outcomes.
                </div>
              </div>

              <div
                style={{
                  minWidth: 180,
                  padding: "14px 16px",
                  borderRadius: 16,
                  border: programDeployed
                    ? "1px solid rgba(20,241,149,.24)"
                    : "1px solid rgba(255,207,136,.25)",
                  background: programDeployed
                    ? "rgba(20,241,149,.055)"
                    : "rgba(255,207,136,.055)",
                }}
              >
                <div
                  style={{
                    color: "#8f879a",
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: ".12em",
                  }}
                >
                  CONTRACT STATUS
                </div>

                <div
                  style={{
                    marginTop: 6,
                    color: programDeployed ? "#8fffc9" : "#ffcf88",
                    fontSize: 14,
                    fontWeight: 900,
                  }}
                >
                  {programDeployed ? "DEPLOYED" : "PENDING"}
                </div>


              </div>
            </div>

            <div
              style={{
                marginTop: 28,
                padding: "13px 14px",
                borderRadius: 15,
                background: "rgba(7,7,11,.46)",
                border: "1px solid rgba(255,255,255,.055)",
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(125px, 1fr))",
                gap: 8,
              }}
            >
              {[
                ["01", "CREATE"],
                ["02", "PREDICT"],
                ["03", "RESOLVE"],
                ["04", "VERIFY"],
              ].map(([number, label], index) => (
                <div
                  key={label}
                  style={{
                    position: "relative",
                    padding: "9px 10px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      color: index % 2 === 0 ? "#a98bff" : "#63e6a9",
                      fontSize: 10,
                      fontWeight: 900,
                    }}
                  >
                    {number}
                  </div>

                  <div
                    style={{
                      marginTop: 3,
                      fontSize: 12,
                      fontWeight: 900,
                      letterSpacing: ".09em",
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 18,
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 10,
              }}
            >
              {[
                ["NETWORK", "Solana Devnet"],
                ["PROGRESS", `${completedSteps}/${totalSteps} stages`],
                ["MARKET", market || "No market"],
                [
                  "WALLET BALANCE",
                  balanceLoading
                    ? "Loading..."
                    : balance === null
                    ? "Not available"
                    : `${balance.toFixed(4)} SOL`,
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    padding: 15,
                    borderRadius: 15,
                    background: "rgba(8,7,12,.44)",
                    border: "1px solid rgba(255,255,255,.06)",
                  }}
                >
                  <div
                    style={{
                      color: "#817887",
                      fontSize: 10,
                      fontWeight: 900,
                      letterSpacing: ".09em",
                    }}
                  >
                    {label}
                  </div>

                  <div
                    style={{
                      marginTop: 5,
                      fontSize: 14,
                      fontWeight: 850,
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 7,
                  color: "#83798e",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                <span>TEST FLOW PROGRESS</span>
                <span>{Math.round(progressPercent)}%</span>
              </div>

              <div
                style={{
                  height: 8,
                  borderRadius: 999,
                  overflow: "hidden",
                  background: "#0a0910",
                  border: "1px solid rgba(255,255,255,.05)",
                }}
              >
                <div
                  style={{
                    width: `${progressPercent}%`,
                    height: "100%",
                    borderRadius: 999,
                    background:
                      "linear-gradient(90deg, #9945ff 0%, #00c2ff 48%, #14f195 100%)",
                    transition: "width .3s ease",
                    boxShadow: "0 0 20px rgba(20,241,149,.30)",
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        <section
          style={{
            ...cardStyle,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: "rgba(153,69,255,.07)",
              filter: "blur(75px)",
              top: -130,
              right: -80,
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 18,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#14f195",
                    fontWeight: 900,
                    fontSize: 11,
                    letterSpacing: ".12em",
                  }}
                >
                  PUBLIC TEST
                </div>

                <h2
                  style={{
                    margin: "7px 0 0",
                    fontSize: "clamp(24px, 4vw, 32px)",
                    letterSpacing: "-.02em",
                  }}
                >
                  Test Memedictions end-to-end
                </h2>

                <p
                  style={{
                    ...mutedTextStyle,
                    margin: "9px 0 0",
                    maxWidth: 680,
                  }}
                >
                  Complete the full prediction lifecycle.
                  Create a market, submit your prediction, resolve the round
                  and verify the result on-chain.
                </p>
              </div>

              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: "rgba(20,241,149,.07)",
                  border: "1px solid rgba(20,241,149,.22)",
                  color: "#8fffc9",
                  fontSize: 11,
                  fontWeight: 900,
                  whiteSpace: "nowrap",
                }}
              >
                NO REAL FUNDS
              </div>
            </div>

            <div
              style={{
                marginTop: 20,
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(145px, 1fr))",
                gap: 10,
              }}
            >
              {[
                ["01", "CONNECT", "Connect a Wallet Standard-compatible wallet."],
                ["02", "CREATE", "Choose a market, duration and opening price."],
                ["03", "PREDICT", "Select UP or DOWN using fictitious PTS."],
                ["04", "WAIT", "Let the round reach its closing time."],
                ["05", "RESOLVE", "Enter the closing price and resolve on-chain."],
                ["06", "VERIFY", "Check the final result on Solana Explorer."],
              ].map(([number, title, description]) => (
                <div
                  key={number}
                  style={{
                    padding: 15,
                    borderRadius: 14,
                    background: "rgba(8,7,12,.44)",
                    border: "1px solid rgba(255,255,255,.06)",
                  }}
                >
                  <div
                    style={{
                      color:
                        Number(number) % 2 === 0
                          ? "#63e6a9"
                          : "#a98bff",
                      fontSize: 10,
                      fontWeight: 900,
                      letterSpacing: ".08em",
                    }}
                  >
                    {number}
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      fontWeight: 900,
                      fontSize: 13,
                      letterSpacing: ".04em",
                    }}
                  >
                    {title}
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      color: "#8f879a",
                      fontSize: 12,
                      lineHeight: 1.5,
                    }}
                  >
                    {description}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 18,
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 12,
              }}
            >
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 14,
                  background: "rgba(153,69,255,.075)",
                  border: "1px solid rgba(153,69,255,.22)",
                }}
              >
                <div
                  style={{
                    color: "#cbb9ff",
                    fontWeight: 900,
                    fontSize: 12,
                  }}
                >
                  RECOMMENDED SETUP
                </div>

                <div
                  style={{
                    marginTop: 7,
                    color: "#aaa1b5",
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  Use <strong style={{ color: "#ffffff" }}>Solflare</strong>{" "}
                  and make sure your wallet is connected to{" "}
                  <strong style={{ color: "#ffffff" }}>
                    Solana Devnet
                  </strong>.
                </div>
              </div>

              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 14,
                  background: "rgba(20,241,149,.055)",
                  border: "1px solid rgba(20,241,149,.18)",
                }}
              >
                <div
                  style={{
                    color: "#8fffc9",
                    fontWeight: 900,
                    fontSize: 12,
                  }}
                >
                  TEST FUNDS ONLY
                </div>

                <div
                  style={{
                    marginTop: 7,
                    color: "#aaa1b5",
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  PTS are fictitious. Devnet SOL is used only for
                  transaction fees. This demo does not move real tokens
                  or real money.
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 16,
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <a
                href="#wallet"
                style={{
                  padding: "11px 16px",
                  borderRadius: 11,
                  background:
                    "linear-gradient(135deg, #9945ff, #14f195)",
                  color: "#08070c",
                  fontWeight: 900,
                  fontSize: 13,
                  textDecoration: "none",
                }}
              >
                Start testing
              </a>

              <a
                href="https://faucet.solana.com/"
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: "11px 16px",
                  borderRadius: 11,
                  border: "1px solid rgba(255,255,255,.11)",
                  background: "rgba(255,255,255,.035)",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: 13,
                  textDecoration: "none",
                }}
              >
                Get Devnet SOL ↗
              </a>
            </div>
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
              <h2 style={{ margin: "6px 0 0" }}>Live Test Checklist</h2>
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
              [roundReady, "Devnet round created"],
              [predictionReady, "Prediction registered"],
              [resultReady, "Round resolved"],
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

        <section id="wallet" style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ color: "#a98bff", fontWeight: 900, fontSize: 12 }}>
              STEP 01
            </div>

            <span
              style={{
                padding: "7px 10px",
                borderRadius: 999,
                background: walletReady
                  ? "rgba(20,241,149,.08)"
                  : "rgba(255,255,255,.04)",
                border: walletReady
                  ? "1px solid rgba(20,241,149,.22)"
                  : "1px solid rgba(255,255,255,.08)",
                color: walletReady ? "#8fffc9" : "#938a9e",
                fontSize: 11,
                fontWeight: 900,
              }}
            >
              {walletReady ? "READY" : "PENDING"}
            </span>
          </div>

          <h2 style={{ margin: "7px 0 0" }}>Connect your wallet</h2>

          <p style={{ ...mutedTextStyle, marginTop: 8 }}>
            Connect a Wallet Standard-compatible wallet and sign transactions securely.
          </p>

          {walletAddress && (
            <>
              <div style={monoBoxStyle}>
                {walletAddress}
              </div>

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
                    ? "Loading balance..."
                    : balance === null
                    ? "Balance unavailable"
                    : `${balance.toFixed(6)} SOL Devnet`}
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    void loadBalance(
                      connectedWallet?.account.address
                    )
                  }
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
              </div>
            </>
          )}

          <div
            style={{
              marginTop: 24,
              paddingTop: 20,
              borderTop:
                "1px solid rgba(255,255,255,.08)",
            }}
          >
            <WalletStandardPanel />
          </div>
        </section>

        <section style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ color: "#a98bff", fontWeight: 900, fontSize: 12 }}>
              STEP 02
            </div>

            <span
              style={{
                padding: "7px 10px",
                borderRadius: 999,
                background: roundReady
                  ? "rgba(20,241,149,.08)"
                  : "rgba(255,255,255,.04)",
                border: roundReady
                  ? "1px solid rgba(20,241,149,.22)"
                  : "1px solid rgba(255,255,255,.08)",
                color: roundReady ? "#8fffc9" : "#938a9e",
                fontSize: 11,
                fontWeight: 900,
              }}
            >
              {roundReady ? "READY" : "PENDING"}
            </span>
          </div>

          <h2 style={{ margin: "7px 0 0" }}>Create a market</h2>

          <p style={{ ...mutedTextStyle, marginTop: 8 }}>
            Define the market, duration and opening price before registering the round on-chain.
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
              <span style={{ fontWeight: 700 }}>Market</span>
              <input
                value={market}
                onChange={(event) => setMarket(event.target.value.toUpperCase())}
                disabled={roundReady}
                style={inputStyle}
              />
            </label>

            <label>
              <span style={{ fontWeight: 700 }}>Duration</span>
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
              <span style={{ fontWeight: 700 }}>Opening price</span>
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
                roundReady || roundPreparing || roundSending
                  ? 0.55
                  : 1,
            }}
          >
            {roundPreparing
              ? "Preparando ronda..."
              : roundSending
              ? "Firmando y enviando..."
              : roundReady
              ? "✓ Round created"
              : preparedRound
              ? "Firmar con wallet"
              : "Create round"}
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ color: "#a98bff", fontWeight: 900, fontSize: 12 }}>
              STEP 03
            </div>

            <span
              style={{
                padding: "7px 10px",
                borderRadius: 999,
                background: predictionReady
                  ? "rgba(20,241,149,.08)"
                  : "rgba(255,255,255,.04)",
                border: predictionReady
                  ? "1px solid rgba(20,241,149,.22)"
                  : "1px solid rgba(255,255,255,.08)",
                color: predictionReady ? "#8fffc9" : "#938a9e",
                fontSize: 11,
                fontWeight: 900,
              }}
            >
              {predictionReady ? "READY" : "PENDING"}
            </span>
          </div>

          <h2 style={{ margin: "7px 0 0" }}>Submit your prediction</h2>
          <p style={mutedTextStyle}>
            Choose UP or DOWN and assign fictitious PTS. No real tokens or money are transferred.
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
            <span style={{ fontWeight: 700 }}>Fictitious PTS</span>
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
              ? "✓ Prediction registered"
              : "Submit prediction"}
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
                ✓ Prediction registered on Solana Devnet.
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ color: "#a98bff", fontWeight: 900, fontSize: 12 }}>
              STEP 04
            </div>

            <span
              style={{
                padding: "7px 10px",
                borderRadius: 999,
                background: resultReady
                  ? "rgba(20,241,149,.08)"
                  : roundReady
                  ? "rgba(153,69,255,.10)"
                  : "rgba(255,255,255,.04)",
                border: resultReady
                  ? "1px solid rgba(20,241,149,.22)"
                  : roundReady
                  ? "1px solid rgba(153,69,255,.24)"
                  : "1px solid rgba(255,255,255,.08)",
                color: resultReady
                  ? "#8fffc9"
                  : roundReady
                  ? "#cbb9ff"
                  : "#938a9e",
                fontSize: 11,
                fontWeight: 900,
              }}
            >
              {resultReady ? "READY" : roundReady ? "ACTIVE" : "PENDING"}
            </span>
          </div>

          <h2 style={{ margin: "7px 0 0" }}>Wait & resolve</h2>

          {!roundReady && <p style={mutedTextStyle}>No test round exists yet.</p>}

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
              <strong style={{ color: "#8fffc9" }}>Round open</strong>

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
                  : "Resolve automatically"}
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
              ✓ Round resolved on-chain.
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ color: "#a98bff", fontWeight: 900, fontSize: 12 }}>
              STEP 05
            </div>

            <span
              style={{
                padding: "7px 10px",
                borderRadius: 999,
                background: resultReady
                  ? "rgba(20,241,149,.08)"
                  : "rgba(255,255,255,.04)",
                border: resultReady
                  ? "1px solid rgba(20,241,149,.22)"
                  : "1px solid rgba(255,255,255,.08)",
                color: resultReady ? "#8fffc9" : "#938a9e",
                fontSize: 11,
                fontWeight: 900,
              }}
            >
              {resultReady ? "VERIFIED" : "PENDING"}
            </span>
          </div>

          <h2 style={{ margin: "7px 0 0" }}>Result & verify</h2>

          {!resultReady ? (
            <p style={mutedTextStyle}>
              The result will appear here once the round has been resolved on-chain.
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
                <h3>Round completed</h3>
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