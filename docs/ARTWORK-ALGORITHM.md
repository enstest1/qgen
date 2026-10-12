# QG1 deterministic art — complete derivation contract

**Supply:** 256 editions, numbered QG-001 … QG-256 (NOT the chain-assigned Quark inscription numbers).

**Source:** edition `e` gets Quantus block at `COLLECTION_ANCHOR_HEIGHT + e - 1`. Every chosen block must already be finalized before any real wallet mint. Mainnet genesis and anchor window must be selected and frozen in a signed manifest; the current DEMO anchor 200000 and its hashes are synthetic **and cannot be used as real provenance**.

For each block:

```
blockHash = lowercase(block.hash without any 0x prefix)
DNA(e) = SHA256( UTF8("QUANT//GENESIS|QG1|" + genesis + "|" + blockHeight + "|" + blockHash + "|" + edition) )
b = 32 bytes decoded from the 64-character lowercase DNA hex
```

Mapping of byte offsets to art:

| Byte | Trait | Mapping |
|---|---|---|
| b[0] | Palette | remainder mod 6 |
| b[1] | Mask shape | remainder mod 6 |
| b[2] | Eyes | remainder mod 6 |
| b[3] | Mouth | remainder mod 6 |
| b[4] | Halo | remainder mod 4 |
| b[5] | Crown | remainder mod 6 |
| b[6] XOR first hash byte | Glitch | remainder mod 5 |
| b[7] | Lattice | remainder mod 4 |

Metrics: bit-density `ones` is the count of `1` bits across the 32 bytes of the source block hash (0–256); leading zeros count **leading zero hexadecimal nibbles**, not zero binary bits. Rarity is a non-financial illustration score: `min(99, 5 + 20*leadingZeros + 14 if ones outside [115..142] + 12 if crown == 5 + 7 if glitch == 4)`. It does not change the onchain value or amount paid.

The exact SVG is the function `render(derive(block,e,genesis))` in `src/engine.mjs`. Encode as UTF-8 without reformatting before signing. `sha256 = SHA256(exactSvgUtf8)`; the wallet must sign these exact bytes. Reject payloads above 960 bytes; the Qlyphs wallet itself decides actual available byte budget. No linked resources, embedded scripts or other content are allowed.

### Current prototype caveats

- Demo art is not produced using real Quantus block hashes.
- Rarity distribution has not been marketed as statistically calibrated.
- Duplicate traits are possible; distinct editions have distinct embedded identity and SHA-256, but some masks may appear similar.
- Source anchor, chain genesis, fee wallet and manifest must be frozen before live minting. Later renderer changes should mint as a new collection version, never silently change existing artifacts.
