import test from 'node:test';
import {checks} from '../dist/checks.mjs';
for (const [name,run] of checks) test(name,run);
