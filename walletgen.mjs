// gen-testnet-address.js
import * as bip39 from "bip39";
import * as bitcoin from "bitcoinjs-lib";
import { BIP32Factory } from "bip32";
import * as ecc from "tiny-secp256k1";
bitcoin.initEccLib(ecc);
const bip32 = BIP32Factory(ecc);

(async () => {
  // Generate a random mnemonic
  const mnemonic = bip39.generateMnemonic();
  console.log("mnemonic:", mnemonic);

  // Convert mnemonic -> seed -> root
  const seed = await bip39.mnemonicToSeed(mnemonic);
  console.log(seed);
  const root = bip32.fromSeed(seed, bitcoin.networks.testnet);

  // Derive first address using BIP44 testnet: m/44'/1'/0'/0/0
  const child = root.derivePath("m/44'/1'/0'/0/0");

  // WIF (private key) and a bech32 testnet address (p2wpkh)
  const wif = child.toWIF();
  const { address } = bitcoin.payments.p2wpkh({
    pubkey: child.publicKey,
    network: bitcoin.networks.testnet,
  });

  console.log("address (testnet):", address);
  console.log("wif (keep secret):", wif);
  console.log("derivationPath: m/44'/1'/0'/0/0");
})();
