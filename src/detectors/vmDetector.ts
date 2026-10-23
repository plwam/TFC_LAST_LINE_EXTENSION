import type { VmReason } from '@/shared/protocol';

export interface VmInput {
  renderer?: string | null;
  vendor?: string | null;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  userAgent?: string;
}

const SOFTWARE_RENDERERS = [
  /swiftshader/i,
  /llvmpipe/i,
  /softpipe/i,
  /microsoft basic render/i,
  /mesa offscreen/i,
  /google swiftshader/i,
];

const VIRTUAL_MARKERS = [
  /virtualbox/i,
  /vmware/i,
  /qemu/i,
  /hyper-v/i,
  /parallels/i,
  /virgl/i,
  /xen/i,
];

export function evaluateVmIndices(input: VmInput): VmReason[] {
  const renderer = (input.renderer ?? '').toLowerCase();
  const vendor = (input.vendor ?? '').toLowerCase();
  const reasons = new Set<VmReason>();

  if (SOFTWARE_RENDERERS.some((pattern) => pattern.test(renderer))) {
    reasons.add('software_renderer');
  }
  if (VIRTUAL_MARKERS.some((pattern) => pattern.test(renderer) || pattern.test(vendor))) {
    reasons.add('virtual_gpu_vendor');
  }
  if (
    typeof input.hardwareConcurrency === 'number' &&
    input.hardwareConcurrency > 0 &&
    input.hardwareConcurrency <= 2
  ) {
    reasons.add('low_cpu');
  }
  if (
    typeof input.deviceMemory === 'number' &&
    input.deviceMemory > 0 &&
    input.deviceMemory <= 2
  ) {
    reasons.add('low_memory');
  }
  if (/headless/i.test(input.userAgent ?? '')) {
    reasons.add('headless');
  }

  return reasons.size >= 2 ? [...reasons] : [];
}

function readWebGlInfo(): { renderer?: string; vendor?: string } {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
    if (!gl) return {};
    const debug = gl.getExtension('WEBGL_debug_renderer_info') as
      | { UNMASKED_RENDERER_WEBGL: number; UNMASKED_VENDOR_WEBGL: number }
      | null;
    if (!debug) return {};
    return {
      renderer: String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) ?? ''),
      vendor: String(gl.getParameter(debug.UNMASKED_VENDOR_WEBGL) ?? ''),
    };
  } catch {
    return {};
  }
}

export function detectVmIndices(): VmReason[] {
  const webgl = readWebGlInfo();
  const nav = typeof navigator === 'undefined' ? undefined : navigator;
  const deviceMemory = (nav as (Navigator & { deviceMemory?: number }) | undefined)?.deviceMemory;
  return evaluateVmIndices({
    renderer: webgl.renderer,
    vendor: webgl.vendor,
    hardwareConcurrency: nav?.hardwareConcurrency,
    deviceMemory,
    userAgent: nav?.userAgent,
  });
}
