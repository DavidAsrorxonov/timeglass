import { act, renderHook, waitFor } from "@testing-library/react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

describe("useLocalStorage", () => {
  it("returns the default value when storage is empty", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));

    expect(result.current[0]).toBe("default");
  });

  it("saves and updates a value", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));

    act(() => {
      result.current[1]("updated");
    });

    expect(result.current[0]).toBe("updated");
    expect(window.localStorage.getItem("test-key")).toBe("\"updated\"");
  });

  it("supports updater functions and removing a value", () => {
    const { result } = renderHook(() => useLocalStorage("count", 1));

    act(() => {
      result.current[1]((previous) => previous + 1);
    });

    expect(result.current[0]).toBe(2);

    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe(1);
    expect(window.localStorage.getItem("count")).toBeNull();
  });

  it("cleans up broken JSON safely", async () => {
    window.localStorage.setItem("broken", "{bad-json");

    const { result } = renderHook(() => useLocalStorage("broken", "fallback"));

    await waitFor(() => {
      expect(result.current[0]).toBe("fallback");
      expect(window.localStorage.getItem("broken")).toBeNull();
    });
  });

  it("does not crash when storage access throws", async () => {
    const getItem = jest
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("restricted");
      });
    const removeItem = jest
      .spyOn(Storage.prototype, "removeItem")
      .mockImplementation(() => {
        throw new Error("restricted");
      });

    const { result } = renderHook(() =>
      useLocalStorage("restricted", "fallback"),
    );

    await waitFor(() => {
      expect(result.current[0]).toBe("fallback");
    });

    getItem.mockRestore();
    removeItem.mockRestore();
  });

  it("syncs when a storage event is received", () => {
    const { result } = renderHook(() => useLocalStorage("sync-key", "one"));

    act(() => {
      window.localStorage.setItem("sync-key", "\"two\"");
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "sync-key",
          newValue: "\"two\"",
        }),
      );
    });

    expect(result.current[0]).toBe("two");
  });
});
