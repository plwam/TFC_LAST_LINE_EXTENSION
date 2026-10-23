import { describe, expect, it } from 'vitest';
import { evaluateVmIndices } from '@/detectors/vmDetector';

describe('indices de machine virtuelle', () => {
  it('exige au moins deux indices cumulés', () => {
    expect(evaluateVmIndices({ renderer: 'Google SwiftShader' })).toEqual([]);
    expect(evaluateVmIndices({ hardwareConcurrency: 2 })).toEqual([]);
    expect(evaluateVmIndices({ renderer: 'Google SwiftShader', hardwareConcurrency: 2 })).toEqual([
      'software_renderer',
      'low_cpu',
    ]);
  });

  it('détecte un GPU virtualisé et une mémoire faible', () => {
    expect(
      evaluateVmIndices({ renderer: 'VMware SVGA 3D', vendor: 'VMware, Inc.', deviceMemory: 2 }),
    ).toEqual(['virtual_gpu_vendor', 'low_memory']);
  });

  it('ne signale rien sur un poste matériel classique', () => {
    expect(
      evaluateVmIndices({
        renderer: 'NVIDIA GeForce RTX 3060',
        vendor: 'NVIDIA Corporation',
        hardwareConcurrency: 12,
        deviceMemory: 8,
        userAgent: 'Mozilla/5.0',
      }),
    ).toEqual([]);
  });

  it('signale un navigateur headless associé à un rendu logiciel', () => {
    expect(
      evaluateVmIndices({ renderer: 'llvmpipe', userAgent: 'HeadlessChrome/120.0.0.0' }),
    ).toEqual(['software_renderer', 'headless']);
  });
});
