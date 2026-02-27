# @aiready/context-analyzer

> AIReady Spoke: Analyzes import chains, fragmented code, and context window costs for AI tools.

[![npm version](https://img.shields.io/npm/v/@aiready/context-analyzer.svg)](https://npmjs.com/package/@aiready/context-analyzer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

AI model context windows are precious and expensive. The **Context Analyzer** identifies import chains, redundant dependencies, and complex data structures that bloat your context window and degrade AI reasoning performance.

## 🏛️ Architecture

```
                    🎯 USER
                      │
                      ▼
         🎛️  @aiready/cli (orchestrator)
           │   │   │   │   │   │   │   │   │   │   │   │
           ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼   ▼
         ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐
         │A│ │B│ │C│ │D│ │E│ │F│ │G│ │H│ │I│ │J│ │K│ │L│
         └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘
         ALL SPOKES — flat peers, no hierarchy:
         A=pattern-detect    B=context-analyzer ★  C=consistency
         D=change-amp        E=deps-health          F=doc-drift
         G=ai-signal-clarity H=agent-grounding      I=testability
         J=visualizer        K=skills               L=components
           │   │   │   │   │   │   │   │   │   │   │   │
           └───┴───┴───┴───┴───┴───┴───┴───┴───┴───┴───┘
                               │
                               ▼
                      🏢 @aiready/core
```

## Features

- **Import Chain Analysis**: Detects deep dependency trees that force unnecessary files into AI context.
- **Fragmentation detection**: Identifies modules that are split across too many small, non-semantic files.
- **Context Budgeting**: Projects the dollar cost of loading specific modules into frontier models (GPT-4, Claude 3.5).

## Installation

```bash
pnpm add @aiready/context-analyzer
```

## Usage

```bash
aiready scan . --tools context-analyzer
```

## License

MIT
