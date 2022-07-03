import { useCallback, useEffect, useRef, useState } from "react"

export const useStateWithCallback = (initialState) => {
    const [state, setState] = useState(initialState)
    
    const callbackRef = useRef(); // In normal state, page rerenders for every change in state, but elements in useRef doesn't rerender for every change
    
    const updateState = useCallback((newState, callback) => { // for every render the function inside callback won't be created every time
        callbackRef.current = callback;
        setState((prev) => {
            return typeof newState === 'function' ? newState(prev) : newState;
        })
    }, [])
    
    useEffect(() => {
        if (callbackRef.current) {
            callbackRef.current(state);
            callbackRef.current = null;
        }
    }, [state])

    return [state, updateState]
}