/**
 * Executes a function immediately and, if it takes longer than `ms`, calls `onDelay`.
 * Once the function finishes, `onFinish` is executed.
 *
 * @template T
 * @param {() => Promise<T>} fn - The async function to execute.
 * @param {number} ms - The delay in milliseconds before `onDelay` is triggered.
 * @param {() => void} onDelay - The function to call if `fn` takes longer than `ms` to complete.
 * @param {(loader?: any) => void} [onFinish] - The function to call once `fn` completes.
 * @returns {Promise<T>} - Resolves with the result of `fn()`.
 */
export async function withTimedCallback(fn, ms, onDelay, onFinish) {
    let fnFinished = false;
    let loader = null;

    // Start the main function immediately
    const fnPromise = fn().then((result) => {
        fnFinished = true;
        return result;
    });

    // Start a delay timer
    const delayTimer = setTimeout(() => {
        if (!fnFinished) {
            loader = onDelay();
        }
    }, ms);

    // Wait for the function to finish
    const result = await fnPromise;

    // Clear the delay timer (if not triggered)
    clearTimeout(delayTimer);

    // Call onFinish (if defined)
    if (onFinish) {
        onFinish(loader);
    }

    return result;
}

