---
title: 'SMLL: Using 200MB of Neural Network to Save 400 Bytes'
date: '2026-02-06'
spoiler: 'We compressed Jane Austen to 10 bytes. The model weights required to decompress it are 200 megabytes.'
---

We compressed Jane Austen's opening line to 10 bytes. The model weights required to decompress it are 200 megabytes.

This is the future of compression.

## Results

| Text                                        | Original  | gzip      | SMLL     |
|---------------------------------------------|-----------|-----------|----------|
| "It is a truth universally acknowledged..." | 117 bytes | 125 bytes | 10 bytes |
| "It was the best of times..."               | 52 bytes  | 60 bytes  | 6 bytes  |
| "All happy families are alike..."           | 76 bytes  | 84 bytes  | 9 bytes  |

gzip makes these files larger. We made them 10x smaller. (Yes, gzip has ~20 bytes of header overhead on tiny inputs. The [real benchmarks](#benchmarks) are below.)

The compression ratio on LLM-generated text is 14.96x. gzip achieves 1.89x. We are 8x better than gzip at compressing text, provided you don't count the 200MB model both parties need to agree on beforehand.

## Background

In 1948, Claude Shannon [proved](https://en.wikipedia.org/wiki/Shannon%27s_source_coding_theorem) there's a theoretical minimum number of bits required to encode any message. This minimum is the [entropy](https://en.wikipedia.org/wiki/Entropy_(information_theory)). Roughly, how "surprising" the data is on average.

If you can predict what comes next with high confidence, the next symbol carries little information. If you can't predict it at all, it carries maximum information.

LLMs do just this. When GPT outputs "the probability of the next token being 'the' is 73%," it's directly stating how much information that token carries: -log₂(0.73) = 0.45 bits.

[Arithmetic coding](https://en.wikipedia.org/wiki/Arithmetic_coding) is a compression algorithm from the 1970s that converts a stream of probabilities into a bitstream. You give it probabilities, it gives you near-optimal compression.

So we plugged an LLM into an arithmetic coder. The LLM provides probabilities. The arithmetic coder converts them to bits. The result approaches the theoretical limit of compression.

This idea is not new. [DeepMind published a paper about it](https://arxiv.org/abs/2309.10668) in 2023. [Fabrice Bellard built ts_zip](https://bellard.org/ts_zip/). The [Hutter Prize](http://prize.hutter1.net/) has offered €500,000 since 2006 for compressing Wikipedia, on the explicit premise that compression and intelligence are related. We just wanted to see the numbers ourselves.

## How It Works

```txt
Text → Tokenizer → LLM → Probabilities → Arithmetic Coder → Bits
```

For each token:

1. Ask the LLM: "Given the previous tokens, what's the probability distribution over the next token?"
2. Look up the actual token's probability
3. Feed that probability to the arithmetic coder
4. The arithmetic coder outputs bits proportional to -log₂(probability)
5. Append the token to context, repeat

Decompression is symmetric. Read bits, query the LLM for probabilities, decode the token, extend context, continue until end-of-sequence.

The model must be identical on both ends. The weights are the codebook. Different weights, different probabilities, wrong tokens, garbage output. This is what we in the business call a feature.

We use [arithmetic coding](https://en.wikipedia.org/wiki/Arithmetic_coding) rather than [Huffman](https://en.wikipedia.org/wiki/Huffman_coding) because it achieves fractional bits per symbol. A token with 70% probability takes 0.51 bits, not Huffman's rounded-up 1 bit.

The implementation uses numerically-stable softmax for probability extraction, 32-bit fixed-point arithmetic coding with a "bits outstanding" counter for underflow, and vocabulary sorted by probability to ensure encoder and decoder compute identical CDFs. Built on [llama.cpp](https://github.com/ggerganov/llama.cpp) for inference. Model format is GGUF. Python bindings via pybind11.

## Benchmarks

### By Content Type

| Content Type   | SMLL   | gzip   | zstd   |
|----------------|--------|--------|--------|
| LLM-Generated  | 14.96x | 1.89x  | 1.86x  |
| Wikipedia      | 14.83x | 2.05x  | 2.02x  |
| C Code         | 11.19x | 2.60x  | 2.53x  |
| Python Code    | 10.48x | 3.19x  | 3.19x  |
| Natural Prose  | 9.75x  | 1.81x  | 1.79x  |
| JSON           | 7.86x  | 2.72x  | 2.66x  |
| Repetitive     | 75.00x | 22.22x | 20.00x |
| UUIDs          | 0.94x  | 1.71x  | 1.76x  |

SMLL wins on 7 of 8 content types. UUIDs are random hexadecimal strings. The LLM cannot predict random data. Neither can anything else. This is fine.

LLM-generated text compresses best. The model is predicting outputs similar to what it would generate. This is circular in a way that happens to be useful.

### By Text Length

| Length | SMLL (bits/char) | gzip (bits/char) |
|--------|------------------|------------------|
| 50     | 2.24             | 9.12             |
| 100.   | 1.44             | 6.96             |
| 500    | 0.98             | 4.98             |
| 1000   | 0.85             | 4.47             |

Compression improves with length because the LLM accumulates context. More context means better predictions means fewer bits. At 1000 characters we're under 1 bit per character. The theoretical minimum for English is estimated around [0.6-1.3 bits per character](https://en.wikipedia.org/wiki/Entropy_(information_theory)#Data_compression). We're in that range.

### Speed

| Method | Throughput          |
|--------|---------------------|
| SMLL   | 700 chars/sec       |
| gzip   | 6,500,000 chars/sec |

SMLL is approximately 10,000x slower. Each token requires a forward pass through the neural network. This is the cost of using a 360 million parameter model as your compression dictionary.

A 10KB document takes about 15 seconds to compress. A 1MB document takes about 25 minutes. These are the trade-offs one makes.

## On Practicality

The model is 200MB. The encoder and decoder must have identical model weights. Compression is 10,000x slower than gzip.

In exchange, you get 8x better compression on natural language and approach the theoretical limit of what's possible.

Whether this trade-off makes sense depends on your situation. If you're archiving text you'll rarely decompress and storage costs more than compute, maybe. If you're compressing HTTP responses, absolutely not.

The more interesting observation is theoretical. [Cross-entropy loss](https://en.wikipedia.org/wiki/Cross-entropy), the thing we train LLMs on, directly measures compression efficiency. When we say "this model has lower perplexity," we mean "this model compresses text better." Language modeling is compression. Compression is language modeling. These are the same research problem wearing different clothes.

[Solomonoff induction](https://en.wikipedia.org/wiki/Solomonoff%27s_theory_of_inductive_inference), the theoretical ideal for prediction, is defined in terms of [Kolmogorov complexity](https://en.wikipedia.org/wiki/Kolmogorov_complexity): the length of the shortest program that produces the data. The Hutter Prize makes this connection explicit: compress Wikipedia well enough and you've demonstrated something about intelligence.

We haven't demonstrated anything about intelligence yet. A simple n-gram lookup table might achieve similar ratios through memorization alone. If the LLM meaningfully outperforms lookup tables on novel text, that's a stronger claim about what "compression = intelligence" actually means. I think this would be an interesting follow up.

We've demonstrated that a 360M parameter model can compress text to 0.68 bits per character, which is close to optimal. I found this fascinating, I hope you did too.

## Usage

If you want to try it out or run your own benchmarks, source code and installation instructions are on [GitHub](https://github.com/fcjr/smll).

```bash
pip install pysmll
```

```python
import smll

with smll.Compressor.from_pretrained(
    "QuantFactory/SmolLM2-360M-GGUF",
    "*Q4_0.gguf"
) as c:
    text = "To be, or not to be, that is the question."

    compressed = c.compress(text)
    decompressed = c.decompress(compressed)

    assert decompressed == text
    print(f"{len(text)} bytes → {len(compressed)} bytes")
```

---

This was built at the [Recurse Center](https://www.recurse.com/) with [Lauria](https://github.com/kshitijl). If spending time on experiments like this sounds interesting to you, you should [apply](https://www.recurse.com/apply).
