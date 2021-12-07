# Transunion TUNA

Transunion TUNA API wrapper for Node.js, written in TypeScript.

## Installation

**npm**

```bash
npm install @rkingon/transunion-tuna-node
```

**Yarn**

```bash
yarn add @rkingon/transunion-tuna-node
```

## Setup

```typescript
import { TransunionClient } from '@rkingon/transunion-tuna-node';

const client = new TransunionClient({
  system: {
    id: string,
    password: string,
  },
  subscriber: {
    industryCode: string,
    memberCode: string,
    prefix: string,
    password: string,
  },
  certificate: Buffer,
});
```

## Usage

Everything is 100% typed. Refer to types for documentation.
