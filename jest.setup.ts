/* eslint-disable @typescript-eslint/no-require-imports */
import "@testing-library/jest-dom";

jest.mock("framer-motion", () => {
  const React = require("react");

  const stripMotionProps = (props: Record<string, unknown>) => {
    const rest = { ...props };

    [
      "animate",
      "exit",
      "initial",
      "layout",
      "transition",
      "whileHover",
      "whileTap",
    ].forEach((prop) => {
      delete rest[prop];
    });

    return rest;
  };

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: new Proxy(
      {},
      {
        get: (_target, element: string) => {
          const MotionComponent = React.forwardRef(
            (
              {
                children,
                ...props
              }: { children?: React.ReactNode; [key: string]: unknown },
              ref: React.ForwardedRef<HTMLElement>,
            ) =>
              React.createElement(
                element,
                { ...stripMotionProps(props), ref },
                children,
              ),
          );

          MotionComponent.displayName = `MockMotion.${element}`;

          return MotionComponent;
        },
      },
    ),
    useReducedMotion: () => true,
  };
});

class MockNotification {
  static instances: MockNotification[] = [];
  static permission: NotificationPermission = "granted";
  static requestPermission = jest.fn(() =>
    Promise.resolve(MockNotification.permission),
  );

  title: string;
  options?: NotificationOptions;

  constructor(title: string, options?: NotificationOptions) {
    this.title = title;
    this.options = options;
    MockNotification.instances.push(this);
  }
}

class MockAudioContext {
  state = "running";
  currentTime = 0;
  destination = {};
  resume = jest.fn();
  createOscillator = jest.fn(() => ({
    connect: jest.fn(),
    frequency: { setValueAtTime: jest.fn() },
    onended: null,
    start: jest.fn(),
    stop: jest.fn(),
    type: "sine",
  }));
  createGain = jest.fn(() => ({
    connect: jest.fn(),
    gain: {
      exponentialRampToValueAtTime: jest.fn(),
      setValueAtTime: jest.fn(),
    },
  }));
}

Object.defineProperty(window, "Notification", {
  configurable: true,
  writable: true,
  value: MockNotification,
});

Object.defineProperty(navigator, "clipboard", {
  configurable: true,
  writable: true,
  value: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

Object.defineProperty(window, "AudioContext", {
  configurable: true,
  writable: true,
  value: MockAudioContext,
});

Object.defineProperty(window, "webkitAudioContext", {
  configurable: true,
  writable: true,
  value: MockAudioContext,
});

Object.defineProperty(window, "requestAnimationFrame", {
  configurable: true,
  writable: true,
  value: (callback: FrameRequestCallback) =>
    window.setTimeout(() => callback(Date.now()), 16),
});

Object.defineProperty(window, "cancelAnimationFrame", {
  configurable: true,
  writable: true,
  value: (id: number) => window.clearTimeout(id),
});

Object.defineProperty(global, "requestAnimationFrame", {
  configurable: true,
  writable: true,
  value: window.requestAnimationFrame,
});

Object.defineProperty(global, "cancelAnimationFrame", {
  configurable: true,
  writable: true,
  value: window.cancelAnimationFrame,
});

beforeEach(() => {
  MockNotification.instances = [];
  MockNotification.permission = "granted";
  MockNotification.requestPermission.mockClear();
  window.localStorage.clear();
  jest.clearAllMocks();
});
